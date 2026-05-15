'use client';

import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

type Variant = 'hero' | 'outline' | 'banner';

interface Props {
    variant?: Variant;
    className?: string;
}

// ── iOS step-by-step guide modal ─────────────────────────────────────────────
const IOSGuide = ({ onClose }: { onClose: () => void }) => (
    <div
        className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        onClick={onClose}
    >
        <div
            className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Add to Home Screen</h3>
                <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <ol className="space-y-3">
                <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">1</span>
                    <div>
                        <p className="text-sm font-medium text-gray-800">Tap the Share button</p>
                        <p className="text-xs text-gray-500">Bottom centre of Safari browser</p>
                    </div>
                    {/* Share icon */}
                    <svg className="ml-auto h-7 w-7 flex-shrink-0 text-[#046ca9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </li>
                <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">2</span>
                    <div>
                        <p className="text-sm font-medium text-gray-800">Scroll down and tap</p>
                        <p className="text-xs font-semibold text-[#046ca9]">"Add to Home Screen"</p>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">3</span>
                    <div>
                        <p className="text-sm font-medium text-gray-800">Tap <strong>Add</strong> in the top right</p>
                        <p className="text-xs text-gray-500">The app icon appears on your home screen</p>
                    </div>
                </li>
            </ol>

            <button
                onClick={onClose}
                className="mt-5 w-full rounded-xl bg-[#046ca9] py-2.5 text-sm font-semibold text-white hover:bg-[#034d79] transition-colors"
            >
                Got it
            </button>
        </div>
    </div>
);

// ── Main button ───────────────────────────────────────────────────────────────
const InstallAppButton = ({ variant = 'hero', className = '' }: Props) => {
    const { isInstallable, isInstalled, isIOS, hasNativePrompt, install } = usePWAInstall();
    const [showIOSGuide, setShowIOSGuide] = useState(false);
    const [installing, setInstalling]     = useState(false);

    // Don't render if not installable or already installed
    if (!isInstallable || isInstalled) return null;

    const handleClick = async () => {
        if (isIOS) {
            setShowIOSGuide(true);
            return;
        }
        if (!hasNativePrompt) return;
        setInstalling(true);
        await install();
        setInstalling(false);
    };

    const label = isIOS ? 'Add to Home Screen' : installing ? 'Installing…' : 'Install App';
    const icon = isIOS ? (
        // Share icon for iOS
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
    ) : (
        // Download icon for Android/Desktop
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
    );

    const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98] disabled:opacity-60';

    const styles: Record<Variant, string> = {
        hero:    `${base} rounded-xl border-2 border-[#046ca9]/40 bg-white/80 px-7 py-3.5 text-sm text-[#034d79] shadow-sm hover:border-[#046ca9] hover:bg-white`,
        outline: `${base} rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm text-gray-700 shadow-sm hover:border-[#046ca9]/40 hover:text-[#046ca9]`,
        banner:  `${base} rounded-lg bg-[#046ca9] px-4 py-2 text-sm text-white shadow-md hover:bg-[#034d79]`,
    };

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                disabled={installing}
                className={`${styles[variant]} ${className}`}
            >
                {icon}
                {label}
            </button>

            {showIOSGuide && <IOSGuide onClose={() => setShowIOSGuide(false)} />}
        </>
    );
};

export default InstallAppButton;
