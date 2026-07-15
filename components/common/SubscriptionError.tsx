'use client';
import { convertNumberByLanguage } from '@/components/custom/convertNumberByLanguage';
import { getTranslation } from '@/i18n';
import { AlertTriangle, Clock, Crown, Package, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface SubscriptionErrorProps {
    errorType: 'no_active_subscription' | 'feature_unavailable' | 'feature_not_in_plan' | 'limit_reached' | 'subscription_required' | 'expired' | 'no_subscription' | 'subscription_expired' | 'quota_exhausted';
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
        title: { en: 'No Active Subscription', bn: 'সক্রিয় সাবস্ক্রিপশন নেই' },
        subtitle: { en: 'Subscribe to unlock powerful features', bn: 'ফিচার ব্যবহার করতে সাবস্ক্রিপশন নিন' },
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
    },
    no_subscription: {
        icon: ShieldAlert,
        title: { en: 'No Active Subscription', bn: 'সক্রিয় সাবস্ক্রিপশন নেই' },
        subtitle: { en: 'Subscribe to unlock powerful features', bn: 'ফিচার ব্যবহার করতে সাবস্ক্রিপশন নিন' },
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
    },
    feature_unavailable: {
        icon: Zap,
        title: { en: 'Feature Not Available', bn: 'ফিচারটি পাওয়া যাচ্ছে না' },
        subtitle: { en: 'Upgrade your plan to access this feature', bn: 'এই ফিচার ব্যবহার করতে প্যাকেজ আপগ্রেড করুন' },
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
    },
    feature_not_in_plan: {
        icon: Zap,
        title: { en: 'Feature Not Available', bn: 'ফিচারটি আপনার প্যাকেজে নেই' },
        subtitle: { en: 'Upgrade your plan to access this feature', bn: 'এই ফিচার ব্যবহার করতে প্যাকেজ আপগ্রেড করুন' },
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
    },
    limit_reached: {
        icon: AlertTriangle,
        title: { en: 'Limit Reached', bn: 'লিমিট শেষ হয়েছে' },
        subtitle: { en: 'Upgrade to continue growing your business', bn: 'ব্যবসা চালিয়ে যেতে প্যাকেজ আপগ্রেড করুন' },
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
    },
    quota_exhausted: {
        icon: AlertTriangle,
        title: { en: 'Limit Reached', bn: 'লিমিট শেষ হয়েছে' },
        subtitle: { en: 'Upgrade to continue growing your business', bn: 'ব্যবসা চালিয়ে যেতে প্যাকেজ আপগ্রেড করুন' },
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
    },
    subscription_required: {
        icon: Crown,
        title: { en: 'Premium Feature', bn: 'প্রিমিয়াম ফিচার' },
        subtitle: { en: 'This feature requires an active subscription', bn: 'এই ফিচারের জন্য সক্রিয় সাবস্ক্রিপশন দরকার' },
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
    },
    expired: {
        icon: Clock,
        title: { en: 'Subscription Expired', bn: 'সাবস্ক্রিপশন মেয়াদ শেষ' },
        subtitle: { en: 'Renew your subscription to continue', bn: 'চালিয়ে যেতে সাবস্ক্রিপশন রিনিউ করুন' },
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
    },
    subscription_expired: {
        icon: Clock,
        title: { en: 'Subscription Expired', bn: 'সাবস্ক্রিপশন মেয়াদ শেষ' },
        subtitle: { en: 'Renew your subscription to continue', bn: 'চালিয়ে যেতে সাবস্ক্রিপশন রিনিউ করুন' },
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
    },
};

const localizeText = (value: string | Record<string, string>, lang: 'en' | 'bn') => (typeof value === 'string' ? value : value[lang] || value.en);

