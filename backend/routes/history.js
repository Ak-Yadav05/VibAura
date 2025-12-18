const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const { authenticateToken } = require("../middleware/authMiddleware");

// @route   POST /api/history/:songId
// @desc    Add a song to recently played history
// @access  Private
router.post("/:songId", authenticateToken, async (req, res) => {
    try {
        const { songId } = req.params;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Add to history (at the beginning)
        user.recentlyPlayed.unshift({ song: songId, playedAt: new Date() });

        // Limit to 20 entries
        if (user.recentlyPlayed.length > 20) {
            user.recentlyPlayed = user.recentlyPlayed.slice(0, 20);
        }

        await user.save();
        res.status(200).json({ message: "Song added to history", history: user.recentlyPlayed });
    } catch (err) {
        console.error("Error adding to history:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   GET /api/history
// @desc    Get recently played history
// @access  Private
router.get("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId).populate({
            path: "recentlyPlayed.song",
            populate: {
                path: "artists",
                model: "Artist"
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return history (already sorted by unshift logic, but let's be sure it's DESC by playedAt)
        const history = user.recentlyPlayed.sort((a, b) => b.playedAt - a.playedAt);

        res.json(history);
    } catch (err) {
        console.error("Error fetching history:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
