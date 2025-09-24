'use client';
import { ArrowRight, BarChart3, Calculator, Check, CreditCard, FileText, Package, ShoppingCart, Store, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Mousewheel, Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

const sectionsData = [
  {
    title: "Powerful Dashboard",
    subtitle: "Analytics",
    icon: <BarChart3 className="h-8 w-8 text-white" />,
    features: [
      'Real-time analytics dashboard',
      'Sales performance tracking',
      'Customer behavior insights',
      'Inventory movement reports'
    ],
    images: [{ src: '/images/dashboard.png', alt: 'Analytics Dashboard', width: 700, height: 500 }],
    colorClass: "bg-blue-600 text-white",
    ctaText: "View Dashboard",
    ctaLink: "/register"
  },
  {
    title: "Advanced Product Management",
    subtitle: "Products",
    icon: <Package className="h-8 w-8 text-white" />,
    features: [
      'Advanced product management',
      'Inventory tracking & alerts',
      'Bulk import/export tools',
      'Category & variant management'
    ],
    images: [
      { src: '/images/products-1.png', alt: 'Product Management 1', width: 700, height: 500 },
      { src: '/images/products-2.png', alt: 'Product Management 2', width: 700, height: 500 },
    ],
    colorClass: "bg-emerald-600 text-white",
    ctaText: "Manage Products",
    ctaLink: "/register"
  },
  {
    title: "Multi-Store Management",
    subtitle: "Store",
    icon: <Store className="h-8 w-8 text-white" />,
    features: [
      'Multi-store management',
      'Staff role permissions',
      'Store performance metrics',
      'Centralized control panel'
    ],
    images: [
      { src: '/images/store-1.png', alt: 'Store Management 1', width: 700, height: 500 },
      { src: '/images/store-2.png', alt: 'Store Management 2', width: 700, height: 500 },
    ],
    colorClass: "bg-purple-600 text-white",
    ctaText: "Manage Stores",
    ctaLink: "/register"
  },
  {
    title: "Customer Management",
    subtitle: "Customers",
    icon: <Users className="h-8 w-8 text-white" />,
    features: [
      'Customer database',
      'Loyalty & reward programs',
      'Customer segmentation',
      'CRM integration'
    ],
    images: [
      { src: '/images/customers-1.png', alt: 'Customer Management 1', width: 700, height: 500 },
      { src: '/images/customers-2.png', alt: 'Customer Management 2', width: 700, height: 500 },
    ],
    colorClass: "bg-orange-600 text-white",
    ctaText: "Manage Customers",
    ctaLink: "/register"
  },
  {
    title: "Sales & Payment",
    subtitle: "Sales",
    icon: <CreditCard className="h-8 w-8 text-white" />,
    features: [
      'Multi-payment support',
      'Invoice generation',
      'Refund management',
      'Sales analytics'
    ],
    images: [
      { src: '/images/sales-1.png', alt: 'Sales Management 1', width: 700, height: 500 },
      { src: '/images/sales-2.png', alt: 'Sales Management 2', width: 700, height: 500 },
    ],
    colorClass: "bg-red-600 text-white",
    ctaText: "Track Sales",
    ctaLink: "/register"
  },
  {
    title: "Reports & Insights",
    subtitle: "Reports",
    icon: <FileText className="h-8 w-8 text-white" />,
    features: [
      'Comprehensive reports',
      'Export PDF/Excel',
      'Business insights',
      'Custom report builder'
    ],
    images: [
      { src: '/images/reports-1.png', alt: 'Reports 1', width: 700, height: 500 },
      { src: '/images/reports-2.png', alt: 'Reports 2', width: 700, height: 500 },
    ],
    colorClass: "bg-indigo-600 text-white",
    ctaText: "View Reports",
    ctaLink: "/register"
  },
];

const SectionBlock = ({
  title,
  subtitle,
  icon,
  features,
  images,
  colorClass,
  ctaText,
  ctaLink,
  reverse = false
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
}) => (
  <div className="mb-24">
    <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5">
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        {/* Image / Swiper */}
        <div className="relative overflow-hidden border-gray-100 lg:border-r-2 lg:border-l-2">
          <Swiper
            modules={[Mousewheel, Pagination, Navigation]}
            mousewheel
            pagination={{ clickable: true }}
            navigation
            spaceBetween={10}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="h-80 lg:h-full"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <Image
                  className="h-80 w-full object-cover lg:h-full rounded-t-3xl lg:rounded-none"
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(image.width, image.height))}`}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center border-gray-100 p-6 sm:p-10 lg:p-16 lg:border-l-2 lg:border-r-2">
          <div className="mb-6 flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${colorClass} shadow-lg`}>
              {icon}
            </div>
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-400">{subtitle}</span>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">{title}</h3>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gray-100">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </div>
                <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
              </div>
            ))}
          </div>
          <Link
            href={ctaLink}
            className={`inline-flex items-center gap-2 rounded-full px-6 sm:px-8 py-3 sm:py-4 font-semibold shadow-lg transition-all duration-200 ${colorClass} hover:opacity-90`}
          >
            {ctaText} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default function OverViewSection({ id }: { id: string }) {
  return (
    <section id={id} className="bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
            System{' '}
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Overview
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-base sm:text-lg md:text-xl text-gray-600">
            Discover the powerful features that make our POS system the perfect solution for your business.
          </p>
        </div>

        {sectionsData.map((section, idx) => (
          <SectionBlock
            key={idx}
            {...section}
            reverse={idx % 2 === 1} // even index = reverse
          />
        ))}
      </div>
    </section>
  );
}
