'use client';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import SubscriptionPendingScreen from './SubscriptionPendingScreen';
import UserBlockedScreen from './UserBlockedScreen';
import UserPendingScreen from './UserPendingScreen';

interface StatusGuardProps {
    children: React.ReactNode;
}

export default function StatusGuard({ children }: StatusGuardProps) {
    const router = useRouter();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
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

    // Show loading while checking
    // if (isChecking) {
    //     return (
    //         <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
    //             <div className="text-center">
    //                 <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    //                 <p className="text-gray-600">Checking account status...</p>
    //             </div>
    //         </div>
    //     );
    // }

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

    // All checks passed, render the protected content
    return <>{children}</>;
}
