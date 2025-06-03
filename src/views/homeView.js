import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default class HomeView {
  constructor(container) {
    this.container = container;
    this.map = null;
  }

  destroyMap() {
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
  }

  renderLoading() {
    this.destroyMap();
    this.container.innerHTML = `<div class="loader"></div>`;
  }

  renderError(message) {
    this.destroyMap();
    this.container.innerHTML = `<p class="error">Error: ${message}</p>`;
  }

  render(stories) {
    this.destroyMap();
    this.container.innerHTML = `
      <a href="javascript:void(0);" class="skip-link" tabindex="0">Lewati ke konten utama</a>

      <div class="stories-container">
        <div id="map" style="height: 400px;"></div>
        <div id="storiesList" tabindex="-1">
          ${stories.map(story => `
            <div class="story-card">
              <img src="${story.photoUrl}" alt="Foto ${story.name} - ${story.description}">
              <h3>${story.name}</h3>
              <p>${story.description}</p>
              <small>Lokasi: ${story.lat || '-'}, ${story.lon || '-'}</small>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.map = L.map('map').setView([-7.607874, 110.203751], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    stories.forEach(story => {
      if (story.lat && story.lon) {
        L.marker([story.lat, story.lon])
          .addTo(this.map)
          .bindPopup(`
            <img src="${story.photoUrl}" width="100" alt="Foto ${story.name}">
            <h4>${story.name}</h4>
            <p>${story.description}</p>
          `);
      }
    });
  }

  bindSkipToContent() {
    const skipLink = this.container.querySelector('.skip-link');
    const mainContent = this.container.querySelector('#storiesList');

    if (skipLink && mainContent) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
      });

      skipLink.addEventListener('keydown', (e) => {
        if (['Enter', ' ', 'Spacebar'].includes(e.key)) {
          e.preventDefault();
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }
    navigateTo(hash) {
    window.location.hash = hash;
  }
}