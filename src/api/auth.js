// src/api/auth.js
export const checkAuth = () => {
  return !!localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  window.location.hash = '#/login';
};