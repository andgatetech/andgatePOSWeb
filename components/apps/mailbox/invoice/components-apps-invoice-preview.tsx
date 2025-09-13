'use client';

import { useRef } from 'react';
import { useGetStoreQuery } from '@/store/features/store/storeApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ComponentsAppsInvoicePreview = ({ data }) => {
    const invoiceRef = useRef(null);
    const posReceiptRef = useRef(null);

    // Fetch store details
    const { data: storeData } = useGetStoreQuery();
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

    const printReceipt = () => {
        if (!posReceiptRef.current) return;

        // Create a new window for printing
        const printWindow = window.open('', '_blank');

        const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt Print</title>
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
              <div class="store-name">${currentStore?.store_name || 'AndGate POS'}</div>
              <div class="store-info">${currentStore?.store_location || 'Dhaka, Bangladesh, 1212'}</div>
              <div class="store-info">${currentStore?.store_contact || '+8801600000'}</div>
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
            
            ${items
                .map(
                    (item, idx) => `
              <div class="item-row">
                <div class="item-name">${item.title}</div>
                <div class="item-qty">${item.quantity}</div>
                <div class="item-price">৳${Number(item.amount).toFixed(2)}</div>
              </div>
              <div style="font-size: 9px; color: #666; margin-left: 2px;">
                ${item.quantity} x ৳${Number(item.price).toFixed(2)}
              </div>
            `
                )
                .join('')}
            
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
                </div>
              `
                      : ''
              }
              ${
                  calculatedDiscount > 0
                      ? `
                <div class="total-row">
                  <div>Discount:</div>
                  <div>-৳${calculatedDiscount.toFixed(2)}</div>
                </div>
              `
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
              <div><strong>Payment:</strong> ${payment_method || 'Cash'}</div>
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
        </body>
      </html>
    `;

        printWindow.document.write(receiptContent);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        };
    };

    return (
        <div>
            {/* Hidden POS Receipt Template */}
            <div ref={posReceiptRef} style={{ display: 'none' }}>
                {/* This is now handled by the printReceipt function */}
            </div>

            {/* Footer Buttons */}
            {isOrderCreated && (
                <div className="mb-6 flex justify-end gap-4">
                    <button className="btn btn-primary px-5 py-2 text-sm hover:bg-blue-600" onClick={exportPDF}>
                        Download Receipt
                    </button>
                    <button className="btn btn-secondary px-5 py-2 text-sm hover:bg-gray-200" onClick={printReceipt}>
                        Print Receipt
                    </button>
                    <button className="btn btn-outline px-5 py-2 text-sm hover:bg-gray-100" onClick={() => window.close()}>
                        Close
                    </button>
                </div>
            )}

            <div className="panel relative" ref={invoiceRef}>
                {/* PAID Watermark */}
                {isOrderCreated && (
                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 rotate-[-25deg] transform select-none text-6xl font-bold text-green-500 opacity-20">
                        PAID
                    </div>
                )}

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

export default ComponentsAppsInvoicePreview;
