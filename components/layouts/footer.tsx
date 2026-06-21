import { Truck } from 'lucide-react';
import Image from 'next/image';

const courierPartners = [
    { name: 'Pathao', logo: '/images/delivery/pathao.svg', width: 92, height: 32 },
    { name: 'REDX', logo: '/images/delivery/redx.svg', width: 88, height: 34 },
    { name: 'Steadfast', logo: '/images/delivery/steadfast.svg', width: 126, height: 28 },
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

                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                        {courierPartners.map((partner) => (
                            <div
                                key={partner.name}
                                className="inline-flex h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-3 shadow-sm transition-colors hover:border-primary/30 dark:border-white/10 dark:bg-white"
                            >
                                <Image src={partner.logo} alt={`${partner.name} courier logo`} width={partner.width} height={partner.height} className="max-h-7 w-auto object-contain" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
