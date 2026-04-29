'use client';

import IconClock from '@/components/icon/icon-clock';
import ComponentsUsersProfilePaymentHistory from '@/app/(application)/(protected)/users/profile/components-users-profile-payment-history';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { RootState } from '@/store';
import { AlertTriangle, Calendar, ChevronDown, ChevronUp, Edit3, Mail, MapPin, Phone, RefreshCw, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

// Parse backend date strings like "2026-03-06 01:50:05 AM" which are non-ISO
const parseBackendDate = (dateStr: string): Date => {
    const direct = new Date(dateStr);
    if (!isNaN(direct.getTime())) return direct;
    const match = dateStr.match(/(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
        let [, datePart, hours, minutes, seconds, meridiem] = match;
        let h = parseInt(hours, 10);
        if (meridiem) {
            if (meridiem.toUpperCase() === 'PM' && h !== 12) h += 12;
            if (meridiem.toUpperCase() === 'AM' && h === 12) h = 0;
        }
        return new Date(`${datePart}T${String(h).padStart(2, '0')}:${minutes}:${seconds}`);
    }
    return direct;
};

// ── Subscription Progress Bar ────────────────────────────────────────────────
const SubscriptionProgress = () => {
    const subscriptionUser = useSelector((state: RootState) => state.auth.user?.subscription_user);
    const router = useRouter();
    const { formatCurrency } = useCurrency();
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [currentTime, setCurrentTime] = useState(new Date());

    const dateCalculations = useMemo(() => {
        if (!subscriptionUser) return null;
        const startDate = parseBackendDate(subscriptionUser.start_date);
        const expireDate = parseBackendDate(subscriptionUser.expire_date);
        const totalTime = expireDate.getTime() - startDate.getTime();
        const remainingTime = expireDate.getTime() - currentTime.getTime();
        let percentage = 0;
        if (totalTime > 0 && remainingTime > 0) {
            percentage = Math.max((remainingTime / totalTime) * 100, 0);
        }
        const daysLeft = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.floor(remainingTime / (1000 * 60 * 60));
        return { startDate, expireDate, totalTime, remainingTime, percentage, daysLeft, hoursLeft };
    }, [subscriptionUser, currentTime]);

    useEffect(() => {
        if (!dateCalculations?.expireDate) return;
        const { expireDate, daysLeft, remainingTime } = dateCalculations;
        const isExpired = remainingTime <= 0;
        const isCritical = daysLeft <= 3 && daysLeft > 0;
        const isGracePeriod = isExpired && Math.abs(daysLeft) <= 7;
        const showHours = daysLeft <= 2 || isCritical || (isExpired && isGracePeriod);
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            const timeRemaining = expireDate.getTime() - now.getTime();
            if (showHours && timeRemaining > 0) {
                const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(hours > 0 ? `${hours}h ${minutes}m` : minutes > 0 ? `${minutes}m` : 'Less than 1m');
            } else if (showHours) {
                setTimeLeft('Expired');
            } else {
                setTimeLeft('');
            }
        }, 60000);
        if (showHours) {
            const timeRemaining = expireDate.getTime() - currentTime.getTime();
            if (timeRemaining > 0) {
                const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(hours > 0 ? `${hours}h ${minutes}m` : minutes > 0 ? `${minutes}m` : 'Less than 1m');
            } else {
                setTimeLeft('Expired');
            }
        }
        return () => clearInterval(interval);
    }, [dateCalculations, currentTime]);

    if (!subscriptionUser || !dateCalculations) return null;

    const { remainingTime, percentage, daysLeft } = dateCalculations;
    const price = subscriptionUser.plan_price || '0.00';
    const isBlocked = subscriptionUser.status === 'blocked';

    if (isBlocked) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-800">Account Blocked</span>
                </div>
                <p className="mb-3 text-xs text-red-700">Your account has been temporarily suspended.</p>
                <button onClick={() => router.push('/contact')} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
                    Contact Support
                </button>
            </div>
        );
    }

    const isExpired = remainingTime <= 0;
    const isCritical = daysLeft <= 3 && daysLeft >= 0;
    const isWarning = daysLeft <= 15 && daysLeft > 7;
    const isExpiredRecently = isExpired && Math.abs(daysLeft) <= 30;
    const isExpiredLongTime = isExpired && Math.abs(daysLeft) > 30;
    const isGracePeriod = isExpired && Math.abs(daysLeft) <= 7;
    const showHours = daysLeft <= 2 || isCritical || (isExpired && isGracePeriod);

    const getBarColor = () => {
        if (isExpired) return 'bg-gradient-to-r from-red-500 to-red-700';
        if (daysLeft <= 1) return 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse';
        if (daysLeft <= 3) return 'bg-gradient-to-r from-red-400 to-orange-500';
        if (daysLeft <= 7) return 'bg-gradient-to-r from-orange-500 to-orange-400';
        if (daysLeft <= 10) return 'bg-gradient-to-r from-orange-400 to-yellow-500';
        if (daysLeft <= 15) return 'bg-gradient-to-r from-yellow-400 to-green-400';
        return 'bg-gradient-to-r from-green-400 to-green-600';
    };

    const getStatusBadge = () => {
        if (isExpiredLongTime) return { cls: 'bg-red-600 text-white', text: `Expired ${Math.abs(daysLeft)}d ago` };
        if (isGracePeriod) return { cls: 'bg-yellow-100 text-yellow-800 border border-yellow-300', text: `Grace period` };
        if (isExpiredRecently) return { cls: 'bg-red-100 text-red-800 border border-red-200', text: `Expired ${Math.abs(daysLeft)}d ago` };
        if (isCritical) return { cls: 'bg-red-50 text-red-900 border border-red-300 animate-pulse', text: daysLeft === 0 ? 'Expires in hours!' : `${daysLeft}d left` };
        if (daysLeft <= 7) return { cls: 'bg-orange-100 text-orange-800 border border-orange-200', text: `${daysLeft}d left` };
        if (isWarning) return { cls: 'bg-yellow-100 text-yellow-800 border border-yellow-200', text: `${daysLeft}d left` };
        return { cls: 'bg-green-100 text-green-800 border border-green-200', text: `${daysLeft}d left` };
    };

    const badge = getStatusBadge();

    return (
        <div className="space-y-3">
            {/* Status row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}>{badge.text}</span>
                    {showHours && timeLeft && <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">{timeLeft}</span>}
                </div>
                <span className="text-xs font-bold text-blue-600">
                    {formatCurrency(price)} / {subscriptionUser.billing_cycle}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor()}`} style={{ width: `${Math.max(isExpired ? 0 : percentage, 2)}%` }} />
            </div>

            {/* Date row */}
            <div className="flex justify-between text-xs text-gray-500">
                <span>{subscriptionUser.start_date}</span>
                <span className={isExpired ? 'font-semibold text-red-600' : ''}>{subscriptionUser.expire_date}</span>
            </div>

            {/* Alerts */}
            {(isGracePeriod || isExpiredLongTime || isWarning || isCritical) && (
                <div
                    className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium
                    ${isCritical || isExpiredLongTime ? 'border-red-200 bg-red-50 text-red-800' : 'border-yellow-200 bg-yellow-50 text-yellow-800'}`}
                >
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {isExpiredLongTime && 'Account suspended — contact support for reactivation.'}
                    {isGracePeriod && !isExpiredLongTime && 'Grace period active — renew now to avoid interruption.'}
                    {isWarning && !isExpired && `Renewal reminder: expires in ${daysLeft} days.`}
                    {isCritical && !isExpired && (daysLeft === 0 ? 'Expires in hours!' : `Critical: only ${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining!`)}
                </div>
            )}
        </div>
    );
};

// ── Admin Profile Card ───────────────────────────────────────────────────────
const AdminProfile = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const subscriptionUser = user?.subscription_user;

    if (!user)
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                <p className="text-sm text-red-500">Profile not found.</p>
            </div>
        );

    const getUserStatus = () => {
        if (!subscriptionUser) return { status: 'Free User', color: 'text-gray-600', dot: 'bg-gray-400' };
        const expireDate = parseBackendDate(subscriptionUser.expire_date);
        const daysLeft = Math.ceil((expireDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 0) {
            return Math.abs(daysLeft) <= 7 ? { status: 'Grace Period', color: 'text-yellow-600', dot: 'bg-yellow-400' } : { status: 'Suspended', color: 'text-red-600', dot: 'bg-red-500' };
        }
        if (daysLeft <= 3) return { status: 'Critical', color: 'text-red-600', dot: 'bg-red-500 animate-pulse' };
        if (daysLeft <= 15) return { status: 'Expiring Soon', color: 'text-yellow-600', dot: 'bg-yellow-400' };
        return { status: 'Active', color: 'text-green-600', dot: 'bg-green-500' };
    };

    const userStatus = getUserStatus();

    return (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            {/* Header band */}
            <div className="h-16 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />

            {/* Avatar */}
            <div className="-mt-8 flex flex-col items-center px-6 pb-6">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <User className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">{user.name}</h4>
                <p className="mb-1 text-xs capitalize text-gray-500">{user.role?.replace(/_/g, ' ')}</p>
                <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${userStatus.dot}`} />
                    <span className={`text-xs font-medium ${userStatus.color}`}>{userStatus.status}</span>
                </div>

                {/* Edit link */}
                <Link
                    href="/users/user-account-settings"
                    className="mt-3 flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50 hover:text-blue-600"
                >
                    <Edit3 className="h-3 w-3" />
                    Edit Profile
                </Link>

                {/* Info rows */}
                <div className="mt-5 w-full space-y-2.5 text-left">
                    <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Email</p>
                            <p className="truncate text-xs text-gray-800">{user.email}</p>
                        </div>
                    </div>
                    {user.phone && (
                        <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Phone</p>
                                <p className="text-xs text-gray-800">{user.phone}</p>
                            </div>
                        </div>
                    )}
                    {user.address && (
                        <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Address</p>
                                <p className="text-xs text-gray-800">{user.address}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Member Since</p>
                            <p className="text-xs text-gray-800">{user.member_since || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Subscription Feature Items (compact chip grid) ───────────────────────────
const FeatureChips = ({ items }: { items: { title_en: string; title_bn: string | null; value: string | null }[] }) => {
    const { t } = getTranslation();
    const [expanded, setExpanded] = useState(false);
    const INITIAL_SHOW = 12;
    const visible = expanded ? items : items.slice(0, INITIAL_SHOW);
    const hasMore = items.length > INITIAL_SHOW;

    return (
        <div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {visible.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1.5">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                        <span className="truncate text-xs text-blue-800">
                            {item.title_en}
                            {item.value ? <span className="ml-1 font-semibold text-blue-600">({item.value})</span> : null}
                        </span>
                    </div>
                ))}
            </div>
            {hasMore && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 py-1.5 text-xs text-gray-500 transition hover:border-blue-300 hover:text-blue-600"
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="h-3.5 w-3.5" /> Show less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-3.5 w-3.5" /> Show {items.length - INITIAL_SHOW} more features
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

// ── Main Profile Page ────────────────────────────────────────────────────────
const Profile = () => {
    const subscriptionUser = useSelector((state: RootState) => state.auth.user?.subscription_user);
    const router = useRouter();

    const getSubscriptionStatus = () => {
        if (!subscriptionUser) return 'free';
        const expireDate = parseBackendDate(subscriptionUser.expire_date);
        const daysLeft = Math.ceil((expireDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 0) {
            if (Math.abs(daysLeft) <= 7) return 'grace';
            if (Math.abs(daysLeft) <= 30) return 'expired_recent';
            return 'expired_long';
        }
        if (daysLeft <= 3) return 'critical';
        if (daysLeft <= 7) return 'expiring';
        if (daysLeft <= 15) return 'warning';
        return 'active';
    };

    const subscriptionStatus = getSubscriptionStatus();

    const getButtonConfig = () => {
        switch (subscriptionStatus) {
            case 'expired_long':
                return { text: 'Reactivate', className: 'btn btn-danger animate-pulse', icon: <RefreshCw className="h-3.5 w-3.5" /> };
            case 'expired_recent':
            case 'grace':
                return { text: 'Renew Now', className: 'btn btn-warning animate-pulse', icon: <AlertTriangle className="h-3.5 w-3.5" /> };
            case 'critical':
                return { text: 'Urgent Renewal', className: 'btn btn-danger animate-pulse', icon: <AlertTriangle className="h-3.5 w-3.5" /> };
            case 'expiring':
            case 'warning':
                return { text: 'Renew Soon', className: 'btn btn-warning', icon: <IconClock className="h-3.5 w-3.5" /> };
            default:
                return { text: 'Renew', className: 'btn btn-primary transition-transform hover:scale-105', icon: <RefreshCw className="h-3.5 w-3.5" /> };
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

            {/* Main Grid */}
            <div className="grid gap-5 lg:grid-cols-3">
                {/* Left — User card */}
                <div className="col-span-1">
                    <AdminProfile />
                </div>

                {/* Right — Plan + History */}
                <div className="col-span-2 space-y-5">
                    {subscriptionUser && (
                        <div className="rounded-xl border bg-white shadow-lg">
                            {/* Plan header */}
                            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                                <div>
                                    <h5 className="text-base font-bold text-gray-900">
                                        {subscriptionUser.plan_name_en} Plan
                                        <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold capitalize text-indigo-700">{subscriptionUser.billing_cycle}</span>
                                    </h5>
                                    <p className="mt-0.5 text-xs text-gray-400">{subscriptionUser.items?.length ?? 0} features included</p>
                                </div>
                                <button onClick={() => router.push('/contact')} className={`flex items-center gap-1.5 text-sm ${buttonConfig.className}`}>
                                    {buttonConfig.icon}
                                    {buttonConfig.text}
                                </button>
                            </div>

                            {/* Progress section */}
                            <div className="border-b border-gray-100 px-5 py-4">
                                <SubscriptionProgress />
                            </div>

                            {/* Features chip grid */}
                            <div className="px-5 py-4">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Included Features</p>
                                <FeatureChips items={subscriptionUser.items ?? []} />
                            </div>
                        </div>
                    )}

                    {/* Payment History */}
                    <ComponentsUsersProfilePaymentHistory />
                </div>
            </div>
        </div>
    );
};

export default Profile;
