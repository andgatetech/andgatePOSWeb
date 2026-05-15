'use client';
import { getTranslation } from '@/i18n';
import { ArrowRight, BarChart3, Check, CreditCard, Package, RotateCcw, ShoppingCart, Store, Truck, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';

const shimmer = (w: number, h: number) => `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g">
        <stop stop-color="#f3f4f6" offset="20%" />
        <stop stop-color="#e5e7eb" offset="50%" />
        <stop stop-color="#f3f4f6" offset="70%" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="#f3f4f6" />
    <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.5s" repeatCount="indefinite" />
  </svg>
`;

const toBase64 = (str: string) =>
    typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

const sectionsConfig = [
    {
        icon: <ShoppingCart className="h-5 w-5 text-white" />,
        iconBg: 'bg-[#046ca9]',
        images: [
            { src: '/assets/LandingImage/updated/pos.webp', alt: 'POS Interface', label: 'POS checkout', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/orders.webp', alt: 'Order Management', label: 'Invoice and order list', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/mobile-pos.webp', alt: 'Mobile POS Interface', label: 'Mobile POS', width: 520, height: 933 },
        ],
        ctaLink: '/register',
    },
    {
        icon: <Package className="h-5 w-5 text-white" />,
        iconBg: 'bg-teal-600',
        images: [
            { src: '/assets/LandingImage/updated/products.webp', alt: 'Product Management', label: 'Product list', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/product-create.webp', alt: 'Create Product', label: 'Create product', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/bulk-upload.webp', alt: 'Bulk Product Upload', label: 'Bulk upload', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/label.webp', alt: 'Product Labels', label: 'Barcode labels', width: 1280, height: 800 },
        ],
        ctaLink: '/register',
    },
    {
        icon: <CreditCard className="h-5 w-5 text-white" />,
        iconBg: 'bg-emerald-600',
        images: [
            { src: '/assets/LandingImage/updated/customer-due.webp', alt: 'Customer Due Management', label: 'Customer due', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/supplier-due.webp', alt: 'Supplier Due Management', label: 'Supplier due', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/customer-list.webp', alt: 'Customer Management', label: 'Customer records', width: 1280, height: 800 },
        ],
        ctaLink: '/register',
    },
    {
        icon: <Truck className="h-5 w-5 text-white" />,
        iconBg: 'bg-amber-600',
        images: [
            { src: '/assets/LandingImage/updated/purchase-create.webp', alt: 'Create Purchase', label: 'Create purchase', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/purchase-list.webp', alt: 'Purchase List', label: 'Purchase list', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/supplier-list.webp', alt: 'All Suppliers', label: 'Supplier list', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/supplier-create.webp', alt: 'Create Supplier', label: 'Supplier profile', width: 1280, height: 800 },
        ],
        ctaLink: '/register',
    },
    {
        icon: <RotateCcw className="h-5 w-5 text-white" />,
        iconBg: 'bg-indigo-600',
        images: [
            { src: '/assets/LandingImage/updated/orders.webp', alt: 'Order Management', label: 'Order list', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/returns.webp', alt: 'Order Returns', label: 'Return list', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/sales-report.webp', alt: 'Sales Report Dashboard', label: 'Return impact in reports', width: 1280, height: 800 },
        ],
        ctaLink: '/register',
    },
    {
        icon: <BarChart3 className="h-5 w-5 text-white" />,
        iconBg: 'bg-blue-600',
        images: [
            { src: '/assets/LandingImage/updated/sales-report.webp', alt: 'Sales Report Dashboard', label: 'Sales report', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/stock-report.webp', alt: 'Stock Report Analytics', label: 'Stock report', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/profit-loss.webp', alt: 'Profit And Loss', label: 'Profit and loss', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/cash-book.webp', alt: 'Cash Book', label: 'Cash book', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/tax-report.webp', alt: 'Tax Report', label: 'Tax report', width: 1280, height: 800 },
        ],
        ctaLink: '/register',
    },
    {
        icon: <Store className="h-5 w-5 text-white" />,
        iconBg: 'bg-purple-600',
        images: [
            { src: '/assets/LandingImage/updated/store-list.webp', alt: 'Store Management', label: 'Multi-store', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/employees.webp', alt: 'Employee Management', label: 'Staff roles', width: 1280, height: 800 },
            { src: '/assets/LandingImage/updated/mobile-dashboard.webp', alt: 'Mobile Dashboard', label: 'Mobile view', width: 520, height: 933 },
            { src: '/assets/LandingImage/updated/orders.webp', alt: 'Ecommerce Orders', label: 'Online orders', width: 1280, height: 800 },
        ],
        ctaLink: '/register',
    },
];

const ImageModal = ({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) => {
    React.useEffect(() => {
        const handleScroll = () => onClose();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative flex max-h-[85vh] w-full max-w-[960px] items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-all hover:scale-110 hover:bg-gray-700"
                    onClick={onClose}
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <Image
                    src={src}
                    alt={alt}
                    width={1920}
                    height={1080}
                    className="max-h-[85vh] w-auto rounded-2xl object-contain shadow-2xl"
                    quality={90}
                />
            </div>
        </div>
    );
};

export default function OverViewSection({ id }: { id: string }) {
    const { t, data } = getTranslation();
    const translatedSections = data.overview?.sections || [];

    const sectionsData = translatedSections.map((trans: any, idx: number) => ({
        ...trans,
        ...sectionsConfig[idx],
    }));

    const [activeTab, setActiveTab] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [zoomedImage, setZoomedImage] = useState<{ src: string; alt: string } | null>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countRef = useRef(sectionsData.length);
    useEffect(() => { countRef.current = sectionsData.length; }, [sectionsData.length]);

    const startTimer = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % countRef.current);
        }, 5000);
    }, []);

    useEffect(() => {
        if (!isPaused) startTimer();
        else if (intervalRef.current) clearInterval(intervalRef.current);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isPaused, startTimer]);

    const handleTabClick = (idx: number) => {
        setActiveTab(idx);
        startTimer();
    };

    const active = sectionsData[activeTab] as any;
    if (!active) return null;

    return (
        <section id={id} className="bg-slate-50 py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <span className="mb-3 inline-flex rounded-full bg-[#046ca9]/10 px-3 py-1 text-xs font-bold text-[#046ca9]">
                            AndgatePOS workflow
                        </span>
                        <h2 className="max-w-3xl text-3xl font-black text-gray-950 sm:text-4xl lg:text-5xl">
                            {t('overview.sectionTitle')}
                        </h2>
                    </div>
                    <p className="max-w-xl text-sm leading-7 text-gray-600 sm:text-base">{t('overview.sectionSubtitle')}</p>
                </div>

                <div
                    className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="border-b border-gray-100 bg-white p-3">
                        <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible lg:grid-cols-7">
                            {sectionsData.map((section: any, idx: number) => {
                                const selected = activeTab === idx;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleTabClick(idx)}
                                        className={`relative flex min-w-[180px] items-center gap-2 rounded-2xl border px-3 py-3 text-left transition-all md:min-w-0 ${
                                            selected
                                                ? 'border-[#046ca9]/30 bg-[#046ca9] text-white shadow-lg shadow-[#046ca9]/20'
                                                : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-white hover:text-gray-950'
                                        }`}
                                    >
                                        <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                                            selected ? 'bg-white/15' : section.iconBg
                                        }`}>
                                            <span className="[&>svg]:h-4 [&>svg]:w-4">{section.icon}</span>
                                        </span>
                                        <span className="min-w-0">
                                            <span className={`block text-[10px] font-bold uppercase tracking-wide ${
                                                selected ? 'text-white/70' : 'text-gray-400'
                                            }`}>
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                            <span className="line-clamp-2 text-xs font-bold leading-snug">{section.subtitle}</span>
                                        </span>
                                        {selected && !isPaused && (
                                            <span
                                                key={activeTab}
                                                className="absolute bottom-0 left-3 h-[2px] rounded-full bg-white/70"
                                                style={{ animation: 'tab-progress 5s linear forwards' }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div key={activeTab} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
                        <div className="relative overflow-hidden bg-slate-100">
                            <div className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-700 shadow-sm backdrop-blur">
                                {activeTab + 1} / {sectionsData.length}
                            </div>
                            <div className="absolute right-4 top-4 z-10 rounded-full bg-gray-950/75 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                                {active.subtitle}
                            </div>
                            <Swiper
                                modules={[Pagination, Navigation]}
                                pagination={{ clickable: true }}
                                navigation
                                spaceBetween={0}
                                slidesPerView={1}
                                className="h-[320px] sm:h-[420px] lg:h-[620px]"
                            >
                                {active.images.map((image: any, index: number) => (
                                    <SwiperSlide key={index}>
                                        <div
                                            className="group relative flex h-[320px] w-full cursor-zoom-in items-center justify-center bg-slate-100 p-4 sm:h-[420px] lg:h-[620px] lg:p-8"
                                            onClick={() => setZoomedImage({ src: image.src, alt: image.alt })}
                                        >
                                            <Image
                                                className="max-h-full max-w-full rounded-xl object-contain shadow-2xl shadow-slate-900/10 transition-transform duration-500 group-hover:scale-[1.02]"
                                                src={image.src}
                                                alt={image.alt}
                                                width={image.width}
                                                height={image.height}
                                                placeholder="blur"
                                                blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(image.width, image.height))}`}
                                            />
                                            <div className="absolute bottom-5 left-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-700 shadow-sm backdrop-blur lg:bottom-8 lg:left-8">
                                                {image.label || image.alt}
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/15">
                                                <ZoomIn className="h-8 w-8 text-white opacity-0 drop-shadow-lg transition-all duration-300 group-hover:opacity-100" />
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                            <span className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#046ca9]">
                                {active.subtitle}
                            </span>
                            <div className="mb-5 flex items-start gap-3">
                                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm ${active.iconBg}`}>
                                    {active.icon}
                                </div>
                                <h3 className="text-2xl font-black leading-tight text-gray-950 sm:text-3xl">{active.title}</h3>
                            </div>
                            {active.outcome && (
                                <p className="mb-5 text-sm leading-7 text-gray-600">{active.outcome}</p>
                            )}
                            {Array.isArray(active.highlights) && active.highlights.length > 0 && (
                                <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                                    {active.highlights.map((item: string) => (
                                        <div key={item} className="rounded-2xl border border-[#046ca9]/10 bg-[#046ca9]/5 px-3 py-2 text-xs font-bold text-[#046ca9]">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <ul className="mb-7 grid gap-2.5">
                                {(active.features || []).map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2.5">
                                        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                            <Check className="h-3 w-3 text-emerald-600" />
                                        </span>
                                        <span className="text-sm leading-relaxed text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={active.ctaLink}
                                className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[#046ca9] to-[#034d79] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-[#034d79] hover:to-[#02395b]"
                            >
                                {active.ctaText}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {zoomedImage && (
                <ImageModal src={zoomedImage.src} alt={zoomedImage.alt} onClose={() => setZoomedImage(null)} />
            )}

            <style>{`
                @keyframes tab-progress {
                    from { width: 0%; }
                    to { width: calc(100% - 24px); }
                }
            `}</style>
        </section>
    );
}
