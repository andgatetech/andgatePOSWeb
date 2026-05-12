'use client';

import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { getTranslation } from '@/i18n';

interface CameraScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (decodedText: string) => void;
    autoClose?: boolean;
    autoCloseDelay?: number;
    title?: string;
    helperText?: string;
    subHelperText?: string;
}

const CameraScanner: React.FC<CameraScannerProps> = ({
    isOpen,
    onClose,
    onScan,
    autoClose = true,
    autoCloseDelay = 500,
    title,
    helperText,
}) => {
    const { t } = getTranslation();
    const reactId = useId();
    const readerId = `qr-reader-${reactId.replace(/:/g, '')}`;

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isStartingRef = useRef(false);
    const isStoppingRef = useRef(false);
    const lastScanRef = useRef<{ text: string; time: number }>({ text: '', time: 0 });

    // 1 second cooldown — same barcode won't fire twice per second
    const SCAN_COOLDOWN_MS = 1000;

    const onScanRef = useRef(onScan);
    onScanRef.current = onScan;
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    const [scanCount, setScanCount] = useState(0);
    const [scanSuccess, setScanSuccess] = useState(false);

    const stopScanner = useCallback(async () => {
        const scanner = scannerRef.current;
        if (!scanner) {
            isStartingRef.current = false;
            return;
        }
        if (isStoppingRef.current) return;
        isStoppingRef.current = true;

        try {
            const state = scanner.getState();
            if (state === 2 || state === 3) await scanner.stop();
        } catch { /* already stopped */ }

        try { scanner.clear(); } catch { /* already cleared */ }

        scannerRef.current = null;
        isStartingRef.current = false;
        isStoppingRef.current = false;
    }, []);

    useEffect(() => {
        if (!isOpen) {
            stopScanner();
            setScanCount(0);
            return;
        }

        if (isStartingRef.current || scannerRef.current || isStoppingRef.current) return;
        isStartingRef.current = true;

        let cancelled = false;

        const timer = setTimeout(async () => {
            const element = document.getElementById(readerId);
            if (!element || cancelled) {
                isStartingRef.current = false;
                return;
            }

            try {
                const formatsToSupport = [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.CODE_39,
                    Html5QrcodeSupportedFormats.CODE_93,
                    Html5QrcodeSupportedFormats.CODABAR,
                    Html5QrcodeSupportedFormats.ITF,
                ];

                const html5QrCode = new Html5Qrcode(readerId, { formatsToSupport, verbose: false });

                if (cancelled) {
                    try { html5QrCode.clear(); } catch { /* ignore */ }
                    isStartingRef.current = false;
                    return;
                }

                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    {
                        // 25 fps — faster frame analysis vs original 15
                        fps: 25,
                        // Balanced box: good for barcodes (wide) and QR codes (square-ish)
                        qrbox: { width: 280, height: 200 },
                    },
                    (decodedText: string) => {
                        const now = Date.now();
                        const last = lastScanRef.current;

                        if (last.text === decodedText && now - last.time < SCAN_COOLDOWN_MS) return;
                        lastScanRef.current = { text: decodedText, time: now };

                        // Visual + haptic feedback
                        setScanSuccess(true);
                        setScanCount((c) => c + 1);
                        if (typeof navigator !== 'undefined' && navigator.vibrate) {
                            navigator.vibrate(60);
                        }
                        setTimeout(() => setScanSuccess(false), 700);

                        onScanRef.current(decodedText);

                        if (autoClose) {
                            setTimeout(() => onCloseRef.current(), autoCloseDelay);
                        }
                    },
                    () => { /* continuous decode attempts — silent */ }
                );

                if (cancelled) {
                    await stopScanner();
                    return;
                }

                isStartingRef.current = false;
            } catch (err: any) {
                let msg = t('pos_camera_start_failed');
                if (err.name === 'NotAllowedError' || err.message?.includes('permission')) msg = t('pos_camera_permission_denied');
                else if (err.name === 'NotFoundError') msg = t('pos_camera_not_found');
                else if (err.name === 'NotReadableError') msg = t('pos_camera_in_use');

                alert(`📷 ${msg}\n\n${t('pos_camera_alert_try')}:\n• ${t('pos_camera_help_permission')}\n• ${t('pos_camera_help_close_apps')}\n• ${t('pos_camera_help_refresh')}`);
                scannerRef.current = null;
                isStartingRef.current = false;
                onCloseRef.current();
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
            stopScanner();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, readerId, autoClose, autoCloseDelay]);

    if (!isOpen) return null;

    return (
        <>
            <style jsx global>{`
                #${readerId} { border: none !important; background: transparent !important; }
                #${readerId}__dashboard_section { display: none !important; }
                #${readerId} video { border-radius: 0 !important; width: 100% !important; }
                #${readerId} img { display: none !important; }
            `}</style>

            <div className="mb-3 overflow-hidden rounded-xl border border-gray-700 bg-gray-950 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                        <Camera className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-white">{title || t('pos_camera_title')}</span>
                        <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-400" />
                        {scanCount > 0 && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
                                {scanCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Camera feed with success flash */}
                <div
                    className={`relative bg-gray-950 transition-all duration-200 ${
                        scanSuccess ? 'ring-4 ring-inset ring-green-400' : ''
                    }`}
                >
                    <div id={readerId} style={{ border: 'none' }} />

                    {/* Success overlay flash */}
                    {scanSuccess && (
                        <div className="pointer-events-none absolute inset-0 animate-ping bg-green-400/20" />
                    )}
                </div>

                {/* Footer hint */}
                <div className="flex items-center justify-center gap-2 border-t border-gray-700 bg-gray-900 px-3 py-2">
                    <svg className="h-3.5 w-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h1M4 10h1M4 14h1M4 18h1M8 4v16M12 4v16M16 6h1M16 10h1M16 14h1M16 18h1M20 4v16" />
                    </svg>
                    <p className="text-xs text-gray-400">{helperText || t('pos_camera_helper')}</p>
                </div>
            </div>
        </>
    );
};

export default CameraScanner;
