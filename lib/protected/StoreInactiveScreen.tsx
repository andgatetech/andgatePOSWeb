'use client';
import ContactSupportCard from '@/lib/protected/ContactSupportCard';
import { getTranslation } from '@/i18n';
import { RootState } from '@/store';
import { AlertTriangle, StoreIcon } from 'lucide-react';
import { useSelector } from 'react-redux';

interface StoreInactiveScreenProps {
    storeName?: string;
}

export default function StoreInactiveScreen({ storeName }: StoreInactiveScreenProps) {
    const user = useSelector((state: RootState) => state.auth?.user);
    const { t } = getTranslation();

    const whatsappMessage = [
        t('support_whatsapp_greeting'),
        '',
        t('support_whatsapp_store_inactive_body'),
        '',
        `${t('support_whatsapp_user_id')}: ${user?.id ?? 'N/A'}`,
        `${t('support_whatsapp_name')}: ${user?.name ?? 'N/A'}`,
        `${t('support_whatsapp_email')}: ${user?.email ?? 'N/A'}`,
        `${t('support_whatsapp_store')}: ${storeName ?? 'N/A'}`,
        `${t('support_whatsapp_issue')}: ${t('support_whatsapp_issue_store_inactive')}`,
        '',
        t('support_whatsapp_please_reactivate_store'),
    ].join('\n');

    return (
        <div className="p-4 py-6">
            <div className="mx-auto w-full max-w-5xl">
                {/* Main Card */}
                <div className="rounded-2xl border-2 border-orange-200 bg-white p-6 shadow-xl lg:p-8">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left: Icon & Status */}
                        <div className="flex flex-col items-center justify-center border-b border-gray-200 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                            <div className="mb-4 rounded-full bg-orange-100 p-5">
                                <StoreIcon className="h-12 w-12 text-orange-600" />
                            </div>
                            <div className="inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold text-orange-800">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                {t('status_store_inactive_badge')}
                            </div>
                        </div>

                        {/* Middle: Info */}
                        <div className="lg:col-span-2">
                            <h1 className="mb-3 text-2xl font-black text-gray-900 lg:text-3xl">{t('status_store_inactive_title')}</h1>
                            {storeName && (
                                <p className="mb-2 text-sm font-semibold text-orange-600">
                                    {t('status_store_label')}: {storeName}
                                </p>
                            )}
                            <p className="mb-4 text-sm text-gray-600 lg:text-base">{t('status_store_inactive_desc')}</p>

                            {/* Info Box */}
                            <div className="mb-4 rounded-lg bg-orange-50 p-4">
                                <div className="mb-2 flex items-center">
                                    <AlertTriangle className="mr-2 h-4 w-4 text-orange-600" />
                                    <h3 className="text-sm font-semibold text-orange-900">{t('status_what_should_you_do')}</h3>
                                </div>
                                <ul className="space-y-1 text-xs text-orange-800 lg:text-sm">
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{t('status_store_inactive_tip_1')}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{t('status_store_inactive_tip_2')}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{t('status_store_inactive_tip_3')}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact */}
                            <ContactSupportCard accentColor="orange" whatsappMessage={whatsappMessage} />
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="mt-4 text-center text-xs text-gray-500 lg:text-sm">{t('status_store_footer')}</p>
            </div>
        </div>
    );
}
