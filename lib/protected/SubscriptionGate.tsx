'use client';
import { RootState } from '@/store';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import SubscriptionPendingScreen from './SubscriptionPendingScreen';

interface SubscriptionGateProps {
    children: React.ReactNode;
}

// Routes that stay browsable even when the subscription is inactive/expired —
// read-only/account pages plus the pages a user needs to actually renew.
const SUBSCRIPTION_BYPASS_PATHS = ['/dashboard', '/store/setting', '/users/profile', '/users/user-account-settings', '/manual-payments', '/notifications'];

// '/company' itself and its read-only branch list bypass; '/company/{id}/edit'
// does not — it's a real mutation and shouldn't be swept in by a loose prefix match.
const COMPANY_BRANCHES_PATTERN = /^\/company\/[^/]+\/branches$/;

function isBypassPath(pathname: string | null): boolean {
    if (!pathname) return false;
    if (pathname === '/company' || COMPANY_BRANCHES_PATTERN.test(pathname)) return true;
    return SUBSCRIPTION_BYPASS_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default function SubscriptionGate({ children }: SubscriptionGateProps) {
    const pathname = usePathname();
    const user = useSelector((state: RootState) => state.auth.user);

    const subscriptionStatus = user?.subscription_user?.status?.toLowerCase();
    const subscriptionName = user?.subscription_user?.plan_name_en;
    const expireDate = user?.subscription_user?.expire_date;

    let blockedStatus: string | null = null;
    if (subscriptionStatus && subscriptionStatus !== 'active') {
        blockedStatus = subscriptionStatus;
    } else if (expireDate) {
        const expiryDate = new Date(expireDate);
        if (expiryDate < new Date() && subscriptionStatus !== 'active') {
            blockedStatus = 'expired';
        }
    }

    if (blockedStatus && !isBypassPath(pathname)) {
        return (
            <div className="min-h-[calc(100vh-200px)]">
                <SubscriptionPendingScreen status={blockedStatus} subscriptionName={subscriptionName} expireDate={expireDate} />
            </div>
        );
    }

    return <>{children}</>;
}
