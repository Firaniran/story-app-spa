//src/models/addStoryModel.js
export default class AddStoryModel {
  constructor() {
    this._BASE_URL = 'https://story-api.dicoding.dev/v1';
  }

  // Method untuk mendapatkan token dari localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // Method untuk validasi file foto
  validatePhoto(file) {
    const errors = [];  
    if (!file) {
      errors.push('Foto harus dipilih');
      return errors;
    }
    if (!file.type.startsWith('image/')) {
      errors.push('File harus berupa gambar');
    }

    // Validasi ukuran file (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('Ukuran file maksimal 5MB');
    }
    
    return errors;
  }

  // Method untuk validasi data story
  validateStoryData({ description, photo, location }) {
    const errors = [];
    if (!description || description.trim().length === 0) {
      errors.push('Deskripsi tidak boleh kosong');
    }
    if (!location || !location.lat || !location.lon) {
      errors.push('Lokasi harus dipilih');
    }

    // Validasi foto
    const photoErrors = this.validatePhoto(photo);
    errors.push(...photoErrors);

    return errors;
  }

  // Method untuk mengirim story ke API
  async addStory(formData) {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Token tidak tersedia. Silakan login kembali.');
    }

    try {
      const response = await fetch(`${this._BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengirim story');
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet.');
      }
      throw error;
    }
  }

  // Method untuk mendapatkan daftar stories
  async getStories() {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Token tidak tersedia. Silakan login kembali.');
    }

    try {
      const response = await fetch(`${this._BASE_URL}/stories`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengambil data stories');
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet.');
      }
      throw error;
    }
  }

  // Method untuk membuat FormData dari data story
  createFormData({ description, photo, location }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    formData.append('lat', location.lat);
    formData.append('lon', location.lon);
    return formData;
  }
}