'use client';
import { getTranslation } from '@/i18n';
import { ArrowRight, BarChart3, Calculator, Check, CreditCard, FileText, Package, Scan, ShoppingCart, Smartphone, Store, Truck, Users, ZoomIn } from 'lucide-react';
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
        icon: <BarChart3 className="h-5 w-5 text-white" />,
        iconBg: 'bg-blue-600',
        images: [
            { src: '/assets/LandingImage/sales-reporrt.png', alt: 'Sales Report Dashboard', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/stock-report.png', alt: 'Stock Report Analytics', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/tax-report.png', alt: 'Tax Report', width: 1920, height: 1080 },
        ],
        ctaLink: '/register',
    },
    {
        icon: <Store className="h-5 w-5 text-white" />,
        iconBg: 'bg-purple-600',
        images: [
            { src: '/assets/LandingImage/employees.png', alt: 'Employee Management', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/employees-create.png', alt: 'Add Employee', width: 1920, height: 1080 },
        ],
        ctaLink: '/register',
    },
    {
        icon: <Package className="h-5 w-5 text-white" />,
        iconBg: 'bg-emerald-600',
        images: [
            { src: '/assets/LandingImage/category.png', alt: 'Category Management', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/brand.png', alt: 'Brand Management', width: 1920, height: 1080 },
        ],
        ctaLink: '/register',
    },
    {
        icon: <Package className="h-5 w-5 text-white" />,
        iconBg: 'bg-teal-600',
        images: [
            { src: '/assets/LandingImage/all-products.png', alt: 'Product Management', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/products-create.png', alt: 'Create Product', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/label.png', alt: 'Product Labels', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/lable-print.png', alt: 'Print Labels', width: 1920, height: 1080 },
        ],
        ctaLink: '/register',
    },
    {
        icon: <ShoppingCart className="h-5 w-5 text-white" />,
        iconBg: 'bg-violet-600',
        images: [{ src: '/assets/LandingImage/pos.png', alt: 'POS Interface', width: 1920, height: 1080 }],
        ctaLink: '/register',
    },
    {
        icon: <Smartphone className="h-5 w-5 text-white" />,
        iconBg: 'bg-pink-600',
        images: [
            { src: '/assets/LandingImage/mobileResponside.png', alt: 'Mobile Responsive', width: 1080, height: 1920 },
            { src: '/assets/LandingImage/Tablet Responsive.png', alt: 'Tablet Responsive', width: 1920, height: 1080 },
        ],
        ctaLink: '/register',
    },
    {
        icon: <Scan className="h-5 w-5 text-white" />,
        iconBg: 'bg-purple-700',
        images: [{ src: '/assets/LandingImage/automatic barcode scan.png', alt: 'Automatic Barcode Scanning', width: 1920, height: 1080 }],
        ctaLink: '/register',
    },
    {
        icon: <FileText className="h-5 w-5 text-white" />,
        iconBg: 'bg-indigo-600',
        images: [{ src: '/assets/LandingImage/orders.png', alt: 'Order Management', width: 1920, height: 1080 }],
        ctaLink: '/register',
    },
    {
        icon: <ShoppingCart className="h-5 w-5 text-white" />,
        iconBg: 'bg-cyan-600',
        images: [
            { src: '/assets/LandingImage/purchase-create.png', alt: 'Create Purchase', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/purchase-rcv.png', alt: 'Receive Purchase', width: 1920, height: 1080 },
        ],
        ctaLink: '/register',
    },
    {
        icon: <Truck className="h-5 w-5 text-white" />,
        iconBg: 'bg-amber-600',
        images: [
            { src: '/assets/LandingImage/all-suppiler.png', alt: 'All Suppliers', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/create-supplier.png', alt: 'Create Supplier', width: 1920, height: 1080 },
        ],
        ctaLink: '/register',
    },
    {
        icon: <CreditCard className="h-5 w-5 text-white" />,
        iconBg: 'bg-green-600',
        images: [
            { src: '/assets/LandingImage/ledger.png', alt: 'Ledger Management', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/journal.png', alt: 'Journal Entries', width: 1920, height: 1080 },
        ],
        ctaLink: '/register',
    },
    {
        icon: <Calculator className="h-5 w-5 text-white" />,
        iconBg: 'bg-rose-600',
        images: [{ src: '/assets/LandingImage/expense.png', alt: 'Expense Tracking', width: 1920, height: 1080 }],
        ctaLink: '/register',
    },
    {
        icon: <Users className="h-5 w-5 text-white" />,
        iconBg: 'bg-orange-600',
        images: [{ src: '/assets/LandingImage/customer.png', alt: 'Customer Management', width: 1920, height: 1080 }],
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
    const tabScrollRef = useRef<HTMLDivElement>(null);
    const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
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

    // Scroll active mobile tab into center view whenever activeTab changes
    useEffect(() => {
        const btn = tabButtonRefs.current[activeTab];
        const container = tabScrollRef.current;
        if (!btn || !container) return;
        const btnLeft = btn.offsetLeft;
        const btnWidth = btn.offsetWidth;
        const containerWidth = container.offsetWidth;
        container.scrollTo({ left: btnLeft - containerWidth / 2 + btnWidth / 2, behavior: 'smooth' });
    }, [activeTab]);

    const active = sectionsData[activeTab] as any;
    if (!active) return null;

    return (
        <section id={id} className="bg-gray-50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">
                        {t('overview.sectionTitle')}
                    </h2>
                    <p className="max-w-2xl text-base text-gray-500">{t('overview.sectionSubtitle')}</p>
                </div>

                {/* Tab panel */}
                <div
                    className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >

                    {/* Mobile: horizontal scroll tabs */}
                    <div className="border-b border-gray-100 lg:hidden">
                        {/* Counter */}
                        <div className="flex items-center justify-between px-4 pb-1 pt-2.5">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                {active.title}
                            </span>
                            <span className="text-[10px] font-bold text-[#046ca9]">
                                {activeTab + 1} / {sectionsData.length}
                            </span>
                        </div>
                        <div
                            ref={tabScrollRef}
                            className="flex gap-2 overflow-x-auto px-3 pb-3"
                            style={{ scrollbarWidth: 'none' }}
                        >
                            {sectionsData.map((section: any, idx: number) => (
                                <button
                                    key={idx}
                                    ref={(el) => { tabButtonRefs.current[idx] = el; }}
                                    onClick={() => handleTabClick(idx)}
                                    className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                                        activeTab === idx
                                            ? 'bg-[#046ca9] text-white shadow-md shadow-[#046ca9]/25'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}
                                >
                                    <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                                        activeTab === idx ? 'bg-white/20' : 'bg-white/60'
                                    }`}>
                                        <span className="[&>svg]:h-2.5 [&>svg]:w-2.5">{section.icon}</span>
                                    </span>
                                    {section.title}
                                </button>
                            ))}
                        </div>
                        {/* Thin progress track */}
                        <div className="relative h-0.5 w-full bg-gray-100">
                            <div
                                className="absolute left-0 top-0 h-full bg-[#046ca9] transition-all duration-300"
                                style={{ width: `${((activeTab + 1) / sectionsData.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="lg:grid lg:grid-cols-[272px_1fr]">
                        {/* Desktop: sidebar nav */}
                        <div className="hidden border-r border-gray-100 lg:block">
                            <nav className="py-1.5">
                                {sectionsData.map((section: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleTabClick(idx)}
                                        className={`relative flex w-full items-start gap-2.5 border-l-[3px] px-3 py-2 text-left transition-colors ${
                                            activeTab === idx
                                                ? 'border-[#046ca9] bg-[#046ca9]/5 font-semibold text-[#046ca9]'
                                                : 'border-transparent font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <span className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all ${
                                            activeTab === idx ? section.iconBg : 'bg-gray-100 [&>svg]:text-gray-400'
                                        }`}>
                                            <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{section.icon}</span>
                                        </span>
                                        <span className="line-clamp-2 text-xs leading-snug">{section.title}</span>
                                        {/* Auto-advance progress bar */}
                                        {activeTab === idx && !isPaused && (
                                            <span
                                                key={activeTab}
                                                className="absolute bottom-0 left-0 h-[2px] bg-[#046ca9]/40"
                                                style={{ animation: 'tab-progress 5s linear forwards' }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content panel — key forces remount on tab switch (resets Swiper to slide 1) */}
                        <div key={activeTab} className="grid grid-cols-1 md:grid-cols-[3fr_2fr]">
                            {/* Screenshots */}
                            <div className="relative overflow-hidden bg-slate-50">
                                <Swiper
                                    modules={[Pagination, Navigation]}
                                    pagination={{ clickable: true }}
                                    navigation
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    className="h-[300px] md:h-[540px]"
                                >
                                    {active.images.map((image: any, index: number) => (
                                        <SwiperSlide key={index}>
                                            <div
                                                className="group relative flex h-[300px] w-full cursor-zoom-in items-center justify-center bg-slate-50 md:h-[540px]"
                                                onClick={() => setZoomedImage({ src: image.src, alt: image.alt })}
                                            >
                                                <Image
                                                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                                                    src={image.src}
                                                    alt={image.alt}
                                                    width={image.width}
                                                    height={image.height}
                                                    placeholder="blur"
                                                    blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(image.width, image.height))}`}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
                                                    <ZoomIn className="h-8 w-8 text-white opacity-0 drop-shadow-lg transition-all duration-300 group-hover:opacity-100" />
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>

                            {/* Features */}
                            <div className="flex flex-col justify-center p-6 lg:p-8">
                                <span className="mb-2 text-xs font-bold uppercase tracking-widest text-[#046ca9]">
                                    {active.subtitle}
                                </span>
                                <div className="mb-5 flex items-center gap-3">
                                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-sm ${active.iconBg}`}>
                                        {active.icon}
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 sm:text-2xl">{active.title}</h3>
                                </div>
                                <ul className="mb-7 space-y-2.5">
                                    {(active.features || []).map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2.5">
                                            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                                <Check className="h-3 w-3 text-emerald-600" />
                                            </span>
                                            <span className="text-sm leading-relaxed text-gray-600">{feature}</span>
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
            </div>

            {zoomedImage && (
                <ImageModal src={zoomedImage.src} alt={zoomedImage.alt} onClose={() => setZoomedImage(null)} />
            )}

            <style>{`
                @keyframes tab-progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </section>
    );
}
