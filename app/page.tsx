'use client';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowRight, BarChart3, CheckCircle, Clock, CreditCard, Package, Play, Settings, Shield, ShoppingCart, Star, Barcode, Target, TrendingUp, Users, Zap, Receipt, Archive, LayoutDashboard, Banknote, Store, BanknoteArrowDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import OverViewSection from './(defaults)/components/pos-overview/OverViewSection';
import TestimonialsSection from './(defaults)/components/testimonial/TestimonialsSection';
import PriceSection from './(defaults)/components/price/PriceSection';
import Footer from './terms-of-service/Footer';

export default function HomePage() {
     const quickStartSteps = [
            {
                step: 1,
                title: 'Create Your Account',
                description: 'Sign up and verify your business information',
                icon: <Target className="h-6 w-6" />,
                color: 'text-blue-600',
            },
            {
                step: 2,
                title: 'Configure Settings',
                description: 'Set up payment methods, tax rates, and business preferences',
                icon: <Settings className="h-6 w-6" />,
                color: 'text-green-600',
            },
            {
                step: 3,
                title: 'Add Products',
                description: 'Import your inventory or add products manually',
                icon: <Package className="h-6 w-6" />,
                color: 'text-purple-600',
            },
            {
                step: 4,
                title: 'Start Selling',
                description: 'Process your first transaction and explore features',
                icon: <ShoppingCart className="h-6 w-6" />,
                color: 'text-orange-600',
            },
        ];
    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-32 pt-20">
                <div className="bg-grid-slate-100 absolute inset-0 -z-10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="mb-8 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                            <Zap className="mr-2 h-4 w-4" />
                            Upcoming: AI-Powered Sales Analytics
                        </div>
                        <h1 className="mb-8 text-5xl font-black leading-tight text-gray-900 md:text-7xl">
                            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Easy POS for Shops</span>            
                        </h1>
                        <h1 className="mb-8 text-2xl font-black leading-tight text-gray-900 md:text-3xl">
                            Made for Bangladeshi SMEs – Start Free, Manage Sales, Stock, and Customers Easily            
                        </h1>
                        <p className="mx-auto mb-12 max-w-4xl text-xl leading-relaxed text-gray-600 md:text-2xl">
                            From small shops to growing businesses, our cloud-based POS helps you track sales, control inventory, and grow profits — anytime, anywhere.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                            <Link
                                href="/register"
                                className="group flex transform items-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-2xl"
                            >
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                            {/* <button className="flex items-center rounded-full px-8 py-4 text-lg font-semibold text-gray-700 transition-colors hover:bg-gray-100">
                                <div className="mr-3 rounded-full bg-white p-2 shadow-md">
                                    <div className="ml-1 h-0 w-0 border-b-[6px] border-l-[8px] border-t-[6px] border-b-transparent border-l-blue-600 border-t-transparent"></div>
                                </div>
                                Watch Demo
                            </button> */}
                        </div>
                        <div className="mt-12 flex items-center justify-center text-sm text-gray-500 space-x-6">
                        <div className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            No pre payment required
                        </div>
                        <div className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                            Free package available
                        </div>
                        <div className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-red-500" />
                            Cancel anytime
                        </div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute left-10 top-1/4 h-20 w-20 animate-pulse rounded-full bg-blue-200 opacity-20"></div>
                <div className="absolute right-10 top-1/3 h-16 w-16 animate-pulse rounded-full bg-purple-200 opacity-20 delay-75"></div>
                <div className="absolute bottom-1/4 left-1/4 h-12 w-12 animate-pulse rounded-full bg-indigo-200 opacity-20 delay-150"></div>
            </section>
            {/* Stats Section */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 text-center md:grid-cols-4">
                        {[
                            { number: '100+', label: 'Active Businesses', icon: <Users className="h-8 w-8" /> },
                            { number: '৳1M+', label: 'Order Processed', icon: <TrendingUp className="h-8 w-8" /> },
                            { number: '99.9%', label: 'Uptime Guarantee', icon: <Shield className="h-8 w-8" /> },
                            { number: '24/7', label: 'Customer Support', icon: <Clock className="h-8 w-8" /> },
                        ].map((stat, index) => (
                            <div key={index} className="group">
                                <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-8 transition-all hover:shadow-lg group-hover:scale-105">
                                    <div className="mb-4 flex justify-center text-blue-600 transition-transform group-hover:scale-110">{stat.icon}</div>
                                    <div className="mb-2 text-3xl font-bold text-gray-900">{stat.number}</div>
                                    <div className="font-medium text-gray-600">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* Features Section */}
            <section id="features" className="bg-gradient-to-b from-slate-50 to-white py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-20 text-center">
                        <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
                            Manage Sales, Stock, and Growth 
                            <span className="block text-blue-600">Effortlessly</span>
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl text-gray-600">From billing to reporting, our POS takes care of the hard work so you can focus on running your business.</p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {[
                            {
                                icon: <LayoutDashboard className="h-12 w-12" />,
                                title: 'Smart Dashboard',
                                description: 'Get a clear overview of sales, stock, and business performance in one easy screen.',
                                color: 'from-blue-500 to-blue-600',
                            },
                            {
                                icon: <ShoppingCart className="h-12 w-12" />,
                                title: 'Easy Checkout',
                                description: 'Process sales quickly and effortlessly — cash, bKash, or card, all in one simple interface.',
                                color: 'from-blue-500 to-blue-600',
                            },
                            {
                                icon: <BarChart3 className="h-12 w-12" />,
                                title: 'Simple Reporting',
                                description: 'View daily sales, revenue trends, and stock levels in a clear dashboard for small business owners.',
                                color: 'from-green-500 to-green-600',
                            },
                            {
                                icon: <Users className="h-12 w-12" />,
                                title: 'Supplier Management',
                                description: 'Easily track suppliers, purchase orders, and stock transfers without paperwork or confusion.',
                                color: 'from-purple-500 to-purple-600',
                            },
                            {
                                icon: <Package className="h-12 w-12" />,
                                title: 'Product & Category Management',
                                description: 'Organize products into categories, manage variants, and keep your inventory clear and up-to-date.',
                                color: 'from-orange-500 to-orange-600',
                            },
                            {
                                icon: <Receipt className="h-12 w-12" />,
                                title: 'Order Management',
                                description: 'Track orders, sales, and invoices easily, so you never miss a sale or customer request.',
                                color: 'from-yellow-500 to-yellow-600',
                            },
                            {
                                icon: <BanknoteArrowDown className="h-12 w-12" />,
                                title: 'Expense Management',
                                description: 'Record and monitor daily expenses — rent, bills, and other costs — in one easy place.',
                                color: 'from-red-500 to-red-600',
                            },
                            {
                                icon: <Banknote className="h-12 w-12" />,
                                title: 'Accounts & Payments',
                                description: 'Track income, payments, and balances across your business to stay financially organized.',
                                color: 'from-teal-500 to-teal-600',
                            },
                            {
                                icon: <Users className="h-12 w-12" />,
                                title: 'Customer Management',
                                description: 'Keep customer records, contact details, and purchase history to improve service and loyalty.',
                                color: 'from-pink-500 to-pink-600',
                            },
                            {
                                icon: <Archive className="h-12 w-12" />,
                                title: 'Inventory Management',
                                description: 'Monitor stock levels, damaged or lost items, and transfer stock between locations easily.',
                                color: 'from-indigo-500 to-indigo-600',
                            },
                            {
                                icon: <Store className="h-12 w-12" />,
                                title: 'Multi-Store Management',
                                description: 'Run multiple shops from a single dashboard — track sales, stock, and expenses across branches.',
                                color: 'from-pink-500 to-pink-600',
                            },
                            {
                                icon: <Barcode className="h-12 w-12" />,
                                title: 'Barcode Generation & Printing',
                                description: 'Generate and print barcodes for your products quickly and easily, improving sales and stock management.',
                                color: 'from-yellow-500 to-yellow-600',
                            },
                        ].map((feature, index) => (
                            <div key={index} className="group flex">
                                <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl group-hover:scale-105 flex-1">
                                    {/* Icon Box */}
                                    <div className={`w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} mb-6 text-white transition-transform group-hover:scale-110`}>
                                    {feature.icon}
                                    </div>

                                    <h3 className="mb-4 text-xl font-bold text-gray-900">{feature.title}</h3>
                                    <p className="leading-relaxed text-gray-600 mt-auto">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* POS Overview Section */}
            <OverViewSection id="overview"></OverViewSection>
            {/* Price Section */}
            <PriceSection id="pricing"></PriceSection>

{/*Quick account start*/}
 {/* Quick Start Section */}
                <section id="quick-start" className="bg-gradient-to-b from-white to-gray-50 py-11">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-16 text-center">
                            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">Quick Start Guide</h2>
                            <p className="mx-auto max-w-3xl text-xl text-gray-600">Get up and running in just 4 simple steps. Perfect for new users who want to start selling immediately.</p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {quickStartSteps.map((step, index) => (
                                <div key={index} className="group relative">
                                    <div className="rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl group-hover:scale-105">
                                        <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 ${step.color}`}>{step.icon}</div>
                                        <div className="mb-2 text-2xl font-bold text-gray-400">0{step.step}</div>
                                        <h3 className="mb-4 text-xl font-bold text-gray-900">{step.title}</h3>
                                        <p className="text-gray-600">{step.description}</p>
                                    </div>
                                    {index < quickStartSteps.length - 1 && (
                                        <div className="absolute -right-4 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-blue-100 lg:flex">
                                            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 text-center">
                            <Link
                                href="/training"
                                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
                            >
                                <Play className="h-5 w-5" />
                                Watch Quick Start Video
                            </Link>
                        </div>
                    </div>
                </section>






            {/* Testimonials Section */}
            <TestimonialsSection></TestimonialsSection>

            {/* CTA Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-24">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-8 text-4xl font-bold text-white md:text-5xl">Ready to Transform Your Business?</h2>
                    <p className="mb-12 text-xl leading-relaxed text-blue-100">
                        Join over 50,000 businesses that trust AndGatePOS to power their success. Start your free trial today and see the difference in just 24 hours.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                        <Link
                            href="/contact"
                            className="group flex transform items-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition-all hover:scale-105 hover:bg-gray-100"
                        >
                            Start Free Trial Now
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link href="/login" className="rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white hover:text-blue-600">
                            Sign In
                        </Link>
                    </div>
                    <div className="mt-8 text-sm text-blue-100">✓ No setup fees ✓ Cancel anytime ✓ 24/7 support included</div>
                </div>

                {/* Decorative elements */}
                <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-white opacity-10"></div>
                <div className="absolute bottom-10 right-10 h-24 w-24 rounded-full bg-white opacity-10"></div>
            </section>
            {/* Footer */}
            <Footer />
        </MainLayout>
    );
}
