//src/views/addStoryView.js
import Swal from 'sweetalert2';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default class AddStoryView {
  constructor() {
    this.container = null;
    this.map = null;
    this.marker = null;
    this.mediaStream = null;

    // DOM references dipindah ke View sesuai arahan reviewer
    this.photoPreview = null;
    this.photoPreviewContainer = null;
    this.cameraStream = null;
    this.captureBtn = null;
    this.cancelCameraBtn = null;
    this.openCameraBtn = null;
    this.photoInput = null;
    this.descriptionInput = null;
    this.locateBtn = null;
    this.storyForm = null;
    this.submitBtn = null;

    // Callbacks untuk komunikasi dengan presenter
    this.onLocateClick = null;
    this.onPhotoChange = null;
    this.onOpenCamera = null;
    this.onCancelCamera = null;
    this.onCapture = null;
    this.onSubmit = null;
    this.onMarkerDragEnd = null;
    this.onMapClick = null;
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = `
      <main id="main-content" tabindex="-1">
        <h2>Tambah Story & Lokasi</h2>
        <a href="#main-content" class="skip-link">Skip to Content</a>
        <form id="storyForm" aria-label="Form tambah cerita">
          <label for="description">Deskripsi cerita</label>
          <textarea id="description" name="description" placeholder="Ceritain pengalaman lo..." required></textarea>
          
          <button type="button" id="locateBtn">Deteksi Lokasi</button>
          <div id="mapContainer" style="height: 300px; margin: 1rem 0;"></div>
          
          <div class="photo-section">
            <h3>Pilih Foto</h3>
            
            <label for="photo" class="upload-btn">
              📁 Pilih dari Galeri
              <input type="file" id="photo" name="photo" accept="image/*" aria-label="Upload foto">
            </label>

            <div class="camera-section" style="margin-top: 1rem;">
              <button type="button" id="openCameraBtn">📷 Buka Kamera</button>
              <button type="button" id="cancelCameraBtn" style="display:none; margin-left: 0.5rem; background: #ff4444;">❌ Tutup Kamera</button>
              
              <video id="cameraStream" autoplay playsinline muted style="display:none; width:100%; max-height:400px; margin-top:1rem; border-radius: 8px; border: 2px solid #ddd;"></video>
              <button type="button" id="captureBtn" style="display:none; margin-top: 0.5rem; padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; font-size: 16px;">📸 Jepret Foto</button>
            </div>

            <!-- Preview hasil foto (dari galeri atau kamera) -->
            <div id="photoPreviewContainer" style="display:none; margin-top: 1rem;">
              <h4>Preview Foto:</h4>
              <img id="photoPreview" alt="Preview Foto" style="max-width: 100%; border-radius: 12px; object-fit: contain; max-height: 300px; border: 2px solid #28a745;">
              <p style="color: #28a745; font-size: 14px; margin-top: 5px;">✅ Foto siap untuk diupload!</p>
            </div>
          </div>

          <canvas id="photoCanvas" style="display:none;"></canvas>

          <button type="submit" class="submit-btn" style="margin-top: 2rem;">📤 Upload Story</button>
        </form>
      </main>
    `;

    // Initialize DOM references setelah render
    this._initializeDOMReferences();
    this._bindEventListeners();
  }

  _initializeDOMReferences() {
    console.log('=== INISIALISASI DOM REFERENCES ===');
    setTimeout(() => {
      this.photoPreview = this.container.querySelector('#photoPreview');
      this.photoPreviewContainer = this.container.querySelector('#photoPreviewContainer');
      this.cameraStream = this.container.querySelector('#cameraStream');
      this.captureBtn = this.container.querySelector('#captureBtn');
      this.cancelCameraBtn = this.container.querySelector('#cancelCameraBtn');
      this.openCameraBtn = this.container.querySelector('#openCameraBtn');
      this.photoInput = this.container.querySelector('#photo');
      this.descriptionInput = this.container.querySelector('#description');
      this.locateBtn = this.container.querySelector('#locateBtn');
      this.storyForm = this.container.querySelector('#storyForm');
      this.submitBtn = this.container.querySelector('button[type="submit"]');
      
      // Debug log
      console.log('DOM References Status:', {
        photoPreview: !!this.photoPreview,
        photoPreviewContainer: !!this.photoPreviewContainer,
        cameraStream: !!this.cameraStream,
        captureBtn: !!this.captureBtn,
        photoInput: !!this.photoInput
      });

      // Setup error handler untuk photo preview
      if (this.photoPreview) {
        this.photoPreview.onerror = (error) => {
          console.warn('Gagal memuat preview gambar:', error);
          if (this.photoPreviewContainer) {
            this.photoPreviewContainer.style.display = 'none';
          }
          this.photoPreview.src = '';
        };

        this.photoPreview.onload = () => {
          console.log('Preview image loaded:', this.photoPreview.naturalWidth, 'x', this.photoPreview.naturalHeight);
        };
      }
    }, 50);
  }

  _bindEventListeners() {
    setTimeout(() => {
      if (this.locateBtn && this.onLocateClick) {
        this.locateBtn.addEventListener('click', this.onLocateClick);
      }
      if (this.photoInput && this.onPhotoChange) {
        this.photoInput.addEventListener('change', this.onPhotoChange);
      }
      if (this.openCameraBtn && this.onOpenCamera) {
        this.openCameraBtn.addEventListener('click', this.onOpenCamera);
      }
      if (this.cancelCameraBtn && this.onCancelCamera) {
        this.cancelCameraBtn.addEventListener('click', this.onCancelCamera);
      }
      if (this.captureBtn && this.onCapture) {
        this.captureBtn.addEventListener('click', this.onCapture);
      }
      if (this.storyForm && this.onSubmit) {
        this.storyForm.addEventListener('submit', this.onSubmit);
      }
      
      console.log('Events berhasil di-bind');
    }, 100);
  }
  setCallbacks({
    onLocateClick,
    onPhotoChange,
    onOpenCamera,
    onCancelCamera,
    onCapture,
    onSubmit,
    onMarkerDragEnd,
    onMapClick
  }) {
    this.onLocateClick = onLocateClick;
    this.onPhotoChange = onPhotoChange;
    this.onOpenCamera = onOpenCamera;
    this.onCancelCamera = onCancelCamera;
    this.onCapture = onCapture;
    this.onSubmit = onSubmit;
    this.onMarkerDragEnd = onMarkerDragEnd;
    this.onMapClick = onMapClick;
  }

  bindSkipToContent() {
    const skipLink = this.container.querySelector('.skip-link');
    const mainContent = this.container.querySelector('#main-content');
    if (skipLink && mainContent) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        skipLink.blur();
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  // INISIALISASI MAP
  initMap(defaultCoords = [-7.607874, 110.203751], zoom = 13) {
    try {
      this.map = L.map('mapContainer').setView(defaultCoords, zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.map.on('tileerror', () => {
        this.showError('Gagal memuat peta', 'Periksa koneksi internet lo, bro!');
      });

      this.map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        this.setMarker(lat, lng);
        if (this.onMapClick) {
          this.onMapClick(lat, lng);
        }
      });
    } catch (error) {
      console.error('Map initialization error:', error);
      this.showError('Gagal menginisialisasi peta', 'Terjadi kesalahan saat memuat peta.');
    }
  }

  setMapView(lat, lon, zoom = 15) {
    if (this.map) {
      this.map.setView([lat, lon], zoom);
    }
  }

  setMarker(lat, lon) {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.marker = L.marker([lat, lon], { draggable: true })
      .addTo(this.map)
      .bindPopup("Lokasi cerita lo nih! Geser kalau mau")
      .openPopup();

    if (this.onMarkerDragEnd) {
      this.marker.on('dragend', (e) => {
        this.onMarkerDragEnd(e.target.getLatLng());
      });
    }
  }

  clearMap() {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
  }
  
  // LOKASI PERANGKAT BIAR KEREN
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lon: longitude });
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(new Error('Gagal mendapatkan lokasi. Silakan coba lagi atau tentukan lokasi secara manual.'));
        }
      );
    });
  }

  // KAMERA API
  async getCameraStream() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Kamera tidak didukung browser');
    }

    try {
      // biar kompatibel
      const constraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'environment'
        }
      };
      
      console.log('Mencoba akses kamera dengan constraint:', constraints);
      return await navigator.mediaDevices.getUserMedia(constraints);
      
    } catch (error) {
      console.error('Camera error:', error);
      try {
        console.log('Mencoba fallback constraint...');
        return await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }
        });
      } catch (fallbackError) {
        console.error('Fallback camera error:', fallbackError);
        throw new Error('Pastikan izin kamera sudah diberikan dan tidak sedang digunakan aplikasi lain.');
      }
    }
  }

  // RENDER FILE DARI API
  handleFileRead(file, onSuccess, onError) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        onSuccess(e.target.result);
      } catch (error) {
        console.error('Error in success callback:', error);
        onError(error);
      }
    };
    
    reader.onerror = () => {
      console.error('FileReader error');
      onError(new Error('Gagal membaca file'));
    };
    
    reader.readAsDataURL(file);
  }

  // NAVIGASI
  redirectToLogin() {
    window.location.hash = '#/login';
  }

  redirectToHome() {
    window.location.hash = '#/';
  }

  // FORRM DATA
  getFormData() {
    return {
      description: this.descriptionInput?.value?.trim() || '',
      photoFile: this.photoInput?.files?.[0] || null
    };
  }

  // PREVIEW FOTO 
  showPhotoPreview(src) {
    console.log('SHOW PHOTO PREVIEW');
    console.log('Source:', src ? src.substring(0, 50) + '...' : 'null');
    if (!this.photoPreview || !this.photoPreviewContainer) {
      console.log('DOM references belum siap, inisialisasi ulang...');
      this._initializeDOMReferences();
      setTimeout(() => {
        this.showPhotoPreview(src);
      }, 100);
      return;
    }
    
    if (src && this.photoPreview && this.photoPreviewContainer) {
      try {
        if (this.photoPreview.src && this.photoPreview.src.startsWith('blob:')) {
          URL.revokeObjectURL(this.photoPreview.src);
        }
        this.photoPreview.src = src;
        this.photoPreviewContainer.style.display = 'block';
        
        console.log('Preview berhasil ditampilkan');
        setTimeout(() => {
          this.photoPreviewContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 100);
        
      } catch (error) {
        console.error('Error setting photo preview:', error);
        this.showError('Gagal menampilkan preview', 'Terjadi kesalahan saat menampilkan preview foto.');
      }
    } else {
      console.error('showPhotoPreview gagal - parameter tidak valid:', {
        hasSrc: !!src,
        hasPhotoPreview: !!this.photoPreview,
        hasContainer: !!this.photoPreviewContainer
      });
    }
  }

  hidePhotoPreview() {
    console.log('hidePhotoPreview dipanggil');
    
    if (this.photoPreview) {
      // Revoke blob URL jika ada
      if (this.photoPreview.src && this.photoPreview.src.startsWith('blob:')) {
        URL.revokeObjectURL(this.photoPreview.src);
      }
      this.photoPreview.src = '';
    }
    
    if (this.photoPreviewContainer) {
      this.photoPreviewContainer.style.display = 'none';
    }
  }

  // KAMERA
  showCamera(stream) {
    if (!stream || !this.cameraStream) {
      console.error('Stream atau camera element tidak tersedia');
      return;
    }

    try {
      this.mediaStream = stream;
      this.cameraStream.srcObject = stream;
      this.cameraStream.onloadedmetadata = () => {
        this.cameraStream.play().then(() => {
          console.log('Kamera berhasil mulai');
        }).catch(error => {
          console.error('Error:', error);
          this.showError('Gagal memutar video kamera', 'Terjadi kesalahan saat memutar video kamera.');
        });
      };

      this.cameraStream.style.display = 'block';
      this.captureBtn.style.display = 'inline-block';
      this.cancelCameraBtn.style.display = 'inline-block';
      this.openCameraBtn.style.display = 'none';
      
      if (this.photoInput) {
        this.photoInput.disabled = true;
      }
    } catch (error) {
      console.error('Error:', error);
      this.showError('Gagal menampilkan kamera', 'Terjadi kesalahan saat menampilkan kamera.');
    }
  }

  hideCamera() {
    try {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => {
          track.stop();
        });
        this.mediaStream = null;
      }
      if (this.cameraStream) {
        this.cameraStream.srcObject = null;
        this.cameraStream.style.display = 'none';
      }

      if (this.captureBtn) this.captureBtn.style.display = 'none';
      if (this.cancelCameraBtn) this.cancelCameraBtn.style.display = 'none';
      if (this.openCameraBtn) this.openCameraBtn.style.display = 'inline-block';
      if (this.photoInput) {
        this.photoInput.disabled = false;
      }
    } catch (error) {
      console.error('Error hiding camera:', error);
    }
  }

  async capturePhotoFromVideo() {
    console.log('=== CAPTURE PHOTO FROM VIDEO ===');
    
    if (!this.cameraStream) {
      throw new Error('Camera stream tidak tersedia');
    }

    // Pastikan video sudah ready
    if (this.cameraStream.readyState < 3) {
      console.log('Menunggu video ready...');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout'));
        }, 5000);

        const checkReady = () => {
          if (this.cameraStream.readyState >= 3) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });
    }

    // Validasi dimensi video
    if (!this.cameraStream.videoWidth || !this.cameraStream.videoHeight) {
      throw new Error('Video dimensions tidak tersedia');
    }

    const video = this.cameraStream;
    const canvas = this.container.querySelector('#photoCanvas');
    
    if (!canvas) {
      throw new Error('Canvas element tidak ditemukan');
    }

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    console.log(`Capturing dengan dimensi: ${canvas.width}x${canvas.height}`);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob && blob.size > 0) {
          const url = URL.createObjectURL(blob);
          console.log('Blob berhasil dibuat, size:', blob.size, 'bytes');
          resolve({ blob, url });
        } else {
          reject(new Error('Gagal membuat blob dari canvas'));
        }
      }, 'image/jpeg', 0.9);
    });
  }

  clear() {
    this.hideCamera();
    this.hidePhotoPreview();
    this.clearMap();
    if (this.storyForm) this.storyForm.reset();
  }

  setLoading(isLoading) {
    if (!this.submitBtn) return;
    if (isLoading) {
      this.submitBtn.disabled = true;
      this.submitBtn.textContent = '⏳ Uploading...';
    } else {
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = '📤 Upload Story';
    }
  }

  async showError(title = 'Error', text = '') {
    await Swal.fire({
      icon: 'error',
      title,
      text,
    });
  }

  async showWarning(title = 'Warning', text = '') {
    await Swal.fire({
      icon: 'warning',
      title,
      text,
    });
  }

  async showSuccess(title = 'Berhasil', text = '') {
    await Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 1500,
      showConfirmButton: false,
    });
  }
}