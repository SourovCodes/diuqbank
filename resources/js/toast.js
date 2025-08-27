/**
 * Sonner-like Toast Notification System
 * A lightweight, modern toast notification library
 */

class Toast {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.init();
    }

    init() {
        // Create toast container
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(this.container);

        // Check for flash messages on page load
        this.checkFlashMessages();
    }

    checkFlashMessages() {
        // Check for Laravel flash messages
        const flashData = window.flashMessages || {};

        Object.entries(flashData).forEach(([type, message]) => {
            if (message) {
                this.show(message, type);
            }
        });
    }

    show(message, type = 'success', options = {}) {
        const id = Date.now() + Math.random();
        const duration = options.duration || this.getDefaultDuration(type);

        const toast = this.createToastElement(id, message, type, options);
        this.toasts.set(id, { element: toast, timer: null });

        // Add to container
        this.container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
            toast.classList.add('translate-x-0', 'opacity-100');
        });

        // Auto dismiss
        if (duration > 0) {
            const timer = setTimeout(() => this.dismiss(id), duration);
            this.toasts.get(id).timer = timer;
        }

        return id;
    }

    createToastElement(id, message, type, options) {
        const toast = document.createElement('div');
        toast.className = `
            transform transition-all duration-300 ease-out
            translate-x-full opacity-0
            pointer-events-auto
            max-w-sm w-full
            bg-card border border-border
            rounded-lg shadow-lg
            p-4 flex items-start gap-3
            ${this.getTypeStyles(type)}
        `.replace(/\s+/g, ' ').trim();

        toast.innerHTML = `
            <div class="flex-shrink-0 mt-0.5">
                ${this.getIcon(type)}
            </div>
            <div class="flex-1 min-w-0">
                ${options.title ? `<div class="font-medium text-card-foreground">${options.title}</div>` : ''}
                <div class="text-sm text-muted-foreground">${message}</div>
            </div>
            <button 
                class="flex-shrink-0 text-muted-foreground hover:text-card-foreground transition-colors"
                onclick="window.toast.dismiss(${id})"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;

        // Add click to dismiss
        toast.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                this.dismiss(id);
            }
        });

        return toast;
    }

    getTypeStyles(type) {
        const styles = {
            success: 'border-l-4 border-l-green-500',
            error: 'border-l-4 border-l-red-500',
            warning: 'border-l-4 border-l-yellow-500',
            info: 'border-l-4 border-l-blue-500',
            default: ''
        };
        return styles[type] || styles.default;
    }

    getIcon(type) {
        const icons = {
            success: `
                <div class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
            `,
            error: `
                <div class="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
            `,
            warning: `
                <div class="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
            `,
            info: `
                <div class="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            `
        };
        return icons[type] || icons.info;
    }

    getDefaultDuration(type) {
        const durations = {
            success: 4000,
            error: 6000,
            warning: 5000,
            info: 4000
        };
        return durations[type] || 4000;
    }

    dismiss(id) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;

        const { element, timer } = toastData;

        if (timer) {
            clearTimeout(timer);
        }

        // Animate out
        element.classList.remove('translate-x-0', 'opacity-100');
        element.classList.add('translate-x-full', 'opacity-0');

        // Remove from DOM after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(id);
        }, 300);
    }

    // Convenience methods
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    // Clear all toasts
    clear() {
        this.toasts.forEach((_, id) => this.dismiss(id));
    }
}

// Initialize toast system
window.toast = new Toast();

// Export for module systems
export default Toast;
