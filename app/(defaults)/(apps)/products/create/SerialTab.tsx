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
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    const quantity = parseInt(formData.quantity || '0');

    // Initialize serial numbers array based on quantity
    useEffect(() => {
        if (quantity > 0 && productSerials.length !== quantity) {
            setProductSerials(new Array(quantity).fill({ serial_number: '', notes: '' }).map(() => ({ serial_number: '', notes: '' })));
        }
    }, [quantity, productSerials.length, setProductSerials]);

    const handleSerialChange = (index: number, field: 'serial_number' | 'notes', value: string) => {
        const newSerials = [...productSerials];
        newSerials[index] = { ...newSerials[index], [field]: value };
        setProductSerials(newSerials);
    };

    const handleSameSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSameSerialForAll(e.target.checked);
        if (e.target.checked) {
            // Apply first serial to all
            const firstSerial = productSerials[0] || { serial_number: '', notes: '' };
            setProductSerials(new Array(quantity).fill(null).map(() => ({ ...firstSerial })));
        }
    };

    const handleSingleSerialChange = (field: 'serial_number' | 'notes', value: string) => {
        // When same serial for all, update all entries
        const updated = { ...productSerials[0], [field]: value };
        setProductSerials(new Array(quantity).fill(null).map(() => ({ ...updated })));
    };

    const openScanner = () => {
        setCurrentScanIndex(0);
        setShowCameraScanner(true);
    };

    const closeScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                console.log('✅ Scanner stopped');
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
        setShowCameraScanner(false);
        setCurrentScanIndex(0);
    };

    const handleScanSuccess = (decodedText: string) => {
        console.log('📸 Serial scanned:', decodedText, 'for index:', currentScanIndex);

        if (sameSerialForAll) {
            // Fill all serials with the same value and close
            handleSingleSerialChange('serial_number', decodedText);
            closeScanner();
        } else {
            // Fill current index
            handleSerialChange(currentScanIndex, 'serial_number', decodedText);

            // Move to next index
            const nextIndex = currentScanIndex + 1;
            if (nextIndex < quantity) {
                // Auto-focus next field
                setTimeout(() => {
                    inputRefs.current[nextIndex]?.focus();
                    setCurrentScanIndex(nextIndex);
                }, 100);
            } else {
                // All serials scanned, close scanner
                console.log('✅ All serials scanned!');
                closeScanner();
            }
        }
    };

    // Initialize html5-qrcode scanner
    useEffect(() => {
        if (showCameraScanner) {
            console.log('🎥 Initializing serial scanner...');
            const timer = setTimeout(async () => {
                const element = document.getElementById('serial-qr-reader');
                if (!element) {
                    console.error('❌ Serial QR reader element not found!');
                    return;
                }

                console.log('✅ Serial QR reader element found, creating scanner...');

                try {
                    // Request camera permission first
                    console.log('📷 Requesting camera permission via getUserMedia...');
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'environment' },
                    });
                    console.log('✅ Camera permission granted!');

                    // Stop the test stream
                    stream.getTracks().forEach((track) => track.stop());

                    // Initialize html5-qrcode
                    html5QrCodeRef.current = new Html5Qrcode('serial-qr-reader');

                    // Get available cameras
                    const devices = await Html5Qrcode.getCameras();
                    console.log('📹 Available cameras:', devices);

                    if (devices && devices.length > 0) {
                        // Use the last camera (usually back camera on mobile)
                        const cameraId = devices[devices.length - 1].id;
                        console.log('🎯 Using camera:', devices[devices.length - 1].label || cameraId);

                        await html5QrCodeRef.current.start(
                            cameraId,
                            {
                                fps: 10,
                                qrbox: { width: 250, height: 250 },
                            },
                            (decodedText) => {
                                // Don't stop scanner, just process and continue
                                console.log('🔄 Processing serial:', decodedText);
                                handleScanSuccess(decodedText);
                            },
                            (errorMessage) => {
                                // Continuous scanning errors - ignore
                            }
                        );
                        console.log('✅ Camera started successfully!');
                    } else {
                        throw new Error('No cameras found on this device');
                    }
                } catch (err: any) {
                    console.error('❌ Failed to start camera:', err);
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
                if (html5QrCodeRef.current) {
                    console.log('🛑 Cleaning up serial scanner...');
                    if (html5QrCodeRef.current.isScanning) {
                        html5QrCodeRef.current
                            .stop()
                            .then(() => {
                                console.log('✅ Serial scanner cleaned up');
                            })
                            .catch((error) => {
                                console.warn('Scanner cleanup warning:', error.message);
                            });
                    } else {
                        console.log('ℹ️ Scanner already stopped');
                    }
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
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <label className="flex cursor-pointer items-center gap-3">
                        <input type="checkbox" checked={sameSerialForAll} onChange={handleSameSerialChange} className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                        <div>
                            <span className="font-medium text-gray-900">Use same serial for all products</span>
                            <p className="text-sm text-gray-600">One serial number will be applied to all {quantity} units</p>
                        </div>
                    </label>
                </div>

                {/* Scanner Button */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={openScanner}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-xl"
                    >
                        <Camera className="h-5 w-5" />
                        {sameSerialForAll ? 'Scan Serial Number' : `Scan All ${quantity} Serials`}
                    </button>
                </div>

                {/* Serial Input Fields */}
                <div className="space-y-3">
                    {sameSerialForAll ? (
                        // Single Serial Input
                        <div className="rounded-lg border border-gray-300 bg-white p-4">
                            <div className="mb-2">
                                <label className="text-sm font-medium text-gray-700">Serial Number (for all {quantity} units)</label>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                    <span className="text-sm text-gray-600">{formData.product_name || 'Product'}</span>
                                </div>
                                <input
                                    ref={(el) => (inputRefs.current[0] = el)}
                                    type="text"
                                    value={productSerials[0]?.serial_number || ''}
                                    onChange={(e) => handleSingleSerialChange('serial_number', e.target.value)}
                                    placeholder="Enter or scan serial"
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                />
                                <input
                                    type="text"
                                    value={productSerials[0]?.notes || ''}
                                    onChange={(e) => handleSingleSerialChange('notes', e.target.value)}
                                    placeholder="Notes (optional)"
                                    className="w-48 rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    ) : (
                        // Multiple Serial Inputs
                        <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                            {Array.from({ length: quantity }).map((_, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center gap-2 rounded-lg border ${
                                        currentScanIndex === index && showCameraScanner ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-gray-300 bg-white'
                                    } p-3 transition-all`}
                                >
                                    {/* Serial Label - Left Side */}
                                    <div className="flex items-center gap-2">
                                        <label className={`whitespace-nowrap text-sm font-medium ${currentScanIndex === index && showCameraScanner ? 'text-purple-700' : 'text-gray-700'}`}>
                                            Serial #{index + 1}
                                        </label>
                                        {currentScanIndex === index && showCameraScanner && <span className="text-xs font-semibold text-purple-600">← Scanning</span>}
                                        {productSerials[index]?.serial_number && <span className="text-xs font-medium text-green-600">✓</span>}
                                    </div>

                                    {/* Product Name */}
                                    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                        <span className="text-sm text-gray-600">{formData.product_name || 'Product'}</span>
                                    </div>

                                    {/* Serial Input */}
                                    <input
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        value={productSerials[index]?.serial_number || ''}
                                        onChange={(e) => handleSerialChange(index, 'serial_number', e.target.value)}
                                        placeholder={`Enter or scan serial ${index + 1}`}
                                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                    />

                                    {/* Notes Field - Inline */}
                                    <input
                                        type="text"
                                        value={productSerials[index]?.notes || ''}
                                        onChange={(e) => handleSerialChange(index, 'notes', e.target.value)}
                                        placeholder="Notes (optional)"
                                        className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Camera Scanner Modal */}
                {showCameraScanner && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                            <button onClick={closeScanner} className="absolute right-4 top-4 z-10 rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600">
                                <X className="h-5 w-5" />
                            </button>
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">{sameSerialForAll ? 'Scan Serial Number' : `Scanning Serial #${currentScanIndex + 1} of ${quantity}`}</h3>
                                {!sameSerialForAll && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-sm text-gray-600">
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
                            <div id="serial-qr-reader" style={{ border: 'none' }}></div>
                            <p className="mt-3 text-center text-sm text-gray-600">
                                {sameSerialForAll ? 'Point camera at QR code or barcode' : `Scan code for Serial #${currentScanIndex + 1} - Scanner will continue to next serial automatically`}
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-6">
                    <button
                        type="button"
                        onClick={onPrevious}
                        className="flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
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
                        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
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
