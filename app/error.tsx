'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { recoverFromStaleClientCache } from '@/lib/client-cache-recovery';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const [isRecovering, setIsRecovering] = useState(false);

    useEffect(() => {
        console.error('App render error:', error);

        recoverFromStaleClientCache().then((started) => {
            setIsRecovering(started);
        });
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center dark:bg-gray-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
                <AlertTriangle className="h-8 w-8 text-danger" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">This page couldn&apos;t load</h1>
            <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
                {isRecovering ? 'Refreshing app files. This page will reload automatically.' : 'Something went wrong while loading this page. Reloading usually fixes it.'}
            </p>
            <div className="flex gap-3">
                <button
                    onClick={() => reset()}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                >
                    <RotateCw className="h-4 w-4" />
                    Reload
                </button>
                <button
                    onClick={() => window.history.back()}
                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                    Back
                </button>
            </div>
        </div>
    );
}
