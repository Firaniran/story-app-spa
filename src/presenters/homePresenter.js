const HomePresenter = (view, model, authModel) => {
const init = async () => {
  console.log('HomePresenter init called');
  if (!authModel.isLoggedIn()) {
    console.log('User not logged in, redirect to login');
    window.location.hash = '#/login';
    return;
  }

    view.destroyMap();
    view.renderLoading();

    try {
      const stories = await model.getStories();
      console.log('stories:', stories);
      console.log('Array.isArray(stories):', Array.isArray(stories));

      view.render(stories);
      view.bindSkipToContent();
    } catch (err) {
      view.renderError(err.message);
    }
  };

  return { init };
};

export default HomePresenter;