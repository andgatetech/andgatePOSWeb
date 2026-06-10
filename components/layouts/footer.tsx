import { Truck } from 'lucide-react';

const courierPartners = [
    { name: 'Pathao', className: 'border-[#e2231a]/20 bg-[#e2231a]/5 text-[#e2231a]' },
    { name: 'REDX', className: 'border-[#ed1c24]/20 bg-[#ed1c24]/5 text-[#ed1c24]' },
    { name: 'Steadfast', className: 'border-[#0f766e]/20 bg-[#0f766e]/5 text-[#0f766e]' },
];

const Footer = () => {
    return (
        <footer className="mt-auto p-6 pt-0 text-center text-xs text-gray-500 dark:text-white-dark ltr:sm:text-left rtl:sm:text-right">
            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-5 dark:border-white/10 sm:flex-row">
                <div>
                    © {new Date().getFullYear()}{' '}
                    <a href="https://andgatetech.net/" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-700 transition-colors hover:text-primary dark:text-white">
                        Andgate Technologies
                    </a>
                    . All rights reserved.
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <div className="inline-flex items-center gap-2 font-medium text-gray-600 dark:text-gray-300">
                        <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span>We support courier delivery with</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {courierPartners.map((partner) => (
                            <span
                                key={partner.name}
                                className={`inline-flex h-8 items-center rounded-md border px-3 text-[11px] font-black uppercase tracking-normal shadow-sm ${partner.className}`}
                            >
                                {partner.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
