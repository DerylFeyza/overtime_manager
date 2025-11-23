import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    activeClassName?: string;
}

export default function NavLink({
    href,
    children,
    className,
    activeClassName,
}: NavLinkProps) {
    const { url } = usePage();

    const isActive = url.startsWith(href);

    return (
        <Link
            href={href}
            className={cn(className, isActive && activeClassName)}
        >
            {children}
        </Link>
    );
}
