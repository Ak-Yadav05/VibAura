/*
===========================
--- Song Database Model ---
===========================
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Mongoose Schema for a Song document.
 * Defines the structure and data types for songs stored in MongoDB.
 */
const songSchema = new Schema({
  // The title of the song
  title: {
    type: String,
    required: true
  },

  // Array of references to Artist documents
  // This allows for multiple artists per song
  artists: [{
    type: Schema.Types.ObjectId,
    ref: 'Artist'
  }],

  // Duration of the song, stored in seconds
  duration: {
    type: Number,
    required: true
  },

  // URL to the audio file (e.g., an S3 or CDN link)
  fileUrl: {
    type: String,
    required: true
  },

  // URL to the song's artwork (e.g., album cover)
  artworkUrl: {
    type: String,
    required: false // Artwork may not be available for all songs
  },

  // Flag to identify featured songs
  // This can be used to populate homepage sections like "Trending Songs".
  isFeatured: {
    type: Boolean,
    default: false
  },

  // --- Optional Metadata ---
  // You can add the other metadata here if you populated it
  // composer: { type: String },
  // lyricist: { type: String },
});

// Create the Mongoose model named 'Song' based on the schema
const Song = mongoose.model('Song', songSchema);

// Export the model to be used in other files (e.g., controllers, API routes)
module.exports = Song;