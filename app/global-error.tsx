'use client';

import { useEffect, useState } from 'react';
import { recoverFromStaleClientCache } from '@/lib/client-cache-recovery';

export default function GlobalError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
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
                <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1.5rem', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
                    <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', fontSize: '1.75rem', fontWeight: 'bold' }}>
                        ⚠️
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '0.25rem 0' }}>This page couldn&apos;t load</h1>
                    <p style={{ maxWidth: '24rem', fontSize: '0.875rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                        {isRecovering ? 'Refreshing app files. This page will reload automatically.' : 'Something went wrong. Reload to try again, clear cache, or go back.'}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{ borderRadius: '0.75rem', backgroundColor: '#046ca9', color: '#fff', padding: '0.625rem 1.125rem', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                        >
                            Reload
                        </button>
                        <a
                            href="/clear-cache.html"
                            style={{ borderRadius: '0.75rem', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.625rem 1.125rem', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                        >
                            Clear Cache
                        </a>
                        <button
                            onClick={() => window.history.back()}
                            style={{ borderRadius: '0.75rem', border: '1px solid #d1d5db', padding: '0.625rem 1.125rem', fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#ffffff', cursor: 'pointer', color: '#374151', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                        >
                            Back
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
