'use client';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import StoreDisabledScreen from './StoreDisabledScreen';
import StoreInactiveScreen from './StoreInactiveScreen';
import SubscriptionPendingScreen from './SubscriptionPendingScreen';
import UserBlockedScreen from './UserBlockedScreen';
import UserPendingScreen from './UserPendingScreen';

interface StatusGuardProps {
    children: React.ReactNode;
}

export default function StatusGuard({ children }: StatusGuardProps) {
    const router = useRouter();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const currentStore = useSelector((state: RootState) => state.auth.currentStore);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // If not authenticated, redirect to login
        if (!isAuthenticated || !user) {
            router.push('/login');
            return;
        }

        // Finished checking
        setIsChecking(false);
    }, [isAuthenticated, user, router]);

    // If not authenticated, don't render anything (will redirect)
    if (!isAuthenticated || !user) {
        return null;
    }

    // Check user status first (highest priority)
    const userStatus = user.status?.toLowerCase();

    if (userStatus === 'blocked') {
        return (
            <div className="min-h-[calc(100vh-200px)]">
                <UserBlockedScreen />
            </div>
        );
    }

    if (userStatus === 'pending') {
        return (
            <div className="min-h-[calc(100vh-200px)]">
                <UserPendingScreen />
            </div>
        );
    }

    // User is active, now check subscription status
    const subscriptionStatus = user.subscription_user?.status?.toLowerCase();
    const subscriptionName = user.subscription_user?.subscription?.name;
    const expireDate = user.subscription_user?.expire_date;

    // Check if subscription is not active
    if (subscriptionStatus && subscriptionStatus !== 'active') {
        return (
            <div className="min-h-[calc(100vh-200px)]">
                <SubscriptionPendingScreen status={subscriptionStatus} subscriptionName={subscriptionName} expireDate={expireDate} />
            </div>
        );
    }

    // Check if subscription is expired (date check)
    if (expireDate) {
        const expiryDate = new Date(expireDate);
        const now = new Date();

        if (expiryDate < now && subscriptionStatus !== 'active') {
            return (
                <div className="min-h-[calc(100vh-200px)]">
                    <SubscriptionPendingScreen status="expired" subscriptionName={subscriptionName} expireDate={expireDate} />
                </div>
            );
        }
    }

    // Check current store status (is_active and store_disabled)
    if (currentStore) {
        // Check if store is inactive (is_active = 0 or false)
        const storeIsActive = currentStore.is_active;
        if (storeIsActive === 0 || storeIsActive === false) {
            return (
                <div className="min-h-[calc(100vh-200px)]">
                    <StoreInactiveScreen storeName={currentStore.store_name} />
                </div>
            );
        }

        // Check if store is disabled (store_disabled = 1 or true)
        const storeDisabled = currentStore.store_disabled;
        if (storeDisabled === 1 || storeDisabled === true) {
            return (
                <div className="min-h-[calc(100vh-200px)]">
                    <StoreDisabledScreen storeName={currentStore.store_name} />
                </div>
            );
        }
    }

    // All checks passed, render the protected content
    return <>{children}</>;
}
