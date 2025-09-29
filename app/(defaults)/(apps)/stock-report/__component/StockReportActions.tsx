'use client';
import React from 'react';
import { RefreshCcw, Printer, Download } from 'lucide-react';

const StockReportActions = ({ onRefresh, onDownloadPDF, onPrint }) => {
    return (
        <div className="mb-6 flex gap-2">
            <button onClick={onRefresh} className="flex items-center gap-1 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                <RefreshCcw size={16} />
                Refresh
            </button>
            <button onClick={onDownloadPDF} className="flex items-center gap-1 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                <Download size={16} />
                Download PDF
            </button>
            <button onClick={onPrint} className="flex items-center gap-1 rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800">
                <Printer size={16} />
                Print
            </button>
        </div>
    );
};

export default StockReportActions;
