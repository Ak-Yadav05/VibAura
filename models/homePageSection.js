/*
=====================================
--- HomePage Database Model ---
=====================================
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Mongoose Schema for a HomepageSection document.
 *
 * This schema defines what dynamic sections appear on the homepage
 * and in what order. It's a powerful way to configure the homepage
 * content directly from the database without needing to redeploy code.
 *
 * Examples:
 * {
 * type: "song",
 * title: "Trending Songs",
 * order: 1,
 * limit: 10,
 * category: "featured" // (or uses isFeatured:true on Song)
 * }
 * {
 * type: "playlist",
 * title: "Bollywood Classics",
 * category: "Bollywood Classics",
 * order: 2,
 * limit: 8
 * }
 * {
 * type: "artist",
 * title: "Featured Artists",
 * order: 3,
 * limit: 10,
 * category: "featured" // (or uses isFeatured:true on Artist)
 * }
 */
const homepageSectionSchema = new Schema({
  // The type of content this section will display
  type: {
    type: String,
    enum: ["song", "playlist", "artist"], // Only these values are allowed
    required: true,
  },

  // An optional filter.
  // For 'playlist', this could match the playlist's 'category' field.
  // For 'song' or 'artist', this could be a special value like "featured"
  // to pull items where `isFeatured: true`.
  category: {
    type: String,
    default: "",
    trim: true,
  },

  // The title displayed on the homepage (e.g., "Trending Now")
  title: {
    type: String,
    required: true,
  },

  // The display order on the page (lowest number appears first/highest)
  order: {
    type: Number,
    default: 0,
  },

  // The maximum number of items to show in this section's horizontal scroller
  limit: {
    type: Number,
    default: 8,
  },

  // An easy way to enable or disable this section from appearing
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Create and export the Mongoose model
module.exports = mongoose.model("HomepageSection", homepageSectionSchema);