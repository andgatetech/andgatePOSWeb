'use client';
import UpgradePlans from '@/components/common/UpgradePlans';
import { useLogoutMutation } from '@/store/features/auth/authApi';
import { AlertCircle, Clock, Crown, Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubscriptionPendingScreenProps {
    status: string; // 'pending', 'expired', 'blocked', 'hold'
    subscriptionName?: string;
    expireDate?: string;
}

export default function SubscriptionPendingScreen({ status, subscriptionName = 'Basic', expireDate }: SubscriptionPendingScreenProps) {
    const router = useRouter();
    const [logout] = useLogoutMutation();

    const handleLogout = async () => {
        router.push('/login');
        try {
            await logout(null);
        } catch (err) {
            console.error('Logout API failed:', err);
        }
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(';').forEach((cookie) => {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
    };

    const getStatusConfig = () => {
        switch (status.toLowerCase()) {
            case 'expired':
                return {
                    title: 'Subscription Expired',
                    description: 'Your subscription has expired. Please renew to continue using our services.',
                    icon: Clock,
                    color: 'red',
                    bgColor: 'from-slate-50 via-red-50 to-orange-50',
                    borderColor: 'border-red-200',
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    badgeBg: 'bg-red-100',
                    badgeText: 'text-red-800',
                };
            case 'blocked':
            case 'hold':
                return {
                    title: 'Subscription On Hold',
                    description: 'Your subscription is currently on hold. Please contact support or upgrade your plan.',
                    icon: AlertCircle,
                    color: 'orange',
                    bgColor: 'from-slate-50 via-orange-50 to-yellow-50',
                    borderColor: 'border-orange-200',
                    iconBg: 'bg-orange-100',
                    iconColor: 'text-orange-600',
                    badgeBg: 'bg-orange-100',
                    badgeText: 'text-orange-800',
                };
            case 'pending':
            default:
                return {
                    title: 'Subscription Pending',
                    description: 'Your subscription is pending activation. Please upgrade your plan or wait for admin approval.',
                    icon: Crown,
                    color: 'yellow',
                    bgColor: 'from-slate-50 via-yellow-50 to-blue-50',
                    borderColor: 'border-yellow-200',
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    badgeBg: 'bg-yellow-100',
                    badgeText: 'text-yellow-800',
                };
        }
    };

    const config = getStatusConfig();
    const IconComponent = config.icon;

    return (
        <div className="p-4 py-6">
            <div className="mx-auto max-w-7xl">
                {/* Header Card */}
                <div className={`mb-6 rounded-2xl border-2 ${config.borderColor} bg-white p-6 shadow-xl lg:p-8`}>
                    <div className="grid gap-6 lg:grid-cols-4">
                        {/* Left: Icon */}
                        <div className="flex flex-col items-center justify-center">
                            <div className={`rounded-full ${config.iconBg} p-4`}>
                                <IconComponent className={`h-10 w-10 ${config.iconColor}`} />
                            </div>
                        </div>

                        {/* Middle: Info */}
                        <div className="lg:col-span-3">
                            <h1 className="mb-2 text-2xl font-black text-gray-900 lg:text-3xl">{config.title}</h1>
                            <p className="mb-4 text-sm text-gray-600 lg:text-base">{config.description}</p>

                            {/* Status Info */}
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <div className={`inline-flex items-center rounded-full ${config.badgeBg} px-4 py-1.5 text-xs font-semibold ${config.badgeText}`}>
                                    <AlertCircle className="mr-2 h-3 w-3" />
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </div>
                                {subscriptionName && (
                                    <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-800">
                                        <Crown className="mr-2 h-3 w-3" />
                                        {subscriptionName}
                                    </div>
                                )}
                                {expireDate && (
                                    <div className="inline-flex items-center rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-800">
                                        <Clock className="mr-2 h-3 w-3" />
                                        Expired: {new Date(expireDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            {/* Contact Section */}
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href="mailto:support@andgate.com"
                                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md"
                                >
                                    <Mail className="mr-2 h-3 w-3" />
                                    Email
                                </a>
                                <a
                                    href="tel:+8801610108851"
                                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md"
                                >
                                    <Phone className="mr-2 h-3 w-3" />
                                    Call
                                </a>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upgrade Plans Section */}
                <UpgradePlans showHeader={true} currentPlan={subscriptionName} />
            </div>
        </div>
    );
}
