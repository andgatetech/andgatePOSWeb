'use client';
import { ArrowRight, BarChart3, Calculator, Check, CreditCard, FileText, Package, ShoppingCart, Store, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Mousewheel, Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import '@/styles/swiper-custom.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const analyticsFeatures = ['Real-time analytics dashboard', 'Sales performance tracking', 'Customer behavior insights', 'Inventory movement reports'];
const productFeatures = ['Advanced product management', 'Inventory tracking & alerts', 'Bulk import/export tools', 'Category & variant management'];
const storeFeatures = ['Multi-store management', 'Staff role permissions', 'Store performance metrics', 'Centralized control panel'];
const posFeatures = ['Lightning-fast checkout', 'Multiple payment methods', 'Receipt customization', 'Offline mode support'];
const accountingFeatures = ['Comprehensive financial reports', 'Tax calculation & filing', 'Expense tracking', 'Integration with accounting software'];
const customerFeatures = ['Customer profiles & history', 'Loyalty program management', 'Personalized marketing campaigns', 'Customer feedback & reviews'];
const purchaseFeatures = ['Supplier management', 'Purchase order tracking', 'Inventory restocking alerts', 'Cost analysis reports'];
const reportFeatures = ['Sales summary reports', 'Tax reports', 'Inventory valuation', 'Custom report generation'];

const analyticsImages = [{ src: '/images/dashboard.png', alt: 'Analytics Dashboard 1' }];
const productImages = [
    { src: '/images/products-1.png', alt: 'Product Management 1' },
    { src: '/images/products-2.png', alt: 'Product Management 2' },
    { src: '/images/products-3.png', alt: 'Product Management 3' },
    { src: '/images/products-4.png', alt: 'Product Management 4' },
];
const storeImages = [
    { src: '/images/store-1.png', alt: 'Store Management 1' },
    { src: '/images/store-2.png', alt: 'Store Management 2' },
    { src: '/images/store-3.png', alt: 'Store Management 3' },
    { src: '/images/store-4.png', alt: 'Store Management 4' },
];
const posImages = [
    { src: '/images/pos-1.png', alt: 'POS System 1' },
    { src: '/images/pos-2.png', alt: 'POS System 2' },
    { src: '/images/pos-3.png', alt: 'POS System 3' },
    { src: '/images/pos-4.png', alt: 'POS System 4' },
];
const accountingImages = [
    { src: '/images/accounting-1.png', alt: 'Accounting Reports 1' },
    { src: '/images/accounting-2.png', alt: 'Accounting Reports 2' },
    { src: '/images/accounting-3.png', alt: 'Accounting Reports 3' },
    { src: '/images/accounting-4.png', alt: 'Accounting Reports 4' },
];
const customerImages = [
    { src: '/images/customer-1.png', alt: 'Customer Management 1' },
    { src: '/images/customer-2.png', alt: 'Customer Management 2' },
    { src: '/images/customer-3.png', alt: 'Customer Management 3' },
    { src: '/images/customer-4.png', alt: 'Customer Management 4' },
];
const purchaseImages = [
    { src: '/images/purchase-1.png', alt: 'Purchase Management 1' },
    { src: '/images/purchase-2.png', alt: 'Purchase Management 2' },
    { src: '/images/purchase-3.png', alt: 'Purchase Management 3' },
    { src: '/images/purchase-4.png', alt: 'Purchase Management 4' },
];
const reportImages = [
    { src: '/images/report-1.png', alt: 'Report Generation 1' },
    { src: '/images/report-2.png', alt: 'Report Generation 2' },
    { src: '/images/report-3.png', alt: 'Report Generation 3' },
    { src: '/images/report-4.png', alt: 'Report Generation 4' },
];

const SectionBlock = ({
  title,
  subtitle,
  icon,
  features,
  images,
  color,
  ctaText,
  ctaLink,
  reverse = false
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  features: string[];
  images: { src: string; alt: string }[];
  color: string;
  ctaText: string;
  ctaLink: string;
  reverse?: boolean;
}) => (
  <div className="mb-24">
    <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5">
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        {/* Swiper / Images */}
        <div className="relative overflow-hidden border-gray-100 lg:border-r-2 lg:border-l-2">
          <Swiper
            modules={[Mousewheel, Pagination, Navigation]}
            mousewheel={true}
            pagination={{ clickable: true }}
            navigation={true}
            spaceBetween={10}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 1 },
              1024: { slidesPerView: 1 },
            }}
            className="h-80 lg:h-full"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <Image className="h-80 w-full object-cover lg:h-full" src={image.src} alt={image.alt} width={700} height={500} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        {/* Content */}
        <div className="flex flex-col justify-center border-gray-100 p-6 sm:p-10 lg:p-16 lg:border-l-2 lg:border-r-2">
          <div className="mb-6 flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-lg`}>
              {icon}
            </div>
            <div>
              <span className={`text-sm font-semibold uppercase tracking-wider ${color.split(' ')[1]}`}>{subtitle}</span>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">{title}</h3>
            </div>
          </div>
          <p className="mb-6 text-gray-600 text-base sm:text-lg leading-relaxed">{subtitle} management tools to enhance your workflow and efficiency.</p>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gray-100`}>
                  <Check className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-600`} />
                </div>
                <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href={ctaLink}
              className={`inline-flex items-center gap-2 rounded-full px-6 sm:px-8 py-3 sm:py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:opacity-90 bg-${color.split(' ')[3]}`}
            >
              {ctaText} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function OverViewSection({ id }: { id: string }) {
  return (
    <section id={id} className="bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
            System{' '}
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Overview
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-base sm:text-lg md:text-xl text-gray-600">
            Discover the powerful features that make our POS system the perfect solution for your business. From advanced analytics to seamless operations, we have everything you need.
          </p>
        </div>

        {/* Sections */}
        <SectionBlock
          title="Powerful Dashboard"
          subtitle="Analytics"
          icon={<BarChart3 className="h-8 w-8 text-white" />}
          features={analyticsFeatures}
          images={analyticsImages}
          color="from-blue-500 to-blue-600 text-blue-600 bg-blue-600"
          ctaText="View Dashboard"
          ctaLink="/register"
        />

        <SectionBlock
          title="Advanced Product Management"
          subtitle="Products"
          icon={<Package className="h-8 w-8 text-white" />}
          features={productFeatures}
          images={productImages}
          color="from-emerald-500 to-green-600 text-emerald-600 bg-emerald-600"
          ctaText="Manage Products"
          ctaLink="/register"
          reverse
        />

        <SectionBlock
          title="Multi-Store Management"
          subtitle="Store"
          icon={<Store className="h-8 w-8 text-white" />}
          features={storeFeatures}
          images={storeImages}
          color="from-purple-500 to-indigo-600 text-purple-600 bg-purple-600"
          ctaText="Manage Stores"
          ctaLink="/register"
        />

        <SectionBlock
          title="Lightning-Fast POS"
          subtitle="Payment"
          icon={<CreditCard className="h-8 w-8 text-white" />}
          features={posFeatures}
          images={posImages}
          color="from-orange-500 to-red-500 text-orange-600 bg-orange-600"
          ctaText="Try POS System"
          ctaLink="/register"
          reverse
        />

        <SectionBlock
          title="Financial Management"
          subtitle="Accounting"
          icon={<Calculator className="h-8 w-8 text-white" />}
          features={accountingFeatures}
          images={accountingImages}
          color="from-teal-500 to-cyan-600 text-teal-600 bg-teal-600"
          ctaText="View Accounting"
          ctaLink="/register"
        />

        <SectionBlock
          title="Customer Relations"
          subtitle="Customer"
          icon={<Users className="h-8 w-8 text-white" />}
          features={customerFeatures}
          images={customerImages}
          color="from-pink-500 to-rose-600 text-pink-600 bg-pink-600"
          ctaText="Manage Customers"
          ctaLink="/register"
          reverse
        />

        <SectionBlock
          title="Supply Chain Management"
          subtitle="Purchase"
          icon={<ShoppingCart className="h-8 w-8 text-white" />}
          features={purchaseFeatures}
          images={purchaseImages}
          color="from-amber-500 to-orange-600 text-amber-600 bg-amber-600"
          ctaText="Manage Purchases"
          ctaLink="/register"
        />

        <SectionBlock
          title="Advanced Reporting"
          subtitle="Reports"
          icon={<FileText className="h-8 w-8 text-white" />}
          features={reportFeatures}
          images={reportImages}
          color="from-indigo-500 to-blue-600 text-indigo-600 bg-indigo-600"
          ctaText="View Reports"
          ctaLink="/register"
          reverse
        />

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 sm:p-12 shadow-2xl">
            <h3 className="mb-4 sm:mb-6 text-3xl sm:text-4xl font-bold text-white">Ready to Transform Your Business?</h3>
            <p className="mb-6 sm:mb-8 text-base sm:text-lg text-blue-100">Join thousands of businesses that trust our POS solution to streamline operations and boost growth.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 sm:px-8 py-3 sm:py-4 font-semibold text-blue-600 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl"
              >
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/20 px-6 sm:px-8 py-3 sm:py-4 font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/10"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
