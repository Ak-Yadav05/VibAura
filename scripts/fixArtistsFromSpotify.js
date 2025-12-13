
const mongoose = require('mongoose');
const Song = require('../models/song');
const Artist = require('../models/artist');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../SpotSync/.env') });

const DB_URI = process.env.DB_URI;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!DB_URI) {
    console.error("❌ DB_URI is missing from environment variables.");
    process.exit(1);
}

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error("❌ Spotify credentials missing (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET).");
    process.exit(1);
}

async function getSpotifyToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to get Spotify token: ${data.error_description || data.error}`);
    }
    return data.access_token;
}

async function getSpotifyTrack(trackId, token) {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        if (response.status === 404) return null; // Track not found
        const text = await response.text();
        throw new Error(`Spotify API Error ${response.status}: ${text}`);
    }
    return await response.json();
}

async function runMigration() {
    console.log("🚀 Starting migration...");

    try {
        await mongoose.connect(DB_URI);
        console.log("✅ Connected to MongoDB");

        const token = await getSpotifyToken();
        console.log("✅ Got Spotify Access Token");

        // Fetch ALL songs to process the entire library
        const songs = await Song.find({}).lean();
        console.log(`Found ${songs.length} songs to process.`);

        for (const song of songs) {
            console.log(`\nProcessing: "${song.title}" (${song._id})`);

            const spotifyId = song._private_spotify_id;
            if (!spotifyId) {
                console.log(`   🔸 No _private_spotify_id found. Skipping.`);
                continue;
            }

            try {
                const trackData = await getSpotifyTrack(spotifyId, token);
                if (!trackData) {
                    console.log(`   🔸 Spotify track not found for ID: ${spotifyId}`);
                    continue;
                }

                const artistIds = [];

                for (const sArtist of trackData.artists) {
                    // 1. Try match by Spotify ID
                    let artist = await Artist.findOne({ spotifyArtistId: sArtist.id });

                    if (artist) {
                        console.log(`   ✅ Matched existing artist by ID: ${artist.name}`);
                    } else {
                        // 2. Try match by Name
                        // Case-insensitive regex search could be safer, but exact match is faster/strict as per task "match by name"
                        artist = await Artist.findOne({ name: sArtist.name });

                        if (artist) {
                            console.log(`   ✅ Matched existing artist by Name: ${artist.name}`);
                            // 3. Update if missing spotifyArtistId
                            if (!artist.spotifyArtistId) {
                                artist.spotifyArtistId = sArtist.id;
                                await artist.save();
                                console.log(`      ↳ Updated artist with Spotify ID.`);
                            }
                        } else {
                            // 4. Create new Artist
                            // Using basic data we have. We don't have artworkUrl easily unless we query artist endpoint, 
                            // but task constraint says "For each Spotify artist... Extract ALL artists".
                            // Track object usually gives simplified artist objects (id, name, type, uri, external_urls).
                            // It does NOT give images. We'd need another call to get artist images.
                            // Task says "Create a new Artist document". I will fulfill required fields.
                            // Artist schema requires: name. Optional: artworkUrl, isFeatured, category.

                            artist = new Artist({
                                name: sArtist.name,
                                spotifyArtistId: sArtist.id,
                                artworkUrl: '' // No image in track.artists
                            });
                            await artist.save();
                            console.log(`   ✨ Created new artist: ${artist.name}`);
                        }
                    }
                    artistIds.push(artist._id);
                }

                // 6. Update Song
                if (artistIds.length > 0) {
                    await Song.updateOne(
                        { _id: song._id },
                        {
                            $set: { artists: artistIds },
                            $unset: { artist: "" } // Remove old field
                        }
                    );
                    console.log(`   💾 Updated Song: Artists linked, old 'artist' field removed.`);
                } else {
                    console.log(`   ⚠️ No artists found to link.`);
                }

            } catch (err) {
                console.error(`   ❌ Error processing song ${song.title}:`, err.message);
            }
        }

        console.log("\n✅ Migration Finished.");

    } catch (error) {
        console.error("❌ Specific Fatal Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from DB.");
    }
}

runMigration();
