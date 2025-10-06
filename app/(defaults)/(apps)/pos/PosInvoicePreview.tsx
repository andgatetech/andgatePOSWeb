'use client';

import { useGetStoreQuery } from '@/store/features/store/storeApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';

interface PosInvoicePreviewProps {
    data: any;
    storeId?: number;
    onClose?: () => void;
}

const PosInvoicePreview = ({ data, storeId, onClose }: PosInvoicePreviewProps) => {
    const invoiceRef = useRef(null);
    const posReceiptRef = useRef(null);

    // Fetch store details using the provided storeId
    const { data: storeData } = useGetStoreQuery(storeId ? { store_id: storeId } : undefined);
    const currentStore = storeData?.data || {};

    const { customer = {}, items = [], totals = {}, tax = 0, discount = 0, invoice = '#INV-PREVIEW', order_id, isOrderCreated = false, payment_status, payment_method } = data || {};

    const subtotal = items.reduce((acc, item) => acc + Number(item.amount || 0), 0);
    const calculatedTax = totals.tax ?? tax;
    const calculatedDiscount = totals.discount ?? discount;
    const grandTotal = totals.grand_total ?? subtotal + calculatedTax - calculatedDiscount;

    const columns = [
        { key: 'id', label: 'S.NO' },
        { key: 'title', label: 'ITEMS' },
        { key: 'quantity', label: 'QTY' },
        { key: 'unit', label: 'UNIT' },
        { key: 'price', label: 'PRICE', class: 'ltr:text-right rtl:text-left' },
        { key: 'amount', label: 'AMOUNT', class: 'ltr:text-right rtl:text-left' },
    ];

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

    // Generate ESC/POS data for thermal printer
    const generateESCPOSData = () => {
        const ESC = '\x1B';
        const GS = '\x1D';
        const LF = '\n';

        let data = '';

        // Initialize printer
        data += ESC + '@';

        // Center align
        data += ESC + 'a' + '\x01';

        // Store name (bold, large)
        data += ESC + 'E' + '\x01'; // Bold ON
        data += GS + '!' + '\x11'; // Double height and width
        data += (currentStore?.store_name || 'AndGate POS') + LF;
        data += GS + '!' + '\x00'; // Normal size
        data += ESC + 'E' + '\x00'; // Bold OFF

        // Store info
        data += (currentStore?.store_location || 'Dhaka, Bangladesh') + LF;
        data += (currentStore?.store_contact || '+880160000') + LF;

        // Divider
        data += '--------------------------------' + LF;

        // Left align for details
        data += ESC + 'a' + '\x00';

        // Invoice info
        data += 'Receipt: ' + invoice + LF;
        data += 'Date: ' + currentDate + ' ' + currentTime + LF;
        if (order_id) data += 'Order: #' + order_id + LF;
        if (customer.name && customer.name !== 'Customer') {
            data += 'Customer: ' + customer.name + LF;
        }

        data += '--------------------------------' + LF;

        // Items header
        data += ESC + 'E' + '\x01'; // Bold
        data += 'ITEM            QTY      AMOUNT' + LF;
        data += ESC + 'E' + '\x00'; // Bold off
        data += '--------------------------------' + LF;

        // Items
        items.forEach((item) => {
            const itemName = item.title.substring(0, 16).padEnd(16);
            const qty = item.quantity.toString().padStart(3);
            const amount = ('৳' + Number(item.amount).toFixed(2)).padStart(11);
            data += itemName + qty + amount + LF;
            data += '  ' + item.quantity + ' x ৳' + Number(item.price).toFixed(2) + LF;
        });

        data += '--------------------------------' + LF;

        // Totals
        data += 'Subtotal:' + ('৳' + subtotal.toFixed(2)).padStart(23) + LF;
        if (calculatedTax > 0) {
            data += 'Tax:' + ('৳' + calculatedTax.toFixed(2)).padStart(28) + LF;
        }
        if (calculatedDiscount > 0) {
            data += 'Discount:' + ('-৳' + calculatedDiscount.toFixed(2)).padStart(23) + LF;
        }

        data += '--------------------------------' + LF;

        // Grand total (bold, large)
        data += ESC + 'E' + '\x01'; // Bold
        data += GS + '!' + '\x10'; // Double width
        data += 'TOTAL: ৳' + grandTotal.toFixed(2) + LF;
        data += GS + '!' + '\x00'; // Normal
        data += ESC + 'E' + '\x00'; // Bold off

        data += '--------------------------------' + LF;

        // Payment info
        data += ESC + 'a' + '\x01'; // Center
        data += 'Payment: ' + (payment_method || 'Cash') + LF;
        data += 'Status: ' + (payment_status || 'Paid') + LF;

        data += '--------------------------------' + LF;

        // Thank you message
        data += ESC + 'E' + '\x01'; // Bold
        data += 'THANK YOU!' + LF;
        data += ESC + 'E' + '\x00'; // Bold off
        data += 'Please come again' + LF;
        data += LF;
        data += 'Powered by AndGate POS' + LF;

        // Feed paper and cut
        data += LF + LF + LF;
        data += GS + 'V' + '\x41' + '\x03'; // Cut paper

        return data;
    };

    const printReceipt = () => {
        // Detect if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            // Mobile: Use iframe printing directly
            printWithIframe();
            return;
        }

        // Desktop: Use window.open for preview
        // Capture all data before opening window
        const storeName = currentStore?.store_name || 'AndGate POS';
        const storeLocation = currentStore?.store_location || 'Dhaka, Bangladesh, 1212';
        const storeContact = currentStore?.store_contact || '+8801600000';
        const receiptInvoice = invoice || '#INV-PREVIEW';
        const receiptDate = currentDate;
        const receiptTime = currentTime;
        const receiptOrderId = order_id;
        const customerName = customer.name;
        const receiptItems = items;
        const receiptSubtotal = subtotal;
        const receiptTax = calculatedTax;
        const receiptDiscount = calculatedDiscount;
        const receiptGrandTotal = grandTotal;
        const receiptPaymentMethod = payment_method || 'Cash';
        const receiptPaymentStatus = payment_status || 'Paid';

        // Open a properly sized window for thermal receipt preview (80mm = ~302px)
        const printWindow = window.open('', '_blank', 'width=320,height=600,toolbar=no,menubar=no,scrollbars=yes');

        if (!printWindow) {
            // Fallback to iframe if popup blocked
            printWithIframe();
            return;
        }

        // Build items HTML
        let itemsHTML = '';
        receiptItems.forEach((item: any) => {
            itemsHTML += `
              <div class="item-row">
                <div class="item-name">${item.title}</div>
                <div class="item-qty">${item.quantity}</div>
                <div class="item-price">৳${Number(item.amount).toFixed(2)}</div>
              </div>
              <div style="font-size: 9px; color: #666; margin-left: 2px;">
                ${item.quantity} x ৳${Number(item.price).toFixed(2)}
              </div>
            `;
        });

        // Ensure document is ready
        printWindow.document.open();

        const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt Print</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=80mm">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: 80mm auto;
              margin: 0;
            }
            
            @media print {
              @page {
                size: 80mm auto;
                margin: 0mm;
              }
              
              body {
                margin: 0;
                padding: 2mm;
              }
            }
            
            body {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.2;
              width: 80mm;
              margin: 0;
              padding: 2mm;
              background: white;
              color: black;
            }
            
            .receipt-container {
              width: 100%;
              max-width: 76mm;
            }
            
            .center {
              text-align: center;
            }
            
            .left {
              text-align: left;
            }
            
            .right {
              text-align: right;
            }
            
            .bold {
              font-weight: bold;
            }
            
            .store-name {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 2px;
            }
            
            .store-info {
              font-size: 10px;
              margin-bottom: 1px;
            }
            
            .divider {
              border-top: 1px dashed #000;
              margin: 3mm 0;
            }
            
            .invoice-info {
              margin-bottom: 2mm;
            }
            
            .invoice-info div {
              margin-bottom: 1px;
            }
            
            .items-header {
              font-weight: bold;
              border-bottom: 1px solid #000;
              padding-bottom: 1px;
              margin-bottom: 1px;
            }
            
            .item-row {
              margin-bottom: 1px;
              display: flex;
              justify-content: space-between;
            }
            
            .item-name {
              width: 60%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            .item-qty {
              width: 15%;
              text-align: center;
            }
            
            .item-price {
              width: 25%;
              text-align: right;
            }
            
            .totals-section {
              margin-top: 2mm;
              border-top: 1px solid #000;
              padding-top: 1mm;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 1px;
            }
            
            .grand-total {
              font-weight: bold;
              font-size: 12px;
              border-top: 1px solid #000;
              padding-top: 1mm;
              margin-top: 1mm;
            }
            
            .footer {
              margin-top: 3mm;
              font-size: 10px;
            }
            
            .thank-you {
              font-size: 11px;
              font-weight: bold;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
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
              <div><strong>Receipt:</strong> ${receiptInvoice}</div>
              <div><strong>Date:</strong> ${receiptDate} ${receiptTime}</div>
              ${receiptOrderId ? `<div><strong>Order:</strong> #${receiptOrderId}</div>` : ''}
              ${customerName && customerName !== 'Customer' ? `<div><strong>Customer:</strong> ${customerName}</div>` : ''}
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
                <div>৳${receiptSubtotal.toFixed(2)}</div>
              </div>
              ${
                  receiptTax > 0
                      ? `
                <div class="total-row">
                  <div>Tax:</div>
                  <div>৳${receiptTax.toFixed(2)}</div>
                </div>`
                      : ''
              }
              ${
                  receiptDiscount > 0
                      ? `
                <div class="total-row">
                  <div>Discount:</div>
                  <div>-৳${receiptDiscount.toFixed(2)}</div>
                </div>`
                      : ''
              }
              <div class="total-row grand-total">
                <div>TOTAL:</div>
                <div>৳${receiptGrandTotal.toFixed(2)}</div>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <!-- Payment Info -->
            <div class="center">
              <div><strong>Payment:</strong> ${receiptPaymentMethod}</div>
              <div><strong>Status:</strong> ${receiptPaymentStatus}</div>
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
          
          <!-- Print Button -->
          <div style="text-align: center; margin-top: 5mm; padding: 3mm; background: #f5f5f5; border-top: 1px solid #ddd;">
            <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 8px;">
              🖨️ Print
            </button>
            <button onclick="window.close()" style="background: #6b7280; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-size: 12px;">
              ✕ Close
            </button>
          </div>
        </body>
      </html>
    `;

        printWindow.document.write(receiptContent);
        printWindow.document.close();

        // Wait for document to fully load before focusing
        setTimeout(() => {
            printWindow.focus();
        }, 100);
    };

    // Fallback: Hidden iframe printing (if popup is blocked or mobile)
    const printWithIframe = () => {
        // Capture all data before creating iframe
        const storeName = currentStore?.store_name || 'AndGate POS';
        const storeLocation = currentStore?.store_location || 'Dhaka, Bangladesh, 1212';
        const storeContact = currentStore?.store_contact || '+8801600000';
        const receiptInvoice = invoice || '#INV-PREVIEW';
        const receiptDate = currentDate;
        const receiptTime = currentTime;
        const receiptOrderId = order_id;
        const customerName = customer.name;
        const receiptItems = items;
        const receiptSubtotal = subtotal;
        const receiptTax = calculatedTax;
        const receiptDiscount = calculatedDiscount;
        const receiptGrandTotal = grandTotal;
        const receiptPaymentMethod = payment_method || 'Cash';
        const receiptPaymentStatus = payment_status || 'Paid';

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) {
            alert('Unable to print. Please try downloading PDF instead.');
            return;
        }

        // Build items HTML
        let itemsHTML = '';
        receiptItems.forEach((item: any) => {
            itemsHTML += `
              <div class="item-row">
                <div class="item-name">${item.title}</div>
                <div class="item-qty">${item.quantity}</div>
                <div class="item-price">৳${Number(item.amount).toFixed(2)}</div>
              </div>
              <div style="font-size: 9px; color: #666; margin-left: 2px;">
                ${item.quantity} x ৳${Number(item.price).toFixed(2)}
              </div>
            `;
        });

        const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt Print</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=80mm">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @page { size: 80mm auto; margin: 0; }
            body {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.2;
              width: 80mm;
              padding: 2mm;
              background: white;
              color: black;
            }
            .receipt-container { width: 100%; max-width: 76mm; }
            .center { text-align: center; }
            .store-name { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
            .store-info { font-size: 10px; margin-bottom: 1px; }
            .divider { border-top: 1px dashed #000; margin: 3mm 0; }
            .invoice-info { margin-bottom: 2mm; }
            .invoice-info div { margin-bottom: 1px; }
            .items-header { font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 1px; margin-bottom: 1px; }
            .item-row { margin-bottom: 1px; display: flex; justify-content: space-between; }
            .item-name { width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .item-qty { width: 15%; text-align: center; }
            .item-price { width: 25%; text-align: right; }
            .totals-section { margin-top: 2mm; border-top: 1px solid #000; padding-top: 1mm; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 1px; }
            .grand-total { font-weight: bold; font-size: 12px; border-top: 1px solid #000; padding-top: 1mm; margin-top: 1mm; }
            .footer { margin-top: 3mm; font-size: 10px; }
            .thank-you { font-size: 11px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="center">
              <div class="store-name">${storeName}</div>
              <div class="store-info">${storeLocation}</div>
              <div class="store-info">${storeContact}</div>
            </div>
            <div class="divider"></div>
            <div class="invoice-info">
              <div><strong>Receipt:</strong> ${receiptInvoice}</div>
              <div><strong>Date:</strong> ${receiptDate} ${receiptTime}</div>
              ${receiptOrderId ? `<div><strong>Order:</strong> #${receiptOrderId}</div>` : ''}
              ${customerName && customerName !== 'Customer' ? `<div><strong>Customer:</strong> ${customerName}</div>` : ''}
            </div>
            <div class="divider"></div>
            <div class="items-header">
              <div class="item-row">
                <div class="item-name">ITEM</div>
                <div class="item-qty">QTY</div>
                <div class="item-price">AMOUNT</div>
              </div>
            </div>
            ${itemsHTML}
            <div class="totals-section">
              <div class="total-row"><div>Subtotal:</div><div>৳${receiptSubtotal.toFixed(2)}</div></div>
              ${receiptTax > 0 ? `<div class="total-row"><div>Tax:</div><div>৳${receiptTax.toFixed(2)}</div></div>` : ''}
              ${receiptDiscount > 0 ? `<div class="total-row"><div>Discount:</div><div>-৳${receiptDiscount.toFixed(2)}</div></div>` : ''}
              <div class="total-row grand-total"><div>TOTAL:</div><div>৳${receiptGrandTotal.toFixed(2)}</div></div>
            </div>
            <div class="divider"></div>
            <div class="center">
              <div><strong>Payment:</strong> ${receiptPaymentMethod}</div>
              <div><strong>Status:</strong> ${receiptPaymentStatus}</div>
            </div>
            <div class="divider"></div>
            <div class="footer center">
              <div class="thank-you">THANK YOU!</div>
              <div>Please come again</div>
              <div style="margin-top: 2mm; font-size: 9px;">Powered by AndGate POS</div>
            </div>
          </div>
        </body>
      </html>
    `;

        iframeDoc.open();
        iframeDoc.write(receiptContent);
        iframeDoc.close();

        setTimeout(() => {
            try {
                if (iframe.contentWindow) {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                }
            } catch (error) {
                console.error('Print error:', error);
            }

            setTimeout(() => {
                try {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                } catch (error) {
                    console.error('Iframe cleanup error:', error);
                }
            }, 1000);
        }, 250);
    };

    return (
        <div>
            {/* Hidden POS Receipt Template */}
            <div ref={posReceiptRef} style={{ display: 'none' }}>
                {/* This is now handled by the printReceipt function */}
            </div>

            {/* Footer Buttons */}
            {isOrderCreated && (
                <div className="mb-6 flex flex-wrap justify-end gap-3">
                    <button className="btn btn-primary px-5 py-2 text-sm hover:bg-blue-600" onClick={exportPDF}>
                        📄 Download PDF
                    </button>
                    <button className="btn btn-success px-5 py-2 text-sm hover:bg-green-600" onClick={printReceipt}>
                        Print Receipt
                    </button>
                    {onClose && (
                        <button className="btn btn-outline px-5 py-2 text-sm hover:bg-gray-100" onClick={onClose}>
                            ✕ Close
                        </button>
                    )}
                </div>
            )}

            <div className="panel relative" ref={invoiceRef}>
                {/* PAID Watermark
                {isOrderCreated && (
                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 rotate-[-25deg] transform select-none text-6xl font-bold text-green-500 opacity-20">
                        PAID
                    </div>
                )} */}

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between px-4">
                    <h2 className="text-2xl font-semibold uppercase">Invoice</h2>
                    {currentStore?.logo_path ? (
                        <img src={currentStore.logo_path} alt="Store Logo" className="h-14 w-14 rounded object-contain" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                    ) : (
                        <img src="/assets/images/Logo-PNG.png" alt="Default Logo" className="w-14" />
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
                                <span>{payment_method || 'Cash'}</span>
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
