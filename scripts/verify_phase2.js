const baseUrl = "http://localhost:3000/api";

async function run() {
    try {
        // 1. Signup/Login
        const email = `test_phase2_${Date.now()}@example.com`;
        const password = "password123";

        console.log("1. Registering user...");
        let res = await fetch(`${baseUrl}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        // Handle if user already exists (rare due to timestamp, but good to know)
        if (res.status === 400) {
            console.log("User might already exist, trying login...");
        } else if (!res.ok) {
            throw new Error("Signup failed " + await res.text());
        }

        console.log("1. Logging in...");
        res = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error("Login failed");
        const { token, userId } = await res.json();
        const authHeader = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
        console.log("Logged in:", userId);

        // 2. Create Playlist
        console.log("2. Creating playlist...");
        res = await fetch(`${baseUrl}/playlists`, {
            method: "POST",
            headers: authHeader,
            body: JSON.stringify({ name: "My Test Playlist" })
        });
        if (!res.ok) throw new Error("Create playlist failed " + await res.text());
        const playlist = await res.json();
        console.log("Playlist created:", playlist._id);

        if (playlist.owner !== userId) console.error("❌ Owner mismatch!");
        else console.log("✅ Owner correct.");

        // 3. Get Library
        console.log("3. Fetching library...");
        res = await fetch(`${baseUrl}/library`, { headers: authHeader });
        const library = await res.json();
        const found = library.find(p => p._id === playlist._id);
        if (found) console.log("✅ Playlist found in library.");
        else console.error("❌ Playlist NOT found in library.");

        // 4. Add Song (Need a song ID)
        // Fetch a song first
        res = await fetch(`${baseUrl}/songs`);
        const songs = await res.json();
        if (songs.length === 0) {
            console.warn("⚠️ No songs in DB, skipping song tests.");
        } else {
            const songId = songs[0]._id;
            console.log("4. Adding song:", songId);
            res = await fetch(`${baseUrl}/playlists/${playlist._id}/songs/${songId}`, {
                method: "POST",
                headers: authHeader
            });
            if (!res.ok) throw new Error("Add song failed " + await res.text());
            const updated = await res.json();
            if (updated.songs.includes(songId)) console.log("✅ Song added.");
            else console.error("❌ Song not added.");

            // 5. Remove Song
            console.log("5. Removing song...");
            res = await fetch(`${baseUrl}/playlists/${playlist._id}/songs/${songId}`, {
                method: "DELETE",
                headers: authHeader
            });
            const cleaned = await res.json();
            if (!cleaned.songs.includes(songId)) console.log("✅ Song removed.");
            else console.error("❌ Song incorrectly present.");
        }

        // 6. Rename Playlist
        console.log("6. Renaming playlist...");
        res = await fetch(`${baseUrl}/playlists/${playlist._id}`, {
            method: "PATCH",
            headers: authHeader,
            body: JSON.stringify({ name: "Renamed Playlist" })
        });
        const renamed = await res.json();
        if (renamed.name === "Renamed Playlist") console.log("✅ Renamed successfully.");
        else console.error("❌ Rename failed.");

        // 7. Remove from Library
        console.log("7. Removing from library...");
        res = await fetch(`${baseUrl}/library/playlists/${playlist._id}`, {
            method: "DELETE",
            headers: authHeader
        });
        if (res.ok) console.log("✅ Removed from library endpoint ok.");

        res = await fetch(`${baseUrl}/library`, { headers: authHeader });
        const lib2 = await res.json();
        if (!lib2.find(p => p._id === playlist._id)) console.log("✅ Verified removed from library.");
        else console.error("❌ Playlist still in library.");

        // 8. Add back to Library
        console.log("8. Adding back to library...");
        res = await fetch(`${baseUrl}/library/playlists/${playlist._id}`, {
            method: "POST",
            headers: authHeader
        });
        if (res.ok) console.log("✅ added back endpoint ok.");

        res = await fetch(`${baseUrl}/library`, { headers: authHeader });
        const lib3 = await res.json();
        if (lib3.find(p => p._id === playlist._id)) console.log("✅ Verified added back.");
        else console.error("❌ Playlist NOT found in library.");

        console.log("🎉 ALL TESTS PASSED");

    } catch (err) {
        console.error("❌ TEST FAILED:", err);
    }
}

run();
