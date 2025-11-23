import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const AppearanceContext = createContext<{
    appearance: Appearance;
    updateAppearance: (mode: Appearance) => void;
} | null>(null);

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark =
        appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    const savedAppearance =
        (localStorage.getItem('appearance') as Appearance) || 'system';

    applyTheme(savedAppearance);

    // Add the event listener for system theme changes...
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function AppearanceProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [appearance, setAppearance] = useState<Appearance>(() => {
        const savedAppearance = localStorage.getItem(
            'appearance',
        ) as Appearance | null;
        return savedAppearance || 'system';
    });

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);

        localStorage.setItem('appearance', mode);
        setCookie('appearance', mode);

        applyTheme(mode);
    }, []);

    useEffect(() => {
        return () =>
            mediaQuery()?.removeEventListener(
                'change',
                handleSystemThemeChange,
            );
    }, []);

    return (
        <AppearanceContext.Provider value={{ appearance, updateAppearance }}>
            {children}
        </AppearanceContext.Provider>
    );
}

export function useAppearance() {
    const context = useContext(AppearanceContext);
    if (!context) {
        throw new Error('useAppearance must be used within AppearanceProvider');
    }
    return context;
}
