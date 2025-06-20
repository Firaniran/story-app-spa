import './styles/style.css';
import MainView from './views/mainView.js';
import router from './router/router.js';
import { setupPushNotification } from '../utils/push-notification.js';

const container = document.getElementById('app');
const mainView = new MainView(container);

function rerenderApp() {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  mainView.renderNav(isLoggedIn);
  mainView.clearContent();

  router(mainView.getContentContainer());
}

// Buat global agar bisa dipanggil dari mana saja
window.rerenderApp = rerenderApp;

document.addEventListener('DOMContentLoaded', () => {
  rerenderApp();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/story-app-spa/service-worker.js')
      .then(() => console.log('Service Worker registered'))
      .catch(console.error);
  }

  // Navigasi SPA dengan anchor
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