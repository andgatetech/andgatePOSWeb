'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import Loader from '@/lib/Loader';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import type { RootState } from '@/store';
import { clearGeneratedLabels, clearLabelItems, removeLabelItem, setGeneratedLabels } from '@/store/features/Label/labelSlice';
import { useGenerateBarCodesMutation, useGenerateQRCodesMutation } from '@/store/features/Product/productApi';
import { Box, FileDown, Minus, Plus, Printer, ScanLine, Settings2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EmptyLabelState from './EmptyLabelState';

// NOTE: Ensure 'jspdf' is installed: npm install jspdf

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
    { value: 'thermal_40mm', label: '🖨️ Thermal 40mm Roll', width: 40, height: 200, isThermal: true },
    { value: 'thermal_50mm', label: '🖨️ Thermal 50mm Roll', width: 50, height: 200, isThermal: true },
    { value: 'thermal_80mm', label: '🖨️ Thermal 80mm Roll', width: 80, height: 200, isThermal: true },
    { value: 'a4', label: 'A4 (210×297mm)', width: 210, height: 297, isThermal: false },
    { value: 'letter', label: 'Letter (8.5×11in)', width: 215.9, height: 279.4, isThermal: false },
    { value: 'custom', label: 'Custom Paper Size', width: 0, height: 0, isThermal: false },
];

const PRESETS = [
    { label: '⭐ 1.5" x 1"', width: 38, height: 25 },
    { label: 'Tiny', width: 20, height: 10 },
    { label: 'Small', width: 30, height: 20 },
    { label: 'Medium', width: 50, height: 30 },
    { label: 'Large', width: 70, height: 40 },
];

