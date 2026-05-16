'use client';

import { useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

type Variant = 'hero' | 'outline' | 'banner';

interface Props {
    variant?: Variant;
    className?: string;
}

// ── Browser fallback guide modal ─────────────────────────────────────────────
const InstallGuide = ({ isIOS, onClose }: { isIOS: boolean; onClose: () => void }) => (
    <div
        className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        onClick={onClose}
    >
        <div
            className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Install AndgatePOS</h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Close install guide"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <ol className="space-y-3">
                <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">1</span>
                    <div>
                        <p className="text-sm font-medium text-gray-800">
                            {isIOS ? 'Tap the Share button' : 'Open the browser menu'}
                        </p>
                        <p className="text-xs text-gray-500">
                            {isIOS ? 'Bottom centre of Safari browser' : 'Usually the three-dot menu near the address bar'}
                        </p>
                    </div>
                    <Share2 className="ml-auto h-7 w-7 flex-shrink-0 text-[#046ca9]" />
                </li>
                <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">2</span>
                    <div>
                        <p className="text-sm font-medium text-gray-800">
                            {isIOS ? 'Scroll down and tap' : 'Tap the install option'}
                        </p>
                        <p className="text-xs font-semibold text-[#046ca9]">
                            {isIOS ? '"Add to Home Screen"' : '"Install app" or "Add to Home screen"'}
                        </p>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">3</span>
                    <div>
                        <p className="text-sm font-medium text-gray-800">Confirm the install</p>
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
    const [showInstallGuide, setShowInstallGuide] = useState(false);
    const [installing, setInstalling]     = useState(false);

    // Don't render if not installable or already installed
    if (!isInstallable || isInstalled) return null;

    const handleClick = async () => {
        if (isIOS) {
            setShowInstallGuide(true);
            return;
        }
        if (!hasNativePrompt) {
            setShowInstallGuide(true);
            return;
        }
        setInstalling(true);
        await install();
        setInstalling(false);
    };

    const label = isIOS ? 'Add to Home Screen' : installing ? 'Installing…' : 'Install App';
    const icon = isIOS ? (
        <Share2 className="h-4 w-4" />
    ) : (
        <Download className="h-4 w-4" />
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

            {showInstallGuide && (
                <InstallGuide isIOS={isIOS} onClose={() => setShowInstallGuide(false)} />
            )}
        </>
    );
};

export default InstallAppButton;
