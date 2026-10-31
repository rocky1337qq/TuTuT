// API клиент для сервиса ТуТуТ
const API = {
  baseUrl: '/api',

  getToken() {
    return localStorage.getItem('tutut_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('tutut_token', token);
    } else {
      localStorage.removeItem('tutut_token');
    }
  },

  getUser() {
    try {
      const u = localStorage.getItem('tutut_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('tutut_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tutut_user');
    }
  },

  clearAuth() {
    localStorage.removeItem('tutut_token');
    localStorage.removeItem('tutut_user');
    // Очистка старых ключей для обратной совместимости
    localStorage.removeItem('user');
  },

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          // Если токен протух или невалиден
          this.clearAuth();
          if (window.checkAuth) window.checkAuth();
        }
        throw new Error(data.error || `Ошибка сервера (${response.status})`);
      }

      return data;
    } catch (err) {
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

// Функция защиты от XSS атак при выводе данных в DOM
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.API = API;
window.escapeHtml = escapeHtml;
