'use client';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Hash, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SerialTabProps {
    formData: {
        quantity: string;
        product_name: string;
    };
    productSerials: Array<{ serial_number: string; notes: string }>;
    setProductSerials: React.Dispatch<React.SetStateAction<Array<{ serial_number: string; notes: string }>>>;
    onPrevious: () => void;
    onNext: () => void;
    onCreateProduct: () => void;
    isCreating: boolean;
}

const SerialTab = ({ formData, productSerials, setProductSerials, onPrevious, onNext, onCreateProduct, isCreating }: SerialTabProps) => {
    const [sameSerialForAll, setSameSerialForAll] = useState(true);
    const [showCameraScanner, setShowCameraScanner] = useState(false);
    const [currentScanIndex, setCurrentScanIndex] = useState<number>(0);
    const currentScanIndexRef = useRef<number>(0); // Use ref to track current index for scanner
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const isProcessingScanRef = useRef<boolean>(false); // Prevent duplicate scans
    const lastScannedCodeRef = useRef<string>(''); // Track last scanned code
    const lastScanTimeRef = useRef<number>(0); // Track last scan timestamp

    // Use a ref to store serials to prevent parent re-renders from clearing data
    const serialsRef = useRef<Array<{ serial_number: string; notes: string }>>(productSerials);

    const quantity = parseInt(formData.quantity || '0');

    // Audio beep for successful scan
    const playBeep = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Silently fail if audio not supported
        }
    };

    // Sync ref with prop on mount and when prop changes externally
    useEffect(() => {
        if (!showCameraScanner) {
            serialsRef.current = productSerials;
        }
    }, [productSerials, showCameraScanner]);

    // Initialize serial numbers array based on quantity
    useEffect(() => {
        if (quantity > 0 && serialsRef.current.length === 0) {
            const initialized = Array.from({ length: quantity }, () => ({ serial_number: '', notes: '' }));
            serialsRef.current = initialized;
            setProductSerials(initialized);
        } else if (quantity > 0 && serialsRef.current.length !== quantity) {
            const newSerials = Array.from({ length: quantity }, (_, index) => serialsRef.current[index] || { serial_number: '', notes: '' });
            serialsRef.current = newSerials;
            setProductSerials(newSerials);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quantity]);

    const handleSerialChange = (index: number, field: 'serial_number' | 'notes', value: string) => {
        const newSerials = [...serialsRef.current];

        if (newSerials.length !== quantity) {
            while (newSerials.length < quantity) {
                newSerials.push({ serial_number: '', notes: '' });
            }
        }

        newSerials[index] = { ...newSerials[index], [field]: value };

        serialsRef.current = newSerials;
        setProductSerials(newSerials);
    };

    const handleSameSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSameSerialForAll(e.target.checked);
        if (e.target.checked) {
            // Apply first serial to all
            const firstSerial = serialsRef.current[0] || { serial_number: '', notes: '' };
            const newSerials = new Array(quantity).fill(null).map(() => ({ ...firstSerial }));
            serialsRef.current = newSerials;
            setProductSerials(newSerials);
        }
    };

    const handleSingleSerialChange = (field: 'serial_number' | 'notes', value: string) => {
        // When same serial for all, update all entries
        const updated = { ...serialsRef.current[0], [field]: value };
        const newSerials = new Array(quantity).fill(null).map(() => ({ ...updated }));
        serialsRef.current = newSerials;
        setProductSerials(newSerials);
    };

    const openScanner = () => {
        const firstEmptyIndex = serialsRef.current.findIndex((s) => !s.serial_number || s.serial_number.trim() === '');
        const startIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;

        setCurrentScanIndex(startIndex);
        currentScanIndexRef.current = startIndex;
        isProcessingScanRef.current = false;
        lastScannedCodeRef.current = '';
        lastScanTimeRef.current = 0;
        setShowCameraScanner(true);
    };

    const closeScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
            } catch (err) {
                // Silently handle scanner stop errors
            }
        }
        setShowCameraScanner(false);
        setCurrentScanIndex(0);
        currentScanIndexRef.current = 0;
        isProcessingScanRef.current = false;
        lastScannedCodeRef.current = '';
        lastScanTimeRef.current = 0;
    };

    const handleScanSuccess = (decodedText: string) => {
        if (isProcessingScanRef.current) {
            return;
        }

        const now = Date.now();
        const scanIndex = currentScanIndexRef.current;

        if ((lastScannedCodeRef.current === decodedText && now - lastScanTimeRef.current < 1000) || now - lastScanTimeRef.current < 500) {
            return;
        }

        // Check if this serial number already exists
        const duplicateIndex = serialsRef.current.findIndex((s, idx) => idx !== scanIndex && s.serial_number.trim() === decodedText.trim());

        if (duplicateIndex !== -1) {
            const shouldReplace = window.confirm(
                `⚠️ Duplicate Serial Number!\n\n` +
                    `Serial "${decodedText}" is already assigned to Serial #${duplicateIndex + 1}.\n\n` +
                    `Do you want to:\n` +
                    `• Click "OK" to REPLACE Serial #${duplicateIndex + 1} with this scan\n` +
                    `• Click "Cancel" to KEEP the existing one and scan a different serial`
            );

            if (shouldReplace) {
                // Play beep for replacement action
                playBeep();

                // Clear the duplicate entry
                const newSerials = [...serialsRef.current];
                newSerials[duplicateIndex] = { serial_number: '', notes: '' };
                serialsRef.current = newSerials;
                setProductSerials(newSerials);
            } else {
                // Don't process this scan, allow retry
                return;
            }
        }

        isProcessingScanRef.current = true;
        lastScannedCodeRef.current = decodedText;
        lastScanTimeRef.current = now;

        playBeep();

        if (sameSerialForAll) {
            handleSingleSerialChange('serial_number', decodedText);
            closeScanner();
        } else {
            handleSerialChange(scanIndex, 'serial_number', decodedText);

            const nextIndex = scanIndex + 1;
            if (nextIndex < quantity) {
                currentScanIndexRef.current = nextIndex;
                setCurrentScanIndex(nextIndex);

                setTimeout(() => {
                    inputRefs.current[nextIndex]?.focus();
                    isProcessingScanRef.current = false;
                }, 800);
            } else {
                closeScanner();
            }
        }
    };

    // Initialize html5-qrcode scanner
    useEffect(() => {
        if (showCameraScanner) {
            const timer = setTimeout(async () => {
                const element = document.getElementById('serial-qr-reader');
                if (!element) return;

                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'environment' },
                    });
                    stream.getTracks().forEach((track) => track.stop());

                    html5QrCodeRef.current = new Html5Qrcode('serial-qr-reader');

                    const devices = await Html5Qrcode.getCameras();

                    if (devices && devices.length > 0) {
                        const cameraId = devices[devices.length - 1].id;

                        await html5QrCodeRef.current.start(
                            cameraId,
                            {
                                fps: 10,
                                qrbox: { width: 250, height: 250 },
                            },
                            (decodedText) => {
                                handleScanSuccess(decodedText);
                            },
                            (errorMessage) => {
                                // Ignore scanning errors
                            }
                        );
                    } else {
                        throw new Error('No cameras found on this device');
                    }
                } catch (err: any) {
                    const errorName = err.name || '';
                    const errorMessage = err.message || 'Failed to access camera';

                    let userMessage = 'Camera Error: ' + errorMessage;

                    if (errorName === 'NotAllowedError' || errorMessage.includes('Permission denied')) {
                        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                        const isHTTPS = window.location.protocol === 'https:';
                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                        if (isLocalhost && !isHTTPS) {
                            userMessage = `🚫 Camera Blocked on Mobile!\n\nMobile browsers require HTTPS for camera access.\n\n✅ SOLUTION:\n• This will work on your live site\n• For local testing, use your laptop/desktop\n• Or use ngrok for HTTPS tunnel\n\nNote: Manual entry still works!`;
                        } else {
                            if (isMobile) {
                                userMessage = `🚫 Camera Permission Needed!\n\n📱 MOBILE STEPS:\n\n1. Refresh this page (pull down)\n2. Look for camera permission popup\n3. Tap "Allow" or "While using"\n\nIf popup doesn't appear:\n• Open browser Settings\n• Find "Site Settings" or "Permissions"\n• Find this website\n• Enable Camera\n• Refresh page`;
                            } else {
                                userMessage = `🚫 Camera Permission Needed!\n\n💻 DESKTOP STEPS:\n\n1. Look for camera icon in address bar\n2. Click it and select "Allow"\n3. Refresh the page\n\nOR:\n1. Click the 🔒 lock icon\n2. Click "Site settings"\n3. Find "Camera"\n4. Select "Allow"\n5. Refresh page (F5)`;
                            }
                        }
                    } else if (errorName === 'NotFoundError' || errorMessage.includes('not found')) {
                        userMessage = `📷 No Camera Found!\n\nPlease check:\n1. Your device has a camera\n2. Camera is not being used by another app\n3. Try closing and reopening browser`;
                    } else if (errorName === 'NotReadableError') {
                        userMessage = `⚠️ Camera In Use!\n\nPlease:\n1. Close other apps using the camera\n2. Restart your browser\n3. Try again`;
                    } else if (errorName === 'NotSupportedError' || errorMessage.includes('Only secure')) {
                        userMessage = `🔒 HTTPS Required!\n\nCamera only works on HTTPS.\n\n✅ Your live site will work!\n\nFor localhost testing:\n• Use desktop/laptop browser\n• Or use ngrok for HTTPS tunnel`;
                    }

                    alert(userMessage);
                    setShowCameraScanner(false);
                }
            }, 100);

            return () => {
                clearTimeout(timer);
                if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                    html5QrCodeRef.current.stop().catch(() => {});
                }
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showCameraScanner]);

    return (
        <>
            {/* Scanner Styles */}
            <style jsx global>{`
                #serial-qr-reader {
                    width: 100%;
                    border: none;
                }
                #serial-qr-reader__dashboard_section {
                    display: none !important;
                }
                #serial-qr-reader__camera_selection {
                    display: none !important;
                }
                #serial-qr-reader video {
                    border-radius: 0.5rem;
                }
                #serial-qr-reader__dashboard_section_csr button {
                    background: #10b981 !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 16px !important;
                    border-radius: 6px !important;
                }
            `}</style>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                    <div className="rounded-lg bg-purple-100 p-2">
                        <Hash className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Serial Numbers</h3>
                        <p className="text-sm text-gray-600">Scan or enter serial numbers for tracking (Quantity: {quantity})</p>
                    </div>
                </div>

                {/* Same Serial Checkbox */}
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 sm:p-4">
                    <label className="flex cursor-pointer items-start gap-2 sm:items-center sm:gap-3">
                        <input
                            type="checkbox"
                            checked={sameSerialForAll}
                            onChange={handleSameSerialChange}
                            className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-purple-600 focus:ring-purple-500 sm:mt-0 sm:h-5 sm:w-5"
                        />
                        <div>
                            <span className="block text-sm font-medium text-gray-900 sm:text-base">Use same serial for all products</span>
                            <p className="text-xs text-gray-600 sm:text-sm">One serial number will be applied to all {quantity} units</p>
                        </div>
                    </label>
                </div>

                {/* Scanner Button */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={openScanner}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-xl sm:w-auto sm:px-6 sm:py-3 sm:text-base"
                    >
                        <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="truncate">{sameSerialForAll ? 'Scan Serial Number' : `Scan All ${quantity} Serials`}</span>
                    </button>
                </div>

                {/* Serial Input Fields */}
                <div className="space-y-3">
                    {sameSerialForAll ? (
                        // Single Serial Input
                        <div className="rounded-lg border border-gray-300 bg-white p-3 sm:p-4">
                            <div className="mb-2">
                                <label className="text-xs font-medium text-gray-700 sm:text-sm">Serial Number (for all {quantity} units)</label>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 sm:px-3">
                                    <span className="truncate text-xs text-gray-600 sm:text-sm">{formData.product_name || 'Product'}</span>
                                </div>
                                <input
                                    ref={(el) => (inputRefs.current[0] = el)}
                                    type="text"
                                    value={productSerials[0]?.serial_number || ''}
                                    onChange={(e) => handleSingleSerialChange('serial_number', e.target.value)}
                                    placeholder="Enter or scan serial"
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                />
                                <input
                                    type="text"
                                    value={productSerials[0]?.notes || ''}
                                    onChange={(e) => handleSingleSerialChange('notes', e.target.value)}
                                    placeholder="Notes (optional)"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 sm:w-48"
                                />
                            </div>
                        </div>
                    ) : (
                        // Multiple Serial Inputs
                        <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 sm:p-4">
                            {Array.from({ length: quantity }).map((_, index) => (
                                <div
                                    key={index}
                                    className={`flex flex-col gap-2 rounded-lg border p-2 transition-all sm:flex-row sm:items-center sm:gap-2 sm:p-3 ${
                                        currentScanIndex === index && showCameraScanner ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-gray-300 bg-white'
                                    }`}
                                >
                                    {/* Serial Label & Status - Mobile: Full Width, Desktop: Auto */}
                                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                                        <div className="flex items-center gap-2">
                                            <label
                                                className={`whitespace-nowrap text-xs font-medium sm:text-sm ${currentScanIndex === index && showCameraScanner ? 'text-purple-700' : 'text-gray-700'}`}
                                            >
                                                Serial #{index + 1}
                                            </label>
                                            {productSerials[index]?.serial_number && <span className="text-xs font-medium text-green-600">✓</span>}
                                        </div>
                                        {currentScanIndex === index && showCameraScanner && <span className="text-xs font-semibold text-purple-600">Scanning</span>}
                                    </div>

                                    {/* Product Name - Mobile: Full Width */}
                                    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 sm:px-3">
                                        <span className="truncate text-xs text-gray-600 sm:text-sm">{formData.product_name || 'Product'}</span>
                                    </div>

                                    {/* Serial Input - Mobile: Full Width */}
                                    <input
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        value={productSerials[index]?.serial_number || ''}
                                        onChange={(e) => handleSerialChange(index, 'serial_number', e.target.value)}
                                        placeholder={`Enter or scan serial ${index + 1}`}
                                        className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs focus:border-purple-500 focus:ring-2 focus:ring-purple-500 sm:flex-1 sm:px-3 sm:text-sm"
                                    />

                                    {/* Notes Field - Mobile: Full Width */}
                                    <input
                                        type="text"
                                        value={productSerials[index]?.notes || ''}
                                        onChange={(e) => handleSerialChange(index, 'notes', e.target.value)}
                                        placeholder="Notes (optional)"
                                        className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs focus:border-purple-500 focus:ring-2 focus:ring-purple-500 sm:w-40 sm:px-3 sm:text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Camera Scanner Modal */}
                {showCameraScanner && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                        <div className="relative w-full max-w-lg rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
                            <button
                                onClick={closeScanner}
                                className="absolute right-2 top-2 z-10 rounded-full bg-red-500 p-1.5 text-white transition-colors hover:bg-red-600 sm:right-4 sm:top-4 sm:p-2"
                            >
                                <X className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <div className="mb-3 sm:mb-4">
                                <h3 className="pr-8 text-base font-semibold text-gray-900 sm:text-lg">
                                    {sameSerialForAll ? 'Scan Serial Number' : `Scanning Serial #${currentScanIndex + 1} of ${quantity}`}
                                </h3>
                                {!sameSerialForAll && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-xs text-gray-600 sm:text-sm">
                                            <span>
                                                Progress: {productSerials.filter((s) => s.serial_number?.trim() !== '').length} / {quantity}
                                            </span>
                                            <span className="font-medium text-purple-600">{Math.round((productSerials.filter((s) => s.serial_number?.trim() !== '').length / quantity) * 100)}%</span>
                                        </div>
                                        <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                                            <div
                                                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                                                style={{ width: `${(productSerials.filter((s) => s.serial_number?.trim() !== '').length / quantity) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div id="serial-qr-reader" className="overflow-hidden rounded-lg" style={{ border: 'none' }}></div>
                            <p className="mt-2 text-center text-xs text-gray-600 sm:mt-3 sm:text-sm">
                                {sameSerialForAll ? 'Point camera at QR code or barcode' : `Scan code for Serial #${currentScanIndex + 1} - Scanner will continue automatically`}
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-6">
                    <button
                        type="button"
                        onClick={onPrevious}
                        className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:px-6 sm:py-2.5"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                    </button>

                    <button
                        type="button"
                        onClick={onCreateProduct}
                        disabled={isCreating}
                        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-2.5"
                    >
                        {isCreating ? (
                            <>
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Creating...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Create Product
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default SerialTab;
