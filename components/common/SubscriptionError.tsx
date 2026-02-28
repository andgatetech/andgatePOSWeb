'use client';
import { RootState } from '@/store';
import { AlertTriangle, Clock, Crown, Package, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

interface SubscriptionErrorProps {
    errorType: 'no_active_subscription' | 'feature_unavailable' | 'limit_reached' | 'subscription_required' | 'expired' | 'no_subscription' | 'subscription_expired' | 'quota_exhausted';
    message: string;
    details?: {
        limit?: number;
        current?: number;
        used?: number;
        feature?: string;
        required_features?: string[];
        [key: string]: any;
    };
}

const errorConfigs: Record<string, any> = {
    no_active_subscription: {
        icon: ShieldAlert,
        title: 'No Active Subscription',
        subtitle: 'Subscribe to unlock powerful features',
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
    },
    no_subscription: {
        icon: ShieldAlert,
        title: 'No Active Subscription',
        subtitle: 'Subscribe to unlock powerful features',
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
    },
    feature_unavailable: {
        icon: Zap,
        title: 'Feature Not Available',
        subtitle: 'Upgrade your plan to access this feature',
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
    },
    limit_reached: {
        icon: AlertTriangle,
        title: 'Limit Reached',
        subtitle: 'Upgrade to continue growing your business',
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
    },
    quota_exhausted: {
        icon: AlertTriangle,
        title: 'Limit Reached',
        subtitle: 'Upgrade to continue growing your business',
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
    },
    subscription_required: {
        icon: Crown,
        title: 'Premium Feature',
        subtitle: 'This feature requires an active subscription',
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
    },
    expired: {
        icon: Clock,
        title: 'Subscription Expired',
        subtitle: 'Renew your subscription to continue',
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
    },
    subscription_expired: {
        icon: Clock,
        title: 'Subscription Expired',
        subtitle: 'Renew your subscription to continue',
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
    },
};

const SubscriptionError: React.FC<SubscriptionErrorProps> = ({ errorType, message, details }) => {
    const config = errorConfigs[errorType] || errorConfigs.subscription_required;
    const IconComponent = config.icon || Zap;

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (pathname && pathname !== '/subscription' && !pathname.includes('/subscription')) {
            const params = new URLSearchParams();
            if (errorType) params.set('error_type', errorType);
            if (message) params.set('message', message);
            if (details) params.set('details', JSON.stringify(details));
            router.push(`/subscription?${params.toString()}`);
        }
    }, [pathname, errorType, message, details, router]);

    // Get current subscription from Redux
    const user = useSelector((state: RootState) => state.auth.user);

    if (pathname && pathname !== '/subscription' && !pathname.includes('/subscription')) {
        return (
            <div className="flex w-full items-center justify-center py-6">
                <div className="flex items-center gap-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
                    <span className="text-sm font-medium text-gray-500">Redirecting to subscription plans...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="w-full pb-8">
                {/* Error Alert Section - Matching StoreComponent Style */}
                <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
                    <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${config.bgColor}`}>
                            <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
                        </div>
                        <div className="flex-1">
                            <h2 className="mb-2 text-2xl font-bold text-gray-900">{config.title}</h2>
                            <p className="mb-4 text-sm text-gray-500">{config.subtitle}</p>
                            <p className="text-base leading-relaxed text-gray-700">{message}</p>

                            {/* Display additional details */}
                            {details && (
                                <div className="mt-6 space-y-3">
                                    {details.limit !== undefined &&
                                        (details.current !== undefined || details.used !== undefined) &&
                                        (() => {
                                            const currentVal = details.used !== undefined ? details.used : details.current;
                                            const percentage = Math.min(((currentVal as number) / (details.limit || 1)) * 100, 100);
                                            const isLimitReached = percentage >= 100;
                                            const colorTheme = isLimitReached
                                                ? {
                                                      bg: 'bg-red-50',
                                                      border: 'border-red-200',
                                                      iconBg: 'bg-red-100',
                                                      icon: 'text-red-600',
                                                      text: 'text-red-900',
                                                      barBg: 'bg-red-200',
                                                      barFill: 'bg-red-500',
                                                  }
                                                : {
                                                      bg: 'bg-blue-50',
                                                      border: 'border-blue-200',
                                                      iconBg: 'bg-blue-100',
                                                      icon: 'text-blue-600',
                                                      text: 'text-blue-900',
                                                      barBg: 'bg-blue-200',
                                                      barFill: 'bg-blue-500',
                                                  };

                                            return (
                                                <div className={`relative mt-4 overflow-hidden rounded-2xl border ${colorTheme.border} ${colorTheme.bg} p-5 shadow-sm sm:p-6`}>
                                                    {/* Background Glow */}
                                                    <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${colorTheme.barFill} opacity-10 blur-2xl`}></div>

                                                    <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
                                                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${colorTheme.iconBg}`}>
                                                            <Package className={`h-7 w-7 ${colorTheme.icon}`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="mb-2 flex items-end justify-between">
                                                                <span className="text-sm font-bold uppercase tracking-wider text-gray-600">Current Usage</span>
                                                                <div className="flex items-baseline gap-1.5">
                                                                    <span className={`text-4xl font-black ${colorTheme.text}`}>{currentVal}</span>
                                                                    <span className="text-sm font-medium text-gray-500">/ {details.limit} allowed</span>
                                                                </div>
                                                            </div>

                                                            <div className={`h-3 overflow-hidden rounded-full ${colorTheme.barBg}`}>
                                                                <div
                                                                    className={`h-full rounded-full ${colorTheme.barFill} transition-all duration-1000 ease-out`}
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>

                                                            {isLimitReached && (
                                                                <p className={`mb-0 mt-3 flex items-center gap-1.5 text-xs font-bold ${colorTheme.icon}`}>
                                                                    <AlertTriangle className="h-4 w-4" />
                                                                    Maximum capacity reached for your current plan.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    {details.required_features && details.required_features.length > 0 && (
                                        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">Required Features:</p>
                                                    <p className="mt-1 text-sm text-gray-700">{details.required_features.join(' or ')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionError;
