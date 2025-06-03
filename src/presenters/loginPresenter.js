export default class LoginPresenter {
  constructor(container, view, model) {
    this.container = container;
    this.view = view;
    this.model = model;
  }

  init() {
    this.view(this.container, this);
  }

  async handleLogin(email, password, onSuccess, onError) {
    try {
      const res = await this.model.login(email, password);
      if (!res.error) {
        onSuccess(res.loginResult);
      } else {
        onError(res.message || 'Email atau password salah.');
      }
    } catch (err) {
      onError('Gagal menghubungi server. Coba lagi nanti.');
    }
  }

  destroy() {
    this.container.innerHTML = '';
  }
}