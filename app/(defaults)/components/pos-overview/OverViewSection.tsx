'use client';
import { ArrowRight, BarChart3, Calculator, Check, CreditCard, FileText, Package, Scan, ShoppingCart, Smartphone, Store, Truck, Users, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { Mousewheel, Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';

// Shimmer effect for placeholder
const shimmer = (w: number, h: number) => `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" >
    <defs>
      <linearGradient id="g">
        <stop stop-color="#f3f4f6" offset="20%" />
        <stop stop-color="#e5e7eb" offset="50%" />
        <stop stop-color="#f3f4f6" offset="70%" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="#f3f4f6" />
    <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.5s" repeatCount="indefinite"  />
  </svg>
`;

const toBase64 = (str: string) => (typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str));

const sectionsData = [
    {
        title: 'Real-Time Business Insights',
        subtitle: 'Dashboard',
        icon: <BarChart3 className="h-8 w-8 text-white" />,
        features: ['Real-time analytics dashboard', 'Sales performance tracking', 'Revenue & profit insights', 'Key business metrics at a glance'],
        images: [
            { src: '/assets/LandingImage/sales-reporrt.png', alt: 'Sales Report Dashboard', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/stock-report.png', alt: 'Stock Report Analytics', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/tax-report.png', alt: 'Tax Report', width: 1920, height: 1080 },
        ],
        colorClass: 'bg-blue-600 text-white',
        ctaText: 'View Dashboard',
        ctaLink: '/register',
        highlight: false,
    },
    {
        title: 'Complete Store Management',
        subtitle: 'Store',
        icon: <Store className="h-8 w-8 text-white" />,
        features: ['Multi-store management system', 'Store settings & configuration', 'Employee management & permissions', 'Stock adjustments & inventory control'],
        images: [
            { src: '/assets/LandingImage/employees.png', alt: 'Employee Management', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/employees-create.png', alt: 'Add Employee', width: 1920, height: 1080 },
        ],
        colorClass: 'bg-purple-600 text-white',
        ctaText: 'Manage Stores',
        ctaLink: '/register',
        highlight: false,
    },
    {
        title: 'Organize Your Products',
        subtitle: 'Category & Brand',
        icon: <Package className="h-8 w-8 text-white" />,
        features: ['Category management system', 'Brand organization & tracking', 'Hierarchical product structure', 'Easy product categorization'],
        images: [
            { src: '/assets/LandingImage/category.png', alt: 'Category Management', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/brand.png', alt: 'Brand Management', width: 1920, height: 1080 },
        ],
        colorClass: 'bg-emerald-600 text-white',
        ctaText: 'Organize Products',
        ctaLink: '/register',
        highlight: false,
    },
    {
        title: 'Advanced Product Management',
        subtitle: 'Products',
        icon: <Package className="h-8 w-8 text-white" />,
        features: ['Add & manage products easily', 'Stock adjustment & tracking', 'Generate product QR codes', 'Print barcode labels'],
        images: [
            { src: '/assets/LandingImage/all-products.png', alt: 'Product Management', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/products-create.png', alt: 'Create Product', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/label.png', alt: 'Product Labels', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/lable-print.png', alt: 'Print Labels', width: 1920, height: 1080 },
        ],
        colorClass: 'bg-teal-600 text-white',
        ctaText: 'Manage Products',
        ctaLink: '/register',
        highlight: false,
    },
    {
        title: 'Fast & Efficient Point of Sale',
        subtitle: 'POS',
        icon: <ShoppingCart className="h-8 w-8 text-white" />,
        features: ['Lightning-fast POS interface', 'Barcode scanning support', 'Multiple payment methods', 'Quick checkout process'],
        images: [{ src: '/assets/LandingImage/pos.png', alt: 'POS Interface', width: 1920, height: 1080 }],
        colorClass: 'bg-blue-500 text-white',
        ctaText: 'Try POS',
        ctaLink: '/register',
        highlight: false,
    },
    {
        title: 'Mobile & Tablet Responsive Design',
        subtitle: 'Responsive',
        icon: <Smartphone className="h-8 w-8 text-white" />,
        features: ['Fully responsive on all devices', 'Mobile-optimized interface', 'Tablet-friendly layouts', 'Works seamlessly on any screen size'],
        images: [
            { src: '/assets/LandingImage/mobileResponside.png', alt: 'Mobile Responsive', width: 1080, height: 1920 },
            { src: '/assets/LandingImage/Tablet Responsive.png', alt: 'Tablet Responsive', width: 1920, height: 1080 },
        ],
        colorClass: 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white',
        ctaText: 'Try on Mobile',
        ctaLink: '/register',
        highlight: true,
    },
    {
        title: 'No Barcode Scanner Needed - Use Your Mobile!',
        subtitle: 'Mobile Scanning',
        icon: <Scan className="h-8 w-8 text-white" />,
        features: ['Scan barcodes with your phone camera', 'No expensive scanner hardware needed', 'Automatic barcode recognition', 'Works on any smartphone or tablet'],
        images: [{ src: '/assets/LandingImage/automatic barcode scan.png', alt: 'Automatic Barcode Scanning', width: 1920, height: 1080 }],
        colorClass: 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white',
        ctaText: 'Try Mobile Scanning',
        ctaLink: '/register',
        highlight: true,
    },
    {
        title: 'Streamlined Order Management',
        subtitle: 'Orders',
        icon: <FileText className="h-8 w-8 text-white" />,
        features: ['View all orders in one place', 'Order status tracking', 'Invoice generation', 'Order history & analytics'],
        images: [{ src: '/assets/LandingImage/orders.png', alt: 'Order Management', width: 1920, height: 1080 }],
        colorClass: 'bg-indigo-600 text-white',
        ctaText: 'Manage Orders',
        ctaLink: '/register',
        highlight: false,
    },
    {
        title: 'Purchase Order System',
        subtitle: 'Purchases',
        icon: <ShoppingCart className="h-8 w-8 text-white" />,
        features: ['Create purchase orders easily', 'Track all purchases', 'Supplier management', 'Purchase history & reports'],
        images: [
            { src: '/assets/LandingImage/purchase-create.png', alt: 'Create Purchase', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/purchase-rcv.png', alt: 'Receive Purchase', width: 1920, height: 1080 },
        ],
        colorClass: 'bg-cyan-600 text-white',
        ctaText: 'Manage Purchases',
        ctaLink: '/register',
        highlight: false,
    },
    {
        title: 'Supplier Management',
        subtitle: 'Suppliers',
        icon: <Truck className="h-8 w-8 text-white" />,
        features: ['Add & manage suppliers', 'Supplier contact information', 'Track supplier history', 'Supplier performance metrics'],
        images: [
            { src: '/assets/LandingImage/all-suppiler.png', alt: 'All Suppliers', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/create-supplier.png', alt: 'Create Supplier', width: 1920, height: 1080 },
        ],
        colorClass: 'bg-amber-600 text-white',
        ctaText: 'Manage Suppliers',
        ctaLink: '/register',
        highlight: false,
    },
    {
        title: 'Financial Accounting',
        subtitle: 'Accounts',
        icon: <CreditCard className="h-8 w-8 text-white" />,
        features: ['Ledger management system', 'Journal entry tracking', 'Financial reports', 'Account reconciliation'],
        images: [
            { src: '/assets/LandingImage/ledger.png', alt: 'Ledger Management', width: 1920, height: 1080 },
            { src: '/assets/LandingImage/journal.png', alt: 'Journal Entries', width: 1920, height: 1080 },
        ],
        colorClass: 'bg-green-600 text-white',
        ctaText: 'Manage Accounts',
        ctaLink: '/register',
        highlight: false,
    },
    {
        title: 'Expense Tracking',
        subtitle: 'Expenses',
        icon: <Calculator className="h-8 w-8 text-white" />,
        features: ['Track all business expenses', 'Expense categorization', 'Receipt management', 'Expense reports & analytics'],
        images: [{ src: '/assets/LandingImage/expense.png', alt: 'Expense Tracking', width: 1920, height: 1080 }],
        colorClass: 'bg-red-600 text-white',
        ctaText: 'Track Expenses',
        ctaLink: '/register',
        highlight: false,
    },
    {
        title: 'Customer Relationship Management',
        subtitle: 'Customers',
        icon: <Users className="h-8 w-8 text-white" />,
        features: ['Complete customer database', 'Customer purchase history', 'Loyalty program support', 'Customer analytics & insights'],
        images: [{ src: '/assets/LandingImage/customer.png', alt: 'Customer Management', width: 1920, height: 1080 }],
        colorClass: 'bg-orange-600 text-white',
        ctaText: 'Manage Customers',
        ctaLink: '/register',
        highlight: false,
    },
];

// Image Modal Component for Zoom
const ImageModal = ({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) => {
    // Close on scroll
    React.useEffect(() => {
        const handleScroll = () => onClose();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [onClose]);

    return (
        <div className="animate-in fade-in fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm duration-200" onClick={onClose}>
            <div className="animate-in zoom-in-95 relative flex max-h-[80vh] w-full max-w-[900px] items-center justify-center duration-200" onClick={(e) => e.stopPropagation()}>
                <button className="absolute -right-3 -top-3 z-10 rounded-full bg-gray-800 p-2 text-white shadow-lg transition-all hover:scale-110 hover:bg-gray-700" onClick={onClose}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <Image src={src} alt={alt} width={1920} height={1080} className="max-h-[80vh] w-auto rounded-lg object-contain shadow-2xl" quality={90} />
            </div>
        </div>
    );
};

const SectionBlock = ({
    title,
    subtitle,
    icon,
    features,
    images,
    colorClass,
    ctaText,
    ctaLink,
    reverse = false,
    highlight = false,
}: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    features: string[];
    images: { src: string; alt: string; width: number; height: number }[];
    colorClass: string;
    ctaText: string;
    ctaLink: string;
    reverse?: boolean;
    highlight?: boolean;
}) => {
    const [zoomedImage, setZoomedImage] = useState<{ src: string; alt: string } | null>(null);

    return (
        <>
            <div className={`mb-24 ${highlight ? 'relative' : ''}`}>
                {highlight && <div className="absolute -inset-4 animate-pulse rounded-3xl bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-red-600/20 blur-2xl"></div>}
                <div className={`relative overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ${highlight ? 'ring-4 ring-purple-500/50 ring-offset-4' : 'ring-gray-900/5'}`}>
                    <div className={`grid grid-cols-1 lg:grid-cols-2 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
                        {/* Image / Swiper */}
                        <div className="relative overflow-hidden border-gray-100">
                            <Swiper
                                modules={[Mousewheel, Pagination, Navigation]}
                                mousewheel
                                pagination={{ clickable: true }}
                                navigation
                                spaceBetween={10}
                                slidesPerView={1}
                                breakpoints={{
                                    640: { slidesPerView: 1 },
                                    768: { slidesPerView: 1 },
                                    1024: { slidesPerView: 1 },
                                }}
                                className="h-[400px] lg:h-[500px]"
                            >
                                {images.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <div
                                            className="group relative flex h-[400px] w-full cursor-zoom-in items-center justify-center bg-gray-50 lg:h-[500px]"
                                            onClick={() => setZoomedImage({ src: image.src, alt: image.alt })}
                                        >
                                            <Image
                                                className="max-h-full max-w-full rounded-t-3xl object-contain transition-transform duration-300 group-hover:scale-105 lg:rounded-none"
                                                src={image.src}
                                                alt={image.alt}
                                                width={image.width}
                                                height={image.height}
                                                placeholder="blur"
                                                blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(image.width, image.height))}`}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
                                                <ZoomIn className="h-12 w-12 text-white opacity-0 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100" />
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col justify-center border-gray-100 p-6 sm:p-10 lg:p-16">
                            <div className="mb-6 flex items-center gap-4">
                                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${colorClass} shadow-lg`}>{icon}</div>
                                <div>
                                    <span className="text-sm font-semibold uppercase tracking-wider text-gray-400">{subtitle}</span>
                                    <h3 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h3>
                                </div>
                            </div>
                            <div className="mb-6 space-y-3">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 sm:h-10 sm:w-10">
                                            <Check className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
                                        </div>
                                        <span className="text-sm text-gray-700 sm:text-base">{feature}</span>
                                    </div>
                                ))}
                            </div>
                            <Link
                                href={ctaLink}
                                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-all duration-200 sm:px-8 sm:py-4
              ${colorClass} 
              text-white shadow-lg 
              hover:scale-105 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-300`}
                            >
                                {ctaText} <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {zoomedImage && <ImageModal src={zoomedImage.src} alt={zoomedImage.alt} onClose={() => setZoomedImage(null)} />}
        </>
    );
};

export default function OverViewSection({ id }: { id: string }) {
    return (
        <section id={id} className="bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                        System <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Overview</span>
                    </h2>
                    <p className="mx-auto max-w-3xl text-base text-gray-600 sm:text-lg md:text-xl">Discover the powerful features that make our POS system the perfect solution for your business.</p>
                </div>

                {sectionsData.map((section, idx) => (
                    <SectionBlock
                        key={idx}
                        {...section}
                        reverse={idx % 2 !== 0} // Odd sections reversed (image right, content left)
                    />
                ))}
            </div>
        </section>
    );
}
