import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'DIUQBank';

// Ensure the user's saved theme is applied before the UI renders.
initializeTheme();

// Declare gtag function for TypeScript
declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

// Track page views with Google Analytics on Inertia navigation
router.on('navigate', (event) => {
    if (typeof window.gtag === 'function') {
        window.gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '', {
            page_path: event.detail.page.url,
            page_title: event.detail.page.props.title || document.title,
        });
    }
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#0ea5e9',
    },
});
