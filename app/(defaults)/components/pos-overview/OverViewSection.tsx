'use client';
import { ArrowRight, BarChart3, Calculator, Check, CreditCard, FileText, Package, ShoppingCart, Store, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Mousewheel, Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
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

// Multiple images for each section
const analyticsImages = [
    { src: '/images/dashboard.png', alt: 'Analytics Dashboard 1' },
    { src: '/images/pos.png', alt: 'Analytics Dashboard 2' },
    { src: '/images/products.png', alt: 'Analytics Dashboard 3' },
    { src: '/images/dashboard-4.png', alt: 'Analytics Dashboard 4' },
];

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

export default function OverViewSection({ id }: { id: string }) {
    return (
        <section id={id} className="bg-gradient-to-b from-gray-50 via-white to-gray-50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-24 text-center">
                    <h2 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 md:text-6xl">
                        System
                        <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Overview</span>
                    </h2>
                    <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
                        Discover the powerful features that make our POS system the perfect solution for your business. From advanced analytics to seamless operations, we&apos;ve got everything you
                        need to succeed.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <div className="h-1 w-16 rounded bg-blue-500"></div>
                        <div className="h-1 w-2 rounded bg-gray-300"></div>
                        <div className="h-1 w-16 rounded bg-purple-500"></div>
                    </div>
                </div>

                {/* Analytics Dashboard Section */}
                <div className="mb-24">
                    <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="relative overflow-hidden border-r border-gray-100 lg:border-r-2">
                                <Swiper
                                    modules={[Mousewheel, Pagination, Navigation]}
                                    mousewheel={true}
                                    pagination={{ clickable: true }}
                                    navigation={true}
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    className="h-80 lg:h-full"
                                >
                                    {analyticsImages.map((image, index) => (
                                        <SwiperSlide key={index}>
                                            <Image className="h-80 w-full object-cover lg:h-full" src={image.src} alt={image.alt} width={700} height={500} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                            <div className="flex flex-col justify-center border-l border-gray-100 p-10 lg:border-l-2 lg:p-16">
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                                        <BarChart3 className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">Analytics</span>
                                        <h3 className="text-4xl font-bold tracking-tight text-gray-900">Powerful Dashboard</h3>
                                    </div>
                                </div>
                                <p className="mb-10 text-lg leading-relaxed text-gray-600">
                                    Get comprehensive insights into your business performance with real-time data visualization, custom reports, and predictive analytics to make informed decisions.
                                </p>
                                <div className="space-y-4">
                                    {analyticsFeatures.map((feature, index) => (
                                        <div key={feature} className="animate-in slide-in-from-left-8 flex items-center gap-4 opacity-0 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                <Check className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <span className="font-medium text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10">
                                    <Link
                                        href="/register"
                                        className="group inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30"
                                    >
                                        View Dashboard
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Management Section */}
                <div className="mb-24">
                    <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="order-2 flex flex-col justify-center border-l border-gray-100 p-10 lg:order-1 lg:border-l-2 lg:p-16">
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25">
                                        <Package className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Products</span>
                                        <h3 className="text-4xl font-bold tracking-tight text-gray-900">Advanced Management</h3>
                                    </div>
                                </div>
                                <p className="mb-10 text-lg leading-relaxed text-gray-600">
                                    Efficiently manage your entire product catalog with advanced inventory tracking, automated workflows, and seamless integration across all your sales channels.
                                </p>
                                <div className="space-y-4">
                                    {productFeatures.map((feature, index) => (
                                        <div key={feature} className="animate-in slide-in-from-right-8 flex items-center gap-4 opacity-0 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                                                <Check className="h-5 w-5 text-emerald-600" />
                                            </div>
                                            <span className="font-medium text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10">
                                    <Link
                                        href="/register"
                                        className="group inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/30"
                                    >
                                        Manage Products
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                            <div className="relative order-1 overflow-hidden border-r border-gray-100 lg:order-2 lg:border-r-2">
                                <Swiper
                                    modules={[Mousewheel, Pagination, Navigation]}
                                    mousewheel={true}
                                    pagination={{ clickable: true }}
                                    navigation={true}
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    className="h-80 lg:h-full"
                                >
                                    {productImages.map((image, index) => (
                                        <SwiperSlide key={index}>
                                            <Image className="h-80 w-full object-cover lg:h-full" src={image.src} alt={image.alt} width={700} height={500} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Store Management Section */}
                <div className="mb-24">
                    <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="relative overflow-hidden border-r border-gray-100 lg:border-r-2">
                                <Swiper
                                    modules={[Mousewheel, Pagination, Navigation]}
                                    mousewheel={true}
                                    pagination={{ clickable: true }}
                                    navigation={true}
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    className="h-80 lg:h-full"
                                >
                                    {storeImages.map((image, index) => (
                                        <SwiperSlide key={index}>
                                            <Image className="h-80 w-full object-cover lg:h-full" src={image.src} alt={image.alt} width={700} height={500} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                            <div className="flex flex-col justify-center border-l border-gray-100 p-10 lg:border-l-2 lg:p-16">
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25">
                                        <Store className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold uppercase tracking-wider text-purple-600">Store</span>
                                        <h3 className="text-4xl font-bold tracking-tight text-gray-900">Multi-Store Management</h3>
                                    </div>
                                </div>
                                <p className="mb-10 text-lg leading-relaxed text-gray-600">
                                    Manage multiple locations from one central hub. Control staff access, monitor store performance, and ensure consistent operations across all your business
                                    locations.
                                </p>
                                <div className="space-y-4">
                                    {storeFeatures.map((feature, index) => (
                                        <div key={feature} className="animate-in slide-in-from-left-8 flex items-center gap-4 opacity-0 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                                <Check className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <span className="font-medium text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10">
                                    <Link
                                        href="/register"
                                        className="group inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:bg-purple-700 hover:shadow-xl hover:shadow-purple-500/30"
                                    >
                                        Manage Stores
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* POS System Section */}
                <div className="mb-24">
                    <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="order-2 flex flex-col justify-center border-l border-gray-100 p-10 lg:order-1 lg:border-l-2 lg:p-16">
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25">
                                        <CreditCard className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold uppercase tracking-wider text-orange-600">Payment</span>
                                        <h3 className="text-4xl font-bold tracking-tight text-gray-900">Lightning-Fast POS</h3>
                                    </div>
                                </div>
                                <p className="mb-10 text-lg leading-relaxed text-gray-600">
                                    Process transactions quickly and efficiently with our advanced POS system. Accept multiple payment methods, customize receipts, and keep operations running even
                                    when offline.
                                </p>
                                <div className="space-y-4">
                                    {posFeatures.map((feature, index) => (
                                        <div key={feature} className="animate-in slide-in-from-right-8 flex items-center gap-4 opacity-0 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                                                <Check className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <span className="font-medium text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10">
                                    <Link
                                        href="/register"
                                        className="group inline-flex items-center gap-2 rounded-full bg-orange-600 px-8 py-4 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-500/30"
                                    >
                                        Try POS System
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                            <div className="relative order-1 overflow-hidden border-r border-gray-100 lg:order-2 lg:border-r-2">
                                <Swiper
                                    modules={[Mousewheel, Pagination, Navigation]}
                                    mousewheel={true}
                                    pagination={{ clickable: true }}
                                    navigation={true}
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    className="h-80 lg:h-full"
                                >
                                    {posImages.map((image, index) => (
                                        <SwiperSlide key={index}>
                                            <Image className="h-80 w-full object-cover lg:h-full" src={image.src} alt={image.alt} width={700} height={500} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accounting Section */}
                <div className="mb-24">
                    <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="relative overflow-hidden border-r border-gray-100 lg:border-r-2">
                                <Swiper
                                    modules={[Mousewheel, Pagination, Navigation]}
                                    mousewheel={true}
                                    pagination={{ clickable: true }}
                                    navigation={true}
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    className="h-80 lg:h-full"
                                >
                                    {accountingImages.map((image, index) => (
                                        <SwiperSlide key={index}>
                                            <Image className="h-80 w-full object-cover lg:h-full" src={image.src} alt={image.alt} width={700} height={500} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                            <div className="flex flex-col justify-center border-l border-gray-100 p-10 lg:border-l-2 lg:p-16">
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/25">
                                        <Calculator className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold uppercase tracking-wider text-teal-600">Accounting</span>
                                        <h3 className="text-4xl font-bold tracking-tight text-gray-900">Financial Management</h3>
                                    </div>
                                </div>
                                <p className="mb-10 text-lg leading-relaxed text-gray-600">
                                    Streamline your financial operations with comprehensive accounting features. Track expenses, generate reports, and seamlessly integrate with popular accounting
                                    software.
                                </p>
                                <div className="space-y-4">
                                    {accountingFeatures.map((feature, index) => (
                                        <div key={feature} className="animate-in slide-in-from-left-8 flex items-center gap-4 opacity-0 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                                                <Check className="h-5 w-5 text-teal-600" />
                                            </div>
                                            <span className="font-medium text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10">
                                    <Link
                                        href="/register"
                                        className="group inline-flex items-center gap-2 rounded-full bg-teal-600 px-8 py-4 font-semibold text-white shadow-lg shadow-teal-500/25 transition-all duration-200 hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-500/30"
                                    >
                                        View Accounting
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Management Section */}
                <div className="mb-24">
                    <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="order-2 flex flex-col justify-center border-l border-gray-100 p-10 lg:order-1 lg:border-l-2 lg:p-16">
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/25">
                                        <Users className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold uppercase tracking-wider text-pink-600">Customer</span>
                                        <h3 className="text-4xl font-bold tracking-tight text-gray-900">Customer Relations</h3>
                                    </div>
                                </div>
                                <p className="mb-10 text-lg leading-relaxed text-gray-600">
                                    Build stronger customer relationships with comprehensive customer management tools. Track purchase history, manage loyalty programs, and create personalized
                                    marketing campaigns.
                                </p>
                                <div className="space-y-4">
                                    {customerFeatures.map((feature, index) => (
                                        <div key={feature} className="animate-in slide-in-from-right-8 flex items-center gap-4 opacity-0 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                                                <Check className="h-5 w-5 text-pink-600" />
                                            </div>
                                            <span className="font-medium text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10">
                                    <Link
                                        href="/register"
                                        className="group inline-flex items-center gap-2 rounded-full bg-pink-600 px-8 py-4 font-semibold text-white shadow-lg shadow-pink-500/25 transition-all duration-200 hover:bg-pink-700 hover:shadow-xl hover:shadow-pink-500/30"
                                    >
                                        Manage Customers
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                            <div className="relative order-1 overflow-hidden border-r border-gray-100 lg:order-2 lg:border-r-2">
                                <Swiper
                                    modules={[Mousewheel, Pagination, Navigation]}
                                    mousewheel={true}
                                    pagination={{ clickable: true }}
                                    navigation={true}
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    className="h-80 lg:h-full"
                                >
                                    {customerImages.map((image, index) => (
                                        <SwiperSlide key={index}>
                                            <Image className="h-80 w-full object-cover lg:h-full" src={image.src} alt={image.alt} width={700} height={500} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Purchase Management Section */}
                <div className="mb-24">
                    <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="relative overflow-hidden border-r border-gray-100 lg:border-r-2">
                                <Swiper
                                    modules={[Mousewheel, Pagination, Navigation]}
                                    mousewheel={true}
                                    pagination={{ clickable: true }}
                                    navigation={true}
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    className="h-80 lg:h-full"
                                >
                                    {purchaseImages.map((image, index) => (
                                        <SwiperSlide key={index}>
                                            <Image className="h-80 w-full object-cover lg:h-full" src={image.src} alt={image.alt} width={700} height={500} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                            <div className="flex flex-col justify-center border-l border-gray-100 p-10 lg:border-l-2 lg:p-16">
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
                                        <ShoppingCart className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold uppercase tracking-wider text-amber-600">Purchase</span>
                                        <h3 className="text-4xl font-bold tracking-tight text-gray-900">Supply Chain Management</h3>
                                    </div>
                                </div>
                                <p className="mb-10 text-lg leading-relaxed text-gray-600">
                                    Optimize your supply chain with advanced purchase management tools. Track suppliers, manage orders, and get alerts for inventory restocking to ensure smooth
                                    operations.
                                </p>
                                <div className="space-y-4">
                                    {purchaseFeatures.map((feature, index) => (
                                        <div key={feature} className="animate-in slide-in-from-left-8 flex items-center gap-4 opacity-0 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                                                <Check className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <span className="font-medium text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10">
                                    <Link
                                        href="/register"
                                        className="group inline-flex items-center gap-2 rounded-full bg-amber-600 px-8 py-4 font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-200 hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-500/30"
                                    >
                                        Manage Purchases
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Generation Section */}
                <div className="mb-24">
                    <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="order-2 flex flex-col justify-center border-l border-gray-100 p-10 lg:order-1 lg:border-l-2 lg:p-16">
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/25">
                                        <FileText className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Reports</span>
                                        <h3 className="text-4xl font-bold tracking-tight text-gray-900">Advanced Reporting</h3>
                                    </div>
                                </div>
                                <p className="mb-10 text-lg leading-relaxed text-gray-600">
                                    Generate comprehensive reports to gain deep insights into your business performance. From sales summaries to tax reports, get the data you need to make informed
                                    decisions.
                                </p>
                                <div className="space-y-4">
                                    {reportFeatures.map((feature, index) => (
                                        <div key={feature} className="animate-in slide-in-from-right-8 flex items-center gap-4 opacity-0 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                                                <Check className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <span className="font-medium text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10">
                                    <button className="group inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/30">
                                        View Reports
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                            <div className="relative order-1 overflow-hidden border-r border-gray-100 lg:order-2 lg:border-r-2">
                                <Swiper
                                    modules={[Mousewheel, Pagination, Navigation]}
                                    mousewheel={true}
                                    pagination={{ clickable: true }}
                                    navigation={true}
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    className="h-80 lg:h-full"
                                >
                                    {reportImages.map((image, index) => (
                                        <SwiperSlide key={index}>
                                            <Image className="h-80 w-full object-cover lg:h-full" src={image.src} alt={image.alt} width={700} height={500} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action Section */}
                <div className="text-center">
                    <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-12 shadow-2xl">
                        <div className="mx-auto max-w-3xl">
                            <h3 className="mb-6 text-4xl font-bold text-white">Ready to Transform Your Business?</h3>
                            <p className="mb-8 text-xl text-blue-100">Join thousands of businesses that trust our comprehensive POS solution to streamline their operations and boost growth.</p>
                            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-blue-600 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl">
                                    Start Free Trial
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                                <button className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/20 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/10">
                                    Schedule Demo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
