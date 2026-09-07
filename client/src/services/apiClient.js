const rawBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:5000');
export const API_BASE = String(rawBase).replace(/\/+$/, '');

let inMemoryAccessToken = null;

export function setAccessToken(token) {
  inMemoryAccessToken = token;
}

export function getAccessToken() {
  return inMemoryAccessToken;
}

export async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (inMemoryAccessToken) {
    headers['Authorization'] = `Bearer ${inMemoryAccessToken}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include' // include cookies for refresh token
  };

  let response = await fetch(`${API_BASE}${endpoint}`, config);

  // Handle 401 token expiry by attempting refresh token
  if (response.status === 401 && !options._isRetry && endpoint !== '/api/auth/login' && endpoint !== '/api/auth/refresh') {
    try {
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setAccessToken(refreshData.accessToken);
        headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
        response = await fetch(`${API_BASE}${endpoint}`, { ...config, headers, _isRetry: true });
      } else {
        setAccessToken(null);
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    } catch (err) {
      setAccessToken(null);
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
  }

  return response;
}
