const API_BASE = '/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('vibAuraToken');
    if (!token) return {};
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const HistoryService = {
    /**
     * Records a song play in the user's history.
     * @param {string} songId - The ID of the song being played.
     */
    async addToHistory(songId) {
        try {
            const res = await fetch(`${API_BASE}/history/${songId}`, {
                method: 'POST',
                headers: getAuthHeader()
            });
            if (!res.ok) {
                console.warn('[HistoryService] Failed to add song to history:', res.status);
            }
        } catch (err) {
            console.error('[HistoryService] Error adding to history:', err);
        }
    },

    /**
     * Fetches the user's recently played history.
     * @returns {Promise<Array>} List of history entries.
     */
    async getHistory() {
        try {
            const res = await fetch(`${API_BASE}/history`, {
                headers: getAuthHeader()
            });
            if (!res.ok) throw new Error('Failed to fetch history');
            return await res.json();
        } catch (err) {
            console.error('[HistoryService] Error fetching history:', err);
            return [];
        }
    }
};
