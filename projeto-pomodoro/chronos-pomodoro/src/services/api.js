const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const content = await response.text();
  const data = content ? JSON.parse(content) : null;

  if (!response.ok) {
    throw data || new Error('Erro de rede');
  }

  return data;
}

export const api = {
  login: body =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: body =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
  forgotPassword: body =>
    request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  resetPassword: body =>
    request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getTasks: () => request('/api/tasks'),
  addTask: body =>
    request('/api/tasks', { method: 'POST', body: JSON.stringify(body) }),
  toggleTask: id => request(`/api/tasks/${id}`, { method: 'PUT' }),
  getSettings: () => request('/api/settings'),
  updateSettings: body =>
    request('/api/settings', { method: 'PUT', body: JSON.stringify(body) }),
};
