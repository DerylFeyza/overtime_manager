import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navigation } from './components/navigation/navigation';
import { ToasterWrapper } from './components/toaster-wrapper';
import { AppearanceProvider, initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <AppearanceProvider>
                    <App {...props}>
                        {({ Component, key, props: pageProps }) => (
                            <>
                                <Navigation />
                                <ToasterWrapper />
                                <Component key={key} {...pageProps} />
                            </>
                        )}
                    </App>
                </AppearanceProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
        delay: 0, // Remove 250ms delay (default: 250)
        showSpinner: true,
    },
});

// This will set light / dark mode on load...
initializeTheme();
