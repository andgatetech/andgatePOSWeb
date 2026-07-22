'use client';

import { useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import PwaInstallGuide from '@/components/custom/PwaInstallGuide';

type Variant = 'hero' | 'outline' | 'banner';

interface Props {
    variant?: Variant;
    className?: string;
}

// ── Main button ───────────────────────────────────────────────────────────────
const InstallAppButton = ({ variant = 'hero', className = '' }: Props) => {
    const { isReady, isIOS, hasNativePrompt, install } = usePWAInstall();
    const [showInstallGuide, setShowInstallGuide] = useState(false);
    const [installing, setInstalling]     = useState(false);

    if (!isReady) return null;

    const handleClick = async () => {
        if (isIOS) {
            setShowInstallGuide(true);
            return;
        }
        if (!hasNativePrompt) {
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
                <PwaInstallGuide isIOS={isIOS} onClose={() => setShowInstallGuide(false)} />
            )}
        </>
    );
};

export default InstallAppButton;