const LabelGenerator = () => {
    const dispatch = useDispatch();
    const { currentStore, currentStoreId } = useCurrentStore();
    const cartItems = useSelector((state: RootState) => (currentStoreId && state.label.itemsByStore ? state.label.itemsByStore[currentStoreId] || [] : []));
    const [generateBarcodes, { isLoading: isGeneratingBarcode }] = useGenerateBarCodesMutation();
    const [generateQRCodes, { isLoading: isGeneratingQR }] = useGenerateQRCodesMutation();

    const [labelType, setLabelType] = useState<LabelType>('barcode');
    const generatedLabels = useSelector((state: RootState) => (currentStoreId && state.label.generatedLabelsByStore ? state.label.generatedLabelsByStore[currentStoreId] || [] : []));

    // --- State (initialize with defaults to avoid hydration mismatch) ---
    const [paperSize, setPaperSize] = useState('thermal_40mm');
    const [labelSize, setLabelSize] = useState<LabelSize>({ width: 38, height: 25 });
    const [customPaperDims, setCustomPaperDims] = useState({ width: 40, height: 200 });

    // Tracks if "Custom" preset is active to show inputs
    const [isCustomLabel, setIsCustomLabel] = useState(false);

    const [showSettings, setShowSettings] = useState(false);
    const [globalQuantity, setGlobalQuantity] = useState(1);
    const [globalBarcodeType, setGlobalBarcodeType] = useState('C128');
    const [globalQRSize, setGlobalQRSize] = useState(200);
    const [globalIncludeInfo, setGlobalIncludeInfo] = useState(false);

    const [productQuantities, setProductQuantities] = useState<Map<number, number>>(new Map());

    useEffect(() => {
        const currentItemIds = new Set(cartItems.map((item) => item.id));
        setProductQuantities((prev) => {
            const newMap = new Map(prev);
            Array.from(newMap.keys()).forEach((itemId) => {
                if (!currentItemIds.has(itemId)) newMap.delete(itemId);
            });
            return newMap;
        });
    }, [cartItems]);

    // --- Helpers ---
    const getProductQuantity = (itemId: number) => productQuantities.get(itemId) ?? globalQuantity;
    const updateProductQuantity = (itemId: number, q: number) => setProductQuantities((prev) => new Map(prev).set(itemId, Math.min(Math.max(q, 1), 100)));

    const handleRemoveItem = (id: number) => {
        if (currentStoreId) dispatch(removeLabelItem({ storeId: currentStoreId, id }));
    };
    const handleClearAll = () => {
        if (currentStoreId) {
            dispatch(clearLabelItems(currentStoreId));
            dispatch(clearGeneratedLabels(currentStoreId));
            setProductQuantities(new Map());
        }
    };

    // --- Generation Logic ---
    const handleGenerate = async () => {
        if (cartItems.length === 0) {
            showErrorDialog('No Products', 'Please add products');
            return;
        }
        try {
            const pos_products = cartItems.map((item) => ({
                product_id: item.productId,
                product_stock_id: item.stockId || undefined,
                quantity: getProductQuantity(item.id),
                type: globalBarcodeType,
                size: globalQRSize,
                include_product_info: globalIncludeInfo,
            }));

            let response = labelType === 'barcode' ? await generateBarcodes(pos_products).unwrap() : await generateQRCodes(pos_products).unwrap();

            if (response.success) {
                const rawLabels = response.data.barcodes || response.data.qr_codes || response.data.qrcodes || [];
                const labels = rawLabels.map((l: any) => ({
                    ...l,
                    // Map the image data: QR API may return qr_code, qrcode, or image field
                    barcode: l.barcode || l.qr_code || l.qrcode || l.image || '',
                }));
                if (currentStoreId) dispatch(setGeneratedLabels({ storeId: currentStoreId, labels }));
                showSuccessDialog('Success!', `${response.data.total_generated} labels generated`);
            }
        } catch (error: any) {
            showErrorDialog('Error', error?.data?.message || 'Failed to generate');
        }
    };

    // --- HTML/PDF Logic ---
    const generatePrintHTML = () => {
        let selectedPaper = PAPER_SIZES.find((p) => p.value === paperSize) || PAPER_SIZES[0];
        let paperWidth = selectedPaper.width;
        let paperHeight = selectedPaper.height;
        if (paperSize === 'custom') {
            paperWidth = customPaperDims.width;
            paperHeight = customPaperDims.height;
        }

        const isSheet = paperWidth > labelSize.width + 10;
        const labelsPerRow = isSheet ? Math.floor((paperWidth - 6) / (labelSize.width + 2)) : 1;
        const pageSize = isSheet ? `${paperWidth}mm ${paperHeight}mm` : `${labelSize.width}mm ${labelSize.height}mm`;

        const styles = `
            @page { size: ${pageSize}; margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: white; font-family: Arial, sans-serif; }
            .label-card {
                width: ${labelSize.width}mm;
                height: ${labelSize.height}mm;
                padding: 1.5mm;
                background: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start; 
                text-align: center;
                border: 1px solid transparent;
                page-break-inside: avoid;
                overflow: hidden;
            }
            @media print { .label-card { border: ${isSheet ? '0.1mm dashed #ddd' : 'none'}; } }
            h3 { font-size: 8pt; font-weight: 700; margin: 0 0 1px 0; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .variant, .sku { font-size: 6pt; font-weight: 600; margin: 0; }
            .barcode-container { width: 100%; display: flex; justify-content: center; align-items: center; max-height: 45%; margin-top: 1mm; }
            .barcode-container img { max-width: 100%; height: auto; max-height: 100%; object-fit: contain; }
            .qr-container { width: 100%; display: flex; justify-content: center; align-items: center; max-height: 50%; margin-top: 1mm; overflow: hidden; }
            .qr-container img { max-width: 50%; max-height: 100%; aspect-ratio: 1/1; object-fit: contain; image-rendering: pixelated; }
            .break-page { page-break-after: always; }
            .page-container { width: 100%; padding: 5mm; display: grid; grid-template-columns: repeat(${Math.max(labelsPerRow, 1)}, ${labelSize.width}mm); gap: 2mm; }
        `;

        const isQR = labelType === 'qrcode';
        const containerClass = isQR ? 'qr-container' : 'barcode-container';

        const content = generatedLabels
            .map(
                (l) => `
            <div class="label-card ${!isSheet ? 'break-page' : ''}">
                <div style="width:100%">
                    <h3>${l.product_name || 'Product'}</h3>
                    ${l.variant_name ? `<div class="variant">${l.variant_name}</div>` : ''}
                    <div class="sku">${l.sku || 'N/A'}</div>
                </div>
                <div class="${containerClass}">${l.barcode ? `<img src="${l.barcode}"/>` : ''}</div>
            </div>
        `
            )
            .join('');

        return `<html><head><style>${styles}</style></head><body>${!isSheet ? content : `<div class="page-container">${content}</div>`}</body></html>`;
    };

    const handlePrint = () => {
        if (!generatedLabels.length) return showErrorDialog('No Labels', 'Generate first');
        const win = window.open('', '_blank', 'width=800,height=600');
        if (win) {
            win.document.write(generatePrintHTML());
            win.document.close();
            win.onload = () => {
                setTimeout(() => win.print(), 250);
            };
        }
    };

    // Helper: Convert any image data URI (SVG, PNG, JPEG) to a PNG data URL via canvas
    const convertImageToPng = (dataUri: string, size: number = 400): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Canvas not supported');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, size, size);
                ctx.drawImage(img, 0, 0, size, size);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => reject('Failed to load image');
            img.src = dataUri;
        });
    };

    const handleDownloadPDF = async () => {
        if (!generatedLabels.length) {
            showErrorDialog('No Labels', 'Please generate labels first');
            return;
        }
        try {
            const { jsPDF } = await import('jspdf');
            let selectedPaper = PAPER_SIZES.find((p) => p.value === paperSize) || PAPER_SIZES[0];
            let paperWidth = selectedPaper.width;
            let paperHeight = selectedPaper.height;
            if (paperSize === 'custom') {
                paperWidth = customPaperDims.width;
                paperHeight = customPaperDims.height;
            }

            const isSheet = paperWidth > labelSize.width + 10;
            const pdfWidth = isSheet ? paperWidth : labelSize.width;
            const pdfHeight = isSheet ? paperHeight : labelSize.height;

            const doc = new jsPDF({
                orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [pdfWidth, pdfHeight],
            });

            const margin = isSheet ? 5 : 0;
            const gap = 2;
            const cols = isSheet ? Math.floor((pdfWidth - margin * 2) / (labelSize.width + gap)) : 1;
            const rows = isSheet ? Math.floor((pdfHeight - margin * 2) / (labelSize.height + gap)) : 1;
            const itemsPerPage = cols * rows;

            // Pre-convert all images to PNG for jsPDF compatibility (SVG not supported by jsPDF)
            const isQRLabel = labelType === 'qrcode';
            const convertedImages: (string | null)[] = [];
            for (const label of generatedLabels) {
                if (label.barcode) {
                    try {
                        // If it's SVG or any non-PNG/JPEG, convert to PNG via canvas
                        if (label.barcode.includes('data:image/svg') || isQRLabel) {
                            const pngData = await convertImageToPng(label.barcode, 400);
                            convertedImages.push(pngData);
                        } else {
                            convertedImages.push(label.barcode);
                        }
                    } catch {
                        convertedImages.push(null);
                    }
                } else {
                    convertedImages.push(null);
                }
            }

            for (let i = 0; i < generatedLabels.length; i++) {
                const label = generatedLabels[i];
                if (isSheet) {
                    if (i > 0 && i % itemsPerPage === 0) doc.addPage();
                } else {
                    if (i > 0) doc.addPage([pdfWidth, pdfHeight]);
                }

                let xPos, yPos;
                if (isSheet) {
                    const idx = i % itemsPerPage;
                    xPos = margin + (idx % cols) * (labelSize.width + gap);
                    yPos = margin + Math.floor(idx / cols) * (labelSize.height + gap);
                } else {
                    xPos = 0;
                    yPos = 0;
                }

                const centerX = xPos + labelSize.width / 2;
                let currentY = yPos + 3;

                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text((label.product_name || 'Product').substring(0, 35), centerX, currentY, { align: 'center', maxWidth: labelSize.width - 2 });
                currentY += 3;

                if (label.variant_name) {
                    doc.setFontSize(6);
                    doc.setFont('helvetica', 'normal');
                    doc.text(label.variant_name, centerX, currentY, { align: 'center' });
                    currentY += 2.5;
                }

                doc.setFontSize(6);
                doc.setFont('helvetica', 'bold');
                doc.text(label.sku || 'N/A', centerX, currentY, { align: 'center' });

                const imgData = convertedImages[i];
                if (imgData) {
                    // Detect format from the converted data
                    const imgFormat = imgData.includes('data:image/png') ? 'PNG' : 'JPEG';

                    let imgWidth, imgHeight, imgX, imgY;

                    if (isQRLabel) {
                        // QR codes are square - fit within available space
                        const availableHeight = labelSize.height * 0.55;
                        const availableWidth = labelSize.width - 4;
                        const qrSize = Math.min(availableWidth, availableHeight);
                        imgWidth = qrSize;
                        imgHeight = qrSize;
                        imgX = xPos + (labelSize.width - qrSize) / 2;
                        imgY = yPos + labelSize.height - qrSize - 1;
                    } else {
                        // Barcodes are wide and short
                        imgHeight = labelSize.height * 0.4;
                        imgWidth = labelSize.width - 4;
                        imgX = xPos + 2;
                        imgY = yPos + labelSize.height - imgHeight - 1;
                    }

                    try {
                        doc.addImage(imgData, imgFormat, imgX, imgY, imgWidth, imgHeight, undefined, 'FAST');
                    } catch (e) {
                        console.error('Failed to add image to PDF:', e);
                    }
                }
                if (isSheet) {
                    doc.setDrawColor(220, 220, 220);
                    doc.rect(xPos, yPos, labelSize.width, labelSize.height);
                }
            }
            doc.save(`labels-${currentStore?.store_name || 'store'}.pdf`);
            showSuccessDialog('Success!', 'PDF downloaded');
        } catch (error) {
            console.error(error);
            showErrorDialog('Error', 'Failed to generate PDF');
        }
    };

    if (cartItems.length === 0) return <EmptyLabelState />;

    const isGenerating = isGeneratingBarcode || isGeneratingQR;
    const totalLabels = cartItems.reduce((sum, item) => sum + getProductQuantity(item.id), 0);

    return (
        <div className="relative flex h-full flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            {isGenerating && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <Loader fullScreen={false} message={labelType === 'barcode' ? 'Generating Barcodes...' : 'Generating QR Codes...'} />
                </div>
            )}

            <div className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Label Generator</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            {cartItems.length} product(s) • {totalLabels} label(s)
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-blue-600 hover:to-blue-700"
                        >
                            <Settings2 className="mr-2 inline h-4 w-4" /> {showSettings ? 'Hide' : 'Show'} Settings
                        </button>
                        <button onClick={handleClearAll} className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
                            <Trash2 className="mr-2 inline h-4 w-4" /> Clear All
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => setLabelType('barcode')}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                            labelType === 'barcode' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'border border-gray-300 bg-white text-gray-700'
                        }`}
                    >
                        Barcode
                    </button>
                    <button
                        onClick={() => setLabelType('qrcode')}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                            labelType === 'qrcode' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' : 'border border-gray-300 bg-white text-gray-700'
                        }`}
                    >
                        QR Code
                    </button>
                </div>

                {showSettings && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* LEFT SIDE: PAPER & PRESETS */}
                            <div>
                                <h3 className="mb-4 text-base font-bold text-gray-900">Label Size & Presets</h3>

                                <div className="mb-4">
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                        {PRESETS.map((preset) => (
                                            <button
                                                key={preset.label}
                                                onClick={() => {
                                                    setLabelSize({ width: preset.width, height: preset.height });
                                                    setIsCustomLabel(false);
                                                }}
                                                className={`rounded-lg border-2 px-3 py-2.5 text-xs font-semibold transition-all ${
                                                    labelSize.width === preset.width && labelSize.height === preset.height && !isCustomLabel
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 bg-white hover:border-blue-300'
                                                }`}
                                            >
                                                {preset.label}
                                                <br />
                                                <span className="text-gray-500">
                                                    {preset.width}x{preset.height}mm
                                                </span>
                                            </button>
                                        ))}
                                        {/* CUSTOM BUTTON */}
                                        <button
                                            onClick={() => setIsCustomLabel(true)}
                                            className={`rounded-lg border-2 px-3 py-2.5 text-xs font-semibold transition-all ${
                                                isCustomLabel ? 'border-blue-600 bg-blue-100 text-blue-900' : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                                            }`}
                                        >
                                            <Settings2 className="mr-1 inline h-3 w-3" /> Custom
                                            <br />
                                            <span className="text-gray-500">Edit Size</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Custom Label Inputs (Conditional) */}
                                {isCustomLabel && (
                                    <div className="animate-in fade-in slide-in-from-top-2 mb-4 grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-gray-700">Width (mm)</label>
                                            <input
                                                type="number"
                                                min="10"
                                                max="200"
                                                value={labelSize.width}
                                                onChange={(e) => setLabelSize({ ...labelSize, width: parseInt(e.target.value) || 10 })}
                                                className="w-full rounded border px-2 py-1.5 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-gray-700">Height (mm)</label>
                                            <input
                                                type="number"
                                                min="10"
                                                max="150"
                                                value={labelSize.height}
                                                onChange={(e) => setLabelSize({ ...labelSize, height: parseInt(e.target.value) || 10 })}
                                                className="w-full rounded border px-2 py-1.5 text-sm"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-gray-100 pt-4">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Paper Size</label>
                                    <select value={paperSize} onChange={(e) => setPaperSize(e.target.value)} className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm">
                                        {PAPER_SIZES.map((size) => (
                                            <option key={size.value} value={size.value}>
                                                {size.label}
                                            </option>
                                        ))}
                                    </select>
                                    {paperSize === 'custom' && (
                                        <div className="mt-2 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-2">
                                            <div>
                                                <label className="text-xs">Page W (mm)</label>
                                                <input
                                                    type="number"
                                                    value={customPaperDims.width}
                                                    onChange={(e) => setCustomPaperDims({ ...customPaperDims, width: parseInt(e.target.value) || 0 })}
                                                    className="w-full rounded border px-2 py-1 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs">Page H (mm)</label>
                                                <input
                                                    type="number"
                                                    value={customPaperDims.height}
                                                    onChange={(e) => setCustomPaperDims({ ...customPaperDims, height: parseInt(e.target.value) || 0 })}
                                                    className="w-full rounded border px-2 py-1 text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT SIDE: VISUAL PREVIEW */}
                            <div className="relative flex flex-col items-center justify-center overflow-visible rounded-xl border border-gray-200 bg-gray-100 p-6">
                                <h4 className="absolute left-4 top-3 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                                    <ScanLine className="h-3 w-3" /> Live Preview
                                </h4>

                                {/* Scale 1mm = 4px for visibility, limited max */}
                                <div className="relative mt-4">
                                    {/* WIDTH INDICATOR */}
                                    <div className="absolute -top-6 left-0 flex w-full flex-col items-center">
                                        <span className="mb-0.5 font-mono text-xs text-gray-500">{labelSize.width}mm</span>
                                        <div className="relative h-px w-full bg-gray-400">
                                            <div className="absolute left-0 top-1/2 h-2 w-px -translate-y-1/2 bg-gray-400"></div>
                                            <div className="absolute right-0 top-1/2 h-2 w-px -translate-y-1/2 bg-gray-400"></div>
                                        </div>
                                    </div>

                                    {/* HEIGHT INDICATOR */}
                                    <div className="absolute -right-6 top-0 flex h-full flex-row items-center">
                                        <div className="relative h-full w-px bg-gray-400">
                                            <div className="absolute left-1/2 top-0 h-px w-2 -translate-x-1/2 bg-gray-400"></div>
                                            <div className="absolute bottom-0 left-1/2 h-px w-2 -translate-x-1/2 bg-gray-400"></div>
                                        </div>
                                        <span className="ml-1 rotate-90 whitespace-nowrap font-mono text-xs text-gray-500">{labelSize.height}mm</span>
                                    </div>

                                    {/* THE LABEL BOX */}
                                    <div
                                        className="relative flex flex-col items-center justify-center border border-gray-300 bg-white p-1 text-center shadow-md transition-all duration-300"
                                        style={{
                                            width: `${labelSize.width * 4}px`,
                                            height: `${labelSize.height * 4}px`,
                                            maxWidth: '180px',
                                            maxHeight: '180px',
                                        }}
                                    >
                                        <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 overflow-hidden opacity-60">
                                            <div className="mb-0.5 h-1.5 w-3/4 rounded-sm bg-gray-800"></div>
                                            <div className="h-1 w-1/2 rounded-sm bg-gray-400"></div>
                                            <div className="flex w-full flex-1 items-end justify-center px-1 pb-0.5">
                                                <div className="flex h-full max-h-[25px] w-full items-end justify-center gap-px">
                                                    {[...Array(10)].map((_, i) => (
                                                        <div key={i} className="h-full bg-black" style={{ width: i % 2 === 0 ? '2px' : '3px', height: `${Math.random() * 40 + 60}%` }}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Global Settings Bar (Bottom) */}
                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <h3 className="mb-3 text-sm font-bold text-gray-900">Content Settings</h3>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Copies:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={globalQuantity}
                                        onChange={(e) => setGlobalQuantity(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 100))}
                                        className="w-20 rounded-lg border-2 border-gray-200 px-3 py-1.5 text-sm font-bold"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Type:</label>
                                    <select
                                        value={labelType === 'barcode' ? globalBarcodeType : globalQRSize}
                                        onChange={(e) => (labelType === 'barcode' ? setGlobalBarcodeType(e.target.value) : setGlobalQRSize(parseInt(e.target.value)))}
                                        className="rounded-lg border-2 border-gray-200 px-3 py-1.5 text-sm"
                                    >
                                        {labelType === 'barcode'
                                            ? BARCODE_TYPES.map((t) => (
                                                  <option key={t.value} value={t.value}>
                                                      {t.label}
                                                  </option>
                                              ))
                                            : [
                                                  { value: 100, label: 'Small' },
                                                  { value: 150, label: 'Medium' },
                                                  { value: 200, label: 'Large' },
                                              ].map((s) => (
                                                  <option key={s.value} value={s.value}>
                                                      {s.label}
                                                  </option>
                                              ))}
                                    </select>
                                </div>
                                {labelType === 'qrcode' && (
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={globalIncludeInfo} onChange={(e) => setGlobalIncludeInfo(e.target.checked)} className="h-4 w-4 rounded" /> Info
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm font-medium text-gray-600">
                        Total: <span className="font-bold text-gray-900">{totalLabels} labels</span> for <span className="font-bold text-gray-900">{cartItems.length} items</span>
                    </div>
                    <div className="flex gap-2">
                        {generatedLabels.length > 0 && (
                            <>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-green-700"
                                >
                                    <FileDown className="h-4 w-4" /> PDF
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700"
                                >
                                    <Printer className="h-4 w-4" /> Print
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-purple-700 disabled:opacity-50"
                        >
                            {isGenerating ? 'Generating...' : 'Generate Labels'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="mx-auto max-w-4xl space-y-4">
                    {cartItems.map((item) => {
                        const qty = getProductQuantity(item.id);
                        return (
                            <div key={item.id} className="flex transform items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                                        <Box className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="truncate text-base font-bold text-gray-900">{item.title}</h3>
                                        <div className="flex gap-2 text-sm text-gray-600">
                                            {(item as any).sku && <span className="rounded bg-gray-100 px-1 font-mono">{(item as any).sku}</span>}
                                            {(item as any).variant_name && <span className="font-medium text-blue-600">{(item as any).variant_name}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
                                        <button onClick={() => updateProductQuantity(item.id, qty - 1)} disabled={qty <= 1} className="rounded p-1 hover:bg-white hover:shadow-sm disabled:opacity-30">
                                            <Minus className="h-4 w-4 text-gray-600" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold">{qty}</span>
                                        <button
                                            onClick={() => updateProductQuantity(item.id, qty + 1)}
                                            disabled={qty >= 100}
                                            className="rounded p-1 hover:bg-white hover:shadow-sm disabled:opacity-30"
                                        >
                                            <Plus className="h-4 w-4 text-gray-600" />
                                        </button>
                                    </div>
                                    <button onClick={() => handleRemoveItem(item.id)} className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LabelGenerator;
