'use client';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import AndGate from '/public/images/andgatePOS.jpeg';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full bg-white shadow-lg">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center">
                            <div className="flex flex-shrink-0 items-center">
                                <Link href="/" className="rounded-lg p-2">
                                    <Image src={AndGate} alt="AndgatePOS Logo" width={190} height={37} />
                                </Link>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden items-center space-x-8 md:flex">
                            <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
                                Home
                            </Link>
                            <Link href="/#features" className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
                                Features
                            </Link>
                            <Link href="/#overview" className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
                                POS Overview
                            </Link>
                            <Link href="/#pricing" className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
                                Pricing
                            </Link>
                            <Link href="/training" className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
                                Training
                            </Link>
                            <Link href="/contact" className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
                                Contact
                            </Link>
                            <Link href="/login" className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="transform rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-blue-600">
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="border-t bg-white shadow-lg md:hidden">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                            <Link href="/#features" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                                Features
                            </Link>
                            <Link href="/#overview" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                                POS Overview
                            </Link>
                            <Link href="/#pricing" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                                Pricing
                            </Link>
                            <Link href="/contact" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                                Contact
                            </Link>
                            <Link href="/login" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                                Login
                            </Link>
                            <Link href="/contact" className="block px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                                Get Started
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Page Content */}
            <main className="pt-16">{children}</main>
        </div>
    );
}
