'use client';

import IconX from '@/components/icon/icon-x';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState, useRef } from 'react';

export default function BrCodeTable({ brCodes }) {
    const [codes, setCodes] = useState(brCodes.map((c) => ({ ...c, showPreview: true })));
    const previewRef = useRef();

    const removeCode = (index) => setCodes(codes.filter((_, i) => i !== index));
    const togglePreview = (index) => {
        const newCodes = codes.map((c, i) => (i === index ? { ...c, showPreview: !c.showPreview } : c));
        setCodes(newCodes);
    };

    const renderBarCodes = (code) => {
        return Array.from({ length: code.quantity }).map((_, i) => (
            <div key={i} className="p-2 text-center">
                <img src={code.barcode} alt="Bar Code" className="mx-auto h-[100px] w-[100px] rounded border" />
                <p className="text-sm">{code.product_name}</p>
                <p className="text-xs">SKU: {code.sku}</p>
            </div>
        ));
    };

    const downloadPDF = async () => {
        if (!previewRef.current) return;

        const canvas = await html2canvas(previewRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190;
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, 0);
        pdf.save('bar-codes.pdf');
    };

    if (!codes || codes.length === 0) {
        return <div className="p-4 text-gray-500">No Bar Codes generated yet</div>;
    }

    return (
        <div className="panel mt-6">
            <h2 className="mb-4 text-lg font-semibold">Generated Bar Codes</h2>

            {/* Table */}
            <div className="table-responsive mb-6">
                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-100 text-left dark:bg-[#1b2e4b]">
                            <th className="border p-2">Product Name</th>
                            <th className="border p-2">SKU</th>
                            <th className="border p-2">Quantity</th>
                            <th className="border p-2">Bar Code</th>
                            <th className="border p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {codes.map((code, index) => (
                            <tr key={index}>
                                <td className="border p-2">{code.product_name}</td>
                                <td className="border p-2">{code.sku}</td>
                                <td className="border p-2">{code.quantity}</td>
                                <td className="border p-2">
                                    <img src={code.barcode} alt="Bar Code" className="mx-auto h-[100px] w-[100px] rounded border" />
                                </td>
                                <td className="flex gap-2 border p-2">
                                    <button className="text-red-500" onClick={() => removeCode(index)}>
                                        <IconX />
                                    </button>
                                    {/* <button onClick={() => togglePreview(index)} className="rounded bg-blue-500 px-2 py-1 text-white">
                                        {code.showPreview ? 'Close Preview' : 'Preview'}
                                    </button> */}
                                    <button onClick={() => togglePreview(index)} className="rounded bg-blue-500 px-2 py-1 text-white">
                                        {codes[index].showPreview ? 'Close Preview' : 'Preview'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Preview Grid */}
            {/* <div ref={previewRef}>
                {codes
                    .filter((c) => c.showPreview)
                    .map((code, index) => (
                        <div key={index} className="mb-4 grid grid-cols-4 gap-4 rounded border p-4">
                            {renderBarCodes(code)}
                        </div>
                    ))}
            </div> */}

            <div ref={previewRef}>
                {codes.map(
                    (code, index) =>
                        code.showPreview && (
                            <div key={index} className="mb-4 grid grid-cols-4 gap-4 rounded border p-4">
                                {renderBarCodes(code)}
                            </div>
                        )
                )}
            </div>

            {/* PDF button */}
            <div className="mt-2 flex gap-4">
                <button onClick={downloadPDF} className="rounded bg-green-500 px-4 py-2 text-white">
                    Download PDF
                </button>
            </div>
        </div>
    );
}
