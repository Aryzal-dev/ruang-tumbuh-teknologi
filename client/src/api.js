const API_BASE = '/api';

export function getAuthHeader() {
  const token = localStorage.getItem('promptvault_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchWithAuth(url, options = {}) {
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('promptvault_token');
    localStorage.removeItem('promptvault_user');
    window.dispatchEvent(new Event('auth:expired'));
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Terjadi kesalahan pada permintaan.');
  }
  return data;
}

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login gagal.');
    return data;
  },

  getMe: () => fetchWithAuth('/auth/me'),

  // Public Prompts (No auth needed)
  getPublicPrompts: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.media_type) searchParams.append('media_type', params.media_type);
    if (params.ai_model) searchParams.append('ai_model', params.ai_model);
    if (params.q) searchParams.append('q', params.q);
    if (params.sort) searchParams.append('sort', params.sort);

    const qs = searchParams.toString();
    const res = await fetch(`${API_BASE}/prompts/public${qs ? `?${qs}` : ''}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memuat galeri publik.');
    return data;
  },

  // Private Prompts
  getPrompts: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.media_type) searchParams.append('media_type', params.media_type);
    if (params.favorite) searchParams.append('favorite', params.favorite);
    if (params.publish_status) searchParams.append('publish_status', params.publish_status);
    if (params.is_public !== undefined && params.is_public !== '') searchParams.append('is_public', params.is_public);
    if (params.ai_model) searchParams.append('ai_model', params.ai_model);
    if (params.q) searchParams.append('q', params.q);
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.scope) searchParams.append('scope', params.scope);

    const qs = searchParams.toString();
    return fetchWithAuth(`/prompts${qs ? `?${qs}` : ''}`);
  },

  getPrompt: (id) => fetchWithAuth(`/prompts/${id}`),

  createPrompt: (formData) => {
    return fetch(`${API_BASE}/prompts`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat prompt.');
      return data;
    });
  },

  updatePrompt: (id, formData) => {
    return fetch(`${API_BASE}/prompts/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal update prompt.');
      return data;
    });
  },

  toggleFavorite: (id) => fetchWithAuth(`/prompts/${id}/favorite`, { method: 'PATCH' }),

  togglePublish: (id) => fetchWithAuth(`/prompts/${id}/publish`, { method: 'PATCH' }),

  approvePrompt: (id) => fetchWithAuth(`/prompts/${id}/approve`, { method: 'PATCH' }),

  rejectPrompt: (id) => fetchWithAuth(`/prompts/${id}/reject`, { method: 'PATCH' }),

  deletePrompt: (id) => fetchWithAuth(`/prompts/${id}`, { method: 'DELETE' }),

  // Stats
  getStats: () => fetchWithAuth('/stats'),

  // User Management (Superadmin & Admin only)
  getUsers: () => fetchWithAuth('/users'),

  createUser: (userData) =>
    fetchWithAuth('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }),

  updateUser: (id, userData) =>
    fetchWithAuth(`/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }),

  deleteUser: (id) =>
    fetchWithAuth(`/users/${id}`, {
      method: 'DELETE',
    }),
};
