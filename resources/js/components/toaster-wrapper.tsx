import { useAppearance } from '@/hooks/use-appearance';
import { Toaster } from 'sonner';

export function ToasterWrapper() {
    const { appearance } = useAppearance();
    console.log(appearance);
    return (
        <Toaster
            theme={appearance === 'dark' ? 'dark' : 'light'}
            richColors
            closeButton
            expand={false}
        />
    );
}
