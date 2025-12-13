const API_BASE_URL = '/api/auth'; // Relative path since frontend/backend on same origin

// Helper for safe storage access
function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { console.warn('Storage set failed'); }
}
function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (e) { console.warn('Storage remove failed'); }
}

export async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }

    // Save token and user info
    safeSet('vibAuraToken', data.token);
    safeSet('vibAuraUser', JSON.stringify({
        id: data.userId,
        role: data.role,
        email: email
    }));

    return data;
}

export async function signup(email, password) {
    const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
    }

    return data;
}

export function logout() {
    safeRemove('vibAuraToken');
    safeRemove('vibAuraUser');
    // Redirect to login via router
    window.location.hash = '#/login';
    window.location.reload(); // Reload to ensure clean state
}

export function getToken() {
    return safeGet('vibAuraToken');
}

export function getCurrentUser() {
    const userStr = safeGet('vibAuraUser');
    return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated() {
    return !!getToken();
}

export async function verifySession() {
    const token = getToken();
    if (!token) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Invalid session");

        // Update user data if needed
        const user = await response.json();
        const storedUser = JSON.parse(safeGet('vibAuraUser') || '{}');
        safeSet('vibAuraUser', JSON.stringify({ ...storedUser, ...user }));
        return true;
    } catch (e) {
        logout(); // Auto logout if invalid
        return false;
    }
}
