import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const isBrowser = () => typeof document !== 'undefined';

const prefersDark = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const mediaQuery = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const getCookie = (name: string): string | null => {
    if (!isBrowser()) {
        return null;
    }

    const cookie = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));

    if (!cookie) {
        return null;
    }

    return decodeURIComponent(cookie.split('=')[1]);
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? ';Secure' : '';

    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax${secure}`;
};

const applyTheme = (appearance: Appearance) => {
    if (!isBrowser()) {
        return;
    }

    const root = document.documentElement;
    const resolved = appearance === 'system' ? (prefersDark() ? 'dark' : 'light') : appearance;

    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved === 'dark' ? 'dark' : 'light';
    root.dataset.appearance = appearance;
    root.dataset.resolvedAppearance = resolved;
};

const getStoredAppearance = (): Appearance => {
    if (!isBrowser()) {
        return 'system';
    }

    const root = document.documentElement;
    const datasetValue = root.dataset.appearance;

    if (datasetValue === 'light' || datasetValue === 'dark' || datasetValue === 'system') {
        return datasetValue;
    }

    const cookieValue = getCookie('appearance');

    if (cookieValue === 'light' || cookieValue === 'dark' || cookieValue === 'system') {
        return cookieValue;
    }

    return 'system';
};

export function initializeTheme() {
    if (!isBrowser()) {
        return;
    }

    const initialAppearance = getStoredAppearance();

    applyTheme(initialAppearance);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>(() => getStoredAppearance());

    const updateAppearance = useCallback((mode: Appearance) => {
        setCookie('appearance', mode);
        setAppearance(mode);
    }, []);

    useEffect(() => {
        applyTheme(appearance);
    }, [appearance]);

    useEffect(() => {
        if (appearance !== 'system') {
            return;
        }

        const query = mediaQuery();

        if (!query) {
            return;
        }

        const listener = () => applyTheme('system');

        query.addEventListener('change', listener);

        return () => {
            query.removeEventListener('change', listener);
        };
    }, [appearance]);

    return { appearance, updateAppearance } as const;
}