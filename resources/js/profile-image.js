class ProfileImageHandler {
    constructor() {
        this.fileInput = document.getElementById('image-upload');
        this.previewImage = document.getElementById('preview-image');
        this.cropModal = document.getElementById('crop-modal');
        this.cropImage = document.getElementById('crop-image');
        this.cropCanvas = document.getElementById('crop-canvas');
        this.cropBtn = document.getElementById('crop-btn');
        this.cancelCropBtn = document.getElementById('cancel-crop-btn');
        this.cropper = null;
        this.croppedFile = null;

        this.init();
    }

    init() {
        if (this.fileInput) {
            this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }

        if (this.cropBtn) {
            this.cropBtn.addEventListener('click', this.handleCrop.bind(this));
        }

        if (this.cancelCropBtn) {
            this.cancelCropBtn.addEventListener('click', this.closeCropModal.bind(this));
        }

        // Close modal when clicking outside
        if (this.cropModal) {
            this.cropModal.addEventListener('click', (e) => {
                if (e.target === this.cropModal) {
                    this.closeCropModal();
                }
            });
        }

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.cropModal && !this.cropModal.classList.contains('hidden')) {
                this.closeCropModal();
            }
        });
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('Please select a valid image file.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('Image size must be less than 10MB.');
            return;
        }

        this.showCropModal(file);
    }

    showCropModal(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.cropImage) {
                this.cropImage.src = e.target.result;
                this.cropModal.classList.remove('hidden');

                // Initialize cropper
                if (this.cropper) {
                    this.cropper.destroy();
                }

                this.cropper = new Cropper(this.cropImage, {
                    aspectRatio: 1, // Square aspect ratio
                    viewMode: 2,
                    dragMode: 'move',
                    autoCropArea: 0.8,
                    restore: false,
                    guides: false,
                    center: false,
                    highlight: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: false,
                    minCropBoxWidth: 100,
                    minCropBoxHeight: 100,
                });
            }
        };
        reader.readAsDataURL(file);
    }

    closeCropModal() {
        if (this.cropModal) {
            this.cropModal.classList.add('hidden');
        }
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
        // Reset file input
        if (this.fileInput) {
            this.fileInput.value = '';
        }
    }

    async handleCrop() {
        if (!this.cropper) return;

        try {
            // Get cropped canvas at 1000x1000 for high quality
            const canvas = this.cropper.getCroppedCanvas({
                width: 1000,
                height: 1000,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            // Convert to blob with high quality
            const finalBlob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', 0.9); // 90% quality for better detail
            });

            // Create a new file from the blob
            const fileName = `profile_${Date.now()}.jpg`;
            this.croppedFile = new File([finalBlob], fileName, {
                type: 'image/jpeg',
                lastModified: Date.now()
            });

            // Update preview with same quality
            this.updatePreview(canvas.toDataURL('image/jpeg', 0.9));

            // Update file input with cropped file
            this.updateFileInput();

            this.closeCropModal();
            this.showSuccess(`Image ready for upload (${this.formatFileSize(finalBlob.size)})`);

        } catch (error) {
            this.showError('Error processing image. Please try again.');
        }
    }

    updatePreview(dataUrl) {
        if (this.previewImage) {
            this.previewImage.src = dataUrl;
            this.previewImage.classList.remove('hidden');

            // Hide the initials if they exist
            const previewInitials = document.getElementById('preview-initials');
            if (previewInitials) {
                previewInitials.classList.add('hidden');
            }

            // Show preview container if hidden
            const previewContainer = this.previewImage.closest('.preview-container');
            if (previewContainer) {
                previewContainer.classList.remove('hidden');
            }
        }
    }

    updateFileInput() {
        if (!this.fileInput || !this.croppedFile) {
            return;
        }

        // Create a new FileList containing our cropped file
        try {
            const dt = new DataTransfer();
            dt.items.add(this.croppedFile);
            this.fileInput.files = dt.files;

            // Store the cropped file for form submission
            this.fileInput.croppedFile = this.croppedFile;

            // Add a custom property to indicate this file has been processed
            this.fileInput.setAttribute('data-has-cropped-file', 'true');

        } catch (error) {
            // Fallback: Create a custom property to store the file
            this.fileInput.croppedFile = this.croppedFile;
            this.fileInput.setAttribute('data-has-cropped-file', 'true');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showError(message) {
        // Use the existing toast system
        if (window.toast && typeof window.toast.error === 'function') {
            window.toast.error(message);
        } else if (window.toast && typeof window.toast.show === 'function') {
            window.toast.show(message, 'error');
        } else {
            // Fallback to creating a simple toast notification
            this.createToast(message, 'error');
        }
    }

    showSuccess(message) {
        // Use the existing toast system
        if (window.toast && typeof window.toast.success === 'function') {
            window.toast.success(message);
        } else if (window.toast && typeof window.toast.show === 'function') {
            window.toast.show(message, 'success');
        } else {
            // Fallback to creating a simple toast notification
            this.createToast(message, 'success');
        }
    }

    createToast(message, type) {
        // Create a simple toast notification as fallback
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm max-w-sm ${type === 'error' ? 'bg-red-600' : 'bg-green-600'
            }`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    new ProfileImageHandler();
});
