'use client';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowRight, BarChart3, CheckCircle, Clock, CreditCard, Link, Shield, ShoppingCart, Star, TrendingUp, Users, Zap } from 'lucide-react';
import Image from 'next/image';

import { useState } from 'react';
import andgatePOSLogo from '/public/images/andgatePOS.jpeg' ;
import PriceSection from './(defaults)/components/price/PriceSection';

import OverViewSection from './(defaults)/components/pos-overview/OverViewSection';
 export default function HomePage() {
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
                            The Future of -<span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Point of Sale</span>
                        </h1>
                        <p className="mx-auto mb-12 max-w-4xl text-xl leading-relaxed text-gray-600 md:text-2xl">
                            Transform your business with our cutting-edge POS system. Streamline operations, boost sales, and delight customers with lightning-fast transactions and powerful analytics.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                            <Link
                                href="/register"
                                className="group flex transform items-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-2xl"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                            {/* <button className="flex items-center rounded-full px-8 py-4 text-lg font-semibold text-gray-700 transition-colors hover:bg-gray-100">
                                <div className="mr-3 rounded-full bg-white p-2 shadow-md">
                                    <div className="ml-1 h-0 w-0 border-b-[6px] border-l-[8px] border-t-[6px] border-b-transparent border-l-blue-600 border-t-transparent"></div>
                                </div>
                                Watch Demo
                            </button> */}
                        </div>
                        <div className="mt-12 flex items-center justify-center text-sm text-gray-500">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            No pre payment required • 1 month free trial • Cancel anytime
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
                            { number: '1K+', label: 'Active Businesses', icon: <Users className="h-8 w-8" /> },
                            { number: '৳1.8M+', label: 'Transactions Processed', icon: <TrendingUp className="h-8 w-8" /> },
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
                            Everything You Need to
                            <span className="block text-blue-600">Succeed</span>
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl text-gray-600">Our comprehensive POS system is packed with features designed to streamline your operations and accelerate growth.</p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {[
                            {
                                icon: <ShoppingCart className="h-12 w-12" />,
                                title: 'Lightning-Fast Checkout',
                                description: 'Process transactions in seconds with our intuitive interface. Support for all payment methods including contactless and mobile payments.',
                                color: 'from-blue-500 to-blue-600',
                            },
                            {
                                icon: <BarChart3 className="h-12 w-12" />,
                                title: 'Advanced Analytics',
                                description: 'Get deep insights into your business with real-time reporting, sales trends, and predictive analytics powered by AI.',
                                color: 'from-green-500 to-green-600',
                            },
                            {
                                icon: <Users className="h-12 w-12" />,
                                title: 'Customer Insights',
                                description: 'Build lasting relationships with integrated CRM, loyalty programs, and personalized marketing campaigns.',
                                color: 'from-purple-500 to-purple-600',
                            },
                            {
                                icon: <CreditCard className="h-12 w-12" />,
                                title: 'Secure Payments',
                                description: 'Accept all payment types with bank-level security. PCI compliance and fraud protection included.',
                                color: 'from-orange-500 to-orange-600',
                            },
                            {
                                icon: <TrendingUp className="h-12 w-12" />,
                                title: 'Inventory Management',
                                description: 'Track stock levels, automate reordering, and manage suppliers with our intelligent inventory system.',
                                color: 'from-indigo-500 to-indigo-600',
                            },
                            {
                                icon: <Shield className="h-12 w-12" />,
                                title: 'Multi-Location Support',
                                description: 'Manage multiple stores from one dashboard. Sync inventory, sales, and customer data across all locations.',
                                color: 'from-pink-500 to-pink-600',
                            },
                        ].map((feature, index) => (
                            <div key={index} className="group">
                                <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl group-hover:scale-105">
                                    <div className={`inline-flex rounded-xl bg-gradient-to-r p-4 ${feature.color} mb-6 text-white transition-transform group-hover:scale-110`}>{feature.icon}</div>
                                    <h3 className="mb-4 text-xl font-bold text-gray-900">{feature.title}</h3>
                                    <p className="leading-relaxed text-gray-600">{feature.description}</p>
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
            {/* Testimonials Section */}
            <section className="bg-white py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-20 text-center">
                        <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">Loved by Business Owners</h2>
                        <p className="text-xl text-gray-600">Join thousands of successful businesses already using AndGatePOS</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                name: 'Sarah Mitchell',
                                business: 'Artisan Coffee Co.',
                                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b593?w=150&h=150&fit=crop&crop=face',
                                review: 'AndGatePOS revolutionized our operations.Sales increased 45% in just 3 months, and our customers love the quick checkout experience.',
                                rating: 5,
                            },
                            {
                                name: 'Marcus Chen',
                                business: 'TechHub Electronics',
                                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                                review: 'The analytics dashboard gives us insights we never had before. We can now make data-driven decisions that actually impact our bottom line.',
                                rating: 5,
                            },
                            {
                                name: 'Isabella Rodriguez',
                                business: 'Bella Boutique',
                                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                                review: 'Customer management features helped us build a loyal community. Our repeat customer rate has doubled since switching to AndgatePOS.',
                                rating: 5,
                            },
                        ].map((testimonial, index) => (
                            <div key={index} className="group relative rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 p-8 transition-all hover:shadow-xl">
                                <div className="mb-6 flex">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                                    ))}
                                </div>
                                <blockquote className="mb-6 text-lg italic leading-relaxed text-gray-700">&ldquo;{testimonial.review}&rdquo;</blockquote>
                                <div className="flex items-center">
                                    <Image src={testimonial.image} alt={testimonial.name} width={40} height={40} className="mr-4 h-12 w-12 rounded-full object-cover" />
                                    <div>
                                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-600">{testimonial.business}</div>
                                    </div>
                                </div>
                                <div className="absolute right-6 top-6 text-6xl text-blue-200 opacity-50">❝</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
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
            <footer className="bg-gray-900 py-16 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 grid gap-8 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <div className="mb-6 flex items-center">
                                <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-2">
                                    <ShoppingCart className="h-6 w-6 text-white" />
                                </div>
                                <span className="ml-3 text-2xl font-bold">AndGatePOS</span>
                            </div>
                            <p className="mb-6 max-w-md leading-relaxed text-gray-400">
                                Empowering businesses worldwide with cutting-edge point of sale technology. Transform your operations and accelerate growth with AndGatePOS.
                            </p>
                            <div className="flex space-x-4">
                                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-blue-600">
                                    <span className="text-sm font-bold">f</span>
                                </div>
                                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-blue-600">
                                    <span className="text-sm font-bold">t</span>
                                </div>
                                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-blue-600">
                                    <span className="text-sm font-bold">in</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-6 text-lg font-semibold">Product</h3>
                            <ul className="space-y-4">
                                <li>
                                    <a href="#" className="text-gray-400 transition-colors hover:text-white">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 transition-colors hover:text-white">
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 transition-colors hover:text-white">
                                        Integrations
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 transition-colors hover:text-white">
                                        API
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-6 text-lg font-semibold">Support</h3>
                            <ul className="space-y-4">
                                <li>
                                    <a href="#" className="text-gray-400 transition-colors hover:text-white">
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 transition-colors hover:text-white">
                                        Contact Us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 transition-colors hover:text-white">
                                        Status
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 transition-colors hover:text-white">
                                        Training
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between border-t border-gray-800 pt-8 md:flex-row">
                        <p className="text-sm text-gray-400">© 2024 AndGate Technologies. All rights reserved. Empowering businesses worldwide.</p>
                        <div className="mt-4 flex space-x-6 md:mt-0">
                            <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                                Terms of Service
                            </a>
                            <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                                Cookie Policy
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </MainLayout>
    );
}
