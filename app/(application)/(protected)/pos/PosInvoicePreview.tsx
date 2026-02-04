'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetStoreQuery } from '@/store/features/store/storeApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Hash, Shield } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface Serial {
    id: number;
    serial_number: string;
    status: string;
    notes?: string;
}

interface Warranty {
    id: number;
    warranty_type_id: number;
    warranty_type_name: string;
    duration_months: number | null;
    duration_days: number | null;
    start_date: string | null;
    end_date: string | null;
    status: string;
    remaining_days: number | null;
}

interface InvoiceItem {
    id: number;
    title: string;
    variantName?: string;
    variantData?: Record<string, string>;
    quantity: number;
    unit?: string;
    price: number;
    amount: number;
    tax_rate?: number;
    tax_included?: boolean;
    serials?: Serial[];
    warranty?: Warranty | null;
    has_serial?: boolean;
    has_warranty?: boolean;
    isReturned?: boolean;
    isExchange?: boolean;
}

interface PosInvoicePreviewProps {
    data: any;
    storeId?: number;
    onClose?: () => void;
}

const PosInvoicePreview = ({ data, storeId, onClose }: PosInvoicePreviewProps) => {
    const { formatCurrency, symbol } = useCurrency();
    const invoiceRef = useRef(null);
    const [isPrinting, setIsPrinting] = useState(false);

    // Get current store from hook (has all store data including logo, name, address, etc.)
    const { currentStore: hookStore } = useCurrentStore();

    // Fetch store details as fallback if storeId is provided
    const { data: storeData } = useGetStoreQuery(storeId ? { store_id: storeId } : undefined, {
        skip: !storeId,
    });

    // Use hookStore first (has full data), fallback to API data if storeId was provided
    const currentStore = hookStore || storeData?.data || {};

    // Debug: Log store data to check logo_path
    console.log('Store Data:', currentStore);
    console.log('Logo Path:', currentStore?.logo_path);

    const {
        customer = {},
        items = [],
        totals = {},
        tax = 0,
        discount = 0,
        invoice = '#INV-PREVIEW',
        order_id,
        isOrderCreated = false,
        payment_status, // From backend response
        paymentStatus, // From preview data (camelCase)
        payment_method, // From backend response
        paymentMethod, // From preview data (camelCase)
        amount_paid, // From backend
        due_amount, // From backend
        partialPaymentAmount, // From preview
        dueAmount, // From preview
        isReturn = false,
        keptItems = [],
        returnedItems = [],
        exchangeItems = [],
        original_order_id,
        returnTotal = 0,
        exchangeTotal = 0,
        netTransaction = 0,
    } = data || {};

    // Use whichever is available (backend uses payment_status, preview uses paymentStatus)
    const displayPaymentStatus = payment_status || paymentStatus;
    const displayPaymentMethod = payment_method || paymentMethod;

    // Calculate payment amounts - ensure they're numbers
    const amountPaid = Number(amount_paid ?? partialPaymentAmount ?? 0);
    const amountDue = Number(due_amount ?? dueAmount ?? 0);

    // Ensure items is typed correctly
    const invoiceItems = items as InvoiceItem[];

    const subtotal = totals.subtotal ?? totals.total ?? invoiceItems.reduce((acc: number, item: InvoiceItem) => acc + Number(item.amount || 0), 0);
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
        const storeContact = currentStore?.store_contact || '+8601600000';

        let itemsHTML = '';
        invoiceItems.forEach((item: InvoiceItem, index: number) => {
            // Build variant info
            let variantInfo = '';
            if (item.variantName) {
                variantInfo = `<div class="item-variant">${item.variantName}</div>`;
            }

            // Build serial number info
            let serialInfo = '';
            if (item.has_serial && item.serials && item.serials.length > 0) {
                serialInfo = `<div class="item-serial">S/N: ${item.serials[0].serial_number}</div>`;
            }

            // Build warranty info
            let warrantyInfo = '';
            if (item.has_warranty && item.warranty && item.warranty !== null && (item.warranty.warranty_type_name || item.warranty.duration_days || item.warranty.duration_months)) {
                const duration = item.warranty.duration_months ? `${item.warranty.duration_months}mo` : item.warranty.duration_days ? `${item.warranty.duration_days}d` : 'Lifetime';
                const warrantyName = item.warranty.warranty_type_name ? `${item.warranty.warranty_type_name} - ` : '';
                warrantyInfo = `<div class="item-warranty">Warranty: ${warrantyName}${duration}</div>`;
            }

            itemsHTML += `
                <div class="item-row">
                    <div class="item-name">${index + 1}. ${item.title}</div>
                    <div class="item-qty">${item.quantity}</div>
                    <div class="item-price">${formatCurrency(item.amount)}</div>
                </div>
                ${variantInfo}
                ${serialInfo}
                ${warrantyInfo}
                <div class="item-details">${item.quantity} x ${formatCurrency(item.price)} ${item.unit ? `(${item.unit})` : ''}</div>
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
        
        .item-variant {
            font-size: 9px;
            color: #4338ca;
            padding-left: 3px;
            margin-bottom: 1px;
        }
        
        .item-serial {
            font-size: 9px;
            color: #059669;
            padding-left: 3px;
            margin-bottom: 1px;
            font-weight: bold;
        }
        
        .item-warranty {
            font-size: 9px;
            color: #059669;
            padding-left: 3px;
            margin-bottom: 2px;
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
        ${
            isReturn
                ? `
            <!-- Kept Items from Original Order -->
            ${
                keptItems.length > 0
                    ? `
            <div class="items-header" style="border-bottom: 1px solid #10b981; color: #10b981; margin-top: 5px;">
                <div class="item-row">
                    <div class="item-name">ITEMS KEPT</div>
                    <div class="item-qty">QTY</div>
                    <div class="item-price">AMOUNT</div>
                </div>
            </div>
            ${keptItems
                .map((item: any, index: number) => {
                    let extras = '';
                    if (item.variantName) extras += `<div class="item-variant">${item.variantName}</div>`;

                    return `
                <div class="item-row">
                    <div class="item-name">${index + 1}. ${item.title}</div>
                    <div class="item-qty">${item.quantity}</div>
                    <div class="item-price">${formatCurrency(item.amount)}</div>
                </div>
                ${extras}
                <div class="item-details" style="margin-bottom: 5px;">${item.quantity} x ${formatCurrency(item.price)}</div>
                    `;
                })
                .join('')}
            `
                    : ''
            }

            <!-- Returned Items Section -->
            ${
                returnedItems.length > 0
                    ? `
            <div class="items-header" style="border-bottom: 1px solid #dc2626; color: #dc2626; margin-top: 10px;">
                <div class="item-row">
                    <div class="item-name">RETURNED ITEMS</div>
                    <div class="item-qty">QTY</div>
                    <div class="item-price">REFUND</div>
                </div>
            </div>
            ${returnedItems
                .map((item: any, index: number) => {
                    let extras = '';
                    if (item.variantName) extras += `<div class="item-variant">${item.variantName}</div>`;
                    return `
                <div class="item-row">
                    <div class="item-name">${index + 1}. ${item.title}</div>
                    <div class="item-qty">-${item.quantity}</div>
                    <div class="item-price">-${formatCurrency(item.amount)}</div>
                </div>
                ${extras}
                <div class="item-details" style="margin-bottom: 5px;">${item.quantity} x ${formatCurrency(item.price)}</div>
            `;
                })
                .join('')}
            `
                    : ''
            }

            <!-- Exchange Items Section -->
            ${
                exchangeItems.length > 0
                    ? `
            <div class="items-header" style="border-bottom: 1px solid #3b82f6; color: #3b82f6; margin-top: 10px;">
                <div class="item-row">
                    <div class="item-name">EXCHANGE ITEMS</div>
                    <div class="item-qty">QTY</div>
                    <div class="item-price">AMOUNT</div>
                </div>
            </div>
            ${exchangeItems
                .map((item: any, index: number) => {
                    // Variant/Serial logic for HTML receipt (simplified from original loop)
                    let extras = '';
                    if (item.variantName) extras += `<div class="item-variant">${item.variantName}</div>`;
                    if (item.has_serial && item.serials?.[0]) extras += `<div class="item-serial">S/N: ${item.serials[0].serial_number}</div>`;

                    return `
                <div class="item-row">
                    <div class="item-name">${index + 1}. ${item.title}</div>
                    <div class="item-qty">${item.quantity}</div>
                    <div class="item-price">${formatCurrency(item.amount)}</div>
                </div>
                ${extras}
                <div class="item-details">${item.quantity} x ${formatCurrency(item.price)}</div>
                    `;
                })
                .join('')}
            `
                    : ''
            }
        `
                : `
        <!-- Normal Invoice Items -->
        <div class="items-header">
            <div class="item-row">
                <div class="item-name">ITEM</div>
                <div class="item-qty">QTY</div>
                <div class="item-price">AMOUNT</div>
            </div>
        </div>
        ${itemsHTML}
        `
        }
        
        <!-- Totals -->
        <div class="totals-section">
            <div class="total-row">
                <div>Subtotal:</div>
                <div>${formatCurrency(isReturn ? exchangeTotal : subtotal)}</div>
            </div>
            ${
                isReturn
                    ? `
            <div class="total-row" style="color: #dc2626;">
                <div>Return Credit:</div>
                <div>-${formatCurrency(returnTotal)}</div>
            </div>
            <div class="total-row grand-total">
                <div>${netTransaction >= 0 ? 'NET PAYABLE:' : 'NET REFUND:'}</div>
                <div>${formatCurrency(Math.abs(netTransaction))}</div>
            </div>
            `
                    : `
            ${
                calculatedTax > 0
                    ? `
            <div class="total-row">
                <div>Tax:</div>
                <div>${formatCurrency(calculatedTax)}</div>
            </div>`
                    : ''
            }
            ${
                calculatedDiscount > 0
                    ? `
            <div class="total-row">
                <div>Discount:</div>
                <div>-${formatCurrency(calculatedDiscount)}</div>
            </div>`
                    : ''
            }
            <div class="total-row grand-total">
                <div>TOTAL:</div>
                <div>${formatCurrency(grandTotal)}</div>
            </div>
            `
            }
            ${
                (displayPaymentStatus?.toLowerCase() === 'partial' || displayPaymentStatus?.toLowerCase() === 'due') && amountPaid > 0
                    ? `
            <div class="total-row" style="color: #059669;">
                <div>Amount Paid:</div>
                <div>${formatCurrency(amountPaid)}</div>
            </div>`
                    : ''
            }
            ${
                (displayPaymentStatus?.toLowerCase() === 'partial' || displayPaymentStatus?.toLowerCase() === 'due') && amountDue > 0
                    ? `
            <div class="total-row" style="color: #dc2626; font-weight: bold;">
                <div>Amount Due:</div>
                <div>${formatCurrency(amountDue)}</div>
            </div>`
                    : ''
            }
        </div>
        
        <div class="divider"></div>
        
        <!-- Payment Info -->
        <div class="center">
            <div><strong>Payment Method:</strong> ${displayPaymentMethod === 'due' ? 'Due' : displayPaymentMethod || 'Cash'}</div>
            <div><strong>Status:</strong> <span style="color: ${
                displayPaymentStatus?.toLowerCase() === 'paid' || displayPaymentStatus?.toLowerCase() === 'completed'
                    ? '#059669'
                    : displayPaymentStatus?.toLowerCase() === 'due' || displayPaymentStatus?.toLowerCase() === 'pending' || displayPaymentStatus?.toLowerCase() === 'unpaid'
                    ? '#ca8a04'
                    : '#dc2626'
            }; font-weight: bold; text-transform: uppercase;">${displayPaymentStatus || 'Pending'}</span></div>
            ${
                (displayPaymentStatus?.toLowerCase() === 'partial' || displayPaymentStatus?.toLowerCase() === 'due') && amountDue > 0
                    ? `
            <div style="margin-top: 2mm; padding: 2mm; background: #fee2e2; border-radius: 2mm;">
                <div style="color: #dc2626; font-weight: bold;">⚠ Amount Due: ${formatCurrency(amountDue)}</div>
            </div>`
                    : ''
            }
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

    // Helper to format warranty duration
    const formatWarrantyDuration = (warranty: Warranty | null | undefined) => {
        if (!warranty) return '';
        if (warranty.duration_months) return `${warranty.duration_months} months`;
        if (warranty.duration_days) return `${warranty.duration_days} days`;
        return 'Lifetime';
    };

    // Helper to format payment status
    const getPaymentStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'paid' || s === 'completed') return 'text-green-600';
        if (s === 'due' || s === 'unpaid' || s === 'pending') return 'text-yellow-600';
        if (s === 'failed' || s === 'cancelled') return 'text-red-600';
        if (s === 'partial') return 'text-orange-600';
        return 'text-gray-600';
    };

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
                {/* Decorative header bar */}
                <div className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                {/* Header */}
                <div className="relative z-10 flex items-start justify-between px-6 pt-8">
                    <div className="flex-1">
                        <h2 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold uppercase tracking-tight text-transparent">
                            {isReturn ? 'Return Receipt' : 'Invoice'}
                        </h2>
                        <div className="mt-1 h-1 w-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    </div>
                    {(currentStore?.logo_path || currentStore?.logo_url || currentStore?.logo) && (
                        <div className="flex flex-col items-end gap-2">
                            <div className="overflow-hidden rounded-xl border-2 border-gray-100 bg-white p-2 shadow-lg ring-2 ring-blue-50">
                                <Image
                                    src={
                                        currentStore.logo_path
                                            ? currentStore.logo_path.startsWith('http')
                                                ? currentStore.logo_path
                                                : currentStore.logo_path.startsWith('/')
                                                ? currentStore.logo_path
                                                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${currentStore.logo_path}`
                                            : currentStore.logo_url
                                            ? currentStore.logo_url.startsWith('http')
                                                ? currentStore.logo_url
                                                : currentStore.logo_url.startsWith('/')
                                                ? currentStore.logo_url
                                                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${currentStore.logo_url}`
                                            : currentStore.logo
                                            ? currentStore.logo.startsWith('http')
                                                ? currentStore.logo
                                                : currentStore.logo.startsWith('/')
                                                ? currentStore.logo
                                                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${currentStore.logo}`
                                            : '/assets/images/Logo-PNG.png'
                                    }
                                    alt="Store Logo"
                                    width={80}
                                    height={80}
                                    className="h-20 w-20 object-contain"
                                    onError={(e) => {
                                        console.log('Logo failed to load:', currentStore?.logo_path);
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                    priority={false}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Company Info */}
                {(currentStore?.store_name || currentStore?.store_location || currentStore?.store_contact || currentStore?.store_email) && (
                    <div className="relative z-10 mx-6 mt-6 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-5 py-4 shadow-sm">
                        {currentStore?.store_name && <div className="mb-2 text-2xl font-bold text-gray-900">{currentStore.store_name}</div>}
                        <div className="flex flex-col gap-2 text-sm text-gray-700">
                            {currentStore?.store_location && (
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 rounded-lg bg-blue-100 p-1.5">
                                        <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <span className="flex-1 leading-relaxed">{currentStore.store_location}</span>
                                </div>
                            )}
                            {currentStore?.store_contact && (
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-green-100 p-1.5">
                                        <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="font-semibold">{currentStore.store_contact}</span>
                                </div>
                            )}
                            {currentStore?.store_email && (
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-purple-100 p-1.5">
                                        <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <span>{currentStore.store_email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <hr className="relative z-10 my-6 border-t-2 border-dashed border-gray-200" />

                {/* Customer & Invoice Details */}
                <div className="relative z-10 flex flex-col justify-between gap-6 px-6 lg:flex-row">
                    <div className="flex-1 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="rounded-lg bg-blue-600 p-2">
                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold uppercase tracking-wide text-gray-600">Bill To</span>
                        </div>
                        <div className="space-y-1.5">
                            <div className="text-lg font-bold text-gray-900">{customer?.name || 'Customer'}</div>
                            {customer?.email && customer.email !== 'No Email' && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    {customer.email}
                                </div>
                            )}
                            {customer?.phone && customer.phone !== 'No Phone' && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                    {customer.phone}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row lg:w-2/3">
                        <div className="flex-1 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm">
                            <div className="space-y-2.5 text-sm">
                                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                                    <span className="font-medium text-gray-600">Invoice Number</span>
                                    <span className="rounded-lg bg-blue-600 px-3 py-1 font-mono text-sm font-bold text-white shadow-sm">{invoice}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{isReturn ? 'Return Date' : 'Issue Date'}</span>
                                    <span className="font-semibold text-gray-900">{currentDate}</span>
                                </div>
                                {order_id && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{isReturn ? 'Return ID' : 'Order ID'}</span>
                                        <span className="rounded bg-white px-2 py-0.5 font-mono text-xs font-bold text-blue-600">#{order_id}</span>
                                    </div>
                                )}
                                {original_order_id && (
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Reference Order</span>
                                        <span className="font-mono">#{original_order_id}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
                            <div className="space-y-2.5 text-sm">
                                <div className="flex items-center justify-between border-b border-green-200 pb-2">
                                    <span className="font-medium text-gray-600">Payment Status</span>
                                    <span
                                        className={`rounded-lg px-3 py-1 text-xs font-bold uppercase shadow-sm ${
                                            displayPaymentStatus?.toLowerCase() === 'paid' || displayPaymentStatus?.toLowerCase() === 'completed'
                                                ? 'bg-green-600 text-white'
                                                : displayPaymentStatus?.toLowerCase() === 'due' || displayPaymentStatus?.toLowerCase() === 'unpaid'
                                                ? 'bg-yellow-500 text-white'
                                                : displayPaymentStatus?.toLowerCase() === 'partial'
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-500 text-white'
                                        }`}
                                    >
                                        {displayPaymentStatus || 'Pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Method</span>
                                    <span className="rounded bg-white px-2 py-1 text-xs font-semibold capitalize text-gray-900">
                                        {displayPaymentMethod === 'due' ? 'Due' : displayPaymentMethod || 'Cash'}
                                    </span>
                                </div>
                                {displayPaymentStatus?.toLowerCase() === 'partial' && amountPaid > 0 && (
                                    <div className="flex justify-between rounded-lg bg-green-100 px-2 py-1.5">
                                        <span className="font-medium text-green-700">Amount Paid</span>
                                        <span className="font-bold text-green-800">{formatCurrency(amountPaid)}</span>
                                    </div>
                                )}
                                {(displayPaymentStatus?.toLowerCase() === 'partial' || displayPaymentStatus?.toLowerCase() === 'due') && amountDue > 0 && (
                                    <div className="flex justify-between rounded-lg bg-red-100 px-2 py-1.5">
                                        <span className="font-medium text-red-700">Amount Due</span>
                                        <span className="font-bold text-red-800">{formatCurrency(amountDue)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="relative z-10 mt-6 overflow-auto px-4">
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-300 bg-gray-50">
                                {columns.map((col) => (
                                    <th key={col.key} className={`px-3 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700 ${col.class || ''}`}>
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Return Mode Rendering */}
                            {isReturn ? (
                                <>
                                    {/* Items Kept from Original Order */}
                                    {keptItems.length > 0 && (
                                        <>
                                            <tr className="bg-green-50">
                                                <td colSpan={6} className="px-3 py-2 text-xs font-bold uppercase text-green-700">
                                                    Items Kept from Original Order
                                                </td>
                                            </tr>
                                            {keptItems.map((item: any, idx: number) => (
                                                <tr key={`kept-${idx}`}>
                                                    <td className="border-b border-gray-200 py-3">{idx + 1}</td>
                                                    <td className="border-b border-gray-200 py-3">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="font-medium text-gray-900">{item.title}</div>
                                                            {item.variantName && (
                                                                <div className="flex flex-wrap items-center gap-1">
                                                                    <span className="text-xs text-indigo-600">Variant:</span>
                                                                    <span className="text-xs font-medium text-indigo-700">{item.variantName}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="border-b border-gray-200 py-3 text-center">{item.quantity}</td>
                                                    <td className="border-b border-gray-200 py-3 text-center">
                                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs">{item.unit || 'piece'}</span>
                                                    </td>
                                                    <td className="border-b border-gray-200 py-3 text-right">{formatCurrency(Number(item.price))}</td>
                                                    <td className="border-b border-gray-200 py-3 text-right font-semibold">{formatCurrency(Number(item.amount))}</td>
                                                </tr>
                                            ))}
                                        </>
                                    )}

                                    {/* Returned Items Section */}
                                    {returnedItems.length > 0 && (
                                        <>
                                            <tr className="bg-red-50">
                                                <td colSpan={6} className="px-3 py-2 text-xs font-bold uppercase text-red-700">
                                                    Returned Items (Refunds)
                                                </td>
                                            </tr>
                                            {returnedItems.map((item: any, idx: number) => (
                                                <tr key={`return-${idx}`} className="text-red-600">
                                                    <td className="border-b border-gray-200 py-3">{idx + 1}</td>
                                                    <td className="border-b border-gray-200 py-3">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="font-medium">{item.title}</div>
                                                            {item.variantName && (
                                                                <div className="flex flex-wrap items-center gap-1">
                                                                    <span className="text-xs text-indigo-600">Variant:</span>
                                                                    <span className="text-xs font-medium text-indigo-700">{item.variantName}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="border-b border-gray-200 py-3 text-center">-{item.quantity}</td>
                                                    <td className="border-b border-gray-200 py-3 text-center">
                                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">{item.unit || 'piece'}</span>
                                                    </td>
                                                    <td className="border-b border-gray-200 py-3 text-right">-{formatCurrency(Number(item.price))}</td>
                                                    <td className="border-b border-gray-200 py-3 text-right font-semibold">-{formatCurrency(Number(item.amount))}</td>
                                                </tr>
                                            ))}
                                        </>
                                    )}

                                    {/* Exchange Items Section */}
                                    {exchangeItems.length > 0 && (
                                        <>
                                            <tr className="bg-blue-50">
                                                <td colSpan={6} className="px-3 py-2 text-xs font-bold uppercase text-blue-700">
                                                    Exchange / New Items
                                                </td>
                                            </tr>
                                            {exchangeItems.map((item: any, idx: number) => (
                                                <tr key={`exchange-${idx}`}>
                                                    <td className="border-b border-gray-200 py-3">{idx + 1}</td>
                                                    <td className="border-b border-gray-200 py-3">
                                                        {/* Reusing existing item render logic for details */}
                                                        <div className="flex flex-col gap-1">
                                                            <div className="font-medium text-gray-900">{item.title}</div>
                                                            {item.variantName && (
                                                                <div className="flex flex-wrap items-center gap-1">
                                                                    <span className="text-xs text-indigo-600">Variant:</span>
                                                                    <span className="text-xs font-medium text-indigo-700">{item.variantName}</span>
                                                                </div>
                                                            )}
                                                            {item.has_serial && item.serials?.[0] && (
                                                                <div className="flex items-center gap-1">
                                                                    <Hash className="h-3 w-3 text-indigo-600" />
                                                                    <span className="text-xs font-semibold text-indigo-700">S/N: {item.serials[0].serial_number}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="border-b border-gray-200 py-3 text-center">{item.quantity}</td>
                                                    <td className="border-b border-gray-200 py-3 text-center">
                                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs">{item.unit || 'piece'}</span>
                                                    </td>
                                                    <td className="border-b border-gray-200 py-3 text-right">{formatCurrency(Number(item.price))}</td>
                                                    <td className="border-b border-gray-200 py-3 text-right font-semibold">{formatCurrency(Number(item.amount))}</td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </>
                            ) : (
                                /* Normal Invoice Items */
                                invoiceItems.map((item: InvoiceItem, idx: number) => (
                                    <tr key={idx}>
                                        <td className="border-b border-gray-200 py-3">{idx + 1}</td>
                                        <td className="border-b border-gray-200 py-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="font-medium text-gray-900">{item.title}</div>

                                                {/* Variant Information */}
                                                {item.variantName && (
                                                    <div className="flex flex-wrap items-center gap-1">
                                                        <span className="text-xs text-indigo-600">Variant:</span>
                                                        <span className="text-xs font-medium text-indigo-700">{item.variantName}</span>
                                                    </div>
                                                )}

                                                {/* Variant Attributes */}
                                                {item.variantData && Object.keys(item.variantData).length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {Object.entries(item.variantData).map(([key, value]) => (
                                                            <span key={key} className="inline-block rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                                                                {value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Serial Number */}
                                                {item.has_serial && item.serials && item.serials.length > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Hash className="h-3 w-3 text-indigo-600" />
                                                        <span className="text-xs font-semibold text-indigo-700">S/N: {item.serials[0].serial_number}</span>
                                                    </div>
                                                )}

                                                {/* Warranty Information */}
                                                {item.has_warranty &&
                                                    item.warranty &&
                                                    item.warranty !== null &&
                                                    (item.warranty.warranty_type_name || item.warranty.duration_days || item.warranty.duration_months) && (
                                                        <div className="flex items-center gap-1">
                                                            <Shield className="h-3 w-3 text-green-600" />
                                                            <span className="text-xs text-green-700">
                                                                {item.warranty.warranty_type_name ? `${item.warranty.warranty_type_name} - ` : 'Warranty: '}
                                                                {formatWarrantyDuration(item.warranty)}
                                                            </span>
                                                        </div>
                                                    )}
                                            </div>
                                        </td>
                                        <td className="border-b border-gray-200 py-3 text-center">{item.quantity}</td>
                                        <td className="border-b border-gray-200 py-3 text-center">
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs">{item.unit || 'piece'}</span>
                                        </td>
                                        <td className="border-b border-gray-200 py-3 text-right">{formatCurrency(Number(item.price))}</td>
                                        <td className="border-b border-gray-200 py-3 text-right font-semibold">{formatCurrency(Number(item.amount))}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="relative z-10 mt-6 flex flex-col justify-end gap-2 px-4 sm:flex-row sm:justify-end">
                    {isReturn ? (
                        <div className="w-full space-y-1 text-right sm:w-[40%]">
                            {exchangeTotal > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>New Items Total:</span>
                                    <span>{formatCurrency(exchangeTotal)}</span>
                                </div>
                            )}
                            {returnTotal > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>Return Credit:</span>
                                    <span>-{formatCurrency(returnTotal)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-gray-300 pt-2 text-lg font-semibold">
                                <span>{netTransaction >= 0 ? 'NET PAYABLE' : 'NET REFUND'}</span>
                                <span className={netTransaction >= 0 ? 'text-black' : 'text-red-600'}>{formatCurrency(Math.abs(netTransaction))}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full space-y-2 text-right sm:w-[50%]">
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-medium">Subtotal</span>
                                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                                    </div>
                                    {calculatedTax > 0 && (
                                        <div className="flex justify-between text-gray-700">
                                            <span className="font-medium">Tax</span>
                                            <span className="font-semibold text-blue-600">{formatCurrency(calculatedTax)}</span>
                                        </div>
                                    )}
                                    {calculatedDiscount > 0 && (
                                        <div className="flex justify-between text-red-600">
                                            <span className="font-medium">Discount</span>
                                            <span className="font-semibold">-{formatCurrency(calculatedDiscount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t-2 border-gray-300 pt-3">
                                        <span className="text-xl font-bold text-gray-900">Grand Total</span>
                                        <span className="text-xl font-bold text-blue-600">{formatCurrency(grandTotal)}</span>
                                    </div>

                                    {/* Payment Breakdown for Partial/Due */}
                                    {(displayPaymentStatus?.toLowerCase() === 'partial' || displayPaymentStatus?.toLowerCase() === 'due') && (
                                        <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
                                            {amountPaid > 0 && (
                                                <div className="flex justify-between rounded-lg bg-green-50 px-3 py-2">
                                                    <span className="font-semibold text-green-700">Amount Paid</span>
                                                    <span className="text-lg font-bold text-green-800">{formatCurrency(amountPaid)}</span>
                                                </div>
                                            )}
                                            {amountDue > 0 && (
                                                <div className="flex justify-between rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 shadow-md">
                                                    <span className="text-lg font-bold text-white">Amount Due</span>
                                                    <span className="text-2xl font-extrabold text-white">{formatCurrency(amountDue)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {isOrderCreated && (
                    <div className="relative z-10 mt-8 border-t-2 border-dashed border-gray-200 px-6 pt-6 text-center">
                        <div className="mx-auto max-w-2xl rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                            <div className="text-lg font-bold text-gray-900">Thank you for your business!</div>
                            <div className="mt-1 text-sm text-gray-600">Order processed on {currentDate}</div>
                            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Powered by AndGate POS</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PosInvoicePreview;
