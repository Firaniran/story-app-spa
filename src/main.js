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

  // Tambah tombol notifikasi kalau sudah login dan tombol belum ada
  if (isLoggedIn && !document.getElementById('pushButton')) {
    const btn = document.createElement('button');
    btn.id = 'pushButton';
    btn.textContent = 'Aktifkan Notifikasi';
    document.body.appendChild(btn);

    btn.addEventListener('click', async () => {
      const result = await setupPushNotification();
      alert(result.message);
    });
  }
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