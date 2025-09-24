'use client';

import jsPDF from 'jspdf';
import { useState } from 'react';

export default function QrCodeTable({ qrCodes }) {
    const [paperSize, setPaperSize] = useState('a4');
    const [selectedQrCodes, setSelectedQrCodes] = useState([]);

    // Handle select all QR codes
    const toggleSelectAllQr = (checked) => {
        if (checked) {
            setSelectedQrCodes(qrCodes.map((q) => q.productId));
        } else {
            setSelectedQrCodes([]);
        }
    };

    // Handle individual QR code selection
    const toggleSelectQr = (productId) => {
        setSelectedQrCodes((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
    };

    // PDF Generation for selected QR codes
    const handleGeneratePdf = async () => {
        const selectedCodes = qrCodes.filter((q) => selectedQrCodes.includes(q.productId));

        if (selectedCodes.length === 0) {
            alert('Please select at least one QR code to generate PDF');
            return;
        }

        const pdf = new jsPDF('p', 'mm', paperSize);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        let x = 10;
        let y = 20;
        const cellSize = 50;
        const margin = 10;
        const perRow = 3;

        for (const item of selectedCodes) {
            // Add product title
            pdf.setFontSize(14);
            pdf.text(`${item.product_name} (x${item.quantity})`, 10, y);
            y += 15;

            // Convert QR code to PNG
            const pngData = await new Promise((resolve) => {
                const img = new Image();
                img.src = item.qrcode;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = () => resolve('');
            });

            // Add QR codes based on quantity
            for (let i = 0; i < item.quantity; i++) {
                // Check if we need a new page
                if (y + cellSize > pageHeight - 10) {
                    pdf.addPage();
                    x = 10;
                    y = 20;
                }

                // Add QR code image
                pdf.addImage(pngData, 'PNG', x, y, cellSize, cellSize);

                // Add SKU text below QR code
                pdf.setFontSize(8);
                pdf.text(item.sku, x + cellSize / 2, y + cellSize + 8, { align: 'center' });

                x += cellSize + margin;

                // Move to next row if we've reached the per-row limit
                if ((i + 1) % perRow === 0) {
                    x = 10;
                    y += cellSize + margin + 10; // extra space for SKU text
                }
            }

            // Reset position for next product
            if (x !== 10) {
                x = 10;
                y += cellSize + margin + 10;
            }

            // Add some space between different products
            y += 10;

            // Check if we need a new page for the next product
            if (y > pageHeight - 80) {
                pdf.addPage();
                y = 20;
            }
        }

        pdf.save(`qrcodes-${paperSize}-${new Date().getTime()}.pdf`);
    };

    // Generate PDF for all QR codes
    const handleGenerateAllPdf = async () => {
        if (qrCodes.length === 0) {
            alert('No QR codes available to generate PDF');
            return;
        }

        const pdf = new jsPDF('p', 'mm', paperSize);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        let x = 10;
        let y = 20;
        const cellSize = 50;
        const margin = 10;
        const perRow = 3;

        for (const item of qrCodes) {
            // Add product title
            pdf.setFontSize(14);
            pdf.text(`${item.product_name} (x${item.quantity})`, 10, y);
            y += 15;

            // Convert QR code to PNG
            const pngData = await new Promise((resolve) => {
                const img = new Image();
                img.src = item.qrcode;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = () => resolve('');
            });

            // Add QR codes based on quantity
            for (let i = 0; i < item.quantity; i++) {
                if (y + cellSize > pageHeight - 10) {
                    pdf.addPage();
                    x = 10;
                    y = 20;
                }

                pdf.addImage(pngData, 'PNG', x, y, cellSize, cellSize);

                // Add SKU text below QR code
                pdf.setFontSize(8);
                pdf.text(item.sku, x + cellSize / 2, y + cellSize + 8, { align: 'center' });

                x += cellSize + margin;

                if ((i + 1) % perRow === 0) {
                    x = 10;
                    y += cellSize + margin + 10;
                }
            }

            if (x !== 10) {
                x = 10;
                y += cellSize + margin + 10;
            }

            y += 10;

            if (y > pageHeight - 80) {
                pdf.addPage();
                y = 20;
            }
        }

        pdf.save(`all-qrcodes-${paperSize}-${new Date().getTime()}.pdf`);
    };

    if (!qrCodes.length) {
        return (
            <div className="rounded border border-gray-200 bg-gray-50 p-8 text-center">
                <div className="mb-2 text-gray-500">No QR Codes generated yet</div>
                <div className="text-sm text-gray-400">Set quantity &gt; 0 for products and generate QR codes</div>
            </div>
        );
    }

    const allSelected = qrCodes.length > 0 && qrCodes.every((q) => selectedQrCodes.includes(q.productId));

    return (
        <div className="space-y-4">
            {/* Header with controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h5 className="text-lg font-semibold text-gray-800">QR Codes</h5>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">{qrCodes.length} items</span>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Paper Size:</label>
                    <select value={paperSize} onChange={(e) => setPaperSize(e.target.value)} className="rounded border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none">
                        <optgroup label="">
                            <option value="a0">A0 (841×1189 mm)</option>
                            <option value="a1">A1 (594×841 mm)</option>
                            <option value="a2">A2 (420×594 mm)</option>
                            <option value="a3">A3 (297×420 mm)</option>
                            <option value="a4">A4 (210×297 mm)</option>
                            <option value="a5">A5 (148×210 mm)</option>
                        </optgroup>
                        <optgroup label="">
                            <option value="letter">Letter (8.5×11 in)</option>
                            <option value="legal">Legal (8.5×14 in)</option>
                            <option value="tabloid">Tabloid (11×17 in)</option>
                        </optgroup>
                        <optgroup label="">
                            <option value="executive">Executive (7.25×10.5 in)</option>
                            <option value="folio">Folio (8.27×13 in)</option>
                        </optgroup>
                    </select>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
                <button
                    className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    onClick={handleGeneratePdf}
                    disabled={selectedQrCodes.length === 0}
                >
                    Generate PDF ({selectedQrCodes.length} selected)
                </button>
                <button className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700" onClick={handleGenerateAllPdf}>
                    Generate All PDF
                </button>
            </div>

            {/* QR Codes Table */}
            <div className="overflow-x-auto rounded border border-gray-200">
                <table className="w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left">
                                <input type="checkbox" checked={allSelected} onChange={(e) => toggleSelectAllQr(e.target.checked)} className="rounded" />
                            </th>
                            <th className="p-3 text-left font-semibold text-gray-700">Product Name</th>
                            <th className="p-3 text-left font-semibold text-gray-700">SKU</th>
                            <th className="p-3 text-left font-semibold text-gray-700">QR Quantity</th>
                            <th className="p-3 text-left font-semibold text-gray-700">QR Preview</th>
                        </tr>
                    </thead>
                    <tbody>
                        {qrCodes.map((q) => (
                            <tr key={q.productId} className="border-b transition-colors hover:bg-gray-50">
                                <td className="p-3">
                                    <input type="checkbox" checked={selectedQrCodes.includes(q.productId)} onChange={() => toggleSelectQr(q.productId)} className="rounded" />
                                </td>
                                <td className="p-3 font-medium text-gray-800">{q.product_name}</td>
                                <td className="p-3 font-mono text-sm text-gray-600">{q.sku}</td>
                                <td className="p-3">
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">{q.quantity}</span>
                                </td>
                                <td className="p-3">
                                    <img src={q.qrcode} alt={`QR Code for ${q.product_name}`} className="h-16 w-16 rounded border border-gray-200 shadow-sm" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="rounded bg-blue-50 p-3 text-sm text-blue-700">
                <strong>Summary:</strong> {selectedQrCodes.length} of {qrCodes.length} QR codes selected for PDF generation with {paperSize.toUpperCase()} paper size.
            </div>
        </div>
    );
}
