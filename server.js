// 1. Import Express
require('dotenv').config();
const express = require('express');
const path = require('path'); // Node.js's built-in path module
const mongoose = require('mongoose'); // --- NEW --- Import Mongoose
const Song = require('./models/Song'); // --- NEW --- Import your Song model

// 2. Create an instance of Express
const app = express();

// 3. Define a port to run on
// Use an environment variable if available, otherwise default to 3000
const PORT = process.env.PORT || 3000;

// --- NEW --- Database Connection ---
// This is the connection string you copied from Atlas
// PASTE YOUR STRING HERE!
// !! REMEMBER TO:
//    1. Replace 'YOUR_PASSWORD' with the password you copied.
//    2. Add '/VibAura' (your database name) before the '?'.
const dbURI = process.env.DB_URI;

mongoose.connect(dbURI)
  .then(() => console.log('Connected to MongoDB Atlas!'))
  .catch((err) => console.error('MongoDB connection error:', err));
// --- END NEW ---

// --- Middleware ---
// This line tells Express to serve all static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // --- NEW --- This lets your server read JSON from requests
// --- END NEW ---

// --- API Routes ---
app.get('/api/test', (req, res) => {
  // res.json() sends a JSON response
  res.json({ message: 'Hello from the VibAura server! API is working!' });
});

// --- NEW --- API for getting all songs ---
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await Song.find(); // Fetches all documents from the 'songs' collection
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching songs', error: err });
  }
});

// --- NEW --- API for getting one song by its ID ---
app.get('/api/songs/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id); // Finds one song by its unique _id
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching song', error: err });
  }
});
// --- END NEW ---

// 4. Start the server and listen for connections
app.listen(PORT, () => {
  console.log(`VibAura server is running on http://localhost:${PORT}`);
});