'use client';

import { useGetStoreQuery } from '@/store/features/store/storeApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface PosInvoicePreviewProps {
    data: any;
    storeId?: number;
    onClose?: () => void;
}

const PosInvoicePreview = ({ data, storeId, onClose }: PosInvoicePreviewProps) => {
    const invoiceRef = useRef(null);
    const [isPrinting, setIsPrinting] = useState(false);

    // Fetch store details
    const { data: storeData } = useGetStoreQuery(storeId ? { store_id: storeId } : undefined);
    const currentStore = storeData?.data || {};

    const { customer = {}, items = [], totals = {}, tax = 0, discount = 0, invoice = '#INV-PREVIEW', order_id, isOrderCreated = false, payment_status, paymentMethod } = data || {};

    const subtotal = totals.subtotal ?? totals.total ?? items.reduce((acc, item) => acc + Number(item.amount || 0), 0);
    const calculatedTax = totals.tax ?? tax;
    const calculatedDiscount = totals.discount ?? discount;
    const grandTotal = totals.grand_total ?? subtotal + calculatedTax - calculatedDiscount;

    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const currentTime = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    const exportPDF = () => {
        if (!invoiceRef.current) return;
        html2canvas(invoiceRef.current, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice-${invoice || 'preview'}.pdf`);
        });
    };

    // Generate receipt HTML content
    const generateReceiptHTML = () => {
        const storeName = currentStore?.store_name || 'AndGatePOS';
        const storeLocation = currentStore?.store_location || 'Dhaka, Bangladesh, 1212';
        const storeContact = currentStore?.store_contact || '+8801600000';

        let itemsHTML = '';
        items.forEach((item: any) => {
            itemsHTML += `
                <div class="item-row">
                    <div class="item-name">${item.title}</div>
                    <div class="item-qty">${item.quantity}</div>
                    <div class="item-price">৳${Number(item.amount).toFixed(2)}</div>
                </div>
                <div class="item-details">${item.quantity} x ৳${Number(item.price).toFixed(2)}</div>
            `;
        });

        return `
<!DOCTYPE html>
<html>
<head>
    <title>Receipt - ${invoice}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        @page {
            size: 58mm auto;
            margin: 0;
        }
        
        body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.3;
            width: 58mm;
            margin: 0 auto;
            padding: 5mm;
            background: white;
            color: black;
        }
        
        .receipt-container {
            width: 100%;
        }
        
        .center {
            text-align: center;
        }
        
        .store-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 3px;
        }
        
        .store-info {
            font-size: 10px;
            margin-bottom: 2px;
        }
        
        .divider {
            border-top: 1px dashed #000;
            margin: 4mm 0;
        }
        
        .invoice-info {
            margin-bottom: 3mm;
            font-size: 10px;
        }
        
        .invoice-info div {
            margin-bottom: 2px;
        }
        
        .items-header {
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding-bottom: 2px;
            margin-bottom: 3px;
            font-size: 10px;
        }
        
        .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
            font-size: 10px;
        }
        
        .item-name {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding-right: 5px;
        }
        
        .item-qty {
            width: 40px;
            text-align: center;
        }
        
        .item-price {
            width: 70px;
            text-align: right;
        }
        
        .item-details {
            font-size: 9px;
            color: #666;
            margin-bottom: 3px;
            padding-left: 3px;
        }
        
        .totals-section {
            margin-top: 3mm;
            border-top: 1px solid #000;
            padding-top: 2mm;
            font-size: 10px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
        }
        
        .grand-total {
            font-weight: bold;
            font-size: 13px;
            border-top: 2px solid #000;
            padding-top: 2mm;
            margin-top: 2mm;
        }
        
        .footer {
            margin-top: 4mm;
            font-size: 10px;
        }
        
        .thank-you {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            @page {
                size: 58mm auto;
                margin: 0mm;
            }
        }
        
        @media screen {
            body {
                padding-top: 60px;
            }
            
            .print-toolbar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #f3f4f6;
                padding: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                z-index: 1000;
                display: flex;
                justify-content: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .print-btn, .close-btn {
                padding: 10px 24px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: all 0.2s;
            }
            
            .print-btn {
                background: #10b981;
                color: white;
            }
            
            .print-btn:active {
                transform: scale(0.98);
            }
            
            .close-btn {
                background: #6b7280;
                color: white;
            }
            
            .close-btn:active {
                transform: scale(0.98);
            }
        }
        
        @media print {
            .print-toolbar {
                display: none !important;
            }
            
            body {
                padding-top: 0;
            }
        }
    </style>
