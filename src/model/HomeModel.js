export default class HomeModel {
  constructor() {
    this._BASE_URL = 'https://story-api.dicoding.dev/v1';
  }

  getToken() {
    return localStorage.getItem('token');
  }

  checkAuth() {
    return !!this.getToken();
  }

  async getStories() {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${this._BASE_URL}/stories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    return data.listStory || [];
  }
}