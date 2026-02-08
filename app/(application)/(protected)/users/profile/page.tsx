'use client';

import IconClock from '@/components/icon/icon-clock';
import ComponentsUsersProfilePaymentHistory from '@/components/users/profile/components-users-profile-payment-history';
import { useCurrency } from '@/hooks/useCurrency';
import { RootState } from '@/store';
import { AlertTriangle, Calendar, Crown, Edit3, Mail, MapPin, Phone, RefreshCw, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

// Enhanced Subscription Progress Component with Advanced Expiry Logic and 15-day marker
const SubscriptionProgress = () => {
    const subscriptionUser = useSelector((state: RootState) => state.auth.user?.subscription_user);
    const { formatCurrency } = useCurrency();
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Memoize date calculations to prevent unnecessary re-renders
    const dateCalculations = useMemo(() => {
        if (!subscriptionUser) return null;

        const startDate = new Date(subscriptionUser.start_date);
        const expireDate = new Date(subscriptionUser.expire_date);
        const totalTime = expireDate.getTime() - startDate.getTime();
        const remainingTime = expireDate.getTime() - currentTime.getTime();

        // Calculate percentage of remaining time (time-based for smooth updates)
        let percentage = 0;
        if (totalTime > 0 && remainingTime > 0) {
            // Calculate percentage without upper clamp to preserve precision
            percentage = Math.max((remainingTime / totalTime) * 100, 0);
        }

        const daysLeft = Math.ceil(remainingTime / (1000 * 60 * 60 * 24)); // Use Math.ceil to show 30 days instead of 29
        const hoursLeft = Math.floor(remainingTime / (1000 * 60 * 60)); // Keep Math.floor for hours

        // NOTE: Avoid day-based percentage here to prevent the bar from updating only once per day.

        return {
            startDate,
            expireDate,
            totalTime,
            remainingTime,
            percentage,
            daysLeft,
            hoursLeft,
        };
    }, [subscriptionUser, currentTime]);

    // Real-time countdown for critical periods and when showing hours
    useEffect(() => {
        if (!dateCalculations?.expireDate) return;

        const { expireDate, daysLeft, remainingTime } = dateCalculations;
        const isExpired = remainingTime <= 0;
        const isCritical = daysLeft <= 3 && daysLeft > 0;
        const isGracePeriod = isExpired && Math.abs(daysLeft) <= 7;
        const showHours = daysLeft <= 2 || isCritical || (isExpired && isGracePeriod);

        // Update every minute to keep the progress bar moving smoothly at all times
        const updateInterval = 60000; // 1 minute

        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            const timeRemaining = expireDate.getTime() - now.getTime();

            if (showHours) {
                if (timeRemaining > 0) {
                    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

                    if (hours > 0) {
                        setTimeLeft(`${hours}h ${minutes}m`);
                    } else if (minutes > 0) {
                        setTimeLeft(`${minutes}m`);
                    } else {
                        setTimeLeft('Less than 1m');
                    }
                } else {
                    setTimeLeft('Expired');
                }
            } else {
                setTimeLeft('');
            }
        }, updateInterval);

        // Initial calculation
        if (showHours) {
            const timeRemaining = expireDate.getTime() - currentTime.getTime();
            if (timeRemaining > 0) {
                const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

                if (hours > 0) {
                    setTimeLeft(`${hours}h ${minutes}m`);
                } else if (minutes > 0) {
                    setTimeLeft(`${minutes}m`);
                } else {
                    setTimeLeft('Less than 1m');
                }
            } else {
                setTimeLeft('Expired');
            }
        }

        return () => clearInterval(interval);
    }, [dateCalculations, currentTime]);

    // Early return after hooks
    if (!subscriptionUser || !dateCalculations) return null;

    const { startDate, expireDate, totalTime, remainingTime, percentage, daysLeft, hoursLeft } = dateCalculations;
    const price = subscriptionUser.subscription?.monthly_price || 0;

    // Check if account is blocked (status = 0)
    const isBlocked = subscriptionUser.status === 0;

    // If account is blocked, show blocked message
    if (isBlocked) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <h3 className="text-lg font-semibold text-red-800">Account Blocked</h3>
                    </div>
                </div>
                <div className="text-center">
                    <p className="mb-4 text-red-700">Your account has been temporarily suspended. Please contact our support team for assistance.</p>
                    <div className="flex justify-center gap-2">
                        <button onClick={() => (window.location.href = '/contact')} className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Enhanced expiry status logic
    const isExpired = remainingTime <= 0;
    const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;
    const isCritical = daysLeft <= 3 && daysLeft >= 0; // Include 0 days in critical
    const isWarning = daysLeft <= 15 && daysLeft > 7;
    const isExpiredRecently = isExpired && Math.abs(daysLeft) <= 30; // Expired within last 30 days
    const isExpiredLongTime = isExpired && Math.abs(daysLeft) > 30; // Expired more than 30 days ago
    const isGracePeriod = isExpired && Math.abs(daysLeft) <= 7; // Grace period of 7 days after expiry

    // Show hours when less than 2 days remaining or in critical periods
    const showHours = daysLeft <= 2 || isCritical || (isExpired && isGracePeriod);

    // Get dynamic progress bar color based on days remaining (more intuitive than percentage)
    const getProgressBarColor = () => {
        if (isExpired) {
            return 'bg-gradient-to-r from-red-500 to-red-700';
        } else if (daysLeft <= 1) {
            // 1 day or less - Critical red with pulse
            return 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse';
        } else if (daysLeft <= 3) {
            // 2-3 days - Red to orange
            return 'bg-gradient-to-r from-red-400 to-orange-500';
        } else if (daysLeft <= 7) {
            // 4-7 days - Orange (no green)
            return 'bg-gradient-to-r from-orange-500 to-orange-400';
        } else if (daysLeft <= 10) {
            // 8-10 days - Orange to yellow (your 8 days will show as orange-yellow)
            return 'bg-gradient-to-r from-orange-400 to-yellow-500';
        } else if (daysLeft <= 15) {
            // 11-15 days - Yellow to light green
            return 'bg-gradient-to-r from-yellow-400 to-green-400';
        } else {
            // More than 15 days - Full green
            return 'bg-gradient-to-r from-green-400 to-green-600';
        }
    };

    // Get status configuration
    const getStatusConfig = () => {
        if (isExpiredLongTime) {
            return {
                bgClass: 'bg-red-600 text-white',
                icon: <Shield className="h-3 w-3" />,
                text: `Expired ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? 'day' : 'days'} ago`,
                showRealTime: false,
            };
        } else if (isExpiredRecently) {
            return {
                bgClass: 'bg-red-100 text-red-800 border border-red-200',
                icon: <AlertTriangle className="h-3 w-3" />,
                text: isGracePeriod
                    ? `Grace period: ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? 'day' : 'days'} over`
                    : `Expired ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? 'day' : 'days'} ago`,
                showRealTime: isGracePeriod,
            };
        } else if (isCritical) {
            return {
                bgClass: 'bg-red-50 text-red-900 border border-red-300 animate-pulse',
                icon: <AlertTriangle className="h-3 w-3" />,
                text: daysLeft === 0 ? 'Expires in hours!' : daysLeft === 1 ? 'Expires today!' : `Critical: ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`,
                showRealTime: true,
            };
        } else if (isExpiringSoon) {
            return {
                bgClass: 'bg-orange-100 text-orange-800 border border-orange-200',
                icon: <IconClock className="h-3 w-3" />,
                text: `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`,
                showRealTime: daysLeft <= 2,
            };
        } else if (isWarning) {
            return {
                bgClass: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
                icon: <IconClock className="h-3 w-3" />,
                text: `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`,
                showRealTime: false,
            };
        } else {
            return {
                bgClass: 'bg-green-100 text-green-800 border border-green-200',
                icon: <IconClock className="h-3 w-3" />,
                text: `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`,
                showRealTime: false,
            };
        }
    };

    const statusConfig = getStatusConfig();
    const progressBarColor = getProgressBarColor();

    return (
        <div>
            <div className="mb-4 flex items-center justify-between font-semibold">
                <div className="flex items-center gap-2">
                    <p className={`flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.bgClass}`}>
                        {statusConfig.icon}
                        <span className="ml-1">{statusConfig.text}</span>
                    </p>
                    {(statusConfig.showRealTime || showHours) && timeLeft && <p className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600">{timeLeft}</p>}
                </div>
                <p className="font-bold text-blue-600">{formatCurrency(price)} / month</p>
            </div>

            {/* Progress Bar with dynamic color and 15-day marker */}
            <div className="relative mb-5">
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 p-0.5">
                    <div className={`relative h-full rounded-full shadow-sm transition-all duration-700 ease-out ${progressBarColor}`} style={{ width: `${Math.max(isExpired ? 0 : percentage, 2)}%` }}>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-white opacity-30"></div>
                    </div>
                </div>
            </div>

            {/* Subscription Details */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Started:</span>
                    <span>
                        {startDate.toISOString().split('T')[0]} {startDate.toISOString().split('T')[1].substring(0, 8)}
                    </span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-600">{isExpired ? 'Expired:' : 'Expires:'}</span>
                    <span className={isExpired ? 'font-semibold text-red-600' : 'text-gray-600'}>
                        {expireDate.toISOString().split('T')[0]} {expireDate.toISOString().split('T')[1].substring(0, 8)}
                    </span>
                </div>

                {/* Show detailed time information when relevant */}
                {showHours && !isExpired && (
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Time remaining:</span>
                        <span className={`font-mono font-semibold ${isCritical ? 'text-red-600' : 'text-orange-600'}`}>
                            {remainingTime > 24 * 60 * 60 * 1000
                                ? `${daysLeft}d ${Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h ${Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))}m`
                                : `${Math.floor(remainingTime / (1000 * 60 * 60))}h ${Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))}m`}
                        </span>
                    </div>
                )}

                {/* Grace Period Notice */}
                {isGracePeriod && (
                    <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-yellow-600" />
                            <span className="text-xs font-medium text-yellow-800">Grace Period Active - Renew now to avoid service interruption</span>
                        </div>
                    </div>
                )}

                {/* Long-term Expired Notice */}
                {isExpiredLongTime && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-xs font-medium text-red-800">Account suspended due to long-term expiration. Contact support for reactivation.</span>
                        </div>
                    </div>
                )}

                {/* 15-day Warning Notice */}
                {isWarning && (
                    <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                        <div className="flex items-center gap-2">
                            <IconClock className="h-4 w-4 text-yellow-600" />
                            <span className="text-xs font-medium text-yellow-800">Renewal reminder: Your subscription expires in {daysLeft} days</span>
                        </div>
                    </div>
                )}

                {/* Critical expiry warning */}
                {isCritical && (
                    <div className="mt-3 animate-pulse rounded-lg border border-red-200 bg-red-50 p-3">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-xs font-medium text-red-800">
                                {daysLeft === 1 ? 'Your subscription expires today!' : daysLeft === 0 ? 'Your subscription expires in hours!' : `Critical: Only ${daysLeft} days remaining!`}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Enhanced Admin Profile Component
const AdminProfile = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const subscriptionUser = user?.subscription_user;

    if (!user) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                <p className="text-sm text-red-500">Profile not found.</p>
            </div>
        );
    }

    // Determine user status based on subscription
    const getUserStatus = () => {
        if (!subscriptionUser) return { status: 'Free User', color: 'text-gray-600', icon: User };

        const expireDate = new Date(subscriptionUser.expire_date);
        const today = new Date();
        const daysLeft = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 0) {
            if (Math.abs(daysLeft) <= 7) {
                return { status: 'Grace Period', color: 'text-yellow-600', icon: Shield };
            } else {
                return { status: 'Suspended', color: 'text-red-600', icon: AlertTriangle };
            }
        } else if (daysLeft <= 3) {
            return { status: 'Premium (Critical)', color: 'text-red-600', icon: AlertTriangle };
        } else if (daysLeft <= 15) {
            return { status: 'Premium (Expiring)', color: 'text-yellow-600', icon: IconClock };
        } else {
            return { status: 'Premium Active', color: 'text-green-600', icon: Crown };
        }
    };

    const userStatus = getUserStatus();
    const StatusIcon = userStatus.icon;

    return (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4">
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                        <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Administrator</h3>
                        <div className="flex items-center gap-2">
                            <StatusIcon className={`h-3 w-3 ${userStatus.color}`} />
                            <p className={`text-xs font-medium ${userStatus.color}`}>{userStatus.status}</p>
                        </div>
                    </div>
                </div>
                <Link href="/users/user-account-settings" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                    <Edit3 className="h-4 w-4" />
                    Edit
                </Link>
            </div>

            {/* Body */}
            <div className="p-6">
                {/* Avatar + Name */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                        <User className="h-10 w-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">{user.name}</h4>
                    <p className="text-sm capitalize text-gray-500">{user.role?.replace('_', ' ')}</p>
                </div>

                {/* Details */}
                <div className="space-y-4">
                    <div className="flex items-start space-x-3 rounded-lg bg-gray-50 p-3">
                        <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</p>
                            <p className="break-all text-sm text-gray-900">{user.email}</p>
                        </div>
                    </div>

                    {user.phone && (
                        <div className="flex items-start space-x-3 rounded-lg bg-gray-50 p-3">
                            <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Phone</p>
                                <p className="text-sm text-gray-900">{user.phone}</p>
                            </div>
                        </div>
                    )}

                    {user.address && (
                        <div className="flex items-start space-x-3 rounded-lg bg-gray-50 p-3">
                            <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Address</p>
                                <p className="text-sm text-gray-900">{user.address}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-start space-x-3 rounded-lg bg-gray-50 p-3">
                        <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Member Since</p>
                            <p className="text-sm text-gray-900">{user.created_at || 'Not available'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Main Profile Component
const Profile = () => {
    const subscriptionUser = useSelector((state: RootState) => state.auth.user?.subscription_user);
    const router = useRouter();

    // Enhanced expiry logic for button states
    const getSubscriptionStatus = () => {
        if (!subscriptionUser) return 'free';

        const expireDate = new Date(subscriptionUser.expire_date);
        const today = new Date();
        const daysLeft = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 0) {
            if (Math.abs(daysLeft) <= 7) return 'grace';
            if (Math.abs(daysLeft) <= 30) return 'expired_recent';
            return 'expired_long';
        } else if (daysLeft <= 3) {
            return 'critical';
        } else if (daysLeft <= 7) {
            return 'expiring';
        } else if (daysLeft <= 15) {
            return 'warning';
        }
        return 'active';
    };

    const subscriptionStatus = getSubscriptionStatus();

    const handleRenewClick = () => {
        // Navigate to renewal/contact page
        router.push('/contact');
    };

    const handleUpgradeClick = () => {
        // Navigate to upgrade/contact page
        router.push('/contact');
    };

    const getButtonConfig = () => {
        switch (subscriptionStatus) {
            case 'expired_long':
                return {
                    text: 'Reactivate',
                    className: 'btn btn-danger animate-pulse',
                    icon: <RefreshCw className="h-4 w-4" />,
                };
            case 'expired_recent':
            case 'grace':
                return {
                    text: 'Renew Now',
                    className: 'btn btn-warning animate-pulse',
                    icon: <AlertTriangle className="h-4 w-4" />,
                };
            case 'critical':
                return {
                    text: 'Urgent Renewal',
                    className: 'btn btn-danger animate-pulse',
                    icon: <AlertTriangle className="h-4 w-4" />,
                };
            case 'expiring':
            case 'warning':
                return {
                    text: 'Renew Soon',
                    className: 'btn btn-warning',
                    icon: <IconClock className="h-4 w-4" />,
                };
            default:
                return {
                    text: 'Renew Now',
                    className: 'btn btn-primary transition-transform hover:scale-105',
                    icon: <RefreshCw className="h-4 w-4" />,
                };
        }
    };

    const buttonConfig = getButtonConfig();

    return (
        <div className="space-y-5">
            {/* Breadcrumb */}
            <ul className="flex space-x-2 text-sm text-gray-500 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Users
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">Profile</li>
            </ul>

            {/* Main Content */}
            <div className="grid gap-5 lg:grid-cols-3">
                {/* User Profile */}
                <div className="col-span-1">
                    <AdminProfile />
                </div>

                {/* Plan & Payment History */}
                <div className="col-span-2 space-y-5">
                    {/* Subscription Plan */}
                    {subscriptionUser ? (
                        <div className="rounded-xl border bg-white p-6 shadow-lg">
                            <div className="mb-6 flex items-center justify-between">
                                <h5 className="text-xl font-semibold">{subscriptionUser.subscription?.name} Plan</h5>
                                <button onClick={handleRenewClick} className={`flex items-center gap-2 ${buttonConfig.className}`}>
                                    {buttonConfig.icon}
                                    {buttonConfig.text}
                                </button>
                            </div>
                            <ul className="mb-5 list-inside list-disc space-y-2 font-semibold text-gray-700">
                                {subscriptionUser.subscription?.items?.map((item: any) => (
                                    <li key={item.id}>
                                        {item.title} {item.value ? `– ${item.value}` : ''}
                                    </li>
                                ))}
                            </ul>

                            <SubscriptionProgress />
                        </div>
                    ) : null}

                    {/* Payment History */}
                    <ComponentsUsersProfilePaymentHistory />
                </div>
            </div>
        </div>
    );
};

export default Profile;