const localizeSubscriptionMessage = (message: string, errorType: string, lang: 'en' | 'bn') => {
    const normalized = String(message || '').trim().toLowerCase();
    if (lang !== 'bn') return message;

    if (
        errorType === 'feature_not_in_plan' ||
        normalized.includes('not included in your subscription plan') ||
        normalized.includes('current package does not include')
    ) {
        return 'এই ফিচারটি আপনার বর্তমান প্যাকেজে নেই। ব্যবহার করতে প্যাকেজ আপগ্রেড করুন।';
    }

    if (errorType === 'feature_unavailable') {
        return 'এই ফিচারটি আপনার বর্তমান প্যাকেজে উপলভ্য নয়। ব্যবহার করতে প্যাকেজ আপগ্রেড করুন।';
    }

    if (errorType === 'quota_exhausted' || errorType === 'limit_reached') {
        return 'আপনার বর্তমান প্যাকেজের ব্যবহার সীমা শেষ হয়েছে। চালিয়ে যেতে প্যাকেজ আপগ্রেড করুন।';
    }

    if (errorType === 'subscription_expired' || errorType === 'expired') {
        return 'আপনার সাবস্ক্রিপশনের মেয়াদ শেষ হয়েছে। চালিয়ে যেতে রিনিউ করুন।';
    }

    return message;
};

const shouldShowMessage = (message: string, errorType: string, lang: 'en' | 'bn') => {
    if (!message) return false;
    if (lang === 'bn' && ['feature_not_in_plan', 'feature_unavailable', 'subscription_required'].includes(errorType)) {
        return false;
    }
    return true;
};

const SubscriptionError: React.FC<SubscriptionErrorProps> = ({ errorType, message, details }) => {
    const { i18n } = getTranslation();
    const lang = i18n.language as 'en' | 'bn';
    const displayNumber = (value: string | number) => convertNumberByLanguage(value, lang);
    const config = errorConfigs[errorType] || errorConfigs.subscription_required;
    const IconComponent = config.icon || Zap;
    const displayTitle = localizeText(config.title, lang);
    const displaySubtitle = localizeText(config.subtitle, lang);
    const displayMessage = localizeSubscriptionMessage(message, errorType, lang);
    const showMessage = shouldShowMessage(message, errorType, lang);

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

    if (pathname && pathname !== '/subscription' && !pathname.includes('/subscription')) {
        return (
            <div className="flex w-full items-center justify-center py-6">
                <div className="flex items-center gap-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
                    <span className="text-sm font-medium text-gray-500">{t('subscription_redirecting_to_plans')}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="w-full">
                <div className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start gap-4">
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${config.bgColor}`}>
                            <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-base font-bold text-gray-900 sm:text-lg">{displayTitle}</h2>
                            <p className="mt-1 text-sm leading-relaxed text-gray-600">{displaySubtitle}</p>
                            {showMessage && <p className="mt-2 text-sm leading-relaxed text-gray-700">{displayNumber(displayMessage)}</p>}
                            {details?.feature && ['feature_not_in_plan', 'feature_unavailable', 'subscription_required'].includes(errorType) && (
                                <p className="mt-3 inline-flex max-w-full rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                                    <span className="truncate">{lang === 'bn' ? 'ফিচার:' : 'Feature:'} {displayNumber(String(details.feature))}</span>
                                </p>
                            )}

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
                                                                <span className="text-sm font-bold uppercase tracking-wider text-gray-600">{t('subscription_current_usage')}</span>
                                                                <div className="flex items-baseline gap-1.5">
                                                                    <span className={`text-4xl font-black ${colorTheme.text}`}>{displayNumber(currentVal as number)}</span>
                                                                    <span className="text-sm font-medium text-gray-500">/ {displayNumber(details.limit)} allowed</span>
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
                                                                    {t('subscription_max_capacity_reached')}
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
                                                    <p className="font-semibold text-gray-900">{t('subscription_required_features')}:</p>
                                                    <p className="mt-1 text-sm text-gray-700">{displayNumber(details.required_features.join(' or '))}</p>
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
