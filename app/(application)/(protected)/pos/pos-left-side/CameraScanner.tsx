'use client';

import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';
import React, { useCallback, useEffect, useId, useRef } from 'react';

interface CameraScannerProps {
    /** Whether the scanner is visible / active */
    isOpen: boolean;
    /** Called when the user closes the scanner */
    onClose: () => void;
    /** Called with the decoded text when a barcode / QR code is scanned */
    onScan: (decodedText: string) => void;
    /** If true, automatically close the scanner after a successful scan (default: true) */
    autoClose?: boolean;
    /** Delay (ms) before auto-closing after a scan (default: 500) */
    autoCloseDelay?: number;
    /** Scanner title text (default: "Camera Scanner Active") */
    title?: string;
    /** Helper text shown below the camera feed */
    helperText?: string;
    /** Sub-helper text shown below the main helper */
    subHelperText?: string;
}

const CameraScanner: React.FC<CameraScannerProps> = ({
    isOpen,
    onClose,
    onScan,
    autoClose = true,
    autoCloseDelay = 500,
    title = 'Camera Scanner Active',
    helperText = 'Point camera at barcode or QR code',
    subHelperText = 'Scanner will automatically detect and add product to cart',
}) => {
    // Generate a unique ID so multiple scanners on the same page won't collide
    const reactId = useId();
    const readerId = `qr-reader-${reactId.replace(/:/g, '')}`;

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isStartingRef = useRef(false);
    const isStoppingRef = useRef(false);

    // Cooldown: prevent the same barcode from firing multiple times
    const lastScanRef = useRef<{ text: string; time: number }>({ text: '', time: 0 });
    const SCAN_COOLDOWN_MS = 3000; // 3 second cooldown for same barcode

    // Stable refs for callbacks to avoid re-triggering the effect
    const onScanRef = useRef(onScan);
    onScanRef.current = onScan;

    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    const stopScanner = useCallback(async () => {
        const scanner = scannerRef.current;
        if (!scanner) {
            isStartingRef.current = false;
            return;
        }

        // Prevent concurrent stop calls
        if (isStoppingRef.current) return;
        isStoppingRef.current = true;

        try {
            // Check if scanner is actually running before trying to stop
            // Html5QrcodeScannerState: NOT_STARTED=0, SCANNING=2, PAUSED=3
            const state = scanner.getState();
            if (state === 2 || state === 3) {
                await scanner.stop();
            }
        } catch {
            // Scanner may already be stopped or mid-transition — safe to ignore
        }

        try {
            scanner.clear();
        } catch {
            // Element may already be cleared — safe to ignore
        }

        scannerRef.current = null;
        isStartingRef.current = false;
        isStoppingRef.current = false;
    }, []);

    useEffect(() => {
        if (!isOpen) {
            stopScanner();
            return;
        }

        // Guard against double init (React Strict Mode) or concurrent stop
        if (isStartingRef.current || scannerRef.current || isStoppingRef.current) return;
        isStartingRef.current = true;

        let cancelled = false;

        // Slightly longer delay to let Strict Mode cleanup finish
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

                // If cleanup happened while we were waiting, bail out
                if (cancelled) {
                    try {
                        html5QrCode.clear();
                    } catch {
                        /* ignore */
                    }
                    isStartingRef.current = false;
                    return;
                }

                scannerRef.current = html5QrCode;

                const config = {
                    fps: 15,
                    qrbox: { width: 300, height: 120 },
                };

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    config,
                    (decodedText: string) => {
                        const now = Date.now();
                        const last = lastScanRef.current;

                        // Skip if same barcode scanned within cooldown period
                        if (last.text === decodedText && now - last.time < SCAN_COOLDOWN_MS) {
                            return;
                        }

                        // Record this scan
                        lastScanRef.current = { text: decodedText, time: now };

                        console.log(`✅ CODE SCANNED: "${decodedText}"`);
                        onScanRef.current(decodedText);

                        if (autoClose) {
                            setTimeout(() => {
                                onCloseRef.current();
                            }, autoCloseDelay);
                        }
                    },
                    () => {
                        // Silent – scanner constantly tries to read
                    }
                );

                // If cleanup fired while we were awaiting start()
                if (cancelled) {
                    await stopScanner();
                    return;
                }

                isStartingRef.current = false;
                console.log('✅ Camera started successfully');
            } catch (err: any) {
                console.error('❌ Camera start FAILED:', err);

                let userMessage = 'Failed to start camera scanner.';

                if (err.name === 'NotAllowedError' || err.message?.includes('permission')) {
                    userMessage = 'Camera permission denied. Please allow camera access in browser settings.';
                } else if (err.name === 'NotFoundError' || err.message?.includes('not found')) {
                    userMessage = 'No camera found on this device.';
                } else if (err.name === 'NotReadableError' || err.message?.includes('in use')) {
                    userMessage = 'Camera is in use by another application. Please close other apps using the camera.';
                } else if (err.message) {
                    userMessage = `Camera error: ${err.message}`;
                }

                alert(`📷 ${userMessage}\n\nTry:\n• Allowing camera permission\n• Closing other camera apps\n• Refreshing the page\n• Using USB barcode scanner instead`);

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
            {/* Scoped styles for this scanner instance */}
            <style jsx global>{`
                #${readerId} {
                    border: none !important;
                }
                #${readerId}__dashboard_section {
                    display: none !important;
                }
                #${readerId}__camera_selection {
                    margin: 10px auto;
                    text-align: center;
                }
                #${readerId} video {
                    border-radius: 8px;
                }
            `}</style>

            <div className="mb-4 overflow-hidden rounded-lg border-2 border-blue-500 bg-white shadow-lg">
                <div className="flex items-center justify-between border-b bg-blue-500 px-4 py-3">
                    <div className="flex items-center gap-2 text-white">
                        <Camera className="h-5 w-5" />
                        <span className="font-semibold">{title}</span>
                        <span className="h-2 w-2 animate-pulse rounded-full bg-white"></span>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1.5 text-white hover:bg-blue-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="relative bg-gray-900">
                    <div id={readerId} style={{ border: 'none' }}></div>
                </div>

                <div className="bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    <p className="text-center font-medium">{helperText}</p>
                    <p className="mt-1 text-center text-xs text-gray-500">{subHelperText}</p>

                    <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="mb-2 text-xs font-semibold text-gray-600">📷 Camera not showing?</p>
                        <ul className="space-y-1 text-xs text-gray-600">
                            <li>• Allow camera permission when prompted</li>
                            <li>• Check browser settings (🔒 icon in address bar)</li>
                            <li>• Close other apps using camera</li>
                            <li>• Refresh page after allowing permission</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CameraScanner;
