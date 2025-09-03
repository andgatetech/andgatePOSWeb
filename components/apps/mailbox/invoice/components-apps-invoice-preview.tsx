'use client';

import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import IconPrinter from '@/components/icon/icon-printer';
import { useGetStoreQuery } from '@/store/features/store/storeApi';

const ComponentsAppsInvoicePreview = ({ data }) => {
    const invoiceRef = useRef(null);

    // Fetch store details
    const { data: storeData } = useGetStoreQuery();
    const currentStore = storeData?.data || {};

    const exportPDF = () => {
        if (!invoiceRef.current) return;

        html2canvas(invoiceRef.current, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice-${data?.invoice || 'preview'}.pdf`);
        });
    };

    const { customer = {}, items = [], totals = {}, tax = 0, discount = 0, invoice = '#INV-PREVIEW', order_id, isOrderCreated = false } = data || {};

    const paymentStatus = 'Paid'; // Always Paid
    const paymentMethod = 'Cash'; // Default

    const subtotal = items.reduce((acc, item) => acc + Number(item.amount || 0), 0);
    const calculatedTax = totals.tax ?? tax;
    const calculatedDiscount = totals.discount ?? discount;
    const grandTotal = totals.grand_total ?? subtotal + calculatedTax - calculatedDiscount;

    const columns = [
        { key: 'id', label: 'S.NO' },
        { key: 'title', label: 'ITEMS' },
        { key: 'quantity', label: 'QTY' },
        { key: 'price', label: 'PRICE', class: 'ltr:text-right rtl:text-left' },
        { key: 'amount', label: 'AMOUNT', class: 'ltr:text-right rtl:text-left' },
    ];

    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <div>
            {/* Download PDF Button */}
            <div className="mb-6 flex justify-start gap-4">
                <button type="button" className="btn btn-primary gap-2" onClick={exportPDF}>
                    <IconPrinter /> Download Invoice
                </button>
            </div>

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
                        {customer.membership && customer.membership !== 'normal' && (
                            <div
                                className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                    customer.membership === 'platinum'
                                        ? 'bg-purple-100 text-purple-800'
                                        : customer.membership === 'gold'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {customer.membership.toUpperCase()} MEMBER
                            </div>
                        )}
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
                                <span className="font-semibold text-green-600">{paymentStatus}</span>
                            </div>
                            <div className="mb-2 flex justify-between">
                                <span>Payment Method:</span>
                                <span>{paymentMethod}</span>
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
                                <tr key={item.id}>
                                    <td className="py-2">{idx + 1}</td>
                                    <td className="py-2">{item.title}</td>
                                    <td className="py-2">{item.quantity}</td>
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
