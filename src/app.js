import MainView from './path/to/MainView.js';
import router from './router/router.js';

const container = document.getElementById('app')
const mainView = new MainView(container);

function rerenderApp() {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  mainView.renderNav(isLoggedIn);
  mainView.clearContent();

  const contentContainer = mainView.getContentContainer();

  if (document.startViewTransition) {
    document.startViewTransition(() => {
      contentContainer.innerHTML = '';
      router(contentContainer);
    });
  } else {
    contentContainer.innerHTML = '';
    router(contentContainer);
  }
}

window.rerenderApp = rerenderApp;

document.addEventListener('DOMContentLoaded', () => {
  rerenderApp();

  window.addEventListener('hashchange', () => {
    rerenderApp();
  });

  document.addEventListener('click', e => {
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
});