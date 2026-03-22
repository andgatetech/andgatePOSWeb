import Link from 'next/link';
import React from 'react';

interface PromoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    href?: string;
    className?: string;
}

export default function PromoButton({ href, children = 'শুরু করুন', className = '', ...props }: PromoButtonProps) {
    const isCustomColors = className.includes('bg-') || className.includes('text-');
    const baseClasses = `rounded-lg px-6 py-2.5 text-sm font-semibold shadow-md transition-all hover:opacity-90 active:scale-95 ${isCustomColors ? '' : 'bg-primary text-white'}`;
    const combinedClasses = `${baseClasses} ${className}`.trim();

    if (href) {
        return (
            <Link href={href} className={combinedClasses}>
                {children}
            </Link>
        );
    }

    return (
        <button className={combinedClasses} {...props}>
            {children}
        </button>
    );
}
