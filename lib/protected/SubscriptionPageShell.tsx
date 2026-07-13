'use client';
import { useEffect, useState } from 'react';
import Footer from '@/components/layouts/footer';
import Header from '@/components/layouts/header';
import MainContainer from '@/components/layouts/main-container';
import MobileBottomNav from '@/components/layouts/MobileBottomNav';
import Overlay from '@/components/layouts/overlay';
import Sidebar from '@/components/layouts/sidebar';
import { RootState } from '@/store';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';

const AndGateLogo = '/images/andgatebos-logo-vertical.png';

interface SubscriptionPageShellProps {
    children: React.ReactNode;
}

// Wraps the (public) /subscription page so it stops feeling like a
// disconnected/orphan page: logged-in users get the real app shell
// (Sidebar/Header/Footer), logged-out visitors get a lightweight branded
// header/footer instead of a bare white page.
export default function SubscriptionPageShell({ children }: SubscriptionPageShellProps) {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (mounted && isAuthenticated) {
        return (
            <div className="relative">
                <Overlay />
                <MainContainer>
                    <Sidebar />
                    <div className="main-content flex min-h-screen flex-col">
                        <Header />
                        <div className="px-3 py-4 pb-20 sm:px-4 lg:px-6 lg:pb-4">{children}</div>
                        <Footer />
                    </div>
                </MainContainer>
                <MobileBottomNav />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-6">
                <Link href="/" className="flex items-center">
                    <Image src={AndGateLogo} alt="AndgateBOS Logo" width={180} height={36} className="h-9 w-auto object-contain" priority unoptimized />
                </Link>
                <Link href="/login" className="rounded-lg bg-[#046ca9] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                    Login
                </Link>
            </header>
            <div className="flex-1">{children}</div>
            <footer className="border-t bg-white px-4 py-6 text-center text-sm text-gray-500 sm:px-6">
                &copy; {new Date().getFullYear()} AndgateBOS &middot; +880 1577303608 &middot; support@andgatetech.net
            </footer>
        </div>
    );
}
