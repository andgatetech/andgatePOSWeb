'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { Download, Printer, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';

interface PaymentReceiptProps {
    purchaseOrder: any;
    transaction: any;
    onClose: () => void;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ purchaseOrder, transaction, onClose }) => {
    const receiptRef = useRef<HTMLDivElement>(null);
    const { currentStore } = useCurrentStore();
    const { formatCurrency, symbol } = useCurrency();

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const printContent = receiptRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '', 'width=1200,height=800');
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Payment Receipt - ${String(transaction.id).padStart(6, '0')}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: Arial, sans-serif;
                            background: white;
                            padding: 20px;
                        }
                        .receipt-container {
                            position: relative;
                            max-width: 1200px;
                            margin: 0 auto;
                            background: white;
                            overflow: hidden;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            aspect-ratio: 2.4/1;
                        }
                        /* Decorative Elements */
                        .decorative-top-right {
                            position: absolute;
                            right: 0;
                            top: 0;
                            width: 96px;
                            height: 96px;
                            border-radius: 0 0 0 100%;
                            background: linear-gradient(135deg, #fbbf24 0%, #fb923c 100%);
                            opacity: 0.7;
                        }
                        .decorative-bottom-left {
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            width: 64px;
                            height: 64px;
                            border-radius: 0 100% 0 0;
                            background: linear-gradient(45deg, #fde047 0%, #fb923c 100%);
                            opacity: 0.7;
                        }
                        .decorative-bottom-right {
                            position: absolute;
                            bottom: 16px;
                            right: 80px;
                            width: 48px;
                            height: 48px;
                            border-radius: 50%;
                            background: linear-gradient(45deg, #fb923c 0%, #fde047 100%);
                            opacity: 0.5;
                        }
                        .content-wrapper {
                            position: relative;
                            z-index: 10;
                            display: flex;
                            flex-direction: column;
                            height: 100%;
                            padding: 24px;
                        }
                        .header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            margin-bottom: 16px;
                        }
                        .logo-section {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .logo {
                            width: 48px;
                            height: 48px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 8px;
                            background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
                        }
                        .logo-inner {
                            width: 24px;
                            height: 24px;
                            border: 3px solid white;
                            border-radius: 4px;
                        }
                        .store-info h1 {
                            font-size: 20px;
                            font-weight: bold;
                            color: #1f2937;
                            margin-bottom: 2px;
                        }
                        .store-info p {
                            font-size: 11px;
                            color: #6b7280;
                            line-height: 1.4;
                        }
                        .receipt-number {
                            text-align: right;
                        }
                        .receipt-number p:first-child {
                            font-size: 11px;
                            color: #4b5563;
                            margin-bottom: 4px;
                        }
                        .receipt-number p:last-child {
                            font-size: 24px;
                            font-weight: bold;
                            color: #1f2937;
                        }
                        .main-content {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 24px;
                            flex: 1;
                        }
                        .left-column {
                            display: flex;
                            flex-direction: column;
                            gap: 12px;
                        }
                        .info-row {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .info-label {
                            width: 128px;
                            flex-shrink: 0;
                            font-size: 14px;
                            font-weight: 600;
                            color: #374151;
                        }
                        .info-value {
                            flex: 1;
                            border-bottom: 2px solid #d1d5db;
                            padding: 4px 8px;
                            font-size: 14px;
                            color: #1f2937;
                        }
                        .amount-box {
                            flex: 1;
                            display: flex;
                            align-items: center;
                            border: 1px solid #e5e7eb;
                            background: #f9fafb;
                            border-radius: 4px;
                            padding: 8px 12px;
                        }
                        .amount-box span:first-child {
                            font-size: 18px;
                            font-weight: bold;
                            color: #374151;
                            margin-right: 8px;
                        }
                        .amount-box span:last-child {
                            flex: 1;
                            font-size: 18px;
                            font-weight: bold;
                            color: #1f2937;
                        }
                        .right-column {
                            display: flex;
                            justify-content: space-between;
                        }
                        .payment-details {
                            flex: 1;
                            display: flex;
                            flex-direction: column;
                            gap: 8px;
                        }
                        .balance-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            font-size: 11px;
                        }
                        .balance-row span:first-child {
                            font-weight: 600;
                            color: #374151;
                        }
                        .balance-row .amount {
                            display: flex;
                            align-items: center;
                            gap: 4px;
                        }
                        .balance-row .amount span:last-child {
                            width: 80px;
                            text-align: right;
                        }
                        .payment-methods {
                            display: flex;
                            flex-direction: column;
                            gap: 4px;
                            padding-top: 8px;
                        }
                        .payment-method {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            cursor: pointer;
                        }
                        .payment-method input {
                            width: 12px;
                            height: 12px;
                            accent-color: #ea580c;
                        }
                        .payment-method span {
                            font-size: 11px;
                            color: #374151;
                        }
                        .qr-signature {
                            margin-left: 16px;
                            display: flex;
                            flex-direction: column;
                            align-items: flex-end;
                            justify-content: space-between;
                        }
                        .qr-code {
                            background: white;
                            padding: 4px;
                            border-radius: 4px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .signature {
                            margin-top: 8px;
                            text-align: right;
                        }
                        .signature-line {
                            width: 96px;
                            border-bottom: 2px solid #9ca3af;
                            margin-bottom: 4px;
                        }
                        .signature p {
                            font-size: 11px;
                            color: #6b7280;
                        }
                        .decorative-dots {
                            position: absolute;
                            bottom: 8px;
                            left: 50%;
                            transform: translateX(-50%);
                            display: flex;
                            gap: 6px;
                        }
                        .dot {
                            width: 6px;
                            height: 6px;
                            border-radius: 50%;
                        }
                        .dot-1 { background: #fb923c; }
                        .dot-2 { background: #fbbf24; }
                        .dot-3 { background: #fdba74; }
                        @page {
                            size: landscape;
                            margin: 10mm;
                        }
                        @media print {
                            body { padding: 0; background: white; }
                            .receipt-container { 
                                box-shadow: none;
                                border-radius: 0;
                                max-width: 100%;
                                width: 100%;
                            }
                            * {
                                print-color-adjust: exact;
                                -webkit-print-color-adjust: exact;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        <div class="decorative-top-right"></div>
                        <div class="decorative-bottom-left"></div>
                        <div class="decorative-bottom-right"></div>
                        
                        <div class="content-wrapper">
                            <div class="header">
                                <div class="logo-section">
                                    <div class="logo">
                                        <div class="logo-inner"></div>
                                    </div>
                                    <div class="store-info">
                                        <h1>${currentStore?.store_name || '.................................'}</h1>
                                        <p>Number: ${currentStore?.store_contact || '.........................'}</p>
                                        <p>Address: ${currentStore?.store_location || '.......................'}</p>
                                       
                                    </div>
                                </div>
                                <div class="receipt-number">
                                    <p>Receipt No :</p>
                                    <p>${String(transaction.id).padStart(6, '0')}</p>
                                    <p style="font-size: 11px; color: #4b5563; margin-top: 4px;">Date: ${formatDate(transaction.paid_at)}</p>
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin: 8px 0;">
                                <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; letter-spacing: 3px;">MONEY RECEIPT</h2>
                            </div>
                            
                            <div class="main-content">
                                <div class="left-column">
                                    <div class="info-row">
                                        <span class="info-label">Received from :</span>
                                        <div class="info-value">${purchaseOrder.supplier?.name || 'Walk-in Purchase'}</div>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Amount (Tk) :</span>
                                        <div class="amount-box">
                                            <span>${formatCurrency(transaction.amount)}</span>
                                        </div>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Amount in Word :</span>
                                        <div class="info-value" style="font-size: 11px;">${numberToWords(transaction.amount)}</div>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Payment For :</span>
                                        <div class="info-value">Purchase Order - ${purchaseOrder.invoice_number}</div>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Transaction No :</span>
                                        <div class="info-value">${String(transaction.id).padStart(8, '0')}</div>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Contact No :</span>
                                        <div class="info-value">${purchaseOrder.supplier?.phone || purchaseOrder.supplier?.contact || currentStore?.store_contact || 'N/A'}</div>
                                    </div>
                                    ${
                                        transaction.notes
                                            ? `
                                    <div class="info-row">
                                        <span class="info-label">Notes :</span>
                                        <div class="info-value" style="font-size: 11px; color: #4b5563;">${transaction.notes}</div>
                                    </div>
                                    `
                                            : ''
                                    }
                                </div>
                                
                                <div class="right-column">
                                    <div class="payment-details">
                                        <div class="balance-row">
                                            <span>Amount of Balance:</span>
                                            <div class="amount">
                                                <span>${formatCurrency(purchaseOrder.grand_total)}</span>
                                            </div>
                                        </div>
                                        <div class="balance-row">
                                            <span>Payment Amount:</span>
                                            <div class="amount">
                                                <span>${formatCurrency(transaction.amount)}</span>
                                            </div>
                                        </div>
                                        <div class="balance-row">
                                            <span>Balance Due:</span>
                                            <div class="amount">
                                                <span>${formatCurrency(purchaseOrder.amount_due)}</span>
                                            </div>
                                        </div>
                                        
                                        <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <span style="font-size: 12px; font-weight: 600; color: #374151;">By:</span>
                                                <label class="payment-method">
                                                    <input type="radio" checked disabled>
                                                    <span>${transaction.payment_method.charAt(0).toUpperCase() + transaction.payment_method.slice(1).replace('_', ' ')}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="qr-signature">
                                        <div class="qr-code">
                                            ${printContent.querySelector('svg')?.outerHTML || ''}
                                        </div>
                                        <div class="signature">
                                            <div class="signature-line"></div>
                                            <p>Authorized Signature</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="decorative-dots">
                                <div class="dot dot-1"></div>
                                <div class="dot dot-2"></div>
                                <div class="dot dot-3"></div>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    // Convert number to words
    const numberToWords = (num: number): string => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        if (num === 0) return 'Zero';

        const convertLessThanThousand = (n: number): string => {
            if (n === 0) return '';
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
            return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
        };

        let wholePart = Math.floor(num);
        const decimalPart = Math.round((num - wholePart) * 100);

        let result = '';
        if (wholePart >= 10000000) {
            result += convertLessThanThousand(Math.floor(wholePart / 10000000)) + ' Crore ';
            wholePart %= 10000000;
        }
        if (wholePart >= 100000) {
            result += convertLessThanThousand(Math.floor(wholePart / 100000)) + ' Lakh ';
            wholePart %= 100000;
        }
        if (wholePart >= 1000) {
            result += convertLessThanThousand(Math.floor(wholePart / 1000)) + ' Thousand ';
            wholePart %= 1000;
        }
        if (wholePart > 0) {
            result += convertLessThanThousand(wholePart);
        }

        result = result.trim();
        if (decimalPart > 0) {
            result += ' and ' + decimalPart + '/100';
        }
        return result + ' Taka Only';
    };

    // Generate QR code data with comprehensive transaction info
    const qrData = JSON.stringify({
        receipt_id: transaction.id,
        po_number: purchaseOrder.invoice_number,
        store: currentStore?.store_name,
        supplier: purchaseOrder.supplier?.name,
        amount: transaction.amount,
        payment_method: transaction.payment_method,
        date: transaction.paid_at,
    });

    return (
        <>
            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
                <div className="relative w-full max-w-6xl">
                    {/* Action Buttons */}
                    <div className="mb-6 flex gap-3 print:hidden">
                        <button onClick={handlePrint} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                            <Printer size={18} />
                            Print
                        </button>
                        <button onClick={handleDownload} className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700">
                            <Download size={18} />
                            Download
                        </button>
                        <button onClick={onClose} className="ml-auto flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700">
                            <X size={18} />
                            Close
                        </button>
                    </div>

                    {/* Check/Receipt Container */}
                    <div ref={receiptRef} className="receipt-container relative overflow-hidden rounded-xl bg-white shadow-2xl" style={{ aspectRatio: '2.4/1' }}>
                        {/* Decorative Elements */}
                        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-yellow-400 to-orange-400 opacity-70"></div>
                        <div className="absolute bottom-0 left-0 h-16 w-16 rounded-tr-full bg-gradient-to-tr from-yellow-300 to-orange-300 opacity-70"></div>
                        <div className="absolute bottom-4 right-20 h-12 w-12 rounded-full bg-gradient-to-tr from-orange-300 to-yellow-300 opacity-50"></div>

                        {/* Receipt Content */}
                        <div className="relative z-20 flex h-full flex-col p-6">
                            {/* MONEY RECEIPT Title - Top */}
                            <div className="mb-3 text-center">
                                <h2 className="text-2xl font-bold tracking-widest text-gray-800">MONEY RECEIPT</h2>
                            </div>

                            {/* Header Row */}
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600">
                                        <div className="border-3 h-6 w-6 rounded border-white"></div>
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-800">{currentStore?.store_name || '.................................'}</h1>
                                        <p className="text-xs text-gray-500">Number: {currentStore?.store_contact || '.........................'}</p>
                                        <p className="text-xs text-gray-500">Address: {currentStore?.store_location || '.......................'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="mb-1 text-xs text-gray-600">Receipt No :</p>
                                    <p className="text-2xl font-bold text-gray-800">{String(transaction.id).padStart(6, '0')}</p>
                                    <p className="mt-1 text-xs text-gray-500">Date: {formatDate(transaction.paid_at)}</p>
                                </div>
                            </div>

                            {/* Main Content - Two Columns */}
                            <div className="grid flex-1 grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <label className="w-32 flex-shrink-0 text-sm font-semibold text-gray-700">Received from :</label>
                                        <div className="flex-1 border-b-2 border-gray-300 px-2 py-1 text-sm text-gray-800">{purchaseOrder.supplier?.name || 'Walk-in Purchase'}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="w-32 flex-shrink-0 text-sm font-semibold text-gray-700">Amount (Tk) :</label>
                                        <div className="flex flex-1 items-center rounded border border-gray-200 bg-gray-50 px-3 py-2">
                                            <span className="flex-1 text-lg font-bold text-gray-800">{formatCurrency(transaction.amount)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="w-32 flex-shrink-0 text-sm font-semibold text-gray-700">Amount in Word :</label>
                                        <div className="flex-1 border-b-2 border-gray-300 px-2 py-1 text-xs text-gray-700">{numberToWords(transaction.amount)}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="w-32 flex-shrink-0 text-sm font-semibold text-gray-700">Payment For :</label>
                                        <div className="flex-1 border-b-2 border-gray-300 px-2 py-1 text-sm text-gray-800">Purchase Order - {purchaseOrder.invoice_number}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="w-32 flex-shrink-0 text-sm font-semibold text-gray-700">Transaction No :</label>
                                        <div className="flex-1 border-b-2 border-gray-300 px-2 py-1 text-sm text-gray-800">{String(transaction.id).padStart(8, '0')}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="w-32 flex-shrink-0 text-sm font-semibold text-gray-700">Contact No :</label>
                                        <div className="flex-1 border-b-2 border-gray-300 px-2 py-1 text-sm text-gray-800">
                                            {purchaseOrder.supplier?.phone || purchaseOrder.supplier?.contact || currentStore?.store_contact || 'N/A'}
                                        </div>
                                    </div>

                                    {transaction.notes && (
                                        <div className="flex items-center gap-2">
                                            <label className="w-32 flex-shrink-0 text-sm font-semibold text-gray-700">Notes :</label>
                                            <div className="flex-1 border-b-2 border-gray-300 px-2 py-1 text-xs text-gray-600">{transaction.notes}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column */}
                                <div className="flex justify-between">
                                    {/* Payment Details */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-gray-700">Amount of Balance:</span>
                                            <div className="flex items-center gap-1">
                                                <span className="w-20 text-right">{formatCurrency(purchaseOrder.grand_total)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-gray-700">Payment Amount:</span>
                                            <div className="flex items-center gap-1">
                                                <span className="w-20 text-right">{formatCurrency(transaction.amount)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-gray-700">Balance Due:</span>
                                            <div className="flex items-center gap-1">
                                                <span className="w-20 text-right">{formatCurrency(purchaseOrder.amount_due)}</span>
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div className="mt-3 border-t border-gray-200 pt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-gray-700">By:</span>
                                                <label className="flex cursor-pointer items-center gap-2">
                                                    <input type="radio" checked readOnly className="h-3 w-3 text-orange-600" />
                                                    <span className="text-xs text-gray-700">
                                                        {transaction.payment_method.charAt(0).toUpperCase() + transaction.payment_method.slice(1).replace('_', ' ')}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Code & Signature */}
                                    <div className="ml-4 flex flex-col items-end justify-between">
                                        <div className="flex items-center justify-center rounded bg-white p-1">
                                            <QRCodeSVG value={qrData} size={64} level="H" includeMargin={false} />
                                        </div>
                                        <div className="mt-2 text-right">
                                            <div className="mb-1 w-24 border-b-2 border-gray-400"></div>
                                            <p className="text-xs text-gray-500">Authorized Signature</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Decorative Dots */}
                            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 transform gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-orange-400"></div>
                                <div className="h-1.5 w-1.5 rounded-full bg-yellow-400"></div>
                                <div className="h-1.5 w-1.5 rounded-full bg-orange-300"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        background: white !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .receipt-container {
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        max-width: 100% !important;
                        width: 100% !important;
                        aspect-ratio: 2.4/1 !important;
                    }
                    @page {
                        size: landscape;
                        margin: 10mm;
                    }
                    /* Ensure decorative elements are visible */
                    .absolute {
                        position: absolute !important;
                    }
                    /* Ensure gradients work */
                    .bg-gradient-to-br,
                    .bg-gradient-to-tr {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    /* Fix colors in print */
                    * {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </>
    );
};

export default PaymentReceipt;
