import os
import re
from pathlib import Path
import spotipy  # ADD THIS IMPORT
from spotipy.oauth2 import SpotifyClientCredentials
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import yt_dlp
import time

from logger import debug, info, warn, error
from config import get_config
from retry_utils import retry_with_backoff

# ==============================
# --- SETUP ---
# ==============================

CONFIG = get_config()
BASE_DOWNLOAD_FOLDER = Path(CONFIG["DOWNLOAD_FOLDER"])
MAX_WORKERS = CONFIG["MAX_WORKERS"]
RATE_LIMIT_DELAY = CONFIG["SPOTIFY_RATE_LIMIT_DELAY"]
MAX_RETRIES = CONFIG["MAX_RETRIES"]

BASE_DOWNLOAD_FOLDER.mkdir(exist_ok=True)
info(f"Download folder set to: {BASE_DOWNLOAD_FOLDER}")

# Custom logger to hide all yt-dlp output
class SuppressLogger:
    def debug(self, msg):
        pass
    def info(self, msg):
        pass
    def warning(self, msg):
        pass
    def error(self, msg):
        error(f"[yt-dlp] {msg}")

# ==============================
# --- SPOTIFY AUTH ---
# ==============================

try:
    sp_auth = SpotifyClientCredentials(
        client_id=CONFIG["SPOTIFY_CLIENT_ID"],
        client_secret=CONFIG["SPOTIFY_CLIENT_SECRET"]
    )
    sp = spotipy.Spotify(auth_manager=sp_auth)  # CHANGE THIS LINE
    info("✅ Spotify authentication successful")
except Exception as e:
    error(f"Spotify authentication failed: {str(e)}")
    exit(1)

# ==============================
# --- DOWNLOAD LOGIC ---
# ==============================

def safe_filename(name: str) -> str:
    name = re.sub(r'[\\/*?:"<>|]', "", name)
    name = name.strip(" .")
    return name

def download_song(track_info):
    """Download a single song from YouTube"""
    track_name = track_info["name"]
    artist_name = track_info["artist"]
    spotify_id = track_info["spotify_id"]
    playlist_name = track_info.get("playlist_name", "all-songs")
    
    song_folder = BASE_DOWNLOAD_FOLDER / playlist_name
    song_folder.mkdir(exist_ok=True)
    
    # Create filename with Spotify ID: "Song Title -- SPOTIFY_ID"
    safe_title = track_name.replace("/", "-").replace("\\", "-")
    filename_with_id = f"{safe_title} -- {spotify_id}"
    output_path = song_folder / f"{filename_with_id}.%(ext)s"
    
    # Skip if already downloaded
    existing_files = list(song_folder.glob(f"{filename_with_id}*"))
    if existing_files:
        debug(f"⏭️  Already downloaded: {track_name}")
        return {"status": "skipped", "spotify_id": spotify_id}
    
    query = f"{track_name} {artist_name} audio"
    
    def download_func():
        ydl_opts = {
            "format": "bestaudio/best",
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "m4a",
                "preferredquality": "192",
            }],
            "outtmpl": str(output_path),
            "quiet": True,
            "no_warnings": True,
            "logger": SuppressLogger(),
            "default_search": "ytsearch",
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([query])
    
    try:
        retry_with_backoff(download_func, max_retries=MAX_RETRIES)
        info(f"✅ Downloaded: {track_name} - {artist_name} (in {playlist_name}/)")
        return {"status": "success", "spotify_id": spotify_id}
    except Exception as e:
        error(f"Failed to download {track_name}: {str(e)}")
        return {"status": "failed", "spotify_id": spotify_id, "error": str(e)}

def download_tracks(spotify_ids, playlist_name="all-songs"):
    """Download multiple tracks in parallel"""
    info(f"Starting download of {len(spotify_ids)} tracks to '{playlist_name}/'...")
    
    tracks_info = []
    for spotify_id in spotify_ids:
        try:
            def get_track():
                return sp.track(spotify_id)
            
            track_data = retry_with_backoff(get_track, max_retries=MAX_RETRIES)
            tracks_info.append({
                "name": track_data["name"],
                "artist": track_data["artists"][0]["name"],
                "spotify_id": spotify_id,
                "playlist_name": playlist_name,  # NEW: add playlist name
            })
            time.sleep(RATE_LIMIT_DELAY)
        except Exception as e:
            error(f"Failed to fetch metadata for {spotify_id}: {str(e)}")
    
    # Download in parallel
    results = {"success": 0, "failed": 0, "skipped": 0}
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(download_song, track) for track in tracks_info]
        
        for future in tqdm(as_completed(futures), total=len(futures), desc="Downloading"):
            result = future.result()
            results[result["status"]] += 1
    
    info(f"Download complete: ✅ {results['success']} | ❌ {results['failed']} | ⏭️  {results['skipped']}")
    return tracks_info

def extract_spotify_id(url_or_id):
    """Extract Spotify track/playlist ID from URL or accept direct ID"""
    # If it's already a 22-char Spotify ID, return it
    if len(url_or_id) == 22 and url_or_id.isalnum():
        return url_or_id
    
    # If it's a Spotify URL, extract the ID
    import re
    
    # Track URL: https://open.spotify.com/track/1HZ1Qgsm0EFGRwVKZ5xQnY
    track_match = re.search(r'spotify\.com/track/([a-zA-Z0-9]+)', url_or_id)
    if track_match:
        return track_match.group(1)
    
    # Playlist URL: https://open.spotify.com/playlist/37i9dQZF1DX...
    playlist_match = re.search(r'spotify\.com/playlist/([a-zA-Z0-9]+)', url_or_id)
    if playlist_match:
        return playlist_match.group(1)
    
    error(f"Invalid Spotify URL or ID: {url_or_id}")
    return None

# ==============================
# --- MAIN ---
# ==============================

if __name__ == "__main__":
    info("SpotSync Download Module Started")
    
    print("\n📋 Download Options:")
    print("1. Download single track (goes to 'all-songs/')")
    print("2. Download playlist (goes to playlist folder)")
    
    choice = input("\nChoose option (1 or 2): ").strip()
    
    if choice == "1":
        user_input = input("\n🎵 Enter Spotify track URL or ID: ").strip()
        if user_input:
            spotify_id = extract_spotify_id(user_input)
            if spotify_id:
                download_tracks([spotify_id], playlist_name="all-songs")
    
    elif choice == "2":
        playlist_url = input("\n🎵 Enter Spotify playlist URL: ").strip()
        playlist_id = extract_spotify_id(playlist_url)
        
        if playlist_id:
            try:
                # Get playlist details
                def get_playlist():
                    return sp.playlist(playlist_id)
                
                playlist_data = retry_with_backoff(get_playlist, max_retries=MAX_RETRIES)
                playlist_name = playlist_data["name"]
                
                # Get all track IDs from playlist
                track_ids = []
                for item in playlist_data["tracks"]["items"]:
                    if item["track"]:
                        track_ids.append(item["track"]["id"])
                
                info(f"Found {len(track_ids)} tracks in playlist: {playlist_name}")
                download_tracks(track_ids, playlist_name=playlist_name)
            
            except Exception as e:
                error(f"Failed to fetch playlist: {str(e)}")
    else:
        error("Invalid option")