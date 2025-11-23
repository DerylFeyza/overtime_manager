import AppearanceToggleTab from '@/components/appearance-tabs';
import NavLink from '@/components/navigation/nav-link';
import { Clock, ListChecks } from 'lucide-react';

export function Navigation() {
    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-card">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold text-foreground">
                            Overtime Manager
                        </h1>
                    </div>
                    <div className="flex gap-1">
                        <NavLink
                            href="/"
                            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                        >
                            <Clock className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Entry</span>
                        </NavLink>
                        <NavLink
                            href="/records"
                            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            activeClassName="bg-primary text-primary-foreground hover:bg-primary"
                        >
                            <ListChecks className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                View Records
                            </span>
                        </NavLink>
                        <AppearanceToggleTab className="ml-2" />
                    </div>
                </div>
            </div>
        </nav>
    );
}
