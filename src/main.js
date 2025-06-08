import './styles/style.css';
import router from './router/router.js';

const container = document.getElementById('app');

function renderNav(isLoggedIn) {
  const nav = document.createElement('nav');
  nav.innerHTML = isLoggedIn ? '<a href="#/logout">Logout</a>' : '<a href="#/login">Login</a>';
  container.appendChild(nav);
}

function clearContent() {
  const content = container.querySelector('.content');
  if (content) {
    content.remove();
  }
}

function rerenderApp() {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  // Render navbar sesuai status login
  renderNav(isLoggedIn);
  clearContent();
  router(container);
}

window.rerenderApp = rerenderApp;

document.addEventListener('DOMContentLoaded', () => {
  rerenderApp();
  document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
      e.preventDefault();
      const targetHash = e.target.getAttribute('href');
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      } else {
        rerenderApp();
      }
    }
  });

  // Render ulang saat hash berubah
  window.addEventListener('hashchange', () => {
    rerenderApp();
  });
});