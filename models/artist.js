/*
===============================
--- Artist Database Model ---
===============================
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Mongoose Schema for an Artist document.
 * Defines the structure for artist information.
 */
const artistSchema = new Schema({
  // The name of the artist
  name: {
    type: String,
    required: true,
    unique: true // Ensures no duplicate artist names
  },

  // URL to the artist's primary image
  artworkUrl: {
    type: String,
    required: false, // Not all artists may have an image
    default: '' // Default to an empty string
  },

  // Flag to identify featured artists
  // This can be used for homepage sections, e.g., "Featured Artists"
  isFeatured: {
    type: Boolean,
    default: false // By default, artists are NOT featured
  },

  // A category for the artist (e.g., "General", "Pop", "Rock")
  category: {
    type: String,
    required: false,
    default: "General",
    trim: true // Removes whitespace from the beginning and end
  }
});

// Create the Mongoose model named 'Artist' based on the schema
const Artist = mongoose.model('Artist', artistSchema);

// Export the model
module.exports = Artist;