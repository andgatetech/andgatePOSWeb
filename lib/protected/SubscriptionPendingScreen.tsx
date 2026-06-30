'use client';
import UpgradePlans from '@/components/common/UpgradePlans';
import ContactSupportCard from '@/lib/protected/ContactSupportCard';
import { clearAuthCookies, clearAuthLocalStorage } from '@/lib/auth-session';
import { getTranslation } from '@/i18n';
import { RootState } from '@/store';
import { useLogoutMutation } from '@/store/features/auth/authApi';
import { AlertCircle, Clock, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

interface SubscriptionPendingScreenProps {
    status: string; // 'pending', 'expired', 'blocked', 'hold'
    subscriptionName?: string;
    expireDate?: string;
}

export default function SubscriptionPendingScreen({ status, subscriptionName = 'Basic', expireDate }: SubscriptionPendingScreenProps) {
    const router = useRouter();
    const [logout] = useLogoutMutation();
    const user = useSelector((state: RootState) => state.auth?.user);
    const { t } = getTranslation();

    const whatsappMessage = [
        t('support_whatsapp_greeting'),
        '',
        t('support_whatsapp_subscription_body', { status: status.toUpperCase() }),
        '',
        `${t('support_whatsapp_user_id')}: ${user?.id ?? 'N/A'}`,
        `${t('support_whatsapp_name')}: ${user?.name ?? 'N/A'}`,
        `${t('support_whatsapp_email')}: ${user?.email ?? 'N/A'}`,
        `${t('support_whatsapp_plan')}: ${subscriptionName}`,
        `${t('support_whatsapp_issue')}: ${t('support_whatsapp_issue_subscription', { status: status.charAt(0).toUpperCase() + status.slice(1) })}`,
        expireDate ? `${t('support_whatsapp_expired_on')}: ${new Date(expireDate).toLocaleDateString()}` : '',
        '',
        t('support_whatsapp_please_renew_subscription'),
    ]
        .filter(Boolean)
        .join('\n');

    const handleLogout = async () => {
        router.push('/login');
        try {
            await logout(null);
        } catch {
            // Ignore API failures; local session cleanup is what matters.
        }
        clearAuthLocalStorage();
        try {
            sessionStorage.clear();
        } catch {
            // Storage can be unavailable in mobile/private contexts.
        }
        clearAuthCookies();
        document.cookie.split(';').forEach((cookie) => {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
    };

    const getStatusConfig = () => {
        switch (status.toLowerCase()) {
            case 'expired':
                return {
                    titleKey: 'status_subscription_expired_title',
                    descriptionKey: 'status_subscription_expired_desc',
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
                    titleKey: 'status_subscription_hold_title',
                    descriptionKey: 'status_subscription_hold_desc',
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
                    titleKey: 'status_subscription_pending_title',
                    descriptionKey: 'status_subscription_pending_desc',
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
                            <h1 className="mb-2 text-2xl font-black text-gray-900 lg:text-3xl">{t(config.titleKey)}</h1>
                            <p className="mb-4 text-sm text-gray-600 lg:text-base">{t(config.descriptionKey)}</p>

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
                                        {t('status_subscription_expired_label')}: {new Date(expireDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            {/* Contact Section */}
                            <ContactSupportCard accentColor="yellow" whatsappMessage={whatsappMessage} />
                            <div className="mt-3">
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
                                >
                                    {t('btn_logout')}
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
