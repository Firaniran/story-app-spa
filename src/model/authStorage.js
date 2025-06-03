// src/model/authStorage.js
const AuthStorage = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  clearToken: () => localStorage.removeItem('token'),
  getUserName: () => localStorage.getItem('userName'),
  setUserName: (name) => localStorage.setItem('userName', name),
  clearUserName: () => localStorage.removeItem('userName'),
  clearAll: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
  }
};

export default AuthStorage;