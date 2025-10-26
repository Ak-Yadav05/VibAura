const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // Duration in seconds
    required: true
  },
  // --- RENAMED ---
  fileUrl: {
    type: String, // Will hold the full Cloudinary URL
    required: true
  },
  // --- RENAMED ---
  artworkUrl: {
    type: String, // Will hold the full Cloudinary URL
    required: false
  }
});

const Song = mongoose.model('Song', songSchema);
module.exports = Song;