// src/api/api.js
const BASE_URL = 'https://story-api.dicoding.dev/v1';

const Api = {
  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  register: async (name, email, password) => {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registrasi gagal');
    }

    return response.json();
  },

  getStories: async (token) => {
    const response = await fetch(`${BASE_URL}/stories`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  addStory: async (token, formData) => {
    // Jangan set 'Content-Type' secara manual saat pakai FormData
    const response = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    return response.json();
  }
};

export default Api;