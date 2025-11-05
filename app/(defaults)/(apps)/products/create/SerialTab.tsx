'use client';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, ChevronDown, ChevronUp, Hash, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const sanitizeCount = (value: unknown): number => {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) {
        return 0;
    }
    return Math.floor(num);
};

interface SerialTabProps {
    formData: {
        quantity: string;
        product_name: string;
    };
    productSerials: Array<{ serial_number: string; notes: string }>;
    setProductSerials: React.Dispatch<React.SetStateAction<Array<{ serial_number: string; notes: string }>>>;
    productStocks: any[];
    productAttributes: any[];
    onPrevious: () => void;
    onNext: () => void;
    onCreateProduct: () => void;
    isCreating: boolean;
}

const SerialTab = ({ formData, productSerials, setProductSerials, productStocks, productAttributes, onPrevious, onNext, onCreateProduct, isCreating }: SerialTabProps) => {
    const hasVariants = productAttributes && productAttributes.length > 0 && productStocks && productStocks.length > 0;

    const [sameSerialForAll, setSameSerialForAll] = useState(() => !hasVariants);
    const [showCameraScanner, setShowCameraScanner] = useState(false);
    const [currentScanIndex, setCurrentScanIndex] = useState<number>(0);
    const currentScanIndexRef = useRef<number>(0); // Use ref to track current index for scanner
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const isProcessingScanRef = useRef<boolean>(false); // Prevent duplicate scans
    const lastScannedCodeRef = useRef<string>(''); // Track last scanned code
    const lastScanTimeRef = useRef<number>(0); // Track last scan timestamp
    const singleFieldScanRef = useRef<boolean>(false);
    const [isSingleScanMode, setIsSingleScanMode] = useState(false);
    const hasVariantsRef = useRef(hasVariants);

    // Use a ref to store serials to prevent parent re-renders from clearing data
    const serialsRef = useRef<Array<{ serial_number: string; notes: string }>>(productSerials);

    const variantUnitCounts = useMemo(() => {
        if (!hasVariants) {
            return [] as number[];
        }
        return productStocks.map((stock: any) => sanitizeCount(stock?.quantity));
    }, [hasVariants, productStocks]);

    const simpleUnitCount = sanitizeCount(formData.quantity);
    const totalUnits = hasVariants ? variantUnitCounts.reduce((sum, qty) => sum + qty, 0) : simpleUnitCount;

    const serialEntryMeta = useMemo(() => {
        if (totalUnits <= 0) {
            return [] as Array<{ variantIndex: number | null; unitIndex: number }>;
        }

        if (!hasVariants) {
            return Array.from({ length: totalUnits }, (_, unitIndex) => ({ variantIndex: null, unitIndex }));
        }

        const meta: Array<{ variantIndex: number; unitIndex: number }> = [];
        productStocks.forEach((_stock, variantIndex) => {
            const unitCount = variantUnitCounts[variantIndex] || 0;
            for (let unitIndex = 0; unitIndex < unitCount; unitIndex++) {
                meta.push({ variantIndex, unitIndex });
            }
        });
        return meta;
    }, [hasVariants, productStocks, totalUnits, variantUnitCounts]);

    const entryCount = serialEntryMeta.length;
    const variantCount = hasVariants ? productStocks.length : 0;
    const displayUnitCount = totalUnits;
    const useSingleSerial = sameSerialForAll && entryCount > 0;

    const variantSerialGroups = useMemo(() => {
        if (!hasVariants) {
            return { byVariant: [] as number[][], unassigned: [] as number[] };
        }

        const groups = productStocks.map(() => [] as number[]);
        const unassigned: number[] = [];

        serialEntryMeta.forEach((meta, index) => {
            if (meta.variantIndex === null || meta.variantIndex < 0 || meta.variantIndex >= groups.length) {
                unassigned.push(index);
                return;
            }
            groups[meta.variantIndex].push(index);
        });

        return { byVariant: groups, unassigned };
    }, [hasVariants, productStocks, serialEntryMeta]);

    const [expandedVariantGroups, setExpandedVariantGroups] = useState<Record<number, boolean>>({});
    const [showUnassigned, setShowUnassigned] = useState(true);

    useEffect(() => {
        if (hasVariants && !hasVariantsRef.current) {
            setSameSerialForAll(false);
        } else if (!hasVariants && hasVariantsRef.current) {
            setSameSerialForAll(true);
        }
        hasVariantsRef.current = hasVariants;
    }, [hasVariants]);

    useEffect(() => {
        if (!hasVariants) {
            setExpandedVariantGroups({});
            setShowUnassigned(true);
            return;
        }

        setExpandedVariantGroups((prev) => {
            const next: Record<number, boolean> = {};
            productStocks.forEach((_, index) => {
                next[index] = prev[index] ?? true;
            });
            return next;
        });
    }, [hasVariants, productStocks]);

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

    const previousMetaRef = useRef<Array<{ variantIndex: number | null; unitIndex: number }>>([]);

    // Initialize serial numbers array based on unit count (variants or quantity)
    useEffect(() => {
        if (entryCount <= 0) {
            if (serialsRef.current.length > 0) {
                serialsRef.current = [];
                previousMetaRef.current = [];
                setProductSerials([]);
            }
            return;
        }

        const defaultEntry = { serial_number: '', notes: '' };
        const serialLookup = new Map<string, { serial_number: string; notes: string }>();

        previousMetaRef.current.forEach((meta, index) => {
            const key = `${meta.variantIndex ?? 'base'}-${meta.unitIndex}`;
            serialLookup.set(key, serialsRef.current[index] || defaultEntry);
        });

        const newSerials = serialEntryMeta.map((meta) => {
            const key = `${meta.variantIndex ?? 'base'}-${meta.unitIndex}`;
            const existing = serialLookup.get(key);
            if (existing) {
                return { ...existing };
            }
            return { ...defaultEntry };
        });

        if (sameSerialForAll && newSerials.length > 0) {
            const first = { ...newSerials[0] };
            for (let i = 0; i < newSerials.length; i++) {
                newSerials[i] = { ...first };
            }
        }

        const changed =
            newSerials.length !== serialsRef.current.length ||
            newSerials.some((serial, index) => {
                const current = serialsRef.current[index];
                if (!current) return true;
                return current.serial_number !== serial.serial_number || current.notes !== serial.notes;
            });

        if (changed) {
            serialsRef.current = newSerials;
            setProductSerials(newSerials);
        }

        previousMetaRef.current = serialEntryMeta;
    }, [entryCount, sameSerialForAll, serialEntryMeta, setProductSerials]);

    const handleSerialChange = (index: number, field: 'serial_number' | 'notes', value: string) => {
        if (index < 0 || index >= entryCount) return;

        const newSerials = [...serialsRef.current];

        if (newSerials.length !== entryCount) {
            while (newSerials.length < entryCount) {
                newSerials.push({ serial_number: '', notes: '' });
            }
            if (newSerials.length > entryCount) {
                newSerials.length = entryCount;
            }
        }

        newSerials[index] = { ...newSerials[index], [field]: value };

        serialsRef.current = newSerials;
        setProductSerials(newSerials);
    };

    const handleSameSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (entryCount <= 0) {
            setSameSerialForAll(e.target.checked);
            return;
        }
        setSameSerialForAll(e.target.checked);
        if (e.target.checked) {
            // Apply first serial to all
            const firstSerial = serialsRef.current[0] || { serial_number: '', notes: '' };
            const newSerials = new Array(entryCount).fill(null).map(() => ({ ...firstSerial }));
            serialsRef.current = newSerials;
            setProductSerials(newSerials);
        }
    };

    const handleSingleSerialChange = (field: 'serial_number' | 'notes', value: string) => {
        if (entryCount <= 0) return;
        // When same serial for all, update all entries
        const baseline = serialsRef.current[0] || { serial_number: '', notes: '' };
        const updated = { ...baseline, [field]: value };
        const newSerials = new Array(entryCount).fill(null).map(() => ({ ...updated }));
        serialsRef.current = newSerials;
        setProductSerials(newSerials);
    };

    const getVariantBaseName = (variantIndex: number | null): string => {
        if (variantIndex === null || !hasVariants || !productStocks[variantIndex]) {
            return '';
        }

        const variant = productStocks[variantIndex];
        if (!variant.variant_data || Object.keys(variant.variant_data).length === 0) {
            return `Variant #${variantIndex + 1}`;
        }

        const values = Object.entries(variant.variant_data)
            .filter(([_, value]) => value && String(value).trim() !== '')
            .map(([_, value]) => String(value))
            .join(' - ');

        return values || `Variant #${variantIndex + 1}`;
    };

    const getVariantDisplayInfo = (index: number): { label: string; subtitle?: string } => {
        const meta = serialEntryMeta[index];
        if (!meta) {
            const label = `Serial/IMEI #${index + 1}`;
            return { label };
        }

        if (!hasVariants || meta.variantIndex === null) {
            const unitNumber = meta.unitIndex + 1;
            const label = `Serial/IMEI #${unitNumber}`;
            const subtitle = entryCount > 0 ? `Unit ${unitNumber} of ${entryCount}` : undefined;
            return { label, subtitle };
        }

        const baseName = getVariantBaseName(meta.variantIndex);
        const totalForVariant = Math.max(variantUnitCounts[meta.variantIndex] || 0, meta.unitIndex + 1);
        const subtitle = `Unit ${meta.unitIndex + 1} of ${totalForVariant}`;
        return { label: baseName || `Variant #${meta.variantIndex + 1}`, subtitle };
    };

    const getSerialDescriptor = (index: number): string => {
        const info = getVariantDisplayInfo(index);
        return info.subtitle ? `${info.label} (${info.subtitle})` : info.label;
    };

    const openScanner = (targetIndex?: number) => {
        if (entryCount <= 0) return;

        let startIndex: number;
        singleFieldScanRef.current = typeof targetIndex === 'number' && !Number.isNaN(targetIndex);
        setIsSingleScanMode(singleFieldScanRef.current);

        if (typeof targetIndex === 'number' && !Number.isNaN(targetIndex)) {
            const boundedIndex = Math.min(Math.max(targetIndex, 0), entryCount - 1);
            startIndex = boundedIndex;
        } else {
            const firstEmptyIndex = serialsRef.current.findIndex((s) => !s.serial_number || s.serial_number.trim() === '');
            startIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
        }

        if (startIndex >= entryCount) {
            startIndex = entryCount - 1;
        }

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
        singleFieldScanRef.current = false;
        setIsSingleScanMode(false);
    };

    const focusEntryInput = (index: number) => {
        if (index < 0) {
            return;
        }
        requestAnimationFrame(() => {
            const input = inputRefs.current[index];
            if (input) {
                input.focus();
            }
        });
    };

    const findNextScanIndex = (currentIndex: number): number => {
        const nextEmptyAhead = serialsRef.current.findIndex((serial, idx) => idx > currentIndex && (!serial.serial_number || serial.serial_number.trim() === ''));
        if (nextEmptyAhead !== -1) {
            return nextEmptyAhead;
        }

        const firstEmpty = serialsRef.current.findIndex((serial) => !serial.serial_number || serial.serial_number.trim() === '');
        return firstEmpty;
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
            const duplicateLabel = getSerialDescriptor(duplicateIndex);
            const shouldReplace = window.confirm(
                `⚠️ Duplicate Serial/IMEI!\n\n` +
                    `Serial/IMEI "${decodedText}" is already assigned to ${duplicateLabel}.\n\n` +
                    `Do you want to:\n` +
                    `• Click "OK" to REPLACE ${duplicateLabel} with this scan\n` +
                    `• Click "Cancel" to KEEP the existing one and scan a different Serial/IMEI`
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
            void closeScanner();
            return;
        }

        handleSerialChange(scanIndex, 'serial_number', decodedText);

        if (singleFieldScanRef.current) {
            // Single-field scan closes immediately after updating targeted entry
            isProcessingScanRef.current = false;
            lastScannedCodeRef.current = '';
            lastScanTimeRef.current = 0;
            void closeScanner();
            return;
        }

        const nextIndex = findNextScanIndex(scanIndex);

        if (nextIndex === -1) {
            // All entries filled; close scanner
            isProcessingScanRef.current = false;
            lastScannedCodeRef.current = '';
            lastScanTimeRef.current = 0;
            void closeScanner();
            return;
        }

        currentScanIndexRef.current = nextIndex;
        setCurrentScanIndex(nextIndex);
        focusEntryInput(nextIndex);

        // Allow next scan event
        isProcessingScanRef.current = false;
        lastScannedCodeRef.current = '';
        lastScanTimeRef.current = 0;
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

    const renderSerialRow = (entryIndex: number) => {
        const info = getVariantDisplayInfo(entryIndex);
        const isActiveRow = currentScanIndex === entryIndex && showCameraScanner;
        const serialValue = productSerials[entryIndex]?.serial_number || '';
        const notesValue = productSerials[entryIndex]?.notes || '';

        return (
            <div
                key={entryIndex}
                className={`flex flex-col gap-2 rounded-lg border p-2 transition-all sm:flex-row sm:items-center sm:gap-2 sm:p-3 ${
                    isActiveRow ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-gray-300 bg-white'
                }`}
            >
                {/* Serial Label & Status */}
                <div className="flex items-center justify-between gap-2 sm:justify-start">
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                            <span className={`text-xs font-medium sm:text-sm ${isActiveRow ? 'text-purple-700' : 'text-gray-700'}`}>{info.label}</span>
                            {info.subtitle && <span className="text-[11px] text-gray-500 sm:text-xs">{info.subtitle}</span>}
                        </div>
                        {serialValue && <span className="text-xs font-medium text-green-600">✓</span>}
                    </div>
                    {isActiveRow && <span className="text-xs font-semibold text-purple-600">Scanning</span>}
                </div>

                {/* Product Name */}
                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 sm:px-3">
                    <span className="truncate text-xs text-gray-600 sm:text-sm">{formData.product_name || 'Product'}</span>
                </div>

                {/* Serial Input */}
                <div className="flex w-full items-center gap-2 sm:flex-1">
                    <input
                        ref={(el) => (inputRefs.current[entryIndex] = el)}
                        type="text"
                        value={serialValue}
                        onChange={(e) => handleSerialChange(entryIndex, 'serial_number', e.target.value)}
                        placeholder={`Enter Serial/IMEI for ${info.label}`}
                        className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs focus:border-purple-500 focus:ring-2 focus:ring-purple-500 sm:px-3 sm:text-sm"
                    />
                    <button
                        type="button"
                        onClick={() => openScanner(entryIndex)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-100"
                        title="Scan this Serial/IMEI"
                    >
                        <Camera className="h-4 w-4" />
                    </button>
                </div>

                {/* Notes Field */}
                <input
                    type="text"
                    value={notesValue}
                    onChange={(e) => handleSerialChange(entryIndex, 'notes', e.target.value)}
                    placeholder="Notes (optional)"
                    className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs focus:border-purple-500 focus:ring-2 focus:ring-purple-500 sm:w-40 sm:px-3 sm:text-sm"
                />
            </div>
        );
    };

    const currentScanDescriptor = entryCount > 0 ? getSerialDescriptor(currentScanIndex) : '';

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
                        <h3 className="text-lg font-semibold text-gray-900">Serial/IMEI Numbers</h3>
                        <p className="text-sm text-gray-600">
                            Scan or enter Serial/IMEI values for tracking (Total: {displayUnitCount} {hasVariants ? 'units across variants' : 'units'})
                        </p>
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
                            <span className="block text-sm font-medium text-gray-900 sm:text-base">Use same Serial/IMEI for all products</span>
                            <p className="text-xs text-gray-600 sm:text-sm">
                                One Serial/IMEI will be applied to all {displayUnitCount} {hasVariants ? 'units across variants' : 'units'}
                            </p>
                            {hasVariants && (
                                <p className="text-[11px] text-purple-700 sm:text-xs">
                                    Includes {variantCount} {variantCount === 1 ? 'variant' : 'variants'}
                                </p>
                            )}
                            {displayUnitCount === 0 && <p className="text-[11px] text-purple-600 sm:text-xs">Add stock quantities to enable Serial/IMEI assignment.</p>}
                        </div>
                    </label>
                </div>

                {/* Scanner Button */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => openScanner()}
                        disabled={entryCount <= 0}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6 sm:py-3 sm:text-base"
                    >
                        <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="truncate">{entryCount <= 0 ? 'Set quantity to enable scanner' : useSingleSerial ? 'Scan Serial/IMEI' : 'Scan Serial/IMEI'}</span>
                    </button>
                </div>

                {hasVariants && <div className=" p-3 sm:p-4">{entryCount === 0 && <p className="mt-2 text-xs text-blue-700">Add stock quantities above to generate Serial/IMEI slots.</p>}</div>}

                {/* Serial Input Fields */}
                <div className="space-y-3">
                    {useSingleSerial ? (
                        // Single Serial Input
                        <div className="rounded-lg border border-gray-300 bg-white p-3 sm:p-4">
                            <div className="mb-2">
                                <label className="text-xs font-medium text-gray-700 sm:text-sm">Serial/IMEI (for all {displayUnitCount} units)</label>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 sm:px-3">
                                    <span className="truncate text-xs text-gray-600 sm:text-sm">{formData.product_name || 'Product'}</span>
                                </div>
                                <div className="flex w-full items-center gap-2 sm:flex-1">
                                    <input
                                        ref={(el) => (inputRefs.current[0] = el)}
                                        type="text"
                                        value={productSerials[0]?.serial_number || ''}
                                        onChange={(e) => handleSingleSerialChange('serial_number', e.target.value)}
                                        placeholder="Enter or scan Serial/IMEI"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => openScanner(0)}
                                        disabled={entryCount <= 0}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-600 transition-colors hover:border-purple-300 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        title="Scan Serial/IMEI"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={productSerials[0]?.notes || ''}
                                    onChange={(e) => handleSingleSerialChange('notes', e.target.value)}
                                    placeholder="Notes (optional)"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 sm:w-48"
                                />
                            </div>
                        </div>
                    ) : // Multiple Serial Inputs
                    entryCount === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-center text-xs text-gray-500">
                            Set product quantity or variant stock to assign Serial/IMEI values.
                        </div>
                    ) : hasVariants ? (
                        <div className="space-y-4">
                            {productStocks.map((_, variantIndex) => {
                                const variantName = getVariantBaseName(variantIndex) || `Variant #${variantIndex + 1}`;
                                const unitTotal = variantUnitCounts[variantIndex] || 0;
                                const indices = variantSerialGroups.byVariant[variantIndex] || [];
                                const filledCount = indices.reduce((count, entryIndex) => {
                                    return count + (productSerials[entryIndex]?.serial_number?.trim() ? 1 : 0);
                                }, 0);
                                const isExpanded = expandedVariantGroups[variantIndex] !== false;

                                return (
                                    <div key={variantIndex} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedVariantGroups((prev) => {
                                                    const current = prev[variantIndex];
                                                    const nextValue = !(current ?? true);
                                                    return { ...prev, [variantIndex]: nextValue };
                                                })
                                            }
                                            className="flex w-full items-center justify-between gap-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 text-left"
                                        >
                                            <div className="flex flex-col">
                                                <h4 className="text-sm font-semibold text-gray-900 sm:text-base">{variantName}</h4>
                                                <p className="text-xs text-gray-600 sm:text-sm">
                                                    {unitTotal} unit{unitTotal === 1 ? '' : 's'} • {filledCount} filled
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-medium text-purple-600 sm:text-sm">
                                                    Variant {variantIndex + 1} of {variantCount}
                                                </span>
                                                {isExpanded ? <ChevronUp className="h-4 w-4 text-purple-600" /> : <ChevronDown className="h-4 w-4 text-purple-600" />}
                                            </div>
                                        </button>
                                        {isExpanded && (
                                            <div className="max-h-72 space-y-2 overflow-y-auto px-2 py-3 sm:px-3">
                                                {indices.length === 0 ? (
                                                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-center text-xs text-gray-500">
                                                        Set a stock quantity for this variant to enable Serial/IMEI inputs.
                                                    </div>
                                                ) : (
                                                    indices.map((entryIndex) => renderSerialRow(entryIndex))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {variantSerialGroups.unassigned.length > 0 && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50">
                                    <button type="button" onClick={() => setShowUnassigned((prev) => !prev)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                                        <div>
                                            <h4 className="text-sm font-semibold text-amber-900 sm:text-base">Unassigned Units</h4>
                                            <p className="text-xs text-amber-800 sm:text-sm">These units are not linked to a specific variant.</p>
                                        </div>
                                        {showUnassigned ? <ChevronUp className="h-4 w-4 text-amber-700" /> : <ChevronDown className="h-4 w-4 text-amber-700" />}
                                    </button>
                                    {showUnassigned && (
                                        <div className="max-h-64 space-y-2 overflow-y-auto border-t border-amber-200 bg-white p-2 sm:p-3">
                                            {variantSerialGroups.unassigned.map((entryIndex) => renderSerialRow(entryIndex))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 sm:p-4">
                            {Array.from({ length: entryCount }).map((_, index) => renderSerialRow(index))}
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
                                    {useSingleSerial
                                        ? 'Scan Serial/IMEI'
                                        : isSingleScanMode
                                        ? `Scan Serial/IMEI for ${currentScanDescriptor}`
                                        : `Scanning Serial/IMEI #${currentScanIndex + 1} of ${entryCount}`}
                                </h3>
                                {!useSingleSerial && entryCount > 0 && !isSingleScanMode && (
                                    <div className="mt-2">
                                        {(() => {
                                            const filledCount = productSerials.filter((s) => s.serial_number?.trim() !== '').length;
                                            const progressPercent = entryCount > 0 ? Math.round((filledCount / entryCount) * 100) : 0;
                                            return (
                                                <>
                                                    <div className="flex items-center justify-between text-xs text-gray-600 sm:text-sm">
                                                        <span>
                                                            Progress: {filledCount} / {entryCount}
                                                        </span>
                                                        <span className="font-medium text-purple-600">{progressPercent}%</span>
                                                    </div>
                                                    <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                                                        <div
                                                            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                                                            style={{ width: `${progressPercent}%` }}
                                                        ></div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                            <div id="serial-qr-reader" className="overflow-hidden rounded-lg" style={{ border: 'none' }}></div>
                            <p className="mt-2 text-center text-xs text-gray-600 sm:mt-3 sm:text-sm">
                                {useSingleSerial
                                    ? 'Point camera at QR code or barcode'
                                    : isSingleScanMode
                                    ? `Scan code for ${currentScanDescriptor}`
                                    : `Scan code for Serial/IMEI #${currentScanIndex + 1}`}
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
