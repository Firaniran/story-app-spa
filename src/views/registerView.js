import Swal from 'sweetalert2';

const registerView = (container, presenter) => {
  container.innerHTML = `
    <section class="form-section" role="main" tabindex="-1" id="main-content">
      <h2>Register</h2>
      <form id="registerForm" aria-label="Form registrasi">
        <label for="name">Nama Lengkap</label>
        <input type="text" id="name" placeholder="Nama Lengkap" required />
        
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="Email" required />
        
        <label for="password">Password</label>
        <input type="password" id="password" placeholder="Password" required />
        
        <button type="submit">Daftar</button>
      </form>
      <p>Udah punya akun? <a href="#/login">Login disini</a></p>
    </section>
  `;

  const form = container.querySelector('#registerForm');
  const submitButton = form.querySelector('button');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    submitButton.disabled = true;
    submitButton.textContent = 'Loading...';

    presenter.handleRegister(
      name,
      email,
      password,
      async () => {
        await Swal.fire({
          icon: 'success',
          title: 'Registrasi Berhasil!',
          text: 'Registrasi sukses bro, langsung login ya!',
          confirmButtonText: 'Oke',
        });
        localStorage.setItem('userName', name);
        window.location.hash = '#/login';
        submitButton.disabled = false;
        submitButton.textContent = 'Daftar';
      },
      async (errMsg) => {
        await Swal.fire({
          icon: 'error',
          title: 'Gagal Registrasi',
          text: errMsg,
        });
        submitButton.disabled = false;
        submitButton.textContent = 'Daftar';
      }
    );
  });

  container.querySelector('#name')?.focus();
};

export default registerView;