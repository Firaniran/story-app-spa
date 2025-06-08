import './styles/style.css';
import MainView from './views/mainView.js';
import router from './router/router.js';

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