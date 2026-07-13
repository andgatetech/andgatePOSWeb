import type { ReactNode } from 'react';

interface BrandedPageHeaderProps {
    icon: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
}

export default function BrandedPageHeader({ icon, title, description, actions }: BrandedPageHeaderProps) {
    return (
        <div className="overflow-hidden rounded-lg border border-[#046ca9]/10 bg-white shadow-sm">
            <div className="h-1 bg-gradient-to-r from-[#046ca9] via-[#0586cb] to-[#e79237]" />
            <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#046ca9]/10 text-[#046ca9]">{icon}</div>
                    <div className="min-w-0">
                        <h1 className="text-xl font-black text-gray-950 sm:text-2xl">{title}</h1>
                        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">{description}</p> : null}
                    </div>
                </div>
                {actions ? <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
        </div>
    );
}
