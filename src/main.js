// main.js
import './styles/style.css';
import MainView from './views/mainView.js';
import router from './router/router.js';
import { setupPushNotification } from '../utils/push-notification.js';

const container = document.getElementById('app');
const mainView = new MainView(container);

function rerenderApp() {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  // Render navbar sesuai status login
  mainView.renderNav(isLoggedIn);
  mainView.clearContent();

  const contentContainer = mainView.getContentContainer();
  contentContainer.innerHTML = '';
  router(contentContainer);
    if (isLoggedIn && !document.getElementById('pushButton')) {
    const btn = document.createElement('button');
    btn.id = 'pushButton';
    btn.textContent = 'Aktifkan Notifikasi';
    btn.style.position = 'fixed';
    btn.style.bottom = '20px';
    btn.style.right = '20px';
    btn.style.zIndex = '9999';
    btn.style.padding = '10px 16px';
    btn.style.background = '#2196f3';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    
    btn.addEventListener('click', async () => {
      const result = await setupPushNotification();
      alert(result.message);
    });

    document.body.appendChild(btn);
    }
}

// Buat global agar bisa dipanggil dari mana saja
window.rerenderApp = rerenderApp;

document.addEventListener('DOMContentLoaded', async () => {
  rerenderApp();

  // ✅ Pasang event listener setelah DOM siap
  const pushButton = document.getElementById('pushButton');
  console.log('pushButton:', pushButton);

  if (pushButton) {
    pushButton.addEventListener('click', async () => {
      const result = await setupPushNotification();
      alert(result.message);
    });
  }

  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/story-app-spa/service-worker.js');
      console.log('Service Worker registered');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  rerenderApp();

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