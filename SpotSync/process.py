import os
import re
import json
import time
from pathlib import Path
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import pymongo
from pymongo import MongoClient
import cloudinary
import cloudinary.uploader
from mutagen import File
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
from bson import ObjectId

from logger import debug, info, warn, error
from config import get_config
from retry_utils import retry_with_backoff

# ==============================
# --- SETUP ---
# ==============================

CONFIG = get_config()
BASE_DOWNLOAD_FOLDER = Path(CONFIG["DOWNLOAD_FOLDER"])
MAX_WORKERS = CONFIG["MAX_WORKERS"]
MAX_RETRIES = CONFIG["MAX_RETRIES"]

info(f"Process module initialized with config: MAX_WORKERS={MAX_WORKERS}, MAX_RETRIES={MAX_RETRIES}")

# ==============================
# --- CLOUDINARY CONFIG ---
# ==============================

try:
    cloudinary.config(
        cloud_name=CONFIG["CLOUDINARY_CLOUD_NAME"],
        api_key=CONFIG["CLOUDINARY_API_KEY"],
        api_secret=CONFIG["CLOUDINARY_API_SECRET"]
    )
    info("✅ Cloudinary authentication successful")
except Exception as e:
    error(f"Cloudinary configuration failed: {str(e)}")
    exit(1)

# ==============================
# --- SPOTIFY AUTH ---
# ==============================

try:
    sp_auth = SpotifyClientCredentials(
        client_id=CONFIG["SPOTIFY_CLIENT_ID"],
        client_secret=CONFIG["SPOTIFY_CLIENT_SECRET"]
    )
    sp = spotipy.Spotify(auth_manager=sp_auth)
    info("✅ Spotify authentication successful")
except Exception as e:
    error(f"Spotify authentication failed: {str(e)}")
    exit(1)

# ==============================
# --- MONGODB CONFIG ---
# ==============================

try:
    client = MongoClient(
        CONFIG["MONGODB_URI"],
        serverSelectionTimeoutMS=10000,
        socketTimeoutMS=45000,
    )
    db = client[CONFIG["MONGODB_DB_NAME"]]
    db.command('ping')
    info(f"✅ MongoDB connected to database: {CONFIG['MONGODB_DB_NAME']}")
except Exception as e:
    error(f"MongoDB connection failed: {str(e)}")
    exit(1)

# ==============================
# --- HELPER FUNCTIONS ---
# ==============================

def get_or_create_artist(artist_data):
    """Get or create artist in MongoDB with Spotify ID support"""
    try:
        artist_name = artist_data.get("name", "Unknown Artist")
        spotify_artist_id = artist_data.get("id")
        
        # 1. Try finding by Spotify ID first (most accurate)
        if spotify_artist_id:
            existing_by_id = db.artists.find_one({"spotifyArtistId": spotify_artist_id})
            if existing_by_id:
                return existing_by_id["_id"]

        # 2. Fallback: Check by name
        existing_by_name = db.artists.find_one({"name": artist_name})
        if existing_by_name:
            # Found by name but checking if we need to backfill Spotify ID
            if spotify_artist_id and not existing_by_name.get("spotifyArtistId"):
                db.artists.update_one(
                    {"_id": existing_by_name["_id"]},
                    {"$set": {"spotifyArtistId": spotify_artist_id}}
                )
                debug(f"ℹ️  Updated artist '{artist_name}' with Spotify ID")
            
            return existing_by_name["_id"]
        
        # 3. Create new artist
        artist_doc = {
            "name": artist_name,
            "spotifyArtistId": spotify_artist_id,
            "artworkUrl": artist_data.get("images", [{}])[0].get("url", "") if artist_data.get("images") else "",
            "isFeatured": False,
        }
        result = db.artists.insert_one(artist_doc)
        info(f"✅ Created/Imported artist: {artist_name}")
        return result.inserted_id
    except Exception as e:
        error(f"Error creating artist: {str(e)}")
        return None

def get_or_create_playlist(playlist_name):
    """Get or create playlist in MongoDB"""
    try:
        existing = db.playlists.find_one({"name": playlist_name})
        if existing:
            debug(f"Playlist exists: {playlist_name}")
            return existing["_id"]
        
        playlist_doc = {
            "name": playlist_name,
            "description": f"Playlist: {playlist_name}",
            "songs": [],
        }
        result = db.playlists.insert_one(playlist_doc)
        info(f"✅ Created playlist: {playlist_name}")
        return result.inserted_id
    except Exception as e:
        error(f"Error creating playlist: {str(e)}")
        return None

