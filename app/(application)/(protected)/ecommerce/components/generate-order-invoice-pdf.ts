/**
 * Order Invoice PDF Generator
 *
 * Generates a PDF invoice that mirrors the layout / styling of the
 * existing POS invoice template (header, divider, invoice meta, products
 * table, totals block, "in word" line, signature row, footer).
 *
 * The original POS invoice file is left untouched; this utility produces
 * an output with the same visual structure for the e-commerce order
 * details page download flow.
 */

import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

export interface InvoiceStore {
    store_name?: string;
    store_location?: string;
    store_email?: string;
    store_contact?: string;
    logo_base64?: string;
    currency?: {
        currency_code?: string;
        decimal_places?: number;
        decimal_separator?: string;
        thousand_separator?: string;
        currency_position?: 'before' | 'after';
    };
}

export interface InvoiceCustomer {
    name?: string;
    email?: string;
    phone?: string;
}

export interface InvoiceItem {
    title: string;
    variantName?: string;
    quantity: number;
    unit?: string;
    price: number;
    amount: number;
    tax_rate?: number;
    warranty?: { duration_months?: number | null; duration_days?: number | null } | null;
    serials?: { serial_number: string }[];
}

export interface InvoicePayload {
    invoice: string;
    order_id?: string | number;
    order_status?: string;
    customer: InvoiceCustomer;
    items: InvoiceItem[];
    store_items_count?: number;
    store_items_subtotal: number;
    store_total: number;
    paymentMethod?: string;
    paymentStatus?: string;
    notes?: string | null;
    store: InvoiceStore;
}

const DEFAULT_CURRENCY = {
    currency_code: 'USD',
    decimal_places: 2,
    decimal_separator: '.',
    thousand_separator: ',',
    currency_position: 'before' as const,
};

const formatCurrency = (amount: number | string | null | undefined, currency = DEFAULT_CURRENCY): string => {
    if (amount === null || amount === undefined) return '-';
    const numAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '-';

    const cfg = { ...DEFAULT_CURRENCY, ...currency };
    const formattedNumber = numAmount.toFixed(cfg.decimal_places);
    const [integerPart, decimalPart] = formattedNumber.split('.');
    const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, cfg.thousand_separator);
    const finalNumber = decimalPart ? `${withSeparators}${cfg.decimal_separator}${decimalPart}` : withSeparators;
    return cfg.currency_position === 'before' ? `${cfg.currency_code} ${finalNumber}` : `${finalNumber} ${cfg.currency_code}`;
};

const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero Only';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const lessThanThousand = (n: number): string => {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + lessThanThousand(n % 100) : '');
    };

    const thousands = (n: number): string => {
        if (n < 1000) return lessThanThousand(n);
        if (n < 1_000_000) {
            const t = Math.floor(n / 1000);
            const r = n % 1000;
            return lessThanThousand(t) + ' Thousand' + (r ? ' ' + lessThanThousand(r) : '');
        }
        const m = Math.floor(n / 1_000_000);
        const r = n % 1_000_000;
        return lessThanThousand(m) + ' Million' + (r ? ' ' + thousands(r) : '');
    };

    return thousands(Math.floor(num)) + ' Only';
};

const getStatusColor = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid' || s === 'completed' || s === 'approved' || s === 'delivered') return '#059669';
    if (s === 'due' || s === 'unpaid' || s === 'pending') return '#d97706';
    if (s === 'failed' || s === 'cancelled') return '#dc2626';
    if (s === 'partial') return '#ea580c';
    return '#6b7280';
};

const formatWarranty = (warranty?: InvoiceItem['warranty']) => {
    if (!warranty) return null;
    if (warranty.duration_months) return `${warranty.duration_months * 30} Day(s)`;
    if (warranty.duration_days) return `${warranty.duration_days} Day(s)`;
    return null;
};

const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

const ROBOTO_FONTS = {
    Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf',
    },
};

export async function generateOrderInvoicePDF(payload: InvoicePayload) {
    // Dynamic import — pdfmake is browser-only
    const pdfMakeModule: any = await import('pdfmake/build/pdfmake');
    const pdfFontsModule: any = await import('pdfmake/build/vfs_fonts');
    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    const baseVfs = pdfFontsModule.default?.pdfMake?.vfs || pdfFontsModule.pdfMake?.vfs || pdfFontsModule.default?.vfs || pdfFontsModule.vfs || {};

    // Detect language from i18next cookie
    const isBn = typeof document !== 'undefined'
        ? document.cookie.split(';').some((c) => c.trim().startsWith('i18nextLng=bn'))
        : false;

    // Build VFS and fonts to pass directly to createPdf
    let docVfs: Record<string, string> = { ...baseVfs };
    let docFonts: Record<string, any> = { ...ROBOTO_FONTS };
    let useBnFont = false;

    if (isBn) {
        try {
            const [rResp, bResp] = await Promise.all([
                fetch('/fonts/NotoSansBengali-Regular.ttf'),
                fetch('/fonts/NotoSansBengali-Bold.ttf'),
            ]);
            if (rResp.ok && bResp.ok) {
                const [regularB64, boldB64] = await Promise.all([
                    rResp.blob().then(blobToBase64),
                    bResp.blob().then(blobToBase64),
                ]);
                docVfs = {
                    ...docVfs,
                    'NotoSansBengali-Regular.ttf': regularB64,
                    'NotoSansBengali-Bold.ttf': boldB64,
                };
                docFonts = {
                    ...ROBOTO_FONTS,
                    NotoSansBengali: {
                        normal: 'NotoSansBengali-Regular.ttf',
                        bold: 'NotoSansBengali-Bold.ttf',
                        italics: 'NotoSansBengali-Regular.ttf',
                        bolditalics: 'NotoSansBengali-Bold.ttf',
                    },
                };
                useBnFont = true;
            }
        } catch {
            // Fall through to Roboto
        }
    }

    const { invoice, order_id, order_status, customer, items, store_items_count, store_items_subtotal, store_total, paymentMethod, paymentStatus, notes, store } = payload;

    const currency = { ...DEFAULT_CURRENCY, ...(store.currency || {}) };
    const fmt = (n: number) => formatCurrency(n, currency);

    const now = new Date();
    const currentDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const currentTime = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    const totalQty = items.reduce((s, i) => s + Number(i.quantity || 0), 0);
    const content: Content = [];

    // ---------- Header ----------
    const headerColumns: any[] = [];
    if (store.logo_base64 && store.logo_base64.startsWith('data:')) {
        headerColumns.push({ image: store.logo_base64, width: 80, alignment: 'left' });
    }
    headerColumns.push({
        stack: [
            { text: store.store_name || 'Store Name', style: 'companyName' },
            { text: store.store_location || 'Store Address', style: 'companyInfo' },
            {
                text: [store.store_email ? `${store.store_email}` : '', store.store_email && store.store_contact ? ' | ' : '', store.store_contact ? `Phone: ${store.store_contact}` : ''],
                style: 'companyInfo',
            },
        ],
        width: '*',
        alignment: 'left',
    });
    content.push({ columns: headerColumns, margin: [0, 0, 0, 10] });

    // Divider
    content.push({
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2 }],
        margin: [0, 5, 0, 10],
    });

    // Invoice title
    content.push({
        text: 'INVOICE',
        style: 'invoiceTitle',
        alignment: 'center',
        margin: [0, 0, 0, 10],
    });

    // ---------- Meta + customer ----------
    const leftStack: any[] = [{ text: [{ text: 'Invoice No.: ', bold: true }, invoice] }, { text: [{ text: 'Date: ', bold: true }, `${currentDate} ${currentTime}`] }];
    if (order_id) leftStack.push({ text: [{ text: 'Order ID: ', bold: true }, `#${order_id}`] });
    leftStack.push({
        text: [
            { text: 'Order Status: ', bold: true },
            {
                text: (order_status || 'Pending').charAt(0).toUpperCase() + (order_status || 'pending').slice(1),
                color: getStatusColor(order_status),
                bold: true,
            },
        ],
    });
    leftStack.push({ text: [{ text: 'Payment Method: ', bold: true }, paymentMethod || 'Cash'] });
    if (paymentStatus) {
        leftStack.push({
            text: [
                { text: 'Payment Status: ', bold: true },
                {
                    text: paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1),
                    color: getStatusColor(paymentStatus),
                    bold: true,
                },
            ],
        });
    }

    const rightStack: any[] = [{ text: [{ text: 'To: ', bold: true }, customer.name || 'Walk-in Customer'] }];
    if (customer.email) rightStack.push({ text: [{ text: 'Email: ', bold: true }, customer.email] });
    if (customer.phone) rightStack.push({ text: [{ text: 'Contact: ', bold: true }, customer.phone] });

    content.push({
        columns: [
            { stack: leftStack, width: '50%' },
            { stack: rightStack, width: '50%' },
        ],
        columnGap: 20,
        margin: [0, 0, 0, 10],
        fontSize: 9,
    });

    // ---------- Products table ----------
    const tableBody: any[] = [
        [
            { text: '#', style: 'tableHeader', alignment: 'center' },
            { text: 'Product Name', style: 'tableHeader' },
            { text: 'Qty', style: 'tableHeader', alignment: 'center' },
            { text: 'Unit Price', style: 'tableHeader', alignment: 'right' },
            { text: 'Amount', style: 'tableHeader', alignment: 'right' },
        ],
    ];

    items.forEach((product, index) => {
        const productCell: any[] = [{ text: product.title, bold: true }];
        if (product.variantName) {
            productCell.push({ text: `\nVariant: ${product.variantName}`, fontSize: 8, color: '#4338ca' });
        }
        const warrantyText = formatWarranty(product.warranty);
        if (warrantyText) {
            productCell.push({ text: `\nWarranty: ${warrantyText}`, fontSize: 8, color: '#6b7280' });
        }
        if (product.serials && product.serials.length > 0) {
            productCell.push({
                text: `\n${product.serials.map((s) => s.serial_number).join(' ')}`,
                fontSize: 8,
                color: '#6b7280',
            });
        }

        tableBody.push([
            { text: (index + 1).toString(), alignment: 'center' },
            { stack: productCell },
            { text: `${Number(product.quantity).toFixed(2)} ${product.unit || 'Pcs'}`, alignment: 'center' },
            { text: fmt(product.price), alignment: 'right' },
            { text: fmt(product.amount), alignment: 'right', bold: true },
        ]);
    });

    content.push({
        table: {
            headerRows: 1,
            widths: [25, '*', 80, 90, 90],
            body: tableBody,
        },
        layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#e5e7eb' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#d1d5db',
            vLineColor: () => '#d1d5db',
        },
        margin: [0, 0, 0, 10],
        fontSize: 9,
    });

    // ---------- Totals ----------
    const totalsContent: any[] = [
        [
            { text: 'Total Qty.', bold: true, border: [false, true, false, false] },
            {
                text: `${totalQty.toFixed(2)} ${items[0]?.unit || 'Pcs'}`,
                alignment: 'right',
                border: [false, true, false, false],
            },
        ],
        [
            { text: 'Store Items', bold: true, border: [false, false, false, false] },
            { text: `${store_items_count ?? items.length}`, alignment: 'right', border: [false, false, false, false] },
        ],
        [
            { text: 'Store Items Subtotal', bold: true, border: [false, false, false, false] },
            { text: fmt(store_items_subtotal), alignment: 'right', border: [false, false, false, false] },
        ],
        [
            { text: 'Store Total', bold: true, fontSize: 11, fillColor: '#f3f4f6', border: [false, true, false, true] },
            {
                text: fmt(store_total),
                alignment: 'right',
                bold: true,
                fontSize: 11,
                fillColor: '#f3f4f6',
                border: [false, true, false, true],
            },
        ],
    ];

    content.push({
        table: { widths: ['*', 100], body: totalsContent },
        layout: 'noBorders',
        margin: [300, 0, 0, 10],
        fontSize: 9,
    });

    // In words
    content.push({
        text: [{ text: 'In Word: ', bold: true }, numberToWords(store_total)],
        margin: [0, 5, 0, 15],
        fontSize: 9,
    });

    if (notes) {
        content.push({
            text: [{ text: 'Notes: ', bold: true }, notes],
            margin: [0, 0, 0, 15],
            fontSize: 9,
        });
    }

    // Signatures
    content.push({
        columns: [
            {
                stack: [{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 1 }] }, { text: 'Received By', alignment: 'center', margin: [0, 5, 0, 0], fontSize: 9, bold: true }],
                width: '33.33%',
            },
            {
                stack: [{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 1 }] }, { text: 'Checked By', alignment: 'center', margin: [0, 5, 0, 0], fontSize: 9, bold: true }],
                width: '33.33%',
            },
            {
                stack: [{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 1 }] }, { text: 'Authorized By', alignment: 'center', margin: [0, 5, 0, 0], fontSize: 9, bold: true }],
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
            { text: `${invoice} | Page: 1 of 1`, alignment: 'center', fontSize: 8, color: '#6b7280' },
        ],
    });

    const docDefinition: TDocumentDefinitions = {
        content,
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        styles: {
            companyName: { fontSize: 18, bold: true, color: '#1f2937', margin: [0, 0, 0, 5] },
            companyInfo: { fontSize: 9, color: '#6b7280', margin: [0, 2, 0, 0] },
            invoiceTitle: { fontSize: 20, bold: true },
            tableHeader: { bold: true, fontSize: 9, color: '#1f2937' },
            sectionHeader: { fontSize: 10, bold: true },
        },
        defaultStyle: { fontSize: 9, font: useBnFont ? 'NotoSansBengali' : 'Roboto' },
    };

    pdfMake.createPdf(docDefinition, null, docFonts, docVfs).download(`invoice-${invoice || 'order'}.pdf`);
}
