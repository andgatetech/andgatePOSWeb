'use client';
import CriticalBanner from '@/app/(application)/(protected)/notifications/components/CriticalBanner';
import Footer from '@/components/layouts/footer';
import Header from '@/components/layouts/header';
import MainContainer from '@/components/layouts/main-container';
import MobileBottomNav from '@/components/layouts/MobileBottomNav';
import Overlay from '@/components/layouts/overlay';
import ScrollToTop from '@/components/layouts/scroll-to-top';
import Sidebar from '@/components/layouts/sidebar';
import Portals from '@/components/portals';
import StatusGuard from '@/lib/protected/StatusGuard';
import { usePushNotifications } from '@/hooks/usePushNotifications';

function ProtectedLayoutInner({ children }: { children: React.ReactNode }) {
    usePushNotifications();

    return (
        <StatusGuard>
            <div className="relative">
                <Overlay />
                <ScrollToTop />

                <MainContainer>
                    <Sidebar />
                    <div className="main-content flex min-h-screen flex-col">
                        <Header />
                        <CriticalBanner />
                        <div className="px-3 py-4 pb-20 sm:px-4 lg:px-6 lg:pb-4">{children}</div>
                        <Footer />
                        <Portals />
                    </div>
                </MainContainer>

                <MobileBottomNav />
            </div>
        </StatusGuard>
    );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedLayoutInner>{children}</ProtectedLayoutInner>;
}