</head>
<body>
    <div class="print-toolbar">
        <button class="print-btn" onclick="window.print()">🖨️ Print Receipt</button>
        <button class="close-btn" onclick="window.close()">✕ Close</button>
    </div>
    
    <div class="receipt-container">
        <!-- Store Header -->
        <div class="center">
            <div class="store-name">${storeName}</div>
            <div class="store-info">${storeLocation}</div>
            <div class="store-info">${storeContact}</div>
        </div>
        
        <div class="divider"></div>
        
        <!-- Invoice Info -->
        <div class="invoice-info">
            <div><strong>Receipt:</strong> ${invoice}</div>
            <div><strong>Date:</strong> ${currentDate} ${currentTime}</div>
            ${order_id ? `<div><strong>Order:</strong> #${order_id}</div>` : ''}
            ${customer.name && customer.name !== 'Customer' ? `<div><strong>Customer:</strong> ${customer.name}</div>` : ''}
        </div>
        
        <div class="divider"></div>
        
        <!-- Items -->
        <div class="items-header">
            <div class="item-row">
                <div class="item-name">ITEM</div>
                <div class="item-qty">QTY</div>
                <div class="item-price">AMOUNT</div>
            </div>
        </div>
        
        ${itemsHTML}
        
        <!-- Totals -->
        <div class="totals-section">
            <div class="total-row">
                <div>Subtotal:</div>
                <div>৳${subtotal.toFixed(2)}</div>
            </div>
            ${
                calculatedTax > 0
                    ? `
            <div class="total-row">
                <div>Tax:</div>
                <div>৳${calculatedTax.toFixed(2)}</div>
            </div>`
                    : ''
            }
            ${
                calculatedDiscount > 0
                    ? `
            <div class="total-row">
                <div>Discount:</div>
                <div>-৳${calculatedDiscount.toFixed(2)}</div>
            </div>`
                    : ''
            }
            <div class="total-row grand-total">
                <div>TOTAL:</div>
                <div>৳${grandTotal.toFixed(2)}</div>
            </div>
        </div>
        
        <div class="divider"></div>
        
        <!-- Payment Info -->
        <div class="center">
            <div><strong>Payment:</strong> ${paymentMethod || 'Cash'}</div>
            <div><strong>Status:</strong> ${payment_status || 'Paid'}</div>
        </div>
        
        <div class="divider"></div>
        
        <!-- Footer -->
        <div class="footer center">
            <div class="thank-you">THANK YOU!</div>
            <div>Please come again</div>
            <div style="margin-top: 2mm; font-size: 9px;">
                Powered by AndGate POS
            </div>
        </div>
    </div>
    
    <script>
        // Auto-print on load for better mobile experience
        window.addEventListener('load', function() {
            setTimeout(function() {
                // Auto-print can be enabled if needed
                // window.print();
            }, 500);
        });
    </script>
