require("dotenv").config();
const axios = require("axios");

const API_BASE = "http://localhost:3000/api";

async function testHistory() {
    try {
        console.log("--- Starting History Verification ---");

        // 1. Login (assuming a user exists or you have credentials)
        // Note: In a real environment, we'd use a test user. 
        // For this script, I'll prompt or use placeholders.
        // Let's assume we can use the root user if we know their email/pass.
        // Or we can just try to login with a potential test user.

        const loginData = {
            email: "test@example.com",
            password: "password123"
        };

        let token;
        try {
            console.log("Logging in...");
            const loginRes = await axios.post(`${API_BASE}/auth/login`, loginData);
            token = loginRes.data.token;
            console.log("Login successful.");
        } catch (err) {
            console.log("Login failed (user might not exist). Creating user...");
            await axios.post(`${API_BASE}/auth/signup`, loginData);
            const loginRes = await axios.post(`${API_BASE}/auth/login`, loginData);
            token = loginRes.data.token;
            console.log("Signup and login successful.");
        }

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Clear history (Manual check: we don't have a clear endpoint, but we can just add songs)
        // Let's fetch some songs first
        console.log("Fetching songs...");
        const songsRes = await axios.get(`${API_BASE}/songs`);
        const songs = songsRes.data;
        if (songs.length < 2) {
            console.log("Not enough songs to test. Need at least 2.");
            return;
        }

        const song1 = songs[0]._id;
        const song2 = songs[1]._id;

        // 3. Add to history
        console.log(`Adding song 1 (${song1}) to history...`);
        await axios.post(`${API_BASE}/history/${song1}`, {}, config);

        console.log(`Adding song 2 (${song2}) to history...`);
        await axios.post(`${API_BASE}/history/${song2}`, {}, config);

        // 4. Get history and verify
        console.log("Fetching history...");
        const historyRes = await axios.get(`${API_BASE}/history`, config);
        const history = historyRes.data;

        console.log("Current History Length:", history.length);
        console.log("Latest song in history:", history[0].song.title);

        if (history[0].song._id === song2 && history[1].song._id === song1) {
            console.log("✅ History order is correct (latest first).");
        } else {
            console.log("❌ History order is incorrect.");
        }

        if (history.length <= 20) {
            console.log("✅ History limit is respected.");
        } else {
            console.log("❌ History limit exceeded.");
        }

        console.log("--- Verification Complete ---");

    } catch (err) {
        console.error("Verification error:", err.response ? err.response.data : err.message);
    }
}

testHistory();
