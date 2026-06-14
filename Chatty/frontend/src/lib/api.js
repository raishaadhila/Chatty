const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('chatty_token');
}

export async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (res.status === 401) {
    localStorage.removeItem('chatty_token');
    localStorage.removeItem('chatty_ws');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  return res.json();
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem('chatty_token');
  localStorage.removeItem('chatty_ws');
  window.location.href = '/';
}
