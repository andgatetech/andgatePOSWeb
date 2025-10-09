'use client';

import { useGenerateBarcodesMutation, useGenerateQRCodesMutation } from '@/store/features/Product/productApi';
import { jsPDF } from 'jspdf';
import { BarcodeIcon, Download, Package, Printer, QrCode, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const CODE_TYPES = {
    barcode: ['C128', 'EAN13', 'C39'],
};

const PAPER_SIZES = [
    { id: 'a4', name: 'A4 (210×297 mm)' },
    { id: 'a5', name: 'A5 (148×210 mm)' },
    { id: 'a6', name: 'A6 (105×148 mm)' },
];

const CodeGeneratorPanel = ({ activeTab, setActiveTab, selectedProducts, onProductRemove, onQuantityChange, onClearAll }) => {
    const [generateBarcodes] = useGenerateBarcodesMutation();
    const [generateQRCodes] = useGenerateQRCodesMutation();
    const [config, setConfig] = useState({
        codeType: 'C128',
        paperSize: 'a4',
        imageWidth: 60,
        imageHeight: 60,
    });

    const [generatedCodes, setGeneratedCodes] = useState([]);
    const [loading, setLoading] = useState(false);

    const totalCodes = selectedProducts.reduce((sum, p) => sum + (p.quantity || 1), 0);
    useEffect(() => {
        setGeneratedCodes([]);
        setLoading(false);
    }, [activeTab]);

    // ✅ Generate QR/Barcode
    // const onGenerate = async () => {
    // if (selectedProducts.length === 0) return;
    // setLoading(true);

    // try {
    // const payload = selectedProducts.map((p) => ({
    // id: p.id,
    // quantity: p.quantity || 1,
    // product_code: p.product_code || p.sku,
    // ...(activeTab === 'barcode' && { type: config.codeType }),
    // }));

    // const response = activeTab === 'qrcode' ? await generateQRCodes(payload).unwrap() : await generateBarcodes(payload).unwrap();

    // setGeneratedCodes(response.codes || []);
    // toast.success(`${activeTab === 'qrcode' ? 'QR Codes' : 'Barcodes'} generated successfully! ✅`);
    // } catch (error) {
    // toast.error('Failed to generate codes ❌');
    // } finally {
    // setLoading(false);
    // }
    // };

    const safeToast = {
        success: (msg) => {
            if (typeof window !== 'undefined') {
                requestAnimationFrame(() => toast.success(msg));
            }
        },
        error: (msg) => {
            if (typeof window !== 'undefined') {
                requestAnimationFrame(() => toast.error(msg));
            }
        },
        info: (msg) => {
            if (typeof window !== 'undefined') {
                requestAnimationFrame(() => toast.info(msg));
            }
        },
    };

    const onGenerate = async () => {
        if (selectedProducts.length === 0) return;

        setLoading(true);
        try {
            const payload = selectedProducts.map((p) => ({
                id: p.id,
                quantity: p.quantity || 1,
                product_code: p.product_code || p.sku,
                ...(activeTab === 'barcode' && { type: config.codeType }),
            }));

            console.log('Payload:', payload);

            const response = activeTab === 'qrcode' ? await generateQRCodes(payload).unwrap() : await generateBarcodes(payload).unwrap();

            if (response && Array.isArray(response.codes)) {
                setGeneratedCodes(response.codes);

                // ✅ Safe toast (no DOM crash)
                safeToast.success(`${activeTab === 'qrcode' ? 'QR Codes' : 'Barcodes'} generated successfully! ✅`);
            } else {
                console.error('Invalid response:', response);
                safeToast.error('Invalid response from server ❌');
            }
        } catch (error) {
            console.error(error);
            safeToast.error('Failed to generate codes ❌');
        } finally {
            // ✅ React-safe delay
            requestAnimationFrame(() => setLoading(false));
        }
    };

    // ✅ Download PDF with layout + paper size
    const handleDownloadPDF = async () => {
        if (generatedCodes.length === 0) return;

        // Paper size mapping for jsPDF
        const paperSizes = {
            a4: [210, 297],
            a5: [148, 210],
            a6: [105, 148],
        };

        const selectedPaper = config.paperSize === 'custom' ? [config.customWidth || 210, config.customLength || 297] : paperSizes[config.paperSize] || paperSizes.a4;

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: selectedPaper,
        });

        const margin = 10;
        const gap = 5;
        const imgW = config.imageWidth * 0.264583; // convert px → mm
        const imgH = config.imageHeight * 0.264583;
        const pageW = selectedPaper[0];
        const pageH = selectedPaper[1];

        let x = margin;
        let y = margin;
        const maxPerRow = Math.floor((pageW - margin * 2) / (imgW + gap));

        for (let i = 0; i < generatedCodes.length; i++) {
            const item = generatedCodes[i];
            const imgBlob = await fetch(item.url)
                .then((r) => r.blob())
                .then((b) => URL.createObjectURL(b));

            const img = new Image();
            img.src = imgBlob;
            await new Promise((res) => (img.onload = res));

            pdf.addImage(img, 'PNG', x, y, imgW, imgH);
            pdf.setFontSize(9);
            pdf.text(item.product_name, x, y + imgH + 5);
            pdf.text(item.product_code, x, y + imgH + 9);

            x += imgW + gap;

            // Next row
            if ((i + 1) % maxPerRow === 0) {
                x = margin;
                y += imgH + 20;
            }

            // Next page
            if (y + imgH + 15 > pageH) {
                pdf.addPage();
                x = margin;
                y = margin;
            }
        }

        pdf.save(`${activeTab}_codes.pdf`);
        toast.success('PDF downloaded successfully! 📄');
    };

    // ✅ Safe Print Function (No DOM Error)
    const handlePrint = () => {
        if (generatedCodes.length === 0) return;

        const columns = 4;
        const itemWidth = `${config.imageWidth + 40}px`;

        const content = generatedCodes
            .map(
                (item) => `
<div style="width:${itemWidth}; text-align:center; margin:10px;">
<img src="${item.url}" style="max-width:100%; height:${config.imageHeight}px; object-fit:contain;" />
<p style="margin:4px 0 0;font-size:12px;">${item.product_name}</p>
<p style="margin:0;font-size:10px;color:gray;">${item.product_code}</p>
</div>
`
            )
            .join('');

        const html = `
<html>
<head>
<title>Print ${activeTab === 'qrcode' ? 'QR Codes' : 'Barcodes'}</title>
<style>
body {
font-family: Arial, sans-serif;
display: flex;
flex-wrap: wrap;
justify-content: center;
padding: 20px;
}
@media print {
body { gap: 5px; }
div { page-break-inside: avoid; }
}
</style>
</head>
<body>${content}</body>
</html>
`;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        // ✅ wait for images & DOM to load before print
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 500);
        };
    };

    return (
        <div className="flex h-full flex-col rounded-lg border bg-white shadow-sm">
            {/* Tabs */}
            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab('qrcode')}
                    className={`relative flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'qrcode' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <QrCode className="h-5 w-5" />
                        QR Code
                    </div>
                    {activeTab === 'qrcode' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />}
                </button>
                <button
                    onClick={() => setActiveTab('barcode')}
                    className={`relative flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'barcode' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <BarcodeIcon className="h-5 w-5" />
                        Barcode
                    </div>
                    {activeTab === 'barcode' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600" />}
                </button>
            </div>

            {/* Configurations */}
            <div className="space-y-4 border-b bg-gray-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Configuration Settings</h3>

                {activeTab === 'barcode' && (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Barcode Type</label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
                            value={config.codeType}
                            onChange={(e) => setConfig({ ...config, codeType: e.target.value })}
                        >
                            {CODE_TYPES.barcode.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Paper Size</label>
                    <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        value={config.paperSize}
                        onChange={(e) => setConfig({ ...config, paperSize: e.target.value })}
                    >
                        {[...PAPER_SIZES, { id: 'custom', name: 'Custom Size' }].map((size) => (
                            <option key={size.id} value={size.id}>
                                {size.name}
                            </option>
                        ))}
                    </select>

                    {/* ✅ Show custom fields when user selects Custom Size */}
                    {config.paperSize === 'custom' && (
                        <div className="mt-4 grid grid-cols-3 gap-4">
                            <div>
                                <label className="mb-1 block text-sm text-gray-700">Length</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 210"
                                    value={config.customLength || ''}
                                    onChange={(e) => setConfig({ ...config, customLength: parseFloat(e.target.value) || 0 })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-gray-700">Width</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 297"
                                    value={config.customWidth || ''}
                                    onChange={(e) => setConfig({ ...config, customWidth: parseFloat(e.target.value) || 0 })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-gray-700">Unit</label>
                                <select
                                    value={config.customUnit || 'mm'}
                                    onChange={(e) => setConfig({ ...config, customUnit: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="mm">mm</option>
                                    <option value="cm">cm</option>
                                    <option value="inch">inch</option>
                                    <option value="m">meter</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">{activeTab === 'qrcode' ? 'QR Code Size' : 'Barcode Size'}</label>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Width (px)</label>
                            <input
                                type="number"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                value={config.imageWidth}
                                onChange={(e) => setConfig({ ...config, imageWidth: parseInt(e.target.value) || 100 })}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Height (px)</label>
                            <input
                                type="number"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                value={config.imageHeight}
                                onChange={(e) => setConfig({ ...config, imageHeight: parseInt(e.target.value) || 100 })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Product list */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Selected Products ({selectedProducts.length})</h3>
                    {selectedProducts.length > 0 && (
                        <button onClick={onClearAll} className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100">
                            <Trash2 className="h-4 w-4" />
                            Clear All
                        </button>
                    )}
                </div>

                {selectedProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <Package className="mb-3 h-16 w-16 text-gray-300" />
                        <p className="text-lg font-medium">No products selected</p>
                        <p className="text-sm">Select products from the left panel</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {selectedProducts.map((product) => (
                            <div
                                key={product.product_code}
                                className="flex items-center justify-between rounded-xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 p-4 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="flex flex-col">
                                    <h4 className="text-base font-semibold leading-tight text-gray-800">{product.product_name}</h4>
                                    <p className="text-[12px] text-gray-500">Code: {product.product_code}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <label className="text-sm font-medium text-gray-700">Qty:</label>
                                        <input
                                            type="number"
                                            value={product.quantity}
                                            onChange={(e) => onQuantityChange(product.product_code, parseInt(e.target.value))}
                                            className="w-20 rounded-lg border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => onProductRemove(product.product_code)}
                                    className="rounded-full bg-red-50 p-2 text-red-600 transition-all hover:bg-red-100"
                                    title="Remove product"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Generate & Actions - Fixed at bottom */}
            <div className="border-t bg-gray-50">
                <div className="space-y-3 p-6">
                    <button
                        onClick={onGenerate}
                        disabled={selectedProducts.length === 0 || loading}
                        className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all ${
                            selectedProducts.length === 0 || loading
                                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                                : activeTab === 'qrcode'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        {loading ? (
                            <>Generating...</>
                        ) : activeTab === 'qrcode' ? (
                            <>
                                <QrCode className="h-5 w-5" /> Generate QR Codes ({totalCodes})
                            </>
                        ) : (
                            <>
                                <BarcodeIcon className="h-5 w-5" /> Generate Barcodes ({totalCodes})
                            </>
                        )}
                    </button>

                    {generatedCodes.length > 0 && (
                        <div className="flex items-center justify-center gap-3">
                            <button onClick={handleDownloadPDF} className="flex items-center gap-2 rounded-md bg-blue-100 px-4 py-2 text-blue-700 transition-all hover:bg-blue-200">
                                <Download className="h-4 w-4" /> Download PDF
                            </button>
                            <button onClick={handlePrint} className="flex items-center gap-2 rounded-md bg-green-100 px-4 py-2 text-green-700 transition-all hover:bg-green-200">
                                <Printer className="h-4 w-4" /> Print
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodeGeneratorPanel;
