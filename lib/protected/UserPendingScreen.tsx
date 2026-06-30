'use client';
import ContactSupportCard from '@/lib/protected/ContactSupportCard';
import { clearAuthCookies, clearAuthLocalStorage } from '@/lib/auth-session';
import { getTranslation } from '@/i18n';
import { RootState } from '@/store';
import { useLogoutMutation } from '@/store/features/auth/authApi';
import { AlertCircle, Clock, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export default function UserPendingScreen() {
    const router = useRouter();
    const [logout] = useLogoutMutation();
    const user = useSelector((state: RootState) => state.auth?.user);
    const { t } = getTranslation();

    const whatsappMessage = [
        t('support_whatsapp_greeting'),
        '',
        t('support_whatsapp_pending_body'),
        '',
        `${t('support_whatsapp_user_id')}: ${user?.id ?? 'N/A'}`,
        `${t('support_whatsapp_name')}: ${user?.name ?? 'N/A'}`,
        `${t('support_whatsapp_email')}: ${user?.email ?? 'N/A'}`,
        `${t('support_whatsapp_issue')}: ${t('support_whatsapp_issue_pending')}`,
        '',
        t('support_whatsapp_please_approve'),
    ].join('\n');

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

    return (
        <div className="p-4 py-6">
            <div className="mx-auto w-full max-w-5xl">
                {/* Main Card */}
                <div className="rounded-2xl border-2 border-yellow-200 bg-white p-6 shadow-xl lg:p-8">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left: Icon & Status */}
                        <div className="flex flex-col items-center justify-center border-b border-gray-200 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                            <div className="mb-4 rounded-full bg-yellow-100 p-5">
                                <Clock className="h-12 w-12 text-yellow-600" />
                            </div>
                            <div className="inline-flex items-center rounded-full bg-yellow-100 px-4 py-2 text-xs font-semibold text-yellow-800">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                {t('status_pending_badge')}
                            </div>
                        </div>

                        {/* Middle: Info */}
                        <div className="lg:col-span-2">
                            <h1 className="mb-3 text-2xl font-black text-gray-900 lg:text-3xl">{t('status_pending_title')}</h1>
                            <p className="mb-4 text-sm text-gray-600 lg:text-base">{t('status_pending_desc')}</p>

                            {/* Info Box */}
                            <div className="mb-4 rounded-lg bg-blue-50 p-4">
                                <div className="mb-2 flex items-center">
                                    <Shield className="mr-2 h-4 w-4 text-blue-600" />
                                    <h3 className="text-sm font-semibold text-blue-900">{t('status_what_happens_next')}</h3>
                                </div>
                                <ul className="space-y-1 text-xs text-blue-800 lg:text-sm">
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{t('status_pending_tip_1')}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{t('status_pending_tip_2')}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{t('status_pending_tip_3')}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact */}
                            <ContactSupportCard accentColor="blue" whatsappMessage={whatsappMessage} />
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

                {/* Footer Note */}
                <p className="mt-4 text-center text-xs text-gray-500 lg:text-sm">{t('status_pending_footer')}</p>
            </div>
        </div>
    );
}
