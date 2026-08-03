'use client';

import { AlertTriangle, ArrowLeft, RotateCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { recoverFromStaleClientCache } from '@/lib/client-cache-recovery';
import { getTranslation } from '@/i18n';

export default function ErrorBoundary({ error }: { error: Error & { digest?: string }; reset: () => void }) {
    const [isRecovering, setIsRecovering] = useState(false);
    const { t } = getTranslation();

    useEffect(() => {
        recoverFromStaleClientCache().then((started) => {
            setIsRecovering(started);
        });
    }, [error]);

    const titleText = t('error_boundary_title');
    const messageText = isRecovering ? t('error_boundary_recovering') : t('error_boundary_message');

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center dark:bg-gray-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
                <AlertTriangle className="h-8 w-8 text-danger" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {titleText !== 'error_boundary_title' ? titleText : "This page couldn't load"}
            </h1>
            <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
                {messageText !== 'error_boundary_message' && messageText !== 'error_boundary_recovering'
                    ? messageText
                    : isRecovering
                      ? 'Refreshing app files. This page will reload automatically.'
                      : 'Something went wrong. Reload to try again, clear cache, or go back.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
                >
                    <RotateCw className="h-4 w-4" />
                    {t('btn_reload') !== 'btn_reload' ? t('btn_reload') : 'Reload'}
                </button>
                <a
                    href="/clear-cache.html"
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition-all hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60"
                >
                    <Trash2 className="h-4 w-4" />
                    {t('btn_clear_cache') !== 'btn_clear_cache' ? t('btn_clear_cache') : 'Clear Cache'}
                </a>
                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('btn_back') !== 'btn_back' ? t('btn_back') : 'Back'}
                </button>
            </div>
        </div>
    );
}
