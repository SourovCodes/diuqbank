class QuestionForm {
    constructor(options = {}) {
        this.isEdit = options.isEdit || false;
        this.questionId = options.questionId || null;
        this.courses = options.courses || [];
        this.uploadedPdfKey = null;

        this.initElements();
        this.bindEvents();
        this.initializeForm();
    }

    initElements() {
        // Form elements
        this.form = document.getElementById('question-form');
        this.departmentSelect = document.getElementById('department_id');
        this.courseSelect = document.getElementById('course_id');
        this.examTypeSelect = document.getElementById('exam_type_id');
        this.sectionContainer = document.getElementById('section-container');
        this.sectionInput = document.getElementById('section');
        this.semesterSelect = document.getElementById('semester_id');

        // Upload elements
        this.pdfUpload = document.getElementById('pdf-upload');
        this.uploadArea = document.getElementById('upload-area');
        this.uploadProgress = document.getElementById('upload-progress');
        this.uploadSuccess = document.getElementById('upload-success');
        this.progressBar = document.getElementById('progress-bar');

        // Submit elements
        this.submitBtn = document.getElementById('submit-btn');
        this.submitText = document.getElementById('submit-text');
        this.submitLoading = document.getElementById('submit-loading');

        // Modal elements
        this.courseModal = document.getElementById('course-modal');
        this.semesterModal = document.getElementById('semester-modal');
        this.addCourseBtn = document.getElementById('add-course-btn');
        this.addSemesterBtn = document.getElementById('add-semester-btn');

        // Course modal elements
        this.courseForm = document.getElementById('course-form');
        this.courseNameInput = document.getElementById('course-name');
        this.createCourseBtn = document.getElementById('create-course-btn');
        this.courseSubmitText = document.getElementById('course-submit-text');
        this.courseSubmitLoading = document.getElementById('course-submit-loading');

        // Semester modal elements
        this.semesterForm = document.getElementById('semester-form');
        this.semesterNameInput = document.getElementById('semester-name');
        this.createSemesterBtn = document.getElementById('create-semester-btn');
        this.semesterSubmitText = document.getElementById('semester-submit-text');
        this.semesterSubmitLoading = document.getElementById('semester-submit-loading');
    }

    bindEvents() {
        // Department change handler
        this.departmentSelect.addEventListener('change', () => this.handleDepartmentChange());

        // Exam type change handler
        this.examTypeSelect.addEventListener('change', () => this.handleExamTypeChange());

        // Clear errors when fields change (optional - for better UX)
        [this.departmentSelect, this.courseSelect, this.examTypeSelect, this.semesterSelect, this.sectionInput].forEach(field => {
            field.addEventListener('change', () => {
                // Clear field-specific error when user makes a selection
                this.hideError(field.id + '-error');
            });
            field.addEventListener('input', () => {
                // Clear field-specific error when user types
                this.hideError(field.id + '-error');
            });
        });

        // PDF upload handlers
        this.uploadArea.addEventListener('click', () => this.pdfUpload.click());
        this.pdfUpload.addEventListener('change', (e) => this.handleFileUpload(e));

        // Clear PDF error when user interacts with upload area
        this.uploadArea.addEventListener('click', () => {
            this.hideError('pdf-upload-error');
            this.removeUploadAreaHighlight();
        });

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Modal handlers
        this.addCourseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openCourseModal();
        });
        this.addSemesterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSemesterModal();
        });

        // Course modal handlers
        document.getElementById('close-course-modal').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeCourseModal();
        });
        document.getElementById('cancel-course').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeCourseModal();
        });
        this.courseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleCourseSubmit(e);
        });

        // Semester modal handlers
        document.getElementById('close-semester-modal').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeSemesterModal();
        });
        document.getElementById('cancel-semester').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeSemesterModal();
        });
        this.semesterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleSemesterSubmit(e);
        });

        // Close modals on escape or background click
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCourseModal();
                this.closeSemesterModal();
            }
        });

        // Prevent modal backgrounds from closing when clicking inside the modal content
        this.courseModal.addEventListener('click', (e) => {
            if (e.target === this.courseModal) {
                this.closeCourseModal();
            }
        });

        this.semesterModal.addEventListener('click', (e) => {
            if (e.target === this.semesterModal) {
                this.closeSemesterModal();
            }
        });
    }

    initializeForm() {
        // Always keep submit button enabled
        this.submitBtn.disabled = false;

        if (this.isEdit) {
            this.validateForm();
        }
    }

    handleDepartmentChange() {
        const departmentId = this.departmentSelect.value;
        const currentCourseId = this.courseSelect.value;

        this.courseSelect.innerHTML = '<option value="">Select Course</option>';

        if (departmentId) {
            this.courseSelect.disabled = false;
            const departmentCourses = this.courses.filter(course => course.department_id == departmentId);

            departmentCourses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.name;
                if (course.id == currentCourseId) {
                    option.selected = true;
                }
                this.courseSelect.appendChild(option);
            });
        } else {
            this.courseSelect.disabled = true;
            this.courseSelect.innerHTML = '<option value="">Select Department First</option>';
        }
    }

    handleExamTypeChange() {
        const selectedOption = this.examTypeSelect.options[this.examTypeSelect.selectedIndex];
        const requiresSection = selectedOption.getAttribute('data-requires-section') === 'true';

        if (requiresSection && this.examTypeSelect.value) {
            this.sectionContainer.classList.remove('hidden');
            this.sectionInput.required = true;
        } else {
            this.sectionContainer.classList.add('hidden');
            this.sectionInput.required = false;
            if (!requiresSection) {
                this.sectionInput.value = '';
            }
        }
    }

    validateForm() {
        // This method now only provides visual feedback without disabling the submit button
        // The actual validation happens on form submission
        const isValid = this.departmentSelect.value &&
            this.courseSelect.value &&
            this.examTypeSelect.value &&
            this.semesterSelect.value &&
            (!this.sectionInput.required || this.sectionInput.value) &&
            (this.isEdit || this.uploadedPdfKey);

        // Keep submit button enabled - validation will happen on submit
        // this.submitBtn.disabled = !isValid;
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            this.showError('pdf-upload-error', 'Please select a PDF file.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB
            this.showError('pdf-upload-error', 'File size must be less than 10MB.');
            return;
        }

        try {
            // Show upload progress
            this.uploadArea.classList.add('hidden');
            this.uploadProgress.classList.remove('hidden');
            this.uploadSuccess.classList.add('hidden');
            this.hideError('pdf-upload-error');

            // Get presigned URL
            const response = await fetch('/api/questions/generate-presigned-url', {
                method: 'POST',
                headers: this.getApiHeaders(),
                body: JSON.stringify({
                    file_size: file.size,
                    file_type: file.type
                })
            });

            if (!response.ok) {
                const result = await this.parseJsonResponse(response);
                const errorMessage = result.message || 'Failed to get upload URL';
                throw new Error(errorMessage);
            }

            const { url, pdf_key } = await response.json();

            // Upload file to S3
            const uploadResponse = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload file');
            }

            // Success
            this.uploadedPdfKey = pdf_key;
            this.uploadProgress.classList.add('hidden');
            this.uploadSuccess.classList.remove('hidden');
            // Clear any previous PDF upload errors and highlighting
            this.hideError('pdf-upload-error');
            this.removeUploadAreaHighlight();

        } catch (error) {
            console.error('Upload error:', error);
            this.uploadProgress.classList.add('hidden');
            this.uploadArea.classList.remove('hidden');
            // Show the actual error message if available
            const errorMessage = error.message || 'Failed to upload file. Please try again.';
            this.showError('pdf-upload-error', errorMessage);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        // Clear previous errors
        this.clearErrors();

        // Validate required fields and show specific error messages
        let hasErrors = false;

        if (!this.departmentSelect.value) {
            this.showError('department_id-error', 'Department is required.');
            hasErrors = true;
        }

        if (!this.courseSelect.value) {
            this.showError('course_id-error', 'Course is required.');
            hasErrors = true;
        }

        if (!this.semesterSelect.value) {
            this.showError('semester_id-error', 'Semester is required.');
            hasErrors = true;
        }

        if (!this.examTypeSelect.value) {
            this.showError('exam_type_id-error', 'Exam type is required.');
            hasErrors = true;
        }

        if (this.sectionInput.required && !this.sectionInput.value) {
            this.showError('section-error', 'Section is required for this exam type.');
            hasErrors = true;
        }

        if (!this.isEdit && !this.uploadedPdfKey) {
            this.showError('pdf-upload-error', 'Please upload a PDF file.');
            // Also highlight the upload area visually
            this.highlightUploadArea();
            hasErrors = true;
        }

        // If there are validation errors, stop here and scroll to first error
        if (hasErrors) {
            this.scrollToFirstError();
            return;
        }

        const formData = {
            department_id: this.departmentSelect.value,
            course_id: this.courseSelect.value,
            semester_id: this.semesterSelect.value,
            exam_type_id: this.examTypeSelect.value,
            section: this.sectionInput.value || null,
        };

        // Only include pdf_key if a new file was uploaded
        if (this.uploadedPdfKey) {
            formData.pdf_key = this.uploadedPdfKey;
        }

        try {
            this.setSubmitLoading(true);
            this.clearErrors();

            const url = this.isEdit ? `/api/questions/${this.questionId}` : '/api/questions';
            const method = this.isEdit ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: this.getApiHeaders(),
                body: JSON.stringify(formData)
            });

            const result = await this.parseJsonResponse(response);

            if (!response.ok) {
                if (response.status === 422 && result.errors) {
                    // Validation errors
                    Object.keys(result.errors).forEach(field => {
                        this.showError(field + '-error', result.errors[field][0]);
                    });
                } else {
                    // Show the actual API error message
                    const errorMessage = result.message || `Failed to ${this.isEdit ? 'update' : 'create'} question`;
                    alert(errorMessage);
                }
                return;
            }

            // Success - redirect
            if (this.isEdit) {
                window.location.href = `/questions/${this.questionId}`;
            } else {
                window.location.href = '/questions';
            }

        } catch (error) {
            console.error('Submission error:', error);
            // Show the actual error message if available
            const errorMessage = error.message || `Failed to ${this.isEdit ? 'update' : 'create'} question. Please try again.`;
            alert(errorMessage);
        } finally {
            this.setSubmitLoading(false);
        }
    }

    // Modal functions
    openCourseModal() {
        if (!this.departmentSelect.value) {
            alert('Please select a department first.');
            return;
        }
        this.courseModal.classList.remove('hidden');
        this.courseNameInput.focus();
    }

    closeCourseModal() {
        this.courseModal.classList.add('hidden');
        this.courseForm.reset();
        this.hideError('course-name-error');
    }

    openSemesterModal() {
        this.semesterModal.classList.remove('hidden');
        this.semesterNameInput.focus();
    }

    closeSemesterModal() {
        this.semesterModal.classList.add('hidden');
        this.semesterForm.reset();
        this.hideError('semester-name-error');
    }

    async handleCourseSubmit(event) {
        event.preventDefault();

        const courseName = this.courseNameInput.value.trim();
        if (!courseName) {
            this.showError('course-name-error', 'Course name is required.');
            return;
        }

        try {
            this.setCourseSubmitLoading(true);
            this.hideError('course-name-error');

            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: this.getApiHeaders(),
                body: JSON.stringify({
                    name: courseName,
                    department_id: this.departmentSelect.value
                })
            });

            const result = await this.parseJsonResponse(response);

            if (!response.ok) {
                if (response.status === 422 && result.errors) {
                    this.showError('course-name-error', result.errors.name?.[0] || 'Invalid course name.');
                } else {
                    // Show the actual API error message
                    const errorMessage = result.message || 'Failed to create course';
                    this.showError('course-name-error', errorMessage);
                }
                return;
            }

            // Add new course to the list and select it
            this.courses.push(result.data);
            const option = document.createElement('option');
            option.value = result.data.id;
            option.textContent = result.data.name;
            option.selected = true;
            this.courseSelect.appendChild(option);

            this.closeCourseModal();

        } catch (error) {
            console.error('Course creation error:', error);
            // Show the actual error message if available
            const errorMessage = error.message || 'Failed to create course. Please try again.';
            this.showError('course-name-error', errorMessage);
        } finally {
            this.setCourseSubmitLoading(false);
        }
    }

    async handleSemesterSubmit(event) {
        event.preventDefault();

        const semesterName = this.semesterNameInput.value.trim();
        if (!semesterName) {
            this.showError('semester-name-error', 'Semester name is required.');
            return;
        }

        try {
            this.setSemesterSubmitLoading(true);
            this.hideError('semester-name-error');

            const response = await fetch('/api/semesters', {
                method: 'POST',
                headers: this.getApiHeaders(),
                body: JSON.stringify({
                    name: semesterName
                })
            });

            const result = await this.parseJsonResponse(response);

            if (!response.ok) {
                if (response.status === 422 && result.errors) {
                    this.showError('semester-name-error', result.errors.name?.[0] || 'Invalid semester name.');
                } else {
                    // Show the actual API error message
                    const errorMessage = result.message || 'Failed to create semester';
                    this.showError('semester-name-error', errorMessage);
                }
                return;
            }

            // Add new semester to the list and select it
            const option = document.createElement('option');
            option.value = result.data.id;
            option.textContent = result.data.name;
            option.selected = true;
            this.semesterSelect.appendChild(option);

            this.closeSemesterModal();

        } catch (error) {
            console.error('Semester creation error:', error);
            // Show the actual error message if available
            const errorMessage = error.message || 'Failed to create semester. Please try again.';
            this.showError('semester-name-error', errorMessage);
        } finally {
            this.setSemesterSubmitLoading(false);
        }
    }

    // Helper functions
    getApiHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        };
    }

    async parseJsonResponse(response) {
        try {
            return await response.json();
        } catch (e) {
            // If JSON parsing fails, return a generic error structure
            return {
                message: response.status === 422 ? 'Validation failed' : 'An error occurred',
                errors: {}
            };
        }
    }

    setSubmitLoading(loading) {
        this.submitBtn.disabled = loading;
        if (loading) {
            this.submitText.classList.add('hidden');
            this.submitLoading.classList.remove('hidden');
            this.submitLoading.classList.add('flex');
        } else {
            this.submitText.classList.remove('hidden');
            this.submitLoading.classList.add('hidden');
            this.submitLoading.classList.remove('flex');
        }
    }

    setCourseSubmitLoading(loading) {
        this.createCourseBtn.disabled = loading;
        if (loading) {
            this.courseSubmitText.classList.add('hidden');
            this.courseSubmitLoading.classList.remove('hidden');
            this.courseSubmitLoading.classList.add('flex');
        } else {
            this.courseSubmitText.classList.remove('hidden');
            this.courseSubmitLoading.classList.add('hidden');
            this.courseSubmitLoading.classList.remove('flex');
        }
    }

    setSemesterSubmitLoading(loading) {
        this.createSemesterBtn.disabled = loading;
        if (loading) {
            this.semesterSubmitText.classList.add('hidden');
            this.semesterSubmitLoading.classList.remove('hidden');
            this.semesterSubmitLoading.classList.add('flex');
        } else {
            this.semesterSubmitText.classList.remove('hidden');
            this.semesterSubmitLoading.classList.add('hidden');
            this.semesterSubmitLoading.classList.remove('flex');
        }
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }

    clearErrors() {
        document.querySelectorAll('[id$="-error"]').forEach(element => {
            element.classList.add('hidden');
        });
    }

    highlightUploadArea() {
        const uploadContainer = this.uploadArea.closest('.border-2');
        if (uploadContainer) {
            uploadContainer.classList.add('border-red-500', 'dark:border-red-400');
            uploadContainer.classList.remove('border-slate-300', 'dark:border-slate-600');
        }
    }

    removeUploadAreaHighlight() {
        const uploadContainer = this.uploadArea.closest('.border-2');
        if (uploadContainer) {
            uploadContainer.classList.remove('border-red-500', 'dark:border-red-400');
            uploadContainer.classList.add('border-slate-300', 'dark:border-slate-600');
        }
    }

    scrollToFirstError() {
        // Find the first visible error message
        const firstError = document.querySelector('[id$="-error"]:not(.hidden)');
        if (firstError) {
            firstError.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
}

// Export for use in other files
window.QuestionForm = QuestionForm;
