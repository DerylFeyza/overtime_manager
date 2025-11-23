import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon }[] = [
        { value: 'light', icon: Sun },
        { value: 'dark', icon: Moon },
    ];

    return (
        <div
            className={cn('inline-flex gap-1 rounded-lg', className)}
            {...props}
        >
            {tabs.map(({ value, icon: Icon }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                        appearance === value
                            ? 'bg-primary text-primary-foreground hover:bg-primary'
                            : '',
                    )}
                >
                    <Icon className="h-4 w-4" />
                </button>
            ))}
        </div>
    );
}
