'use client';

import { useEffect, useState } from 'react';

/**
 * Three-layer portrait enforcement:
 * 1. Manifest orientation:portrait  → works when installed as PWA
 * 2. screen.orientation.lock()      → works in PWA standalone / fullscreen
 * 3. This component                 → CSS overlay fallback for browser tabs
 *    Shows a "please rotate" screen when a phone is held in landscape.
 *    Threshold: landscape + innerHeight < 600 px = phone in landscape.
 *    Tablets (iPad landscape height ~768px) are NOT blocked.
 */
const OrientationLock = () => {
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        // Attempt API lock (works in standalone PWA / fullscreen; silently fails in browser tabs)
        const tryLock = async () => {
            try {
                if (
                    typeof screen !== 'undefined' &&
                    'orientation' in screen &&
                    typeof (screen.orientation as any).lock === 'function'
                ) {
                    await (screen.orientation as any).lock('portrait');
                }
            } catch {
                // Expected in regular browser tabs — overlay handles it
            }
        };
        tryLock();

        const check = () => {
            // Phone in landscape: width > height AND height < 600 px
            // (Tablets have landscape height ≥ 600 px → not blocked)
            const landscape = window.innerWidth > window.innerHeight;
            const isPhone   = window.innerHeight < 600;
            setShowOverlay(landscape && isPhone);
        };

        check();
        window.addEventListener('resize', check);
        window.addEventListener('orientationchange', check);

        return () => {
            window.removeEventListener('resize', check);
            window.removeEventListener('orientationchange', check);
        };
    }, []);

    if (!showOverlay) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Please rotate your device"
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#034d79] text-white px-8"
            style={{ touchAction: 'none' }}
        >
            {/* Animated phone-rotation icon */}
            <div className="mb-6 relative w-20 h-20">
                <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    style={{ animation: 'rotatePhone 2s ease-in-out infinite' }}
                >
                    {/* Phone body */}
                    <rect x="30" y="10" width="40" height="70" rx="6" ry="6"
                        fill="none" stroke="white" strokeWidth="4" />
                    {/* Home button */}
                    <circle cx="50" cy="71" r="3" fill="white" opacity="0.6" />
                    {/* Screen notch */}
                    <line x1="42" y1="17" x2="58" y2="17" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    {/* Rotation arrow */}
                    <path
                        d="M 15 50 A 20 20 0 0 1 50 15"
                        fill="none" stroke="white" strokeWidth="3"
                        strokeLinecap="round" strokeDasharray="4 3"
                        opacity="0.7"
                    />
                    <polygon points="50,8 44,18 56,18" fill="white" opacity="0.7" />
                </svg>
            </div>

            <h2 className="text-xl font-bold mb-2 text-center">Rotate Your Device</h2>
            <p className="text-sm text-white/70 text-center leading-relaxed">
                This app works best in<br />
                <strong className="text-white">portrait mode</strong>.
                <br />Please rotate your phone.
            </p>

            <style>{`
                @keyframes rotatePhone {
                    0%   { transform: rotate(0deg);   }
                    40%  { transform: rotate(-90deg);  }
                    60%  { transform: rotate(-90deg);  }
                    100% { transform: rotate(0deg);   }
                }
            `}</style>
        </div>
    );
};

export default OrientationLock;
