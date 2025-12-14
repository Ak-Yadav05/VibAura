const API_BASE = '/api';

const getAuthHeader = (contentType = 'application/json') => {
    const token = localStorage.getItem('vibAuraToken');
    if (!token) return {}; // Or throw an error, depending on desired behavior
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    if (contentType) {
        headers['Content-Type'] = contentType;
    }
    return headers;
};

export const PlaylistService = {
    // Get User Library
    async getUserLibrary() {
        const token = localStorage.getItem('vibAuraToken'); // Changed to vibAuraToken
        if (!token) return [];

        try {
            const res = await fetch(`${API_BASE}/library`, {
                headers: getAuthHeader(null) // Using helper, no content type needed for GET
            });
            if (!res.ok) throw new Error('Failed to fetch library');
            return await res.json();
        } catch (err) {
            console.error('Library fetch error:', err);
            return [];
        }
    },

    // Create Playlist
    async createPlaylist(name) {
        // No checks here, let backend handle duplicate names if enforced, or allow duplicates.
        // Backend expects { name }
        const res = await fetch(`${API_BASE}/playlists`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ name })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to create playlist');
        }
        return await res.json();
    },

    // Delete Playlist (Permanent)
    async deletePlaylist(playlistId) {
        const res = await fetch(`${API_BASE}/playlists/${playlistId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to delete playlist');
        }
        return await res.json();
    },

    // Add Song to Playlist
    async addSongToPlaylist(playlistId, songId) {
        const res = await fetch(`${API_BASE}/playlists/${playlistId}/songs/${songId}`, {
            method: 'POST',
            headers: getAuthHeader()
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to add song');
        }
        return await res.json();
    },

    // Remove Song from Playlist
    async removeSongFromPlaylist(playlistId, songId) {
        const res = await fetch(`${API_BASE}/playlists/${playlistId}/songs/${songId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!res.ok) throw new Error('Failed to remove song');
        return await res.json();
    },

    // Rename Playlist
    async renamePlaylist(playlistId, name) {
        const res = await fetch(`${API_BASE}/playlists/${playlistId}`, {
            method: 'PATCH',
            headers: getAuthHeader(),
            body: JSON.stringify({ name })
        });
        if (!res.ok) throw new Error('Failed to rename playlist');
        return await res.json();
    },

    // Add Playlist to Library (Save)
    async addPlaylistToLibrary(playlistId) {
        const res = await fetch(`${API_BASE}/library/playlists/${playlistId}`, {
            method: 'POST',
            headers: getAuthHeader()
        });
        if (!res.ok) throw new Error('Failed to add to library');
        return await res.json();
    },

    // Remove Playlist from Library
    async removePlaylistFromLibrary(playlistId) {
        const res = await fetch(`${API_BASE}/library/playlists/${playlistId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!res.ok) throw new Error('Failed to remove from library');
        return await res.json();
    },

    // Add to Liked Songs
    async addToLikedSongs(songId) {
        try {
            const res = await fetch(`${API_BASE}/library/songs/${songId}`, {
                method: 'POST',
                headers: getAuthHeader()
            });
            if (!res.ok) {
                const txt = await res.text();
                alert("API Fail: " + res.status + " " + txt);
                throw new Error('Failed to add to Liked Songs');
            }
            return await res.json();
        } catch (e) {
            alert("Fetch Error: " + e.message);
            throw e;
        }
    },

    // Remove from Liked Songs
    async removeFromLikedSongs(songId) {
        const res = await fetch(`${API_BASE}/library/songs/${songId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!res.ok) throw new Error('Failed to remove from Liked Songs');
        return await res.json();
    }
};
