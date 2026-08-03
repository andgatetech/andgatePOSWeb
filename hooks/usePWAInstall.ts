'use client';

import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
}

export interface PWAInstallState {
    isReady: boolean;
    isInstallable: boolean;
    isInstalled: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    isWindows: boolean;
    isMac: boolean;
    isChrome: boolean;
    isEdge: boolean;
    isSafari: boolean;
    isFirefox: boolean;
    platformName: string;
    browserName: string;
    hasNativePrompt: boolean;
    install(): Promise<boolean>;
}

// Module-level caching so the prompt event is preserved across Next.js client-side navigations
let globalPromptEvent: BeforeInstallPromptEvent | null = null;
const promptSubscribers = new Set<(event: BeforeInstallPromptEvent | null) => void>();
const installSubscribers = new Set<() => void>();

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        globalPromptEvent = e as BeforeInstallPromptEvent;
        promptSubscribers.forEach((cb) => cb(globalPromptEvent));
    });

    window.addEventListener('appinstalled', () => {
        globalPromptEvent = null;
        promptSubscribers.forEach((cb) => cb(null));
        installSubscribers.forEach((cb) => cb());
    });
}

export const usePWAInstall = (): PWAInstallState => {
    const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(globalPromptEvent);
    const [isReady, setIsReady] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isWindows, setIsWindows] = useState(false);
    const [isMac, setIsMac] = useState(false);
    const [isChrome, setIsChrome] = useState(false);
    const [isEdge, setIsEdge] = useState(false);
    const [isSafari, setIsSafari] = useState(false);
    const [isFirefox, setIsFirefox] = useState(false);
    const [platformName, setPlatformName] = useState('Unknown Device');
    const [browserName, setBrowserName] = useState('Browser');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check if running in standalone (already installed)
        const standalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true ||
            document.referrer.includes('android-app://');

        if (standalone) {
            setIsInstalled(true);
            setIsReady(true);
            return;
        }

        const ua = navigator.userAgent || '';

        // Platform detection
        const ios =
            (/iphone|ipad|ipod/i.test(ua) ||
                (ua.includes('Mac') && navigator.maxTouchPoints > 1)) &&
            !(window as any).MSStream;
        const android = /android/i.test(ua);
        const windows = /windows/i.test(ua);
        const mac = /macintosh|mac os x/i.test(ua) && !ios;

        // Browser detection
        const edge = /edg/i.test(ua);
        const chrome = /chrome|crios/i.test(ua) && !edge && !/opr|opera/i.test(ua);
        const safari = /safari/i.test(ua) && !chrome && !edge && !/crios|fxios|opr/i.test(ua);
        const firefox = /firefox|fxios/i.test(ua);

        setIsIOS(ios);
        setIsAndroid(android);
        setIsWindows(windows);
        setIsMac(mac);
        setIsChrome(chrome);
        setIsEdge(edge);
        setIsSafari(safari);
        setIsFirefox(firefox);

        let pName = 'Desktop';
        if (ios) pName = 'iOS';
        else if (android) pName = 'Android';
        else if (windows) pName = 'Windows';
        else if (mac) pName = 'macOS';
        setPlatformName(pName);

        let bName = 'Browser';
        if (edge) bName = 'Microsoft Edge';
        else if (chrome) bName = 'Google Chrome';
        else if (safari) bName = 'Safari';
        else if (firefox) bName = 'Firefox';
        setBrowserName(bName);

        if (globalPromptEvent) {
            setPromptEvent(globalPromptEvent);
        }

        setIsReady(true);

        const handlePromptUpdate = (evt: BeforeInstallPromptEvent | null) => {
            setPromptEvent(evt);
        };
        const handleInstalled = () => {
            setIsInstalled(true);
            setPromptEvent(null);
        };

        promptSubscribers.add(handlePromptUpdate);
        installSubscribers.add(handleInstalled);

        return () => {
            promptSubscribers.delete(handlePromptUpdate);
            installSubscribers.delete(handleInstalled);
        };
    }, []);

    const install = async (): Promise<boolean> => {
        const targetPrompt = promptEvent || globalPromptEvent;
        if (!targetPrompt) return false;
        try {
            await targetPrompt.prompt();
            const { outcome } = await targetPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsInstalled(true);
                globalPromptEvent = null;
                setPromptEvent(null);
                return true;
            }
            return false;
        } catch (err) {
            console.error('[usePWAInstall] install prompt failed:', err);
            return false;
        } finally {
            globalPromptEvent = null;
            setPromptEvent(null);
        }
    };

    return {
        isReady,
        isInstallable: isReady && !isInstalled && (isIOS || !!promptEvent || !!globalPromptEvent),
        isInstalled,
        isIOS,
        isAndroid,
        isWindows,
        isMac,
        isChrome,
        isEdge,
        isSafari,
        isFirefox,
        platformName,
        browserName,
        hasNativePrompt: !!promptEvent || !!globalPromptEvent,
        install,
    };
};