def extract_duration(audio_file_path):
    """Extract duration from audio file in seconds"""
    try:
        audio = File(audio_file_path)
        if audio and audio.info:
            duration_seconds = round(audio.info.length, 2)
            debug(f"Extracted duration: {duration_seconds}s")
            return duration_seconds
        return 0
    except Exception as e:
        warn(f"Could not read duration for {audio_file_path.name}: {str(e)}")
        return 0

def upload_to_cloudinary(file_path):
    """Upload file to Cloudinary with retry logic"""
    def upload_func():
        return cloudinary.uploader.upload(
            str(file_path),
            resource_type="video",  # Cloudinary uses "video" for audio
            folder=CONFIG["CLOUDINARY_FOLDER"],
            overwrite=True,
        )
    
    try:
        result = retry_with_backoff(upload_func, max_retries=MAX_RETRIES)
        info(f"✅ Uploaded to Cloudinary: {file_path.name}")
        return result["secure_url"]
    except Exception as e:
        error(f"Failed to upload {file_path.name} to Cloudinary: {str(e)}")
        return None

def validate_spotify_id(spotify_id):
    """Validate Spotify ID format (22 alphanumeric characters)"""
    return bool(re.fullmatch(r'[a-zA-Z0-9]{22}', spotify_id))

def fetch_spotify_metadata(spotify_id):
    """Fetch song metadata from Spotify API"""
    def fetch_func():
        return sp.track(spotify_id)
    
    try:
        track = retry_with_backoff(fetch_func, max_retries=MAX_RETRIES)
        time.sleep(0.1)  # Rate limiting
        return track
    except Exception as e:
        error(f"Failed to fetch Spotify metadata for {spotify_id}: {str(e)}")
        return None

# ==============================
# --- PROCESS LOGIC ---
# ==============================

def scan_downloaded_songs():
    """Scan downloaded-songs folder and return list of songs with folder info"""
    if not BASE_DOWNLOAD_FOLDER.exists():
        warn(f"Download folder does not exist: {BASE_DOWNLOAD_FOLDER}")
        return []
    
    songs_to_process = []
    
    # Iterate through all folders in downloaded-songs/
    for folder_path in BASE_DOWNLOAD_FOLDER.iterdir():
        if not folder_path.is_dir():
            continue
        
        folder_name = folder_path.name
        
        # Find audio files
        audio_files = list(folder_path.glob("*.m4a")) + list(folder_path.glob("*.mp3")) + list(folder_path.glob("*.webm"))
        
        for audio_file in audio_files:
            # Skip temp files
            if audio_file.stem.endswith(("_temp", ".part")):
                continue
            
            songs_to_process.append({
                "folder_name": folder_name,
                "audio_file": audio_file,
                "file_name": audio_file.stem,
            })
    
    info(f"Found {len(songs_to_process)} songs to process across {len(set([s['folder_name'] for s in songs_to_process]))} folders")
    return songs_to_process

