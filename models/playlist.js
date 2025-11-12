/*
==================================
--- Playlist Database Model ---
==================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Mongoose Schema for a Playlist document.
 * Defines the structure for user-created or curated playlists.
 */
const playlistSchema = new Schema({
  // Name of the playlist (e.g., "Workout Mix", "Chill Vibes")
  name: {
    type: String,
    required: true,
  },

  // Optional description for the playlist
  description: {
    type: String,
    required: false,
  },

  // Category for the playlist (e.g., "General", "Pop", "Focus")
  category: {
    type: String,
    required: false,
    default: "General",
    trim: true, // Removes whitespace
  },

  // An array of song references.
  // This stores an array of `ObjectId`s, each linking to a
  // document in the 'Song' collection.
  songs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Song",
    },
  ],
});

// Create the Mongoose model named 'Playlist' based on the schema
const Playlist = mongoose.model("Playlist", playlistSchema);

// Export the model
module.exports = Playlist;