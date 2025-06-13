export default class MainView {
  constructor(container) {
    this.container = container;
    this.header = document.querySelector('header');
  }

  renderNav(isLoggedIn) {
    this.header = document.querySelector('header');
    if (!this.header) return;

    this.header.innerHTML = `
      <nav class="navbar" role="navigation" aria-label="Navigasi Utama">
        <a href="#main-content" class="skip-link" tabindex="0">Lewati ke konten utama</a>
        
        <section class="navbar-container">
          <div class="navbar-brand">
            <a href="#/" class="app-title" aria-label="Story App - Kembali ke Beranda">
              <h1 class="brand-title">Story App</h1>
            </a>
            <button 
              class="mobile-menu-toggle" 
              aria-label="Buka menu navigasi" 
              aria-expanded="false" 
              aria-controls="main-nav"
              type="button"
            >
              <span class="menu-bar" aria-hidden="true"></span>
              <span class="menu-bar" aria-hidden="true"></span>
              <span class="menu-bar" aria-hidden="true"></span>
            </button>
          </div>

          <div class="navbar-collapse" id="main-nav" hidden>
            <ul class="nav-list" role="menubar" aria-label="Menu navigasi utama">
              <li role="none">
                <a role="menuitem" href="#/" class="nav-link" tabindex="0" aria-current="page">
                  <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                  <span>Beranda</span>
                </a>
              </li>

              ${isLoggedIn ? `
              <li role="none">
                <a role="menuitem" href="#/add" class="nav-link" tabindex="0">
                  <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  <span>Tambah Story</span>
                </a>
              </li>
              ` : ''}

              ${!isLoggedIn ? `
              <li role="none">
                <a role="menuitem" href="#/login" class="nav-link" tabindex="0">
                  <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5z"/>
                  </svg>
                  <span>Masuk</span>
                </a>
              </li>
              <li role="none">
                <a role="menuitem" href="#/register" class="nav-link" tabindex="0">
                  <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V8c0-.55-.45-1-1-1s-1 .45-1 1v2H2c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1H6z"/>
                  </svg>
                  <span>Daftar</span>
                </a>
              </li>
              ` : ''}
            </ul>

              ${isLoggedIn ? `
              <aside class="user-actions" aria-label="Aksi pengguna" style="display: flex; align-items: center; gap: 1rem;">
                  <button id="pushButton" class="push-btn" type="button" aria-label="Aktifkan Notifikasi" style="background: none; border: none; cursor: pointer;">
                    <svg class="nav-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-1.99 2H20l-2-2z"/>
                  </svg>
                    </button>
                <button id="logoutBtn" class="logout-btn" role="menuitem" tabindex="0" type="button" aria-label="Keluar dari akun">
                    <svg class="logout-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16 17v-3H9v-4h7V7l5 5-5 5zM14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z"/>
                </svg
              </button>
              </aside>
            ` : ''}
            </div>
          </section>
        </nav>
      `;

    this.bindEvents();
  }

bindEvents() {
  const pushBtn = this.header.querySelector('#pushButton');
  if (pushBtn) {
    pushBtn.addEventListener('click', async () => {
      try {
        const { setupPushNotification } = await import('../../utils/push-notification.js');
        const result = await setupPushNotification();
        alert(result.message);
      } catch (error) {
        console.error(error);
        alert('Gagal mengaktifkan notifikasi');
      }
    });
  }

  const logoutBtn = this.header.querySelector('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      window.location.hash = '#/login';
      if (window.rerenderApp) window.rerenderApp();
    });
  }
    // Skip link
    const skipLink = this.header.querySelector('.skip-link');
    const mainContent = document.getElementById('main-content');
    if (skipLink && mainContent) {
      const scrollToMiddle = () => {
        // Hitung posisi scroll supaya mainContent ada di tengah viewport
        const rect = mainContent.getBoundingClientRect();
        const absoluteElementTop = window.pageYOffset + rect.top;
        const middleOffset = window.innerHeight / 2 - rect.height / 2;
        window.scrollTo({
          top: absoluteElementTop - middleOffset,
          behavior: 'smooth'
        });
      };

      const focusMainContent = () => {
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
        // Remove tabindex setelah focus agar aksesibilitas tetap baik
        setTimeout(() => mainContent.removeAttribute('tabindex'), 100);
      };

      const handleSkip = (e) => {
        e.preventDefault();
        skipLink.blur();
        scrollToMiddle();
        focusMainContent();
        this.announceToScreenReader('Melompat ke konten utama');
      };

      skipLink.addEventListener('click', handleSkip);

      skipLink.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
          handleSkip(e);
        }
      });
    }

    // Nav-link keyboard navigation
    const navLinks = this.header.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const href = link.getAttribute('href');
          if (href && href !== '#') {
            window.location.hash = href;
          }
        }
      });

      link.addEventListener('click', () => {
        navLinks.forEach(l => l.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'page');
      });
    });

    // Mobile menu toggle
    const menuToggle = this.header.querySelector('.mobile-menu-toggle');
    const mainNav = this.header.querySelector('#main-nav');

    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', () => {
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        const isExpanding = !expanded;

        menuToggle.setAttribute('aria-expanded', String(isExpanding));

        if (isExpanding) {
          mainNav.hidden = false;
          this.announceToScreenReader('Menu navigasi dibuka');
          setTimeout(() => {
            const firstFocusable = mainNav.querySelector('input, a, button, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) firstFocusable.focus();
          }, 50);
        } else {
          mainNav.hidden = true;
          this.announceToScreenReader('Menu navigasi ditutup');
          menuToggle.focus();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mainNav.hidden) {
          mainNav.hidden = true;
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.focus();
          this.announceToScreenReader('Menu navigasi ditutup');
        }
      });
    }
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  clearContent() {
    this.container.innerHTML = '';
  }

  getContentContainer() {
    return this.container;
  }

  renderPage(title, content, headingLevel = 2) {
    this.clearContent();

    const pageContainer = document.createElement('article');
    pageContainer.className = 'page-container';
    pageContainer.setAttribute('aria-labelledby', 'page-title');

    const pageTitle = document.createElement(`h${headingLevel}`);
    pageTitle.id = 'page-title';
    pageTitle.className = 'page-title';
    pageTitle.textContent = title;

    const pageContent = document.createElement('section');
    pageContent.className = 'page-content';
    pageContent.innerHTML = content;

    pageContainer.appendChild(pageTitle);
    pageContainer.appendChild(pageContent);

    this.container.appendChild(pageContainer);

    this.announceToScreenReader(`Halaman ${title} dimuat`);
  }
}