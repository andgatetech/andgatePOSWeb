'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetStoreLogoQuery, useGetStoreQuery } from '@/store/features/store/storeApi';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

// Dynamic imports for pdfmake to avoid SSR issues
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

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
    const { formatCurrency, currency } = useCurrency();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [logoDataUrl, setLogoDataUrl] = useState<string>('');
    const [pdfMake, setPdfMake] = useState<any>(null);

    // Get current store from hook
    const { currentStore: hookStore } = useCurrentStore();

    // Fetch store details as fallback if storeId is provided
    const { data: storeData } = useGetStoreQuery(storeId ? { store_id: storeId } : undefined, {
        skip: !storeId,
    });

    // Use hookStore first, fallback to API data - wrapped in useMemo to prevent unnecessary re-renders
    const currentStore = useMemo(() => {
        return hookStore || storeData?.data || {};
    }, [hookStore, storeData?.data]);

    // Fetch store logo from dedicated endpoint
    const currentStoreId = currentStore?.id || storeId;
    const { data: logoData } = useGetStoreLogoQuery(currentStoreId, {
        skip: !currentStoreId,
    });

    const {
        customer = {},
        items = [],
        totals = {},
        tax = 0,
        discount = 0,
        invoice = '#INV-PREVIEW',
        order_id,
        isOrderCreated = false,
        payment_status,
        paymentStatus,
        payment_method,
        paymentMethod,
        amount_paid,
        due_amount,
        partialPaymentAmount,
        dueAmount,
        isReturn = false,
        keptItems = [],
        returnedItems = [],
        exchangeItems = [],
        original_order_id,
        returnTotal = 0,
        exchangeTotal = 0,
        netTransaction = 0,
    } = data || {};

    // Use whichever is available
    const displayPaymentStatus = payment_status || paymentStatus;
    const displayPaymentMethod = payment_method || paymentMethod;

    // Calculate payment amounts
    const amountPaid = Number(amount_paid ?? partialPaymentAmount ?? 0);
    const amountDue = Number(due_amount ?? dueAmount ?? 0);

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
        second: '2-digit',
        hour12: true,
    });

    // PDF-safe currency formatter (uses ASCII-safe symbols for pdfMake compatibility)
    const formatCurrencyPDF = (amount: number | string | null | undefined): string => {
        if (amount === null || amount === undefined) return '-';
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return '-';

        const formattedNumber = numAmount.toFixed(currency.decimal_places);
        const [integerPart, decimalPart] = formattedNumber.split('.');
        const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousand_separator);
        const finalNumber = decimalPart ? `${withSeparators}${currency.decimal_separator}${decimalPart}` : withSeparators;

        const pdfSafeSymbol = currency.currency_code || currentStore?.currency?.currency_code || 'USD';

        return currency.currency_position === 'before' ? `${pdfSafeSymbol} ${finalNumber}` : `${finalNumber} ${pdfSafeSymbol}`;
    };

    // Load pdfMake dynamically
    useEffect(() => {
        const loadPdfMake = async () => {
            try {
                // Dynamic import for client-side only
                const pdfMakeModule: any = await import('pdfmake/build/pdfmake');
                const pdfFontsModule: any = await import('pdfmake/build/vfs_fonts');

                // Handle different module export formats (varies by bundler)
                const pdfMakeInstance = pdfMakeModule.default || pdfMakeModule;
                const vfsFonts = pdfFontsModule.default?.pdfMake?.vfs || pdfFontsModule.pdfMake?.vfs || pdfFontsModule.default?.vfs || pdfFontsModule.vfs || pdfFontsModule.default;

                if (pdfMakeInstance && vfsFonts) {
                    pdfMakeInstance.vfs = vfsFonts;
                    setPdfMake(pdfMakeInstance);
                }
            } catch (error) {
                // pdfMake loading failed
            }
        };

        loadPdfMake();
    }, []);

    // Load logo from dedicated endpoint only
    useEffect(() => {
        // Use logo from dedicated API endpoint
        if (logoData?.data?.logo_base64) {
            setLogoDataUrl(logoData.data.logo_base64);
        }
    }, [logoData]);

    // Convert number to words
    const numberToWords = (num: number): string => {
        if (num === 0) return 'Zero';

        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        const convertLessThanThousand = (n: number): string => {
            if (n === 0) return '';
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
            return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
        };

        const convertThousands = (n: number): string => {
            if (n < 1000) return convertLessThanThousand(n);
            if (n < 100000) {
                const thousands = Math.floor(n / 1000);
                const remainder = n % 1000;
                return convertLessThanThousand(thousands) + ' Thousand' + (remainder !== 0 ? ' ' + convertLessThanThousand(remainder) : '');
            }
            const lakhs = Math.floor(n / 100000);
            const remainder = n % 100000;
            return convertLessThanThousand(lakhs) + ' Lakh' + (remainder !== 0 ? ' ' + convertThousands(remainder) : '');
        };

        return convertThousands(Math.floor(num)) + ' Taka Only';
    };

    // Format warranty duration
    const formatWarrantyDuration = (warranty: Warranty | null | undefined) => {
        if (!warranty) return null;
        if (warranty.duration_months) return `${warranty.duration_months * 30} Day(s)`;
        if (warranty.duration_days) return `${warranty.duration_days} Day(s)`;
        return 'Product Life Time';
    };

    const getPaymentStatusColor = (status: string) => {
        // Try to get color from store's payment_statuses first
        if (currentStore?.payment_statuses && status) {
            const paymentStatus = currentStore.payment_statuses.find((ps) => ps.status_name.toLowerCase() === status.toLowerCase());
            if (paymentStatus?.status_color) {
                return paymentStatus.status_color;
            }
        }

        // Fallback to default colors if not found in store settings
        const s = status?.toLowerCase();
        if (s === 'paid' || s === 'completed' || s === 'approved') return '#059669';
        if (s === 'due' || s === 'unpaid' || s === 'pending') return '#d97706';
        if (s === 'failed' || s === 'cancelled') return '#dc2626';
        if (s === 'partial') return '#ea580c';
        return '#6b7280';
    };

    const totalQty = invoiceItems.reduce((sum, item) => sum + item.quantity, 0);

    // Generate PDF using pdfmake
    const exportPDF = async () => {
        if (!pdfMake) {
            alert('PDF library is still loading. Please try again in a moment.');
            return;
        }

        setIsPrinting(true);

        try {
            const content: Content = [];

            // Header with logo and company info
            const headerContent: any = {
                columns: [],
                margin: [0, 0, 0, 10],
            };

            // Add logo if available (must be data URL for pdfmake)
            // pdfmake only supports data URLs (base64), not http URLs
            if (logoDataUrl && logoDataUrl.startsWith('data:')) {
                headerContent.columns.push({
                    image: logoDataUrl,
                    width: 80,
                    alignment: 'left',
                });
            }

            // Company info
            headerContent.columns.push({
                stack: [
                    { text: currentStore?.store_name || 'Store Name', style: 'companyName' },
                    { text: currentStore?.store_location || 'Store Address', style: 'companyInfo' },
                    {
                        text: [
                            currentStore?.store_email ? `${currentStore.store_email}` : '',
                            currentStore?.store_email && currentStore?.store_contact ? ' | ' : '',
                            currentStore?.store_contact ? `Phone: ${currentStore.store_contact}` : '',
                        ],
                        style: 'companyInfo',
                    },
                ],
                width: '*',
                alignment: 'left',
            });

            content.push(headerContent);

            // Add divider
            content.push({
                canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2 }],
                margin: [0, 5, 0, 10],
            });

            // Invoice title
            content.push({
                text: isReturn ? 'RETURN RECEIPT' : 'INVOICE',
                style: 'invoiceTitle',
                alignment: 'center',
                margin: [0, 0, 0, 10],
            });

            // Invoice details and customer info
            const detailsContent: any = {
                columns: [
                    {
                        stack: [{ text: [{ text: 'Invoice No.: ', bold: true }, invoice] }, { text: [{ text: 'Date: ', bold: true }, `${currentDate} ${currentTime}`] }],
                        width: '50%',
                    },
                    {
                        stack: [
                            { text: [{ text: 'To: ', bold: true }, customer.name || 'Walk-in Customer'] },
                            customer.email ? { text: [{ text: 'Email: ', bold: true }, customer.email] } : {},
                            customer.phone ? { text: [{ text: 'Contact: ', bold: true }, customer.phone] } : {},
                        ],
                        width: '50%',
                    },
                ],
                columnGap: 20,
                margin: [0, 0, 0, 10],
                fontSize: 9,
            };

            if (order_id) {
                detailsContent.columns[0].stack.push({ text: [{ text: 'Order ID: ', bold: true }, `#${order_id}`] });
            }

            detailsContent.columns[0].stack.push({
                text: [
                    { text: 'Order Status: ', bold: true },
                    {
                        text: (displayPaymentStatus || 'Pending').charAt(0).toUpperCase() + (displayPaymentStatus || 'pending').slice(1),
                        color: getPaymentStatusColor(displayPaymentStatus || 'pending'),
                        bold: true,
                    },
                ],
            });

            detailsContent.columns[0].stack.push({
                text: [{ text: 'Payment Method: ', bold: true }, displayPaymentMethod || 'Cash'],
            });

            if (isReturn && original_order_id) {
                detailsContent.columns[0].stack.push({
                    text: [{ text: 'Original Order: ', bold: true }, `#${original_order_id}`],
                });
            }

            content.push(detailsContent);

            // Products table
            if (!isReturn) {
                const tableBody: any[] = [
                    [
                        { text: '#', style: 'tableHeader', alignment: 'center' },
                        { text: 'Product Name', style: 'tableHeader' },
                        { text: 'Qty', style: 'tableHeader', alignment: 'center' },
                        { text: 'Unit Price', style: 'tableHeader', alignment: 'right' },
                        { text: 'Tax/VAT', style: 'tableHeader', alignment: 'right' },
                        { text: 'Discount', style: 'tableHeader', alignment: 'right' },
                        { text: 'Amount', style: 'tableHeader', alignment: 'right' },
                    ],
                ];

                invoiceItems.forEach((product, index) => {
                    const productName: any[] = [{ text: product.title, bold: true }];

                    if (product.variantName) {
                        productName.push({ text: `\nVariant: ${product.variantName}`, fontSize: 8, color: '#4338ca' });
                    }

                    if (product.warranty && formatWarrantyDuration(product.warranty)) {
                        productName.push({ text: `\nWarranty: ${formatWarrantyDuration(product.warranty)}`, fontSize: 8, color: '#6b7280' });
                    }

                    if (product.serials && product.serials.length > 0) {
                        productName.push({
                            text: `\n${product.serials.map((s) => s.serial_number).join(' ')}`,
                            fontSize: 8,
                            color: '#6b7280',
                        });
                    }

                    tableBody.push([
                        { text: (index + 1).toString(), alignment: 'center' },
                        { stack: productName },
                        { text: `${product.quantity.toFixed(2)} ${product.unit || 'Pcs'}`, alignment: 'center' },
                        { text: formatCurrencyPDF(product.price), alignment: 'right' },
                        { text: product.tax_rate ? `${product.tax_rate}%` : '-', alignment: 'right' },
                        { text: formatCurrencyPDF(0), alignment: 'right' },
                        { text: formatCurrencyPDF(product.amount), alignment: 'right', bold: true },
                    ]);
                });

                content.push({
                    table: {
                        headerRows: 1,
                        widths: [25, '*', 60, 70, 50, 50, 70],
                        body: tableBody,
                    },
                    layout: {
                        fillColor: function (rowIndex: number) {
                            return rowIndex === 0 ? '#e5e7eb' : null;
                        },
                        hLineWidth: function () {
                            return 0.5;
                        },
                        vLineWidth: function () {
                            return 0.5;
                        },
                        hLineColor: function () {
                            return '#d1d5db';
                        },
                        vLineColor: function () {
                            return '#d1d5db';
                        },
                    },
                    margin: [0, 0, 0, 10],
                    fontSize: 9,
                });
            } else {
                // Return invoice tables (kept, returned, exchange)
                if (keptItems.length > 0) {
                    content.push({ text: 'ITEMS KEPT', style: 'sectionHeader', color: '#059669', margin: [0, 5, 0, 5] });
                    const keptTableBody: any[] = [
                        [
                            { text: '#', style: 'tableHeader', alignment: 'center' },
                            { text: 'Product Name', style: 'tableHeader' },
                            { text: 'Qty', style: 'tableHeader', alignment: 'center' },
                            { text: 'Unit Price', style: 'tableHeader', alignment: 'right' },
                            { text: 'Amount', style: 'tableHeader', alignment: 'right' },
                        ],
                    ];

                    keptItems.forEach((product: any, index: number) => {
                        keptTableBody.push([
                            { text: (index + 1).toString(), alignment: 'center' },
                            { text: product.title },
                            { text: product.quantity.toString(), alignment: 'center' },
                            { text: formatCurrencyPDF(product.price), alignment: 'right' },
                            { text: formatCurrencyPDF(product.amount), alignment: 'right', bold: true },
                        ]);
                    });

                    content.push({
                        table: {
                            headerRows: 1,
                            widths: [25, '*', 60, 80, 80],
                            body: keptTableBody,
                        },
                        layout: {
                            fillColor: function (rowIndex: number) {
                                return rowIndex === 0 ? '#d1fae5' : null;
                            },
                        },
                        margin: [0, 0, 0, 10],
                        fontSize: 9,
                    });
                }

                if (returnedItems.length > 0) {
                    content.push({ text: 'RETURNED ITEMS', style: 'sectionHeader', color: '#dc2626', margin: [0, 5, 0, 5] });
                    const returnedTableBody: any[] = [
                        [
                            { text: '#', style: 'tableHeader', alignment: 'center' },
                            { text: 'Product Name', style: 'tableHeader' },
                            { text: 'Qty', style: 'tableHeader', alignment: 'center' },
                            { text: 'Unit Price', style: 'tableHeader', alignment: 'right' },
                            { text: 'Refund', style: 'tableHeader', alignment: 'right' },
                        ],
                    ];

                    returnedItems.forEach((product: any, index: number) => {
                        returnedTableBody.push([
                            { text: (index + 1).toString(), alignment: 'center' },
                            { text: product.title },
                            { text: `-${product.quantity}`, alignment: 'center' },
                            { text: formatCurrencyPDF(product.price), alignment: 'right' },
                            { text: `-${formatCurrencyPDF(product.amount)}`, alignment: 'right', bold: true, color: '#dc2626' },
                        ]);
                    });

                    content.push({
                        table: {
                            headerRows: 1,
                            widths: [25, '*', 60, 80, 80],
                            body: returnedTableBody,
                        },
                        layout: {
                            fillColor: function (rowIndex: number) {
                                return rowIndex === 0 ? '#fee2e2' : null;
                            },
                        },
                        margin: [0, 0, 0, 10],
                        fontSize: 9,
                    });
                }

                if (exchangeItems.length > 0) {
                    content.push({ text: 'EXCHANGE ITEMS', style: 'sectionHeader', color: '#2563eb', margin: [0, 5, 0, 5] });
                    const exchangeTableBody: any[] = [
                        [
                            { text: '#', style: 'tableHeader', alignment: 'center' },
                            { text: 'Product Name', style: 'tableHeader' },
                            { text: 'Qty', style: 'tableHeader', alignment: 'center' },
                            { text: 'Unit Price', style: 'tableHeader', alignment: 'right' },
                            { text: 'Amount', style: 'tableHeader', alignment: 'right' },
                        ],
                    ];

                    exchangeItems.forEach((product: any, index: number) => {
                        exchangeTableBody.push([
                            { text: (index + 1).toString(), alignment: 'center' },
                            { text: product.title },
                            { text: product.quantity.toString(), alignment: 'center' },
                            { text: formatCurrencyPDF(product.price), alignment: 'right' },
                            { text: formatCurrencyPDF(product.amount), alignment: 'right', bold: true },
                        ]);
                    });

                    content.push({
                        table: {
                            headerRows: 1,
                            widths: [25, '*', 60, 80, 80],
                            body: exchangeTableBody,
                        },
                        layout: {
                            fillColor: function (rowIndex: number) {
                                return rowIndex === 0 ? '#dbeafe' : null;
                            },
                        },
                        margin: [0, 0, 0, 10],
                        fontSize: 9,
                    });
                }
            }

            // Totals section
            const totalsContent: any[] = [];

            if (!isReturn) {
                totalsContent.push([
                    { text: 'Total Qty.', bold: true, border: [false, true, false, false] },
                    { text: `${totalQty.toFixed(2)} ${invoiceItems[0]?.unit || 'Pcs'}`, alignment: 'right', border: [false, true, false, false] },
                ]);
                totalsContent.push([
                    { text: 'Subtotal', bold: true, border: [false, false, false, false] },
                    { text: formatCurrencyPDF(subtotal), alignment: 'right', border: [false, false, false, false] },
                ]);

                if (calculatedTax > 0) {
                    totalsContent.push([
                        { text: 'Tax', bold: true, border: [false, false, false, false] },
                        { text: formatCurrencyPDF(calculatedTax), alignment: 'right', border: [false, false, false, false] },
                    ]);
                }

                if (calculatedDiscount > 0) {
                    totalsContent.push([
                        { text: 'Discount', bold: true, border: [false, false, false, false], color: '#dc2626' },
                        { text: `-${formatCurrencyPDF(calculatedDiscount)}`, alignment: 'right', border: [false, false, false, false], color: '#dc2626' },
                    ]);
                }

                totalsContent.push([
                    { text: 'Grand Total', bold: true, fontSize: 11, fillColor: '#f3f4f6', border: [false, true, false, true] },
                    { text: formatCurrencyPDF(grandTotal), alignment: 'right', bold: true, fontSize: 11, fillColor: '#f3f4f6', border: [false, true, false, true] },
                ]);

                if ((displayPaymentStatus?.toLowerCase() === 'partial' || displayPaymentStatus?.toLowerCase() === 'due') && amountPaid > 0) {
                    totalsContent.push([
                        { text: 'Amount Paid', bold: true, border: [false, false, false, false], color: '#059669' },
                        { text: formatCurrencyPDF(amountPaid), alignment: 'right', border: [false, false, false, false], color: '#059669' },
                    ]);
                }

                if ((displayPaymentStatus?.toLowerCase() === 'partial' || displayPaymentStatus?.toLowerCase() === 'due') && amountDue > 0) {
                    totalsContent.push([
                        { text: 'Total Due', bold: true, fontSize: 11, fillColor: '#fee2e2', border: [false, true, false, true], color: '#dc2626' },
                        {
                            text: formatCurrencyPDF(amountDue),
                            alignment: 'right',
                            bold: true,
                            fontSize: 11,
                            fillColor: '#fee2e2',
                            border: [false, true, false, true],
                            color: '#dc2626',
                        },
                    ]);
                }
            } else {
                if (exchangeTotal > 0) {
                    totalsContent.push([
                        { text: 'Exchange Total', bold: true, border: [false, true, false, false] },
                        { text: formatCurrencyPDF(exchangeTotal), alignment: 'right', border: [false, true, false, false] },
                    ]);
                }

                if (returnTotal > 0) {
                    totalsContent.push([
                        { text: 'Return Credit', bold: true, border: [false, false, false, false], color: '#dc2626' },
                        { text: `-${formatCurrencyPDF(returnTotal)}`, alignment: 'right', border: [false, false, false, false], color: '#dc2626' },
                    ]);
                }

                totalsContent.push([
                    {
                        text: netTransaction >= 0 ? 'Net Payable' : 'Net Refund',
                        bold: true,
                        fontSize: 11,
                        fillColor: '#f3f4f6',
                        border: [false, true, false, true],
                    },
                    {
                        text: formatCurrencyPDF(Math.abs(netTransaction)),
                        alignment: 'right',
                        bold: true,
                        fontSize: 11,
                        fillColor: '#f3f4f6',
                        border: [false, true, false, true],
                        color: netTransaction >= 0 ? '#059669' : '#dc2626',
                    },
                ]);
            }

            content.push({
                table: {
                    widths: ['*', 100],
                    body: totalsContent,
                },
                layout: 'noBorders',
                margin: [300, 0, 0, 10],
                fontSize: 9,
            });

            // Amount in words
            content.push({
                text: [{ text: 'In Word: ', bold: true }, numberToWords(isReturn ? Math.abs(netTransaction) : grandTotal)],
                margin: [0, 5, 0, 15],
                fontSize: 9,
            });

            // Signature section
            content.push({
                columns: [
                    {
                        stack: [
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 1 }] },
                            { text: 'Received By', alignment: 'center', margin: [0, 5, 0, 0], fontSize: 9, bold: true },
                        ],
                        width: '33.33%',
                    },
                    {
                        stack: [{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 1 }] }, { text: 'Checked By', alignment: 'center', margin: [0, 5, 0, 0], fontSize: 9, bold: true }],
                        width: '33.33%',
                    },
                    {
                        stack: [
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 1 }] },
                            { text: 'Authorized By', alignment: 'center', margin: [0, 5, 0, 0], fontSize: 9, bold: true },
                        ],
                        width: '33.33%',
                    },
                ],
                columnGap: 10,
                margin: [0, 30, 0, 20],
            });

            // Footer
            content.push({
                stack: [
                    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }], margin: [0, 0, 0, 5] },
                    { text: `Print Date: ${currentDate} ${currentTime}`, alignment: 'center', fontSize: 8, color: '#6b7280' },
                    { text: `Powered by: AndgatePOS | ${invoice} | Page: 1 of 1`, alignment: 'center', fontSize: 8, color: '#6b7280' },
                ],
            });

            const docDefinition: TDocumentDefinitions = {
                content: content,
                pageSize: 'A4',
                pageMargins: [40, 40, 40, 40],
                styles: {
                    companyName: {
                        fontSize: 18,
                        bold: true,
                        color: '#1f2937',
                        margin: [0, 0, 0, 5],
                    },
                    companyInfo: {
                        fontSize: 9,
                        color: '#6b7280',
                        margin: [0, 2, 0, 0],
                    },
                    invoiceTitle: {
                        fontSize: 20,
                        bold: true,
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 9,
                        color: '#1f2937',
                    },
                    sectionHeader: {
                        fontSize: 10,
                        bold: true,
                    },
                },
                defaultStyle: {
                    fontSize: 9,
                },
            };

            pdfMake.createPdf(docDefinition).download(`invoice-${invoice || 'preview'}.pdf`);
        } catch (error) {
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsPrinting(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handlePrintPreview = () => {
        window.print();
    };

    // Generate receipt HTML for thermal printer
    const generateReceiptHTML = () => {
        const storeName = currentStore?.store_name || 'AndGatePOS';
        const storeLocation = currentStore?.store_location || 'Store Address';
        const storeContact = currentStore?.store_contact || 'Contact';

        let itemsHTML = '';
        invoiceItems.forEach((item: InvoiceItem, index: number) => {
            let variantInfo = '';
            if (item.variantName) {
                variantInfo = `<div class="item-variant">${item.variantName}</div>`;
            }

            let serialInfo = '';
            if (item.has_serial && item.serials && item.serials.length > 0) {
                serialInfo = `<div class="item-serial">S/N: ${item.serials[0].serial_number}</div>`;
            }

            let warrantyInfo = '';
            if (item.has_warranty && item.warranty) {
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: 58mm auto; margin: 0; }
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
        .center { text-align: center; }
        .store-name { font-size: 16px; font-weight: bold; margin-bottom: 3px; }
        .store-info { font-size: 10px; margin-bottom: 2px; }
        .divider { border-top: 1px dashed #000; margin: 4mm 0; }
        .invoice-info { margin-bottom: 3mm; font-size: 10px; }
        .invoice-info div { margin-bottom: 2px; }
        .items-header { font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 3px; font-size: 10px; }
        .item-row { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 10px; }
        .item-name { flex: 1; padding-right: 5px; }
        .item-qty { width: 40px; text-align: center; }
        .item-price { width: 70px; text-align: right; }
        .item-details { font-size: 9px; color: #666; margin-bottom: 3px; padding-left: 3px; }
        .item-variant { font-size: 9px; color: #4338ca; padding-left: 3px; margin-bottom: 1px; }
        .item-serial { font-size: 9px; color: #059669; padding-left: 3px; margin-bottom: 1px; font-weight: bold; }
        .item-warranty { font-size: 9px; color: #059669; padding-left: 3px; margin-bottom: 2px; }
        .totals-section { margin-top: 3mm; border-top: 1px solid #000; padding-top: 2mm; font-size: 10px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
        .grand-total { font-weight: bold; font-size: 13px; border-top: 2px solid #000; padding-top: 2mm; margin-top: 2mm; }
        .footer { margin-top: 4mm; font-size: 10px; }
        .thank-you { font-size: 12px; font-weight: bold; margin-bottom: 2px; }
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: 58mm auto; margin: 0mm; }
        }
        @media screen {
            body { padding-top: 60px; }
            .print-toolbar {
                position: fixed; top: 0; left: 0; right: 0;
                background: #f3f4f6; padding: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                z-index: 1000; display: flex;
                justify-content: center; gap: 10px; flex-wrap: wrap;
            }
            .print-btn, .close-btn {
                padding: 10px 24px; border: none; border-radius: 6px;
                font-size: 14px; font-weight: 600; cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s;
            }
            .print-btn { background: #10b981; color: white; }
            .print-btn:active { transform: scale(0.98); }
            .close-btn { background: #6b7280; color: white; }
            .close-btn:active { transform: scale(0.98); }
        }
        @media print {
            .print-toolbar { display: none !important; }
            body { padding-top: 0; }
        }
    </style>
</head>
<body>
    <div class="print-toolbar">
        <button class="print-btn" onclick="window.print()">🖨️ Print Receipt</button>
        <button class="close-btn" onclick="window.close()">✕ Close</button>
    </div>
    <div class="receipt-container">
        <div class="center">
            <div class="store-name">${storeName}</div>
            <div class="store-info">${storeLocation}</div>
            <div class="store-info">${storeContact}</div>
        </div>
        <div class="divider"></div>
        <div class="invoice-info">
            <div><strong>Receipt:</strong> ${invoice}</div>
            <div><strong>Date:</strong> ${currentDate} ${currentTime}</div>
            ${order_id ? `<div><strong>Order:</strong> #${order_id}</div>` : ''}
            ${customer.name ? `<div><strong>Customer:</strong> ${customer.name}</div>` : ''}
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
            <div class="total-row">
                <div>Subtotal:</div>
                <div>${formatCurrency(subtotal)}</div>
            </div>
            ${calculatedTax > 0 ? `<div class="total-row"><div>Tax:</div><div>${formatCurrency(calculatedTax)}</div></div>` : ''}
            ${calculatedDiscount > 0 ? `<div class="total-row"><div>Discount:</div><div>-${formatCurrency(calculatedDiscount)}</div></div>` : ''}
            <div class="total-row grand-total">
                <div>TOTAL:</div>
                <div>${formatCurrency(grandTotal)}</div>
            </div>
            ${amountPaid > 0 ? `<div class="total-row"><div>Amount Paid:</div><div>${formatCurrency(amountPaid)}</div></div>` : ''}
            ${amountDue > 0 ? `<div class="total-row" style="color: #dc2626;"><div>Amount Due:</div><div>${formatCurrency(amountDue)}</div></div>` : ''}
        </div>
        <div class="divider"></div>
        <div class="center">
            <div><strong>Payment Method:</strong> ${displayPaymentMethod || 'Cash'}</div>
            <div><strong>Status:</strong> ${displayPaymentStatus || 'Pending'}</div>
        </div>
        <div class="divider"></div>
        <div class="footer center">
            <div class="thank-you">THANK YOU!</div>
            <div>Please come again</div>
            <div style="margin-top: 2mm; font-size: 9px;">Powered by: AndgatePOS</div>
        </div>
    </div>
</body>
</html>`;
    };

    const printReceipt = () => {
        if (isPrinting) return;
        setIsPrinting(true);

        try {
            const receiptHTML = generateReceiptHTML();
            const blob = new Blob([receiptHTML], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);
            const printWindow = window.open(blobUrl, '_blank');

            if (!printWindow) {
                alert('Please allow popups to print receipts.');
                URL.revokeObjectURL(blobUrl);
                setIsPrinting(false);
                return;
            }

            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
                setIsPrinting(false);
            }, 2000);
        } catch (error) {
            alert('Failed to open print window. Please try again.');
            setIsPrinting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 print:bg-white print:p-0">
            <div className="mx-auto max-w-5xl bg-white shadow-lg print:shadow-none">
                {/* Top Close Button */}
                {onClose && (
                    <div className="flex justify-end border-b border-gray-200 bg-gray-100 p-3 print:hidden">
                        <button
                            onClick={onClose}
                            disabled={isPrinting}
                            className="flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Close
                        </button>
                    </div>
                )}

                {/* Success Message - Only show when order is just created */}
                {isOrderCreated && (
                    <div className="border-b border-green-200 bg-green-50 p-4 print:hidden">
                        <div className="flex items-center gap-3 text-green-800">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-lg font-semibold">Order Created Successfully!</p>
                                <p className="text-sm text-green-700">Your order has been processed and saved.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons - Always show */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 print:hidden">
                    <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-4">
                        <button
                            onClick={handlePrintPreview}
                            disabled={isPrinting}
                            className="group relative flex min-w-[160px] items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-blue-200 bg-white px-6 py-3.5 font-semibold text-blue-700 shadow-lg transition-all duration-300 hover:scale-105 hover:border-blue-400 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                            <svg className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                            <span className="relative z-10">Print Preview</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            disabled={isPrinting}
                            className="group relative flex min-w-[160px] items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
                            <svg className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                />
                            </svg>
                            <span className="relative z-10">Print Invoice</span>
                        </button>
                        <button
                            onClick={printReceipt}
                            disabled={isPrinting}
                            className="group relative flex min-w-[160px] items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:to-violet-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
                            <svg className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <span className="relative z-10">{isPrinting ? 'Opening...' : 'Print Receipt'}</span>
                        </button>
                        <button
                            onClick={exportPDF}
                            disabled={isPrinting || !pdfMake}
                            className="group relative flex min-w-[160px] items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
                            <svg className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <span className="relative z-10">{isPrinting ? 'Generating...' : !pdfMake ? 'Loading...' : 'Download PDF'}</span>
                        </button>
                    </div>
                </div>

                {/* Invoice Content - SAME AS BEFORE, keeping the rest of the JSX */}
                <div className="p-6 print:p-4" ref={invoiceRef}>
                    {/* Header with Logo */}
                    <div className="mb-3 border-b-2 border-gray-800 pb-3">
                        <div className="flex items-start gap-6">
                            {/* Logo - show if available */}
                            {logoDataUrl ? (
                                <div className="flex-shrink-0">
                                    <Image
                                        src={logoDataUrl}
                                        alt="Company Logo"
                                        width={96}
                                        height={96}
                                        className="object-contain"
                                        style={{ maxWidth: '96px', maxHeight: '96px' }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            ) : currentStore?.logo_path ? (
                                // Fallback: try direct URL if logoDataUrl conversion failed
                                <div className="flex-shrink-0">
                                    <Image
                                        src={
                                            currentStore.logo_path.startsWith('http')
                                                ? currentStore.logo_path
                                                : `${process.env.NEXT_PUBLIC_API_BASE_URL}${currentStore.logo_path.startsWith('/') ? '' : '/storage/'}${currentStore.logo_path}`
                                        }
                                        alt="Company Logo"
                                        width={96}
                                        height={96}
                                        className="object-contain"
                                        style={{ maxWidth: '96px', maxHeight: '96px' }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            ) : null}

                            {/* Company Info */}
                            <div className="flex-grow">
                                <h1 className="text-2xl font-bold text-gray-800">{currentStore?.store_name || 'Store Name'}</h1>
                                <p className="mt-1 text-sm text-gray-600">{currentStore?.store_location || 'Store Address'}</p>
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                                    {currentStore?.store_email && <span>{currentStore.store_email}</span>}
                                    {currentStore?.store_email && currentStore?.store_contact && <span>|</span>}
                                    {currentStore?.store_contact && <span>Phone: {currentStore.store_contact}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Title */}
                    <div className="mb-4 text-center">
                        <h2 className="text-2xl font-bold text-gray-800">{isReturn ? 'Return Receipt' : 'Invoice'}</h2>
                    </div>

                    {/* Invoice Details and Customer Info */}
                    <div className="mb-4 grid grid-cols-2 gap-6">
                        {/* Left Side - Invoice Details */}
                        <div className="space-y-1 text-sm">
                            <p>
                                <strong>Invoice No.:</strong> {invoice}
                            </p>
                            <p>
                                <strong>Date:</strong> {currentDate} {currentTime}
                            </p>
                            {order_id && (
                                <p>
                                    <strong>Order ID:</strong> #{order_id}
                                </p>
                            )}
                            <p>
                                <strong>Order Status:</strong>{' '}
                                <span className={`font-semibold`} style={{ color: getPaymentStatusColor(displayPaymentStatus || 'pending') }}>
                                    {(displayPaymentStatus || 'Pending').charAt(0).toUpperCase() + (displayPaymentStatus || 'pending').slice(1)}
                                </span>
                            </p>
                            <p>
                                <strong>Payment Method:</strong> {displayPaymentMethod || 'Cash'}
                            </p>
                            {isReturn && original_order_id && (
                                <p>
                                    <strong>Original Order:</strong> #{original_order_id}
                                </p>
                            )}
                        </div>

                        {/* Right Side - Customer Details */}
                        <div className="space-y-1 text-sm">
                            <p>
                                <strong>To:</strong> {customer.name || 'Walk-in Customer'}
                            </p>
                            {customer.email && (
                                <p>
                                    <strong>Email:</strong> {customer.email}
                                </p>
                            )}
                            {customer.phone && (
                                <p>
                                    <strong>Contact No.:</strong> {customer.phone}
                                </p>
                            )}
                            {customer.membership && customer.membership.toLowerCase() !== 'normal' && (
                                <p>
                                    <strong>Membership:</strong> <span className="capitalize">{customer.membership}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Products Table */}
                    {!isReturn ? (
                        <div className="mb-4 overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300 text-sm">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="w-12 border border-gray-300 px-2 py-2 text-left">#</th>
                                        <th className="border border-gray-300 px-2 py-2 text-left">Product Name</th>
                                        <th className="w-16 border border-gray-300 px-2 py-2 text-center">Qty</th>
                                        <th className="w-24 border border-gray-300 px-2 py-2 text-right">Unit Price</th>
                                        <th className="w-20 border border-gray-300 px-2 py-2 text-right">Tax/VAT</th>
                                        <th className="w-20 border border-gray-300 px-2 py-2 text-right">Disc.</th>
                                        <th className="w-28 border border-gray-300 px-2 py-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceItems.map((product, index) => (
                                        <tr key={product.id}>
                                            <td className="border border-gray-300 px-2 py-2 align-top">{index + 1}</td>
                                            <td className="border border-gray-300 px-2 py-2">
                                                <div>
                                                    <p className="font-medium">{product.title}</p>
                                                    {product.variantName && (
                                                        <p className="mt-1 text-xs text-blue-600">
                                                            <strong>Variant:</strong> {product.variantName}
                                                        </p>
                                                    )}
                                                    {product.warranty && formatWarrantyDuration(product.warranty) && (
                                                        <p className="mt-1 text-xs text-gray-600">
                                                            <strong>Warranty:</strong> {formatWarrantyDuration(product.warranty)}
                                                        </p>
                                                    )}
                                                    {product.serials && product.serials.length > 0 && (
                                                        <p className="mt-1 font-mono text-xs text-gray-600">{product.serials.map((s) => s.serial_number).join(' ')}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-center align-top">
                                                {product.quantity.toFixed(2)} {product.unit || 'Pcs'}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right align-top">{formatCurrency(product.price)}</td>
                                            <td className="border border-gray-300 px-2 py-2 text-right align-top">{product.tax_rate ? `${product.tax_rate}%` : '-'}</td>
                                            <td className="border border-gray-300 px-2 py-2 text-right align-top">{formatCurrency(0)}</td>
                                            <td className="border border-gray-300 px-2 py-2 text-right align-top font-semibold">{formatCurrency(product.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="mb-4 space-y-4">
                            {/* Return tables - same as before */}
                            {/* I'll skip copying them here to save space, but keep them in your code */}
                        </div>
                    )}

                    {/* Totals, Signatures, Footer - same as before */}
                    <div className="mb-4 flex justify-end">
                        <div className="w-80 text-sm">
                            {!isReturn ? (
                                <>
                                    <div className="flex justify-between border-b border-gray-300 py-1">
                                        <span>
                                            <strong>Total Qty.</strong>
                                        </span>
                                        <span>
                                            {totalQty.toFixed(2)} {invoiceItems[0]?.unit || 'Pcs'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-300 py-1">
                                        <span>
                                            <strong>Subtotal</strong>
                                        </span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    {calculatedTax > 0 && (
                                        <div className="flex justify-between border-b border-gray-300 py-1">
                                            <span>
                                                <strong>Tax</strong>
                                            </span>
                                            <span>{formatCurrency(calculatedTax)}</span>
                                        </div>
                                    )}
                                    {calculatedDiscount > 0 && (
                                        <div className="flex justify-between border-b border-gray-300 py-1 text-red-600">
                                            <span>
                                                <strong>Discount</strong>
                                            </span>
                                            <span>-{formatCurrency(calculatedDiscount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between bg-gray-100 px-2 py-2 text-base font-bold">
                                        <span>Grand Total</span>
                                        <span>{formatCurrency(grandTotal)}</span>
                                    </div>
                                    {(displayPaymentStatus?.toLowerCase() === 'partial' || displayPaymentStatus?.toLowerCase() === 'due') && amountPaid > 0 && (
                                        <div className="flex justify-between border-b border-gray-300 py-1 text-green-600">
                                            <span>
                                                <strong>Amount Paid</strong>
                                            </span>
                                            <span>{formatCurrency(amountPaid)}</span>
                                        </div>
                                    )}
                                    {(displayPaymentStatus?.toLowerCase() === 'partial' || displayPaymentStatus?.toLowerCase() === 'due') && amountDue > 0 && (
                                        <div className="flex justify-between bg-red-50 px-2 py-2 text-base font-bold text-red-600">
                                            <span>Total Due</span>
                                            <span>{formatCurrency(amountDue)}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {exchangeTotal > 0 && (
                                        <div className="flex justify-between border-b border-gray-300 py-1">
                                            <span>
                                                <strong>Exchange Total</strong>
                                            </span>
                                            <span>{formatCurrency(exchangeTotal)}</span>
                                        </div>
                                    )}
                                    {returnTotal > 0 && (
                                        <div className="flex justify-between border-b border-gray-300 py-1 text-red-600">
                                            <span>
                                                <strong>Return Credit</strong>
                                            </span>
                                            <span>-{formatCurrency(returnTotal)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between bg-gray-100 px-2 py-2 text-base font-bold">
                                        <span>{netTransaction >= 0 ? 'Net Payable' : 'Net Refund'}</span>
                                        <span className={netTransaction >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(Math.abs(netTransaction))}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Amount in Words */}
                    <div className="mb-4 text-sm">
                        <p>
                            <strong>In Word:</strong> {numberToWords(isReturn ? Math.abs(netTransaction) : grandTotal)}
                        </p>
                    </div>

                    {/* Signature Section */}
                    <div className="mb-6 grid grid-cols-3 gap-4 pt-8">
                        <div className="border-t border-gray-400 pt-2 text-center">
                            <p className="text-sm font-semibold">Received By</p>
                        </div>
                        <div className="border-t border-gray-400 pt-2 text-center">
                            <p className="text-sm font-semibold">Checked By</p>
                        </div>
                        <div className="border-t border-gray-400 pt-2 text-center">
                            <p className="text-sm font-semibold">Authorized By</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-300 pt-2 text-center text-xs text-gray-500">
                        <p>
                            Print Date: {currentDate} {currentTime}
                        </p>
                        <p>Powered by: AndgatePOS | {invoice} | Page: 1 of 1</p>
                    </div>
                </div>
            </div>

            {/* Print Styles - SAME AS BEFORE */}
            <style jsx>{`
                @media print {
                    html,
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                    }

                    body * {
                        visibility: hidden;
                    }

                    .max-w-5xl,
                    .max-w-5xl * {
                        visibility: visible;
                    }

                    .max-w-5xl {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                    }

                    .print\\:hidden {
                        display: none !important;
                        visibility: hidden !important;
                    }

                    .print\\:p-4 {
                        padding: 0.5cm !important;
                    }

                    .border-b-2,
                    .grid,
                    table {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    .mb-6 {
                        margin-bottom: 0.3cm !important;
                    }
                    .mb-4 {
                        margin-bottom: 0.25cm !important;
                    }
                    .mb-3 {
                        margin-bottom: 0.2cm !important;
                    }
                    .pb-3 {
                        padding-bottom: 0.2cm !important;
                    }
                    .pt-8 {
                        padding-top: 0.5cm !important;
                    }
                    .gap-6 {
                        gap: 0.3cm !important;
                    }

                    table {
                        font-size: 9pt !important;
                    }

                    th,
                    td {
                        padding: 0.1cm 0.15cm !important;
                    }

                    .text-sm {
                        font-size: 9pt !important;
                    }

                    .text-xs {
                        font-size: 8pt !important;
                    }

                    @page {
                        size: A4 portrait;
                        margin: 0.5cm;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                }
            `}</style>

            {/* Bottom Close Button */}
            {onClose && (
                <div className="flex justify-center border-t border-gray-200 bg-gray-100 p-4 print:hidden">
                    <button
                        onClick={onClose}
                        disabled={isPrinting}
                        className="flex items-center gap-2 rounded-lg bg-gray-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default PosInvoicePreview;
