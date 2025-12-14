const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const { authenticateToken } = require("../middleware/authMiddleware");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Signup
router.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Always create as "user" via this public endpoint
        const newUser = new User({
            email,
            passwordHash,
            role: "user",
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Signup error:", err.message, err.stack);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" } // Token expiry
        );

        res.json({ token, userId: user._id, role: user.role });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Current User (Protected)
router.get("/me", authenticateToken, async (req, res) => {
    try {
        // req.user is populated by authenticateToken
        // Retrieve fresh data from DB if needed, or just return from token payload
        // To be safe and get latest role, let's fetch from DB (optional, but good practice)
        const user = await User.findById(req.user.userId).select("-passwordHash");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Me error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // ⚠️ Security: Always return success to prevent email enumeration
            return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString("hex");

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Set expire (15 minutes)
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        // Create reset url (SPA hash route)
        // Create reset url (SPA hash route)
        // const resetUrl = `http://localhost:3000/#/reset-password?token=${resetToken}`;
        const resetUrl = `https://cathryn-portionless-doreen.ngrok-free.dev/#/reset-password?token=${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT (or POST via UI) request to: \n\n ${resetUrl}`;

        // Development logging
        console.log("====================================");
        console.log("PASSWORD RESET LINK:", resetUrl);
        console.log("====================================");
        // Write to file for easier access in development
        try {
            require("fs").writeFileSync("token.txt", resetUrl);
        } catch (err) {
            console.error("Failed to write token.txt:", err);
        }

        try {
            await sendEmail({
                email: user.email,
                subject: "Password Reset Token",
                message,
            });

            res.status(200).json({ message: "If that email exists, a reset link has been sent." });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            console.error("Email send error:", err);
            return res.status(500).json({ message: "Email could not be sent" });
        }
    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }

        // Hash token to compare with DB
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() },
        });


        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Check if new password is same as old password
        const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
        if (isSamePassword) {
            return res.status(400).json({ message: "New password cannot be the same as the old password" });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);

        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