def process_song(song_info):
    """Process a single song: fetch Spotify metadata, upload to Cloudinary, and populate DB"""
    folder_name = song_info["folder_name"]
    audio_file = song_info["audio_file"]
    file_name = song_info["file_name"]
    
    try:
        # Extract Spotify ID from filename (last 22 chars should be the ID)
        parts = file_name.split(" -- ")
        if len(parts) < 2:
            warn(f"Invalid filename format, skipping: {file_name}")
            return {"status": "failed", "reason": "invalid_filename", "folder": folder_name}
        
        spotify_id = parts[-1].strip()
        
        # Validate Spotify ID format
        if not validate_spotify_id(spotify_id):
            warn(f"Invalid Spotify ID format, skipping: {spotify_id}")
            return {"status": "failed", "reason": "invalid_spotify_id", "folder": folder_name}
        
        # Check if already processed
        existing = db.songs.find_one({"_private_spotify_id": spotify_id})
        if existing:
            debug(f"Song already processed: {file_name}")
            return {"status": "skipped", "song_id": str(existing["_id"]), "folder": folder_name}
        
        # Fetch Spotify metadata (title, artist, artwork)
        track_data = fetch_spotify_metadata(spotify_id)
        if not track_data:
            return {"status": "failed", "reason": "spotify_fetch", "folder": folder_name}
        
        official_title = track_data["name"]
        
        # Process ALL artists
        artist_ids = []
        for ad in track_data["artists"]:
            a_id = get_or_create_artist(ad)
            if a_id:
                artist_ids.append(a_id)
        
        if not artist_ids:
             return {"status": "failed", "reason": "no_artists", "folder": folder_name}

        artwork_url = track_data["album"]["images"][0]["url"] if track_data.get("album", {}).get("images") else ""
        
        # Upload to Cloudinary
        file_url = upload_to_cloudinary(audio_file)
        if not file_url:
            return {"status": "failed", "reason": "cloudinary_upload", "folder": folder_name}
        
        # Extract duration from local file
        duration = extract_duration(audio_file)
        
        # Create song document (matching VibAura Song schema)
        song_doc = {
            "title": official_title,
            "artists": artist_ids,
            "duration": duration,
            "fileUrl": file_url,
            "artworkUrl": artwork_url,
            "isFeatured": False,
            "_private_spotify_id": spotify_id,
        }
        
        # Insert song into DB
        result = db.songs.insert_one(song_doc)
        song_id = result.inserted_id
        
        # Add song to playlist if not "all-songs"
        if folder_name.lower() != "all-songs":
            playlist_id = get_or_create_playlist(folder_name)
            if playlist_id:
                db.playlists.update_one(
                    {"_id": playlist_id},
                    {"$addToSet": {"songs": song_id}}
                )
                info(f"✅ Added to playlist: {folder_name}")
        
        first_artist_name = track_data['artists'][0]['name']
        info(f"✅ Processed: {official_title} by {first_artist_name} (+{len(artist_ids)-1} others) (folder: {folder_name})")
        return {"status": "success", "song_id": str(song_id), "folder": folder_name}
    
    except Exception as e:
        error(f"Error processing {file_name}: {str(e)}")
        return {"status": "failed", "reason": str(e), "folder": folder_name}

def process_all_songs():
    """Scan and process all downloaded songs"""
    songs_to_process = scan_downloaded_songs()
    
    if not songs_to_process:
        warn("No songs found to process")
        return
    
    info(f"Starting processing of {len(songs_to_process)} songs...")
    
    results = {"success": 0, "failed": 0, "skipped": 0}
    errors_list = []
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(process_song, song) for song in songs_to_process]
        
        for future in tqdm(as_completed(futures), total=len(futures), desc="Processing songs"):
            result = future.result()
            results[result["status"]] += 1
            if result["status"] == "failed":
                errors_list.append(result.get("reason", "unknown"))
    
    info(f"Processing complete: ✅ {results['success']} | ❌ {results['failed']} | ⏭️  {results['skipped']}")
    
    if errors_list:
        warn(f"Error breakdown: {dict(zip(set(errors_list), [errors_list.count(e) for e in set(errors_list)]))}")

# ==============================
# --- MAIN ---
# ==============================

if __name__ == "__main__":
    info("SpotSync Process Module Started")
    
    print("\n📋 Processing Options:")
    print("1. Process all downloaded songs")
    print("2. Process specific folder")
    
    choice = input("\nChoose option (1 or 2): ").strip()
    
    if choice == "1":
        process_all_songs()
    
    elif choice == "2":
        folder_name = input("Enter folder name (e.g., 'all-songs' or 'Playlist Name'): ").strip()
        
        if folder_name:
            folder_path = BASE_DOWNLOAD_FOLDER / folder_name
            if not folder_path.exists():
                error(f"Folder not found: {folder_path}")
            else:
                audio_files = list(folder_path.glob("*.m4a")) + list(folder_path.glob("*.mp3")) + list(folder_path.glob("*.webm"))
                
                if audio_files:
                    songs = [
                        {
                            "folder_name": folder_name,
                            "audio_file": f,
                            "file_name": f.stem,
                        }
                        for f in audio_files
                    ]
                    
                    info(f"Processing {len(songs)} songs from '{folder_name}'...")
                    results = {"success": 0, "failed": 0, "skipped": 0}
                    
                    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
                        futures = [executor.submit(process_song, song) for song in songs]
                        for future in tqdm(as_completed(futures), total=len(futures), desc=f"Processing '{folder_name}'"):
                            result = future.result()
                            results[result["status"]] += 1
                    
                    info(f"Done: ✅ {results['success']} | ❌ {results['failed']} | ⏭️  {results['skipped']}")
                else:
                    warn(f"No audio files found in {folder_name}")
    else:
        error("Invalid option")