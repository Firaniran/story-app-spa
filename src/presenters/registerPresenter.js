export default class RegisterPresenter {
  constructor(container, model, view) {
    this.container = container;
    this.model = model;
    this.view = view;
  }

  init() {
    this.view(this.container, this);
  }

  async handleRegister(name, email, password, onSuccess, onError) {
    try {
      const result = await this.model.register(name, email, password);
      if (result.message === 'User created') {
        onSuccess();
      } else {
        onError(result.message || 'Registrasi gagal bro!');
      }
    } catch (err) {
      onError(err.message || 'Terjadi kesalahan server. Coba lagi nanti.');
    }
  }

  destroy() {
    this.container.innerHTML = '';
  }
}