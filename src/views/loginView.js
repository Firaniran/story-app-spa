import Swal from 'sweetalert2';

const loginView = (container, presenter) => {
  container.innerHTML = `
    <section class="form-section">
      <h2>Login</h2>
      <form id="loginForm">
        <input type="email" id="email" placeholder="Email" required />
        <input type="password" id="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p>Belum punya akun? <a href="#/register">Daftar disini</a></p>
    </section>
  `;

  const form = container.querySelector('#loginForm');
  const submitButton = form.querySelector('button');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitButton.disabled = true;
    submitButton.textContent = 'Loading...';

    const email = container.querySelector('#email').value;
    const password = container.querySelector('#password').value;

    presenter.handleLogin(
      email,
      password,
      async (result) => {
        localStorage.setItem('token', result.token);
        localStorage.setItem('userName', result.name);

        window.location.hash = '#/';
        window.rerenderApp?.();

        await Swal.fire({
          icon: 'success',
          title: 'Login Berhasil!',
          text: `Selamat datang, ${result.name}!`,
          timer: 1800,
          showConfirmButton: false,
        });

        submitButton.disabled = false;
        submitButton.textContent = 'Login';
      },
      async (errorMessage) => {
        await Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: errorMessage,
        });
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
      }
    );
  });

  container.querySelector('#email')?.focus();
};

export default loginView;