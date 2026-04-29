'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { getTranslation } from '@/i18n';

export default function ProtectedError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { t } = getTranslation();
    useEffect(() => {
        console.error('[Dashboard Error]', error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-800">{t('msg_error')}</h2>
            <p className="mb-6 max-w-md text-sm text-gray-500">
                {error?.message || t('msg_error')}
            </p>
            <button
                onClick={reset}
                className="flex items-center gap-2 rounded-lg bg-[#046ca9] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#035887]"
            >
                <RefreshCw className="h-4 w-4" />
                {t('btn_retry')}
            </button>
        </div>
    );
}
