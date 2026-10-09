const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const TOKEN_KEY = 'sem5_token';
const REFRESH_KEY = 'sem5_refresh';
const USER_KEY = 'sem5_user';
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}
export function getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
}
export function getStoredUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw)
        return null;
    try {
        const user = JSON.parse(raw);
        return user.role === 'admin' || user.role === 'analyst' ? user : null;
    }
    catch {
        return null;
    }
}
/** Replace the locally cached user with an authoritative backend response. */
export function setStoredUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function isAuthRequired() {
    // Auth is on by default; only an explicit opt-out disables the route guards.
    return import.meta.env.VITE_AUTH_REQUIRED !== 'false';
}
/** Platform administration: admin only. */
export function isAdmin() {
    return getStoredUser()?.role === 'admin';
}
/** Business intelligence: both supported roles. */
export function isAnalyst() {
    return getStoredUser()?.role === 'analyst';
}
export function isAdminOrAnalyst() {
    const role = getStoredUser()?.role;
    return role === 'admin' || role === 'analyst';
}
export async function login(username, password) {
    const body = new URLSearchParams({ username, password });
    const r = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
    if (!r.ok)
        throw new Error(r.status === 401 ? 'Invalid credentials' : `Login failed: ${r.status}`);
    const data = (await r.json());
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
}
export async function refreshAccessToken() {
    const refresh_token = getRefreshToken();
    if (!refresh_token)
        return null;
    try {
        const r = await fetch(`${API_BASE}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token }),
        });
        if (!r.ok)
            return null;
        const data = (await r.json());
        localStorage.setItem(TOKEN_KEY, data.access_token);
        return data.access_token;
    }
    catch {
        return null;
    }
}
export function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
}
