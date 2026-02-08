'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import type { RootState } from '@/store';
import { clearGeneratedLabels, clearLabelItems, removeLabelItem, setGeneratedLabels } from '@/store/features/Label/labelSlice';
import { useGenerateBarCodesMutation, useGenerateQRCodesMutation } from '@/store/features/Product/productApi';
import { Download, FileDown, Minus, Plus, Printer, Settings2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EmptyLabelState from './EmptyLabelState';

type LabelType = 'barcode' | 'qrcode';

interface LabelSize {
    width: number; // in millimeters
    height: number; // in millimeters
}

const BARCODE_TYPES = [
    { value: 'C128', label: 'Code 128' },
    { value: 'C39', label: 'Code 39' },
    { value: 'EAN13', label: 'EAN-13' },
    { value: 'EAN8', label: 'EAN-8' },
    { value: 'UPCA', label: 'UPC-A' },
    { value: 'UPCE', label: 'UPC-E' },
];

const PAPER_SIZES = [
    // Thermal Printer Rolls (most common for POS)
    { value: 'thermal_40mm', label: '🖨️ Thermal 40mm Roll', width: 40, height: 200, isThermal: true },
    { value: 'thermal_50mm', label: '🖨️ Thermal 50mm Roll', width: 50, height: 200, isThermal: true },
    { value: 'thermal_80mm', label: '🖨️ Thermal 80mm Roll', width: 80, height: 200, isThermal: true },
    // Standard Paper (for laser/inkjet printers)
    { value: 'a4', label: 'A4 (210×297mm)', width: 210, height: 297, isThermal: false },
    { value: 'letter', label: 'Letter (8.5×11in)', width: 215.9, height: 279.4, isThermal: false },
];

const LabelGenerator = () => {
    const dispatch = useDispatch();
    const { currentStore, currentStoreId } = useCurrentStore();
    const cartItems = useSelector((state: RootState) => (currentStoreId && state.label.itemsByStore ? state.label.itemsByStore[currentStoreId] || [] : []));
    const [generateBarcodes, { isLoading: isGeneratingBarcode }] = useGenerateBarCodesMutation();
    const [generateQRCodes, { isLoading: isGeneratingQR }] = useGenerateQRCodesMutation();

    const [labelType, setLabelType] = useState<LabelType>('barcode');
    const generatedLabels = useSelector((state: RootState) => (currentStoreId && state.label.generatedLabelsByStore ? state.label.generatedLabelsByStore[currentStoreId] || [] : []));

    // Paper & Label Size Settings with localStorage persistence
    const [paperSize, setPaperSize] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('labelPaperSize') || 'thermal_40mm';
        }
        return 'thermal_40mm';
    });
    const [labelSize, setLabelSize] = useState<LabelSize>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('labelSize');
            return saved ? JSON.parse(saved) : { width: 38, height: 25 };
        }
        return { width: 38, height: 25 };
    });
    const [showSettings, setShowSettings] = useState(false);

    // Global settings with localStorage persistence
    const [globalQuantity, setGlobalQuantity] = useState(() => {
        if (typeof window !== 'undefined') {
            return parseInt(localStorage.getItem('labelGlobalQuantity') || '1');
        }
        return 1;
    });
    const [globalBarcodeType, setGlobalBarcodeType] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('labelBarcodeType') || 'C128';
        }
        return 'C128';
    });
    const [globalQRSize, setGlobalQRSize] = useState(() => {
        if (typeof window !== 'undefined') {
            return parseInt(localStorage.getItem('labelQRSize') || '200');
        }
        return 200;
    });
    const [globalIncludeInfo, setGlobalIncludeInfo] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('labelIncludeInfo') === 'true';
        }
        return false;
    });

    // Individual quantities override
    const [productQuantities, setProductQuantities] = useState<Map<number, number>>(new Map());

    // Clean up stale product quantities when cart items change
    useEffect(() => {
        const currentItemIds = new Set(cartItems.map((item) => item.id));
        setProductQuantities((prev) => {
            const newMap = new Map(prev);
            // Remove quantities for items no longer in cart
            Array.from(newMap.keys()).forEach((itemId) => {
                if (!currentItemIds.has(itemId)) {
                    newMap.delete(itemId);
                }
            });
            return newMap;
        });
    }, [cartItems]);

    const getProductQuantity = (itemId: number) => {
        return productQuantities.get(itemId) ?? globalQuantity;
    };

    const updateProductQuantity = (itemId: number, quantity: number) => {
        const clamped = Math.min(Math.max(quantity, 1), 100);
        setProductQuantities((prev) => new Map(prev).set(itemId, clamped));
    };

    // Save settings to localStorage
    const savePaperSize = (size: string) => {
        setPaperSize(size);
        localStorage.setItem('labelPaperSize', size);
    };

    const saveLabelSize = (size: LabelSize) => {
        setLabelSize(size);
        localStorage.setItem('labelSize', JSON.stringify(size));
    };

    const saveGlobalQuantity = (qty: number) => {
        setGlobalQuantity(qty);
        localStorage.setItem('labelGlobalQuantity', qty.toString());
    };

    const saveGlobalBarcodeType = (type: string) => {
        setGlobalBarcodeType(type);
        localStorage.setItem('labelBarcodeType', type);
    };

    const saveGlobalQRSize = (size: number) => {
        setGlobalQRSize(size);
        localStorage.setItem('labelQRSize', size.toString());
    };

    const saveGlobalIncludeInfo = (include: boolean) => {
        setGlobalIncludeInfo(include);
        localStorage.setItem('labelIncludeInfo', include.toString());
    };

    const handleRemoveItem = (itemId: number) => {
        if (!currentStoreId) return;
        dispatch(removeLabelItem({ storeId: currentStoreId, id: itemId }));
        setProductQuantities((prev) => {
            const newMap = new Map(prev);
            newMap.delete(itemId);
            return newMap;
        });
    };

    const handleClearAll = () => {
        if (!currentStoreId) return;
        dispatch(clearLabelItems(currentStoreId));
        setProductQuantities(new Map());
        dispatch(clearGeneratedLabels(currentStoreId));
    };

    const handleGenerate = async () => {
        if (cartItems.length === 0) {
            showErrorDialog('No Products', 'Please add products to generate labels');
            return;
        }

        try {
            if (labelType === 'barcode') {
                const pos_products = cartItems.map((item) => ({
                    product_id: item.productId,
                    product_stock_id: item.stockId || undefined,
                    quantity: getProductQuantity(item.id),
                    type: globalBarcodeType,
                }));

                const response = await generateBarcodes(pos_products).unwrap();

                if (response.success) {
                    if (currentStoreId) {
                        dispatch(setGeneratedLabels({ storeId: currentStoreId, labels: response.data.barcodes || [] }));
                    }
                    showSuccessDialog('Success!', `${response.data.total_generated} barcodes generated`);
                }
            } else {
                const pos_products = cartItems.map((item) => ({
                    product_id: item.productId,
                    product_stock_id: item.stockId || undefined,
                    quantity: getProductQuantity(item.id),
                    size: globalQRSize,
                    include_product_info: globalIncludeInfo,
                }));

                const response = await generateQRCodes(pos_products).unwrap();

                if (response.success) {
                    // Map QR codes to same structure as barcodes for consistent rendering
                    const qrLabels = (response.data.qr_codes || response.data.barcodes || []).map((label: any) => ({
                        ...label,
                        // Ensure the image is in the 'barcode' field for consistent rendering
                        barcode: label.qr_code || label.qrcode || label.barcode,
                    }));
                    console.log('QR Labels generated:', qrLabels);
                    if (currentStoreId) {
                        dispatch(setGeneratedLabels({ storeId: currentStoreId, labels: qrLabels }));
                    }
                    showSuccessDialog('Success!', `${response.data.total_generated} QR codes generated`);
                }
            }
        } catch (error: any) {
            console.error('Label generation error:', error);
            showErrorDialog('Error', error?.data?.message || 'Failed to generate labels');
        }
    };

    const generatePrintHTML = () => {
        const selectedPaper = PAPER_SIZES.find((p) => p.value === paperSize) || PAPER_SIZES[0];
        const labelsPerRow = Math.floor((selectedPaper.width - 4) / (labelSize.width + 2)); // mm calculation with 2mm gap

        // Determine page size for @page rule
        const pageSize = selectedPaper.value === 'a4' ? 'A4' : selectedPaper.value === 'letter' ? 'letter' : `${selectedPaper.width}mm ${selectedPaper.height}mm`;

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Labels - ${currentStore?.store_name || 'Store'}</title>
                <style>
                    @page {
                        size: ${pageSize};
                        margin: ${selectedPaper.isThermal ? '2mm' : '10mm'};
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: white;
                        padding: ${selectedPaper.isThermal ? '2mm' : '5mm'};
                    }
                    
                    .page-container {
                        width: 100%;
                    }
                    
                    .label-grid {
                        display: grid;
                        grid-template-columns: repeat(${Math.max(labelsPerRow, 1)}, minmax(0, 1fr));
                        gap: 2mm;
                        width: 100%;
                    }
                    
                    .label-card {
                        width: ${labelSize.width}mm;
                        height: ${labelSize.height}mm;
                        border: 0.5mm solid #e0e0e0;
                        padding: 2mm;
                        background: white;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        page-break-inside: avoid;
                        break-inside: avoid;
                        overflow: hidden;
                    }
                    
                    .label-card h3 {
                        font-size: 3mm;
                        font-weight: 700;
                        color: #1a1a1a;
                        margin-bottom: 1mm;
                        line-height: 1.2;
                        max-height: none;
                        overflow: visible;
                        width: 100%;
                        word-wrap: break-word;
                        white-space: normal;
                    }
                    
                    .variant {
                        font-size: 2.5mm;
                        color: #666;
                        margin-bottom: 1mm;
                        font-weight: 500;
                    }
                    
                    .sku {
                        font-size: 2.5mm;
                        font-weight: 700;
                        color: #2563eb;
                        margin-bottom: 1.5mm;
                        letter-spacing: 0.1mm;
                    }
                    
                    .label-card img {
                        max-width: calc(100% - 2mm);
                        max-height: ${labelSize.height - 15}mm;
                        height: auto;
                        width: auto;
                        object-fit: contain;
                        display: block;
                        margin: 0 auto;
                    }
                    
                    .no-image {
                        color: red;
                        font-size: 10px;
                        font-weight: bold;
                    }
                    
                    @media print {
                        body {
                            background: white;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            padding: 0;
                        }
                        
                        .page-container {
                            padding: 0;
                        }
                        
                        .label-grid {
                            gap: 3mm;
                        }
                        
                        .label-card {
                            border: 1px solid #d0d0d0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="page-container">
                    <div class="label-grid">
                        ${(generatedLabels || [])
                            .map(
                                (label) => `
                            <div class="label-card">
                                <h3>${label.product_name || 'Product'}</h3>
                                ${label.variant_name ? `<p class="variant">${label.variant_name}</p>` : ''}
                                <p class="sku"> ${label.sku || 'N/A'}</p>
                                ${
                                    label.barcode
                                        ? `<img src="${label.barcode}" alt="${label.sku || 'label'}" onerror="this.parentElement.innerHTML+='<p class=no-image>Image failed to load</p>'" />`
                                        : '<p class="no-image">No image data</p>'
                                }
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                </div>
            </body>
            </html>
        `;
    };

    const handlePrint = () => {
        if (!generatedLabels || generatedLabels.length === 0) {
            showErrorDialog('No Labels', 'Please generate labels first');
            return;
        }

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(generatePrintHTML());
            printWindow.document.close();

            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            };

            printWindow.onafterprint = () => {
                printWindow.close();
            };
        }
    };

    const handleDownloadPDF = async () => {
        if (!generatedLabels || generatedLabels.length === 0) {
            showErrorDialog('No Labels', 'Please generate labels first');
            return;
        }

        try {
            // Dynamic import of html2pdf
            const html2pdf = (await import('html2pdf.js')).default;

            const selectedPaper = PAPER_SIZES.find((p) => p.value === paperSize) || PAPER_SIZES[0];

            const element = document.createElement('div');
            element.innerHTML = generatePrintHTML();

            const opt = {
                margin: 10,
                filename: `labels-${currentStore?.store_name || 'store'}-${new Date().getTime()}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false,
                },
                jsPDF: {
                    unit: 'mm',
                    format: paperSize === 'a4' ? 'a4' : 'letter',
                    orientation: 'portrait' as const,
                    compress: true,
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            };

            await html2pdf().set(opt).from(element).save();
            showSuccessDialog('Success!', 'PDF downloaded successfully');
        } catch (error) {
            console.error('PDF generation error:', error);
            showErrorDialog('Error', 'Failed to generate PDF. Please try printing instead.');
        }
    };

    const handleDownloadImages = () => {
        if (generatedLabels.length === 0) {
            showErrorDialog('No Labels', 'Please generate labels first');
            return;
        }

        generatedLabels.forEach((label, index) => {
            if (label.barcode) {
                const link = document.createElement('a');
                link.href = label.barcode;
                link.download = `${label.sku || 'label'}-${index + 1}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                console.warn(`Label ${index + 1} has no barcode/QR data:`, label);
            }
        });

        showSuccessDialog('Downloaded!', `${generatedLabels.length} labels downloaded`);
    };

    if (cartItems.length === 0) {
        return <EmptyLabelState />;
    }

    const isGenerating = isGeneratingBarcode || isGeneratingQR;
    const totalLabels = cartItems.reduce((sum, item) => sum + getProductQuantity(item.id), 0);

    return (
        <div className="flex h-full flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Full Screen Loading Overlay */}
            {isGenerating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
                        <p className="mt-4 text-lg font-medium text-gray-700">Generating {labelType === 'barcode' ? 'Barcodes' : 'QR Codes'}...</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Label Generator</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            {cartItems.length} product{cartItems.length !== 1 ? 's' : ''} • {totalLabels} label{totalLabels !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
                        >
                            <Settings2 className="mr-2 inline h-4 w-4" />
                            {showSettings ? 'Hide' : 'Show'} Settings
                        </button>

                        <button
                            onClick={handleClearAll}
                            className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 hover:shadow-md"
                        >
                            <Trash2 className="mr-2 inline h-4 w-4" />
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Label Type Toggle */}
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => setLabelType('barcode')}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none sm:px-6 ${
                            labelType === 'barcode' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        Barcode
                    </button>
                    <button
                        onClick={() => setLabelType('qrcode')}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none sm:px-6 ${
                            labelType === 'qrcode' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        QR Code
                    </button>
                </div>

                {/* Label Size Settings Panel */}
                {showSettings && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <h3 className="mb-4 text-base font-bold text-gray-900">Label & Paper Settings</h3>

                        {/* Quick Presets */}
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Quick Presets</label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                                <button
                                    onClick={() => saveLabelSize({ width: 38, height: 25 })}
                                    className="rounded-lg border-2 border-blue-500 bg-blue-50 px-3 py-2.5 text-xs font-semibold transition-all hover:border-blue-600 hover:bg-blue-100"
                                    title="Most popular retail POS label - Works with thermal printers (Xprinter, Zebra, TSC)"
                                >
                                    <span className="text-blue-600">⭐ 1.5&quot; × 1&quot;</span>
                                    <br />
                                    <span className="text-gray-600">38×25mm</span>
                                </button>
                                <button
                                    onClick={() => saveLabelSize({ width: 20, height: 10 })}
                                    className="rounded-lg border-2 border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold transition-all hover:border-blue-500 hover:bg-blue-50"
                                >
                                    Tiny
                                    <br />
                                    <span className="text-gray-600">20×10mm</span>
                                </button>
                                <button
                                    onClick={() => saveLabelSize({ width: 30, height: 20 })}
                                    className="rounded-lg border-2 border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold transition-all hover:border-blue-500 hover:bg-blue-50"
                                >
                                    Small
                                    <br />
                                    <span className="text-gray-600">30×20mm</span>
                                </button>
                                <button
                                    onClick={() => saveLabelSize({ width: 50, height: 30 })}
                                    className="rounded-lg border-2 border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold transition-all hover:border-blue-500 hover:bg-blue-50"
                                >
                                    Medium
                                    <br />
                                    <span className="text-gray-600">50×30mm</span>
                                </button>
                                <button
                                    onClick={() => saveLabelSize({ width: 70, height: 40 })}
                                    className="rounded-lg border-2 border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold transition-all hover:border-blue-500 hover:bg-blue-50"
                                >
                                    Large
                                    <br />
                                    <span className="text-gray-600">70×40mm</span>
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="mb-3 text-sm font-bold text-gray-900">Custom Label Size</h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Paper Size</label>
                                    <select
                                        value={paperSize}
                                        onChange={(e) => savePaperSize(e.target.value)}
                                        className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-all focus:border-blue-500 focus:outline-none"
                                    >
                                        {PAPER_SIZES.map((size) => (
                                            <option key={size.value} value={size.value}>
                                                {size.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Width (millimeters)
                                        <span className="ml-1 text-xs font-normal text-gray-500">≈ {(labelSize.width / 25.4).toFixed(2)}&quot;</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="200"
                                        step="1"
                                        value={labelSize.width}
                                        onChange={(e) => saveLabelSize({ ...labelSize, width: parseInt(e.target.value) || 38 })}
                                        className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-all focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., 38"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">10-200mm range</p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Height (millimeters)
                                        <span className="ml-1 text-xs font-normal text-gray-500">≈ {(labelSize.height / 25.4).toFixed(2)}&quot;</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="150"
                                        step="1"
                                        value={labelSize.height}
                                        onChange={(e) => saveLabelSize({ ...labelSize, height: parseInt(e.target.value) || 25 })}
                                        className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-all focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., 25"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">10-150mm range</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 rounded-lg bg-blue-50 p-3">
                            <p className="text-sm text-blue-800">
                                📏 Current:{' '}
                                <strong>
                                    {labelSize.width}×{labelSize.height}mm
                                </strong>{' '}
                                ({(labelSize.width / 25.4).toFixed(2)}&quot; × {(labelSize.height / 25.4).toFixed(2)}&quot;) • 📄 Paper:{' '}
                                <strong>{PAPER_SIZES.find((p) => p.value === paperSize)?.label}</strong> • 🏷️ Per Row:{' '}
                                <strong>~{Math.floor((PAPER_SIZES.find((p) => p.value === paperSize)?.width || 40) / (labelSize.width + 2))}</strong>
                            </p>
                        </div>
                    </div>
                )}

                {/* Global Settings */}
                <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-bold text-gray-900">Global Settings</h3>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-gray-700">Default Qty:</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={globalQuantity}
                                onChange={(e) => saveGlobalQuantity(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 100))}
                                className="w-20 rounded-lg border-2 border-gray-200 px-3 py-2 text-sm font-semibold transition-all focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {labelType === 'barcode' ? (
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-semibold text-gray-700">Type:</label>
                                <select
                                    value={globalBarcodeType}
                                    onChange={(e) => saveGlobalBarcodeType(e.target.value)}
                                    className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-all focus:border-blue-500 focus:outline-none"
                                >
                                    {BARCODE_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Size:</label>
                                    <select
                                        value={globalQRSize}
                                        onChange={(e) => saveGlobalQRSize(parseInt(e.target.value))}
                                        className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-all focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value={100}>Small (100px)</option>
                                        <option value={150}>Medium (150px)</option>
                                        <option value={200}>Large (200px)</option>
                                        <option value={300}>XL (300px)</option>
                                    </select>
                                </div>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={globalIncludeInfo}
                                        onChange={(e) => saveGlobalIncludeInfo(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="font-semibold text-gray-700">Include Product Info</span>
                                </label>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="mx-auto max-w-4xl space-y-4">
                    {cartItems.map((item) => {
                        const qty = getProductQuantity(item.id);
                        return (
                            <div key={item.id} className="transform rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                                <div className="flex items-center gap-3">
                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-all hover:bg-red-100 hover:shadow-md"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    {/* Product Info */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="truncate text-base font-bold text-gray-900">{item.title}</h3>
                                            {(item as any).variant_name && (
                                                <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">{(item as any).variant_name}</span>
                                            )}
                                            {(item as any).sku && (
                                                <p className="text-sm text-gray-600">
                                                     <span className="font-semibold text-gray-800">{(item as any).sku}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateProductQuantity(item.id, qty - 1)}
                                            disabled={qty <= 1}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-gray-300 bg-white transition-all hover:border-blue-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Minus className="h-4 w-4 text-gray-700" />
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={qty}
                                            onChange={(e) => updateProductQuantity(item.id, parseInt(e.target.value) || 1)}
                                            className="w-16 rounded-lg border-2 border-gray-300 px-3 py-2 text-center text-sm font-bold transition-all focus:border-blue-500 focus:outline-none"
                                        />
                                        <button
                                            onClick={() => updateProductQuantity(item.id, qty + 1)}
                                            disabled={qty >= 100}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-gray-300 bg-white transition-all hover:border-blue-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Plus className="h-4 w-4 text-gray-700" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 bg-white px-4 py-4 shadow-lg sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Summary Info */}
                    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2">
                        <p className="text-sm font-semibold text-gray-700">
                            Ready to generate <span className="font-bold text-blue-600">{totalLabels}</span> label{totalLabels !== 1 ? 's' : ''} for{' '}
                            <span className="font-bold text-purple-600">{cartItems.length}</span> product{cartItems.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {generatedLabels && generatedLabels.length > 0 && (
                            <>
                                <button
                                    onClick={handleDownloadImages}
                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-gray-700 hover:to-gray-800 hover:shadow-lg"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Images ({generatedLabels.length})</span>
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-green-700 hover:to-green-800 hover:shadow-lg"
                                >
                                    <FileDown className="h-4 w-4" />
                                    <span>Download PDF</span>
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                                >
                                    <Printer className="h-4 w-4" />
                                    <span>Print</span>
                                </button>
                            </>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <span>Generate {labelType === 'barcode' ? 'Barcodes' : 'QR Codes'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabelGenerator;
