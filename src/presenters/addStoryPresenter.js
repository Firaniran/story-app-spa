//src/presenters/addStoryPresenter.js
export default class AddStoryPresenter {
  constructor(container, model, view) {
    this.container = container;
    this.model = model;
    this.view = view;
    
    // State untuk logika bisnis
    this.selectedLocation = null;
    this.capturedBlob = null;
    this.capturedUrl = null;
    
    // Bind methods
    this.onLocateClick = this.onLocateClick.bind(this);
    this.onPhotoChange = this.onPhotoChange.bind(this);
    this.onOpenCamera = this.onOpenCamera.bind(this);
    this.onCancelCamera = this.onCancelCamera.bind(this);
    this.onCapture = this.onCapture.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onMarkerDragEnd = this.onMarkerDragEnd.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
  }

  async init() {
    // Cek autentikasi melalui model (pure business logic sesuai kata reviewer)
    if (!this.model.isAuthenticated()) {
      this.view.redirectToLogin();
      return;
    }

    // Render view dan setup
    this.view.render(this.container);
    this.view.bindSkipToContent();
    this.view.setCallbacks({
      onLocateClick: this.onLocateClick,
      onPhotoChange: this.onPhotoChange,
      onOpenCamera: this.onOpenCamera,
      onCancelCamera: this.onCancelCamera,
      onCapture: this.onCapture,
      onSubmit: this.onSubmit,
      onMarkerDragEnd: this.onMarkerDragEnd,
      onMapClick: this.onMapClick
    });
    
    setTimeout(() => {
      this.view.initMap();
    }, 150);
  }

  // PURE BUSINESS LOGIC
  onMapClick(lat, lon) {
    // Logika bisnis: simpan lokasi yang dipilih
    this.selectedLocation = { lat, lon };
    console.log('Location selected via map click:', this.selectedLocation);
  }

  onMarkerDragEnd(latlng) {
    // Logika bisnis: update lokasi saat marker di-drag
    this.selectedLocation = { lat: latlng.lat, lon: latlng.lng };
    console.log('Location updated via marker drag:', this.selectedLocation);
  }

  async onLocateClick() {
    try {
      const location = await this.view.getCurrentLocation();
      this.selectedLocation = location;
      this.view.setMapView(location.lat, location.lon, 15);
      this.view.setMarker(location.lat, location.lon);
      
      console.log('Current location detected:', this.selectedLocation);
    } catch (error) {
      console.error('Geolocation business logic error:', error);
      this.view.showError('Gagal mendapatkan lokasi', error.message);
    }
  }

  onPhotoChange(event) {
    console.log('=== PHOTO CHANGE BUSINESS LOGIC ===');
    const file = event.target.files[0];
    
    if (file) {
      console.log('Processing file from gallery:', {
        name: file.name,
        size: file.size + ' bytes',
        type: file.type
      });
      
      // Business logic: validasi file melalui model
      const errors = this.model.validatePhoto(file);
      if (errors.length > 0) {
        this.view.showError('File tidak valid', errors.join(', '));
        return;
      }

      // Business logic: cleanup previous data
      this._cleanupBlobUrls();
      
      // Reset captured data karena user pilih dari galeri
      this.capturedBlob = null;
      this.capturedUrl = null;
      
      // Delegate file reading ke view
      this.view.handleFileRead(file, (previewUrl) => {
        console.log('File gallery processed successfully');
        this.view.showPhotoPreview(previewUrl);
      }, (error) => {
        console.error('File reading error:', error);
        this.view.showError('Gagal membaca file', 'Terjadi kesalahan saat membaca file gambar.');
      });
    } else {
      console.log('No file selected, hiding preview');
      this.view.hidePhotoPreview();
    }
  }

  async onOpenCamera() {
    try {
      console.log('=== MEMBUKA KAMERA - BUSINESS LOGIC ===');
      const stream = await this.view.getCameraStream();
      
      // Business logic: show camera UI
      this.view.showCamera(stream);
      console.log('Camera opened successfully');
      
    } catch (error) {
      console.error('Camera business logic error:', error);
      this.view.showError('Gagal membuka kamera', error.message);
    }
  }

  onCancelCamera() {
    console.log('=== TUTUP KAMERA - BUSINESS LOGIC ===');
    this._cleanupBlobUrls();
    this.view.hideCamera();
    console.log('Camera cancelled');
  }

  async onCapture() {
    try {
      console.log('=== CAPTURE PHOTO - BUSINESS LOGIC ===');
      const result = await this.view.capturePhotoFromVideo();
      this._cleanupBlobUrls();
      this.capturedBlob = result.blob;
      this.capturedUrl = result.url;
      this.view.showPhotoPreview(result.url);
      this.view.hideCamera();
      console.log('Photo captured successfully, size:', result.blob.size, 'bytes');
      
    } catch (error) {
      console.error('Capture business logic error:', error);
      this.view.showError('Gagal mengambil foto', error.message);
    }
  }

  async onSubmit(event) {
    event.preventDefault();
    console.log('=== SUBMIT STORY - BUSINESS LOGIC ===');
    
    try {
      const formData = this.view.getFormData();
      const { description, photoFile } = formData;
      
      let finalPhotoFile = photoFile;
      if (this.capturedBlob && !photoFile) {
        finalPhotoFile = new File([this.capturedBlob], 'captured-photo.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        console.log('Using captured photo:', finalPhotoFile.size, 'bytes');
      }
      
      // validasi lengkap melalui model
      const storyData = {
        description,
        photo: finalPhotoFile,
        location: this.selectedLocation
      };
      
      const validationErrors = this.model.validateStoryData(storyData);
      if (validationErrors.length > 0) {
        this.view.showError('Data tidak lengkap', validationErrors.join(', '));
        return;
      }
      
      //set loading state
      this.view.setLoading(true);
      
      //buat FormData dan kirim melalui model
      const uploadFormData = this.model.createFormData(storyData);
      const response = await this.model.addStory(uploadFormData);
      
      console.log('Story uploaded successfully:', response);
      this._cleanup();
      this.view.showSuccess('Story berhasil diupload!', 'Story lo udah berhasil dibagikan ke semua orang!');
      setTimeout(() => {
        this.view.redirectToHome();
      }, 1500);
      
    } catch (error) {
      console.error('Submit story error:', error);
      this.view.setLoading(false);
      
      // error types
      if (error.message.includes('Token tidak tersedia')) {
        this.view.showError('Sesi berakhir', 'Silakan login kembali.');
        setTimeout(() => {
          this.view.redirectToLogin();
        }, 2000);
      } else {
        this.view.showError('Gagal upload story', error.message);
      }
    }
  }

  // PRIVATE METHODS
  _cleanupBlobUrls() {
    // Business logic: cleanup memory
    if (this.capturedUrl) {
      URL.revokeObjectURL(this.capturedUrl);
      this.capturedUrl = null;
    }
    this.capturedBlob = null;
  }

  _cleanup() {
    this._cleanupBlobUrls();
    this.selectedLocation = null;
    this.view.clear();
  }

  // PUBLIC CLEANUP METHOD
  destroy() {
    console.log('=== DESTROYING ADD STORY PRESENTER ===');
    this._cleanup();
  }
}