const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Playlist = require("../../models/playlist");
const { authenticateToken } = require("../middleware/authMiddleware");

// All routes here are protected
router.use(authenticateToken);

// GET /api/library - Get user library
router.get("/", async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate({
                path: "libraryPlaylists",
                populate: { path: "songs", model: "Song" }
            })
            .populate({
                path: "likedSongs",
                model: "Song", // Make sure to populate Song details
                populate: { path: "artists", model: "Artist" } // Needed for displaying artist names
            });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Return unified structure
        res.json({
            libraryPlaylists: user.libraryPlaylists,
            likedSongs: user.likedSongs
        });
    } catch (err) {
        console.error("Library error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// POST /api/library/playlists/:playlistId - Add playlist to library
router.post("/playlists/:playlistId", async (req, res) => {
    try {
        const { playlistId } = req.params;
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        await User.findByIdAndUpdate(req.user.userId, {
            $addToSet: { libraryPlaylists: playlistId }
        });

        res.json({ message: "Playlist added to library" });
    } catch (err) {
        console.error("Add to library error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE /api/library/playlists/:playlistId - Remove from library
router.delete("/playlists/:playlistId", async (req, res) => {
    try {
        const { playlistId } = req.params;

        await User.findByIdAndUpdate(req.user.userId, {
            $pull: { libraryPlaylists: playlistId }
        });

        res.json({ message: "Playlist removed from library" });
    } catch (err) {
        console.error("Remove from library error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// POST /api/library/songs/:songId - Add song to Liked Songs
router.post("/songs/:songId", async (req, res) => {
    try {
        const { songId } = req.params;
        await User.findByIdAndUpdate(req.user.userId, {
            $addToSet: { likedSongs: songId }
        });
        res.json({ message: "Added to Liked Songs" });
    } catch (err) {
        console.error("Like song error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE /api/library/songs/:songId - Remove song from Liked Songs
router.delete("/songs/:songId", async (req, res) => {
    try {
        const { songId } = req.params;
        await User.findByIdAndUpdate(req.user.userId, {
            $pull: { likedSongs: songId }
        });
        res.json({ message: "Removed from Liked Songs" });
    } catch (err) {
        console.error("Unlike song error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
