'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAInstallState {
    isInstallable: boolean;
    isInstalled:   boolean;
    isIOS:         boolean;
    hasNativePrompt: boolean;
    install(): Promise<void>;
}

export const usePWAInstall = (): PWAInstallState => {
    const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled]   = useState(false);
    const [isIOS, setIsIOS]               = useState(false);

    useEffect(() => {
        // Running in standalone (already installed)
        const standalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        if (standalone) {
            setIsInstalled(true);
            return;
        }

        // iOS/iPadOS: Safari doesn't fire beforeinstallprompt
        const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        const onPrompt = (e: Event) => {
            e.preventDefault();
            setPromptEvent(e as BeforeInstallPromptEvent);
        };
        const onInstalled = () => {
            setIsInstalled(true);
            setPromptEvent(null);
        };

        window.addEventListener('beforeinstallprompt', onPrompt);
        window.addEventListener('appinstalled', onInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', onPrompt);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    const install = async () => {
        if (!promptEvent) return;
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
            setIsInstalled(true);
            setPromptEvent(null);
        }
    };

    return {
        isInstallable:   !isInstalled && (!!promptEvent || isIOS),
        isInstalled,
        isIOS,
        hasNativePrompt: !!promptEvent,
        install,
    };
};
