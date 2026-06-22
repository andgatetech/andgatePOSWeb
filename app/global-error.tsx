'use client';

import { useEffect, useState } from 'react';
import { recoverFromStaleClientCache } from '@/lib/client-cache-recovery';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const [isRecovering, setIsRecovering] = useState(false);

    useEffect(() => {
        console.error('Root render error:', error);

        recoverFromStaleClientCache().then((started) => {
            setIsRecovering(started);
        });
    }, [error]);

    return (
        <html lang="en-BD">
            <body>
                <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1.5rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>This page couldn&apos;t load</h1>
                    <p style={{ maxWidth: '24rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        {isRecovering ? 'Refreshing app files. This page will reload automatically.' : 'Something went wrong. Reload to try again, or go back.'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => reset()}
                            style={{ borderRadius: '0.75rem', backgroundColor: '#046ca9', color: '#fff', padding: '0.625rem 1rem', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                        >
                            Reload
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            style={{ borderRadius: '0.75rem', border: '1px solid #d1d5db', padding: '0.625rem 1rem', fontSize: '0.875rem', fontWeight: 600, backgroundColor: 'transparent', cursor: 'pointer' }}
                        >
                            Back
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