</body>
</html>`;
    };

    const printReceipt = () => {
        if (isPrinting) return;
        setIsPrinting(true);

        try {
            const receiptHTML = generateReceiptHTML();
            
            // Create a Blob from the HTML
            const blob = new Blob([receiptHTML], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);
            
            // Open in a new window/tab
            const printWindow = window.open(blobUrl, '_blank');
            
            if (!printWindow) {
                // If popup blocked, try alternative method
                alert('Please allow popups to print receipts. Or use the Download PDF option.');
                URL.revokeObjectURL(blobUrl);
                setIsPrinting(false);
                return;
            }
            
            // Clean up the blob URL after a delay
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
                setIsPrinting(false);
            }, 2000);
            
        } catch (error) {
            console.error('Print error:', error);
            alert('Failed to open print window. Please try again.');
            setIsPrinting(false);
        }
    };

    const columns = [
        { key: 'id', label: 'S.NO' },
        { key: 'title', label: 'ITEMS' },
        { key: 'quantity', label: 'QTY' },
        { key: 'unit', label: 'UNIT' },
        { key: 'price', label: 'PRICE', class: 'ltr:text-right rtl:text-left' },
        { key: 'amount', label: 'AMOUNT', class: 'ltr:text-right rtl:text-left' },
    ];

    return (
        <div>
            {/* Footer Buttons */}
            {isOrderCreated && (
                <div className="mb-6 flex flex-wrap justify-end gap-3">
                    <button className="btn btn-primary px-5 py-2 text-sm hover:bg-blue-600" onClick={exportPDF} disabled={isPrinting}>
                        📄 Download PDF
                    </button>
                    <button className="btn btn-success px-5 py-2 text-sm hover:bg-green-600" onClick={printReceipt} disabled={isPrinting}>
                        {isPrinting ? '⏳ Opening...' : '🖨️ Print Receipt'}
                    </button>
                    {onClose && (
                        <button className="btn btn-outline px-5 py-2 text-sm hover:bg-gray-100" onClick={onClose} disabled={isPrinting}>
                            ✕ Close
                        </button>
                    )}
                </div>
            )}

            <div className="panel relative" ref={invoiceRef}>
                {/* Header */}
                <div className="relative z-10 flex items-center justify-between px-4">
                    <h2 className="text-2xl font-semibold uppercase">Invoice</h2>
                    {currentStore?.logo_path ? (
                        <Image
                            src={currentStore.logo_path.startsWith('/') ? currentStore.logo_path : `/assets/images/${currentStore.logo_path}`}
                            alt="Store Logo"
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded object-contain"
                            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                            priority={false}
                        />
                    ) : (
                        <Image
                            src="/assets/images/Logo-PNG.png"
                            alt="Default Logo"
                            width={56}
                            height={56}
                            className="w-14"
                            priority={false}
                        />
                    )}
                </div>

                {/* Company Info */}
                <div className="relative z-10 mt-6 space-y-1 px-4 text-right">
                    <div className="font-semibold text-black">{currentStore?.store_name || 'AndGate POS'}</div>
                    <div>{currentStore?.store_location || 'Dhaka, Bangladesh, 1212'}</div>
                    <div>{currentStore?.store_contact || '+8801600000'}</div>
                </div>

                <hr className="relative z-10 my-6 border-gray-300" />

                {/* Customer & Invoice Details */}
                <div className="relative z-10 flex flex-col justify-between gap-6 px-4 lg:flex-row">
                    <div className="flex-1 space-y-1">
                        <div>Issue For:</div>
                        <div className="font-semibold text-black">{customer.name || 'Customer'}</div>
                        <div>{customer.email || 'No Email'}</div>
                        <div>{customer.phone || 'No Phone'}</div>
                    </div>

                    <div className="flex flex-col gap-6 sm:flex-row lg:w-2/3">
                        <div className="sm:w-1/2 lg:w-2/5">
                            <div className="mb-2 flex justify-between">
                                <span>Invoice:</span>
                                <span>{invoice}</span>
                            </div>
                            <div className="mb-2 flex justify-between">
                                <span>Issue Date:</span>
                                <span>{currentDate}</span>
                            </div>
                            {order_id && (
                                <div className="mb-2 flex justify-between">
                                    <span>Order ID:</span>
                                    <span>#{order_id}</span>
                                </div>
                            )}
                        </div>

                        <div className="sm:w-1/2 lg:w-2/5">
                            <div className="mb-2 flex justify-between">
                                <span>Payment Status:</span>
                                <span className="font-semibold text-green-600">{payment_status || 'Paid'}</span>
                            </div>
                            <div className="mb-2 flex justify-between">
                                <span>Payment Method:</span>
                                <span>{paymentMethod || 'Cash'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="relative z-10 mt-6 overflow-auto px-4">
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key} className={`border-b py-2 ${col.class || ''}`}>
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-2">{idx + 1}</td>
                                    <td className="py-2">{item.title}</td>
                                    <td className="py-2">{item.quantity}</td>
                                    <td className="py-2">{item.unit || 'piece'}</td>
                                    <td className="py-2 text-right">৳{Number(item.price).toFixed(2)}</td>
                                    <td className="py-2 text-right">৳{Number(item.amount).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="relative z-10 mt-6 flex flex-col justify-end gap-2 px-4 sm:flex-row sm:justify-end">
                    <div className="w-full space-y-1 text-right sm:w-[40%]">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>৳{subtotal.toFixed(2)}</span>
                        </div>
                        {calculatedTax > 0 && (
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>৳{calculatedTax.toFixed(2)}</span>
                            </div>
                        )}
                        {calculatedDiscount > 0 && (
                            <div className="flex justify-between text-red-600">
                                <span>Discount</span>
                                <span>-৳{calculatedDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-gray-300 pt-2 text-lg font-semibold">
                            <span>Grand Total</span>
                            <span>৳{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {isOrderCreated && (
                    <div className="relative z-10 mt-6 border-t border-gray-200 px-4 pt-4 text-center">
                        <div className="text-sm text-gray-600">Thank you for your business!</div>
                        <div className="mt-1 text-xs text-gray-500">Order processed on {currentDate}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PosInvoicePreview;