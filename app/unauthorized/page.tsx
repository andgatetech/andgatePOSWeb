import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslation } from '@/i18n';

export const metadata: Metadata = {
    title: 'Unauthorized',
};

export default function UnauthorizedPage() {
    const { t } = getTranslation();

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900">
            <div className="px-6 py-16 text-center font-semibold">
                <div className="relative">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-danger/10 text-4xl font-bold text-danger">403</div>
                    <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">{t('msg_unauthorized_title')}</h1>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300">{t('msg_unauthorized_desc')}</p>
                    <Link
                        href="/dashboard"
                        className="btn btn-primary mx-auto !mt-7 w-max uppercase shadow-none"
                    >
                        {t('btn_go_dashboard')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
