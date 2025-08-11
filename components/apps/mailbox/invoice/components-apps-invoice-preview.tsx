'use client';

import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import IconSend from '@/components/icon/icon-send';
import IconPrinter from '@/components/icon/icon-printer';

const ComponentsAppsInvoicePreview = ({ data }) => {
    const invoiceRef = useRef(null);

    const exportTable = () => {
        if (!invoiceRef.current) return;

        html2canvas(invoiceRef.current, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('invoice.pdf');
        });
    };

    const { customer, items = [], tax = 0, discount = 0, paymentMethod = 'Cash', paymentStatus = 'Paid', totals } = data || {};

    // If totals object not passed, calculate it dynamically
    const subtotal = items.reduce((acc, item) => acc + Number(item.amount || 0), 0);
    const calculatedTax = tax || 0;
    const calculatedDiscount = discount || 0;
    const grandTotal = totals?.total ?? subtotal + calculatedTax - calculatedDiscount;

    const columns = [
        { key: 'id', label: 'S.NO' },
        { key: 'title', label: 'ITEMS' },
        { key: 'quantity', label: 'QTY' },
        { key: 'price', label: 'PRICE', class: 'ltr:text-right rtl:text-left' },
        { key: 'amount', label: 'AMOUNT', class: 'ltr:text-right rtl:text-left' },
    ];

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-center gap-4 lg:justify-end">
                

                <button type="button" className="btn btn-primary gap-2" onClick={exportTable}>
                    <IconPrinter />
                    Print PDF
                </button>
            </div>
            {/* Invoice container to capture for PDF */}
            <div className="panel" ref={invoiceRef}>
                <div className="flex flex-wrap justify-between gap-4 px-4">
                    <div className="text-2xl font-semibold uppercase">Invoice</div>
                    <div className="shrink-0">
                        <img src="/assets/images/logo.svg" alt="Logo" className="w-14 ltr:ml-auto rtl:mr-auto" />
                    </div>
                </div>

                <div className="mt-6 space-y-1 px-4 text-white-dark ltr:text-right rtl:text-left">
                    <div>Dhaka, Bangladesh, 1212</div>
                    <div>andgate@gmail.com</div>
                    <div>+8801610108851</div>
                </div>

                <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

                <div className="flex flex-col flex-wrap justify-between gap-6 lg:flex-row">
                    <div className="flex-1 space-y-1 text-white-dark">
                        <div>Issue For:</div>
                        <div className="font-semibold text-black dark:text-white">{customer?.name || 'John Doe'}</div>
                        <div>{customer?.email || 'No Email'}</div>
                        <div>{customer?.phone || 'No Phone'}</div>
                    </div>

                    <div className="flex flex-col justify-between gap-6 sm:flex-row lg:w-2/3">
                        <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="text-white-dark">Invoice :</div>
                                <div>#8701</div>
                            </div>
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="text-white-dark">Issue Date :</div>
                                <div>13 Sep 2022</div>
                            </div>
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="text-white-dark">Order ID :</div>
                                <div>#OD-85794</div>
                            </div>
                        </div>

                        <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="text-white-dark">Paid:</div>
                                <div className="whitespace-nowrap">{paymentStatus}</div>
                            </div>
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="text-white-dark">Type:</div>
                                <div>{paymentMethod}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="table-responsive mt-6">
                    <table className="table-striped">
                        <thead>
                            <tr>
                                {columns.map((column) => (
                                    <th key={column.key} className={column?.class}>
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.title}</td>
                                    <td>{item.quantity}</td>
                                    <td className="ltr:text-right rtl:text-left">${Number(item.price).toFixed(2)}</td>
                                    <td className="ltr:text-right rtl:text-left">${Number(item.amount).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 grid grid-cols-1 px-4 sm:grid-cols-2">
                    <div></div>
                    <div className="space-y-2 ltr:text-right rtl:text-left">
                        <div className="flex items-center">
                            <div className="flex-1">Subtotal</div>
                            <div className="w-[37%]">${subtotal.toFixed(2)}</div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex-1">Tax</div>
                            <div className="w-[37%]">${calculatedTax.toFixed(2)}</div>
                        </div>

                        <div className="flex items-center">
                            <div className="flex-1">Discount</div>
                            <div className="w-[37%]">${calculatedDiscount.toFixed(2)}</div>
                        </div>
                        <div className="flex items-center text-lg font-semibold">
                            <div className="flex-1">Grand Total</div>
                            <div className="w-[37%]">${grandTotal.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentsAppsInvoicePreview;
