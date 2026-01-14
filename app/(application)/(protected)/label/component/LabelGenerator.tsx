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
    width: number;
    height: number;
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
    { value: 'a4', label: 'A4 (210×297 mm)', width: 210, height: 297 },
    { value: 'letter', label: 'Letter (8.5×11 in)', width: 215.9, height: 279.4 },
];

const LabelGenerator = () => {
    const dispatch = useDispatch();
    const { currentStore } = useCurrentStore();
    const cartItems = useSelector((state: RootState) => state.label.items);
    const [generateBarcodes, { isLoading: isGeneratingBarcode }] = useGenerateBarCodesMutation();
    const [generateQRCodes, { isLoading: isGeneratingQR }] = useGenerateQRCodesMutation();

    const [labelType, setLabelType] = useState<LabelType>('barcode');
    const generatedLabels = useSelector((state: RootState) => state.label.generatedLabels);

    // Paper & Label Size Settings with localStorage persistence
    const [paperSize, setPaperSize] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('labelPaperSize') || 'a4';
        }
        return 'a4';
    });
    const [labelSize, setLabelSize] = useState<LabelSize>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('labelSize');
            return saved ? JSON.parse(saved) : { width: 250, height: 120 };
        }
        return { width: 250, height: 120 };
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
        dispatch(removeLabelItem(itemId));
        setProductQuantities((prev) => {
            const newMap = new Map(prev);
            newMap.delete(itemId);
            return newMap;
        });
    };

    const handleClearAll = () => {
        dispatch(clearLabelItems());
        setProductQuantities(new Map());
        dispatch(clearGeneratedLabels());
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
                    dispatch(setGeneratedLabels(response.data.barcodes || []));
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
                    dispatch(setGeneratedLabels(qrLabels));
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
        const labelsPerRow = Math.floor((selectedPaper.width - 20) / (labelSize.width * 0.264583)); // Convert px to mm

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Labels - ${currentStore?.store_name || 'Store'}</title>
                <style>
                    @page {
                        size: ${selectedPaper.value === 'a4' ? 'A4' : 'letter'};
                        margin: 10mm;
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: white;
                        padding: 5mm;
                    }
                    
                    .page-container {
                        width: 100%;
                    }
                    
                    .label-grid {
                        display: grid;
                        grid-template-columns: repeat(${Math.max(labelsPerRow, 1)}, minmax(0, 1fr));
                        gap: 4mm;
                        width: 100%;
                    }
                    
                    .label-card {
                        width: ${labelSize.width}px;
                        height: ${labelSize.height}px;
                        border: 1.5px solid #e0e0e0;
                        padding: 8px;
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
                        font-size: 11px;
                        font-weight: 700;
                        color: #1a1a1a;
                        margin-bottom: 4px;
                        line-height: 1.2;
                        max-height: none;
                        overflow: visible;
                        width: 100%;
                        word-wrap: break-word;
                        white-space: normal;
                    }
                    
                    .variant {
                        font-size: 10px;
                        color: #666;
                        margin-bottom: 3px;
                        font-weight: 500;
                    }
                    
                    .sku {
                        font-size: 10px;
                        font-weight: 700;
                        color: #2563eb;
                        margin-bottom: 6px;
                        letter-spacing: 0.3px;
                    }
                    
                    .label-card img {
                        max-width: calc(100% - 8px);
                        max-height: ${labelSize.height - 70}px;
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
                        ${generatedLabels
                            .map(
                                (label) => `
                            <div class="label-card">
                                <h3>${label.product_name || 'Product'}</h3>
                                ${label.variant_name ? `<p class="variant">${label.variant_name}</p>` : ''}
                                <p class="sku">SKU: ${label.sku || 'N/A'}</p>
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
        if (generatedLabels.length === 0) {
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
        if (generatedLabels.length === 0) {
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
        <div className="flex h-full flex-col bg-white">
            {/* Compact Header */}
            <div className="border-b bg-gray-50 px-3 py-3 md:px-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 md:text-lg">Label Generator</h2>
                            <p className="text-xs text-gray-600">
                                {cartItems.length} product{cartItems.length !== 1 ? 's' : ''} • {totalLabels} label{totalLabels !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Label Type Toggle */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setLabelType('barcode')}
                                className={`rounded px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                                    labelType === 'barcode' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Barcode
                            </button>
                            <button
                                onClick={() => setLabelType('qrcode')}
                                className={`rounded px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                                    labelType === 'qrcode' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                QR Code
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={handleClearAll} className="rounded bg-red-50 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 sm:px-3 sm:text-sm">
                            <Trash2 className="inline h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Clear All</span>
                        </button>

                        <button onClick={() => setShowSettings(!showSettings)} className="rounded bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 sm:px-3 sm:text-sm">
                            <Settings2 className="inline h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">{showSettings ? 'Hide' : 'Label'} Settings</span>
                        </button>
                    </div>
                </div>

                {/* Label Size Settings Panel */}
                {showSettings && (
                    <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-4">
                        <h3 className="mb-3 text-sm font-bold text-gray-900">Label & Paper Settings</h3>

                        {/* Quick Presets */}
                        <div className="mb-4">
                            <label className="mb-2 block text-xs font-semibold text-gray-700">Quick Presets</label>
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                <button onClick={() => saveLabelSize({ width: 150, height: 80 })} className="rounded border border-gray-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50">
                                    Small Sticker
                                    <br />
                                    150×80
                                </button>
                                <button onClick={() => saveLabelSize({ width: 250, height: 120 })} className="rounded border border-gray-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50">
                                    Standard
                                    <br />
                                    250×120
                                </button>
                                <button onClick={() => saveLabelSize({ width: 400, height: 200 })} className="rounded border border-gray-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50">
                                    Large Tag
                                    <br />
                                    400×200
                                </button>
                                <button onClick={() => saveLabelSize({ width: 300, height: 150 })} className="rounded border border-gray-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50">
                                    Wide Label
                                    <br />
                                    300×150
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-700">Paper Size</label>
                                <select value={paperSize} onChange={(e) => savePaperSize(e.target.value)} className="w-full rounded border px-3 py-1.5 text-sm">
                                    {PAPER_SIZES.map((size) => (
                                        <option key={size.value} value={size.value}>
                                            {size.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-700">Custom Width (px)</label>
                                <input
                                    type="number"
                                    min="100"
                                    max="800"
                                    value={labelSize.width}
                                    onChange={(e) => saveLabelSize({ ...labelSize, width: parseInt(e.target.value) || 250 })}
                                    className="w-full rounded border px-3 py-1.5 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-700">Custom Height (px)</label>
                                <input
                                    type="number"
                                    min="80"
                                    max="600"
                                    value={labelSize.height}
                                    onChange={(e) => saveLabelSize({ ...labelSize, height: parseInt(e.target.value) || 120 })}
                                    className="w-full rounded border px-3 py-1.5 text-sm"
                                />
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                            📏 Current: {labelSize.width}×{labelSize.height}px • 📄 Paper: {PAPER_SIZES.find((p) => p.value === paperSize)?.label} • 🏷️ Per Row: ~
                            {Math.floor((PAPER_SIZES.find((p) => p.value === paperSize)?.width || 210 - 20) / (labelSize.width * 0.264583))}
                        </p>
                    </div>
                )}

                {/* Global Settings */}
                <div className="mt-3 flex flex-col gap-3 rounded bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-700">Default Qty:</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={globalQuantity}
                            onChange={(e) => saveGlobalQuantity(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 100))}
                            className="w-16 rounded border px-2 py-1 text-sm font-semibold"
                        />
                    </div>

                    {labelType === 'barcode' ? (
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-700">Type:</label>
                            <select value={globalBarcodeType} onChange={(e) => saveGlobalBarcodeType(e.target.value)} className="rounded border px-2 py-1 text-xs sm:text-sm">
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
                                <label className="text-xs font-semibold text-gray-700">Size:</label>
                                <select value={globalQRSize} onChange={(e) => saveGlobalQRSize(parseInt(e.target.value))} className="rounded border px-2 py-1 text-xs sm:text-sm">
                                    <option value={100}>Small (100px)</option>
                                    <option value={150}>Medium (150px)</option>
                                    <option value={200}>Large (200px)</option>
                                    <option value={300}>XL (300px)</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-2 text-xs">
                                <input type="checkbox" checked={globalIncludeInfo} onChange={(e) => saveGlobalIncludeInfo(e.target.checked)} className="rounded" />
                                <span className="font-semibold text-gray-700">Include Product Info</span>
                            </label>
                        </>
                    )}
                </div>
            </div>

            {/* Compact Product List */}
            <div className="flex-1 overflow-auto p-3 md:p-4">
                <div className="mb-4 rounded-lg bg-blue-50 p-3 text-center text-sm text-blue-800">
                    Ready to generate <strong className="font-bold">{totalLabels}</strong> label{totalLabels !== 1 ? 's' : ''} for {cartItems.length} product{cartItems.length !== 1 ? 's' : ''}
                </div>
                <div className="space-y-2">
                    {cartItems.map((item) => {
                        const qty = getProductQuantity(item.id);
                        return (
                            <div key={item.id} className="flex items-center gap-2 rounded border bg-gray-50 p-2 hover:bg-gray-100 sm:gap-3 sm:p-3">
                                <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                </button>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
                                        <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">{item.title}</h3>
                                        {(item as any).variant_name && <span className="text-xs text-gray-600">({(item as any).variant_name})</span>}
                                    </div>
                                    {(item as any).sku && <p className="text-xs text-gray-600">SKU: {(item as any).sku}</p>}
                                </div>

                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        onClick={() => updateProductQuantity(item.id, qty - 1)}
                                        disabled={qty <= 1}
                                        className="flex h-7 w-7 items-center justify-center rounded border bg-white hover:bg-gray-100 disabled:opacity-50 sm:h-8 sm:w-8"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={qty}
                                        onChange={(e) => updateProductQuantity(item.id, parseInt(e.target.value) || 1)}
                                        className="w-12 rounded border px-1 py-1 text-center text-sm font-semibold sm:w-14 sm:px-2"
                                    />
                                    <button
                                        onClick={() => updateProductQuantity(item.id, qty + 1)}
                                        disabled={qty >= 100}
                                        className="flex h-7 w-7 items-center justify-center rounded border bg-white hover:bg-gray-100 disabled:opacity-50 sm:h-8 sm:w-8"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t bg-gray-50 p-3 md:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="text-xs text-gray-700 sm:text-sm"></div>

                    <div className="flex flex-wrap gap-2">
                        {generatedLabels.length > 0 && (
                            <>
                                <button
                                    onClick={handleDownloadImages}
                                    className="flex items-center gap-1 rounded bg-gray-600 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700 sm:gap-2 sm:px-4 sm:text-sm"
                                >
                                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Images ({generatedLabels.length})</span>
                                    <span className="sm:hidden">IMG</span>
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="flex items-center gap-1 rounded bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 sm:gap-2 sm:px-4 sm:text-sm"
                                >
                                    <FileDown className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Download PDF</span>
                                    <span className="sm:hidden">PDF</span>
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 sm:gap-2 sm:px-4 sm:text-sm"
                                >
                                    <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Print</span>
                                    <span className="sm:hidden">Print</span>
                                </button>
                            </>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="flex items-center gap-1 rounded bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50 sm:gap-2 sm:px-6 sm:text-sm"
                        >
                            {isGenerating ? (
                                <>
                                    <svg className="h-3 w-3 animate-spin sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <span className="hidden sm:inline">Generating...</span>
                                    <span className="sm:hidden">Gen...</span>
                                </>
                            ) : (
                                <>
                                    <span className="hidden sm:inline">Generate {labelType === 'barcode' ? 'Barcodes' : 'QR Codes'}</span>
                                    <span className="sm:hidden">Generate</span>
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
