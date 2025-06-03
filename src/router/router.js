//src/router/router.js
import LoginPresenter from '../presenters/loginPresenter.js';
import RegisterPresenter from '../presenters/registerPresenter.js';
import AddStoryPresenter from '../presenters/addStoryPresenter.js';

import HomePresenter from '../presenters/homePresenter.js';
import HomeView from '../views/homeView.js';
import AddStoryView from '../views/addStoryView.js';
import loginView from '../views/loginView.js';
import registerView from '../views/registerView.js';

import StoryModel from '../model/storyModel.js';
import AuthModel from '../model/authModel.js';
import HomeModel from '../model/HomeModel.js';

// Helper View function untuk navigasi
const redirectTo = (hash) => {
  window.location.hash = hash;
};

const presenters = {
  login: null,
  register: null,
  home: null,
  addStory: null,
};

export const router = (container) => {
  if (!container) return;

  const token = AuthModel.getToken();
  const hash = window.location.hash || '#/';

  // Bersihkan presenter sebelumnya (agar kamera dll bisa dimatikan sesuai arahan reviewer)
  Object.values(presenters).forEach(presenter => {
    if (presenter && typeof presenter.destroy === 'function') {
      presenter.destroy();
    }
  });

  Object.keys(presenters).forEach(key => {
    presenters[key] = null;
  });

  if (!token && !['#/login', '#/register'].includes(hash)) {
    redirectTo('#/login');
    return;
  }

  const renderPage = () => {
    container.innerHTML = '';

    switch(hash) {
      case '#/login':
        presenters.login = new LoginPresenter(container, loginView, AuthModel);
        presenters.login.init();
        break;

      case '#/register':
        presenters.register = new RegisterPresenter(container, AuthModel, registerView);
        presenters.register.init();
        break;

      case '#/add':
        const addModel = new StoryModel();
        const addView = new AddStoryView();
        addView.render(container);
        presenters.addStory = new AddStoryPresenter(container, addModel, addView);
        presenters.addStory.init();
        break;


      case '#/': 
        const homeModel = new HomeModel();
        const homeView = new HomeView(container);
        presenters.home = HomePresenter(homeView, homeModel, AuthModel);
        presenters.home.init();
      break;


      default:
        container.innerHTML = `
          <main tabindex="-1" role="main">
            <h2>404 Not Found</h2>
            <p>Halaman yang kamu cari tidak ditemukan.</p>
          </main>
        `;
        const mainContent = container.querySelector('main');
        if (mainContent) mainContent.focus();
    }
  };

  if (document.startViewTransition) {
    document.startViewTransition(renderPage);
  } else {
    renderPage();
  }
};

export default router;