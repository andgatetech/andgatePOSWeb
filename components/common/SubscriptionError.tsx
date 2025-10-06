'use client';
import { RootState } from '@/store';
import { AlertTriangle, ArrowRight, Clock, Crown, Package, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import UpgradePlans from './UpgradePlans';

interface SubscriptionErrorProps {
    errorType: 'no_active_subscription' | 'feature_unavailable' | 'limit_reached' | 'subscription_required' | 'expired';
    message: string;
    details?: {
        limit?: number;
        current?: number;
        required_features?: string[];
        [key: string]: any;
    };
}

const errorConfigs = {
    no_active_subscription: {
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
};

const SubscriptionError: React.FC<SubscriptionErrorProps> = ({ errorType, message, details }) => {
    const config = errorConfigs[errorType] || errorConfigs.subscription_required;
    const IconComponent = config.icon;

    // Get current subscription from Redux
    const user = useSelector((state: RootState) => state.auth.user);
    const currentPlan = user?.subscription_user?.subscription?.name || 'Basic';

    return (
        <div className="min-h-screen bg-gray-50">
            <div className=" py-8 sm:px-6 lg:px-8">
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
                                    {details.limit !== undefined && details.current !== undefined && (
                                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                                    <Package className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-baseline gap-2">
                                                        <span className="text-sm font-medium text-gray-700">Current Usage:</span>
                                                        <span className="text-2xl font-bold text-gray-900">{details.current}</span>
                                                        <span className="text-sm text-gray-600">/ {details.limit}</span>
                                                    </div>
                                                    <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                                                        <div
                                                            className="h-full rounded-full bg-blue-600 transition-all duration-300"
                                                            style={{ width: `${Math.min((details.current / details.limit) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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

                            {/* CTA Buttons */}
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href="/subscription"
                                    className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <Crown className="mr-2 h-5 w-5" />
                                    Upgrade Now
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Contact Sales
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Plans Section */}
                <UpgradePlans showHeader={true} currentPlan={currentPlan} />
            </div>
        </div>
    );
};

export default SubscriptionError;
