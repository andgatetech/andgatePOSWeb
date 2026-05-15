/**
 * Order Invoice PDF Generator — pdfMake based, NotoSansBengali for Bengali mode.
 */

import type { Content } from 'pdfmake/interfaces';
import enLocale from '@/public/locales/en.json';
import bnLocale from '@/public/locales/bn.json';
import { downloadPdfMake } from '@/lib/pdf-mobile-download';

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
    const n = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
    if (isNaN(n)) return '-';
    const cfg = { ...DEFAULT_CURRENCY, ...currency };
    const s = n.toFixed(cfg.decimal_places);
    const [int, dec] = s.split('.');
    const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, cfg.thousand_separator);
    const num = dec ? `${withSep}${cfg.decimal_separator}${dec}` : withSep;
    return cfg.currency_position === 'before' ? `${cfg.currency_code} ${num}` : `${num} ${cfg.currency_code}`;
};

const numberToWordsEn = (num: number): string => {
    if (num === 0) return 'Zero Only';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const lt1k = (n: number): string => {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + lt1k(n % 100) : '');
    };
    const convert = (n: number): string => {
        if (n < 1000) return lt1k(n);
        if (n < 100000) return lt1k(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + lt1k(n % 1000) : '');
        const l = Math.floor(n / 100000);
        const r = n % 100000;
        return lt1k(l) + ' Lakh' + (r ? ' ' + convert(r) : '');
    };
    return convert(Math.floor(num)) + ' Taka Only';
};

const numberToWordsBn = (num: number): string => {
    if (num === 0) return 'শূন্য টাকা মাত্র';
    const ones = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
    const tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
    const teens = ['দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ'];
    const lt1k = (n: number): string => {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' শত' + (n % 100 ? ' ' + lt1k(n % 100) : '');
    };
    const convert = (n: number): string => {
        if (n < 1000) return lt1k(n);
        if (n < 100000) return lt1k(Math.floor(n / 1000)) + ' হাজার' + (n % 1000 ? ' ' + lt1k(n % 1000) : '');
        if (n < 10000000) return lt1k(Math.floor(n / 100000)) + ' লক্ষ' + (n % 100000 ? ' ' + convert(n % 100000) : '');
        return lt1k(Math.floor(n / 10000000)) + ' কোটি' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };
    return convert(Math.floor(num)) + ' টাকা মাত্র';
};

const getStatusColor = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid' || s === 'completed' || s === 'approved' || s === 'delivered') return '#059669';
    if (s === 'due' || s === 'unpaid' || s === 'pending') return '#d97706';
    if (s === 'failed' || s === 'cancelled') return '#dc2626';
    if (s === 'partial') return '#ea580c';
    return '#6b7280';
};

const formatWarranty = (warranty?: InvoiceItem['warranty'], daysLabel = 'Day(s)') => {
    if (!warranty) return null;
    if (warranty.duration_months) return `${warranty.duration_months * 30} ${daysLabel}`;
    if (warranty.duration_days) return `${warranty.duration_days} ${daysLabel}`;
    return null;
};

// Recursively routes text by Unicode script: Bengali (U+0980-U+09FF) → NotoSansBengali, rest → Roboto
const _fixPdfNode = (n: any): any => {
    if (!n || typeof n !== 'object') return n;
    if (Array.isArray(n)) return n.map(_fixPdfNode);
    const o: any = { ...n };
    if (typeof o.text === 'string' && o.text.length > 0) {
        const hasBn = /[ঀ-৿]/.test(o.text);
        const hasLatin = o.text.replace(/[ঀ-৿]/g, '').length > 0;
        if (hasBn && hasLatin) {
            const segs: any[] = [];
            let run = '', runBn = /[ঀ-৿]/.test(o.text[0]);
            for (const ch of o.text) {
                const isBn = /[ঀ-৿]/.test(ch);
                if (isBn === runBn) { run += ch; }
                else { if (run) segs.push({ text: run, font: runBn ? 'NotoSansBengali' : 'Roboto' }); run = ch; runBn = isBn; }
            }
            if (run) segs.push({ text: run, font: runBn ? 'NotoSansBengali' : 'Roboto' });
            o.text = segs; delete o.font;
        } else if (hasBn) {
            o.font = 'NotoSansBengali';
        }
    } else if (Array.isArray(o.text)) {
        o.text = o.text.map(_fixPdfNode);
    }
    if (Array.isArray(o.stack)) o.stack = o.stack.map(_fixPdfNode);
    if (Array.isArray(o.columns)) o.columns = o.columns.map(_fixPdfNode);
    if (o.table?.body) o.table = { ...o.table, body: o.table.body.map((r: any[]) => r.map(_fixPdfNode)) };
    return o;
};

// Module-level — pdfMake 0.3 is a singleton; Bengali fonts registered once per session
let _ecPm: any = null;
let _ecBnLoaded = false;
let _ecLoadPromise: Promise<void> | null = null;

const _ensureEcPdf = (): Promise<void> => {
    if (_ecPm && _ecBnLoaded) return Promise.resolve();
    if (_ecLoadPromise) return _ecLoadPromise;
    _ecLoadPromise = (async () => {
        try {
            // pdfmake must load first so window.pdfMake is set before vfs_fonts runs
            const pmMod: any = await import('pdfmake/build/pdfmake');
            _ecPm = pmMod.default || pmMod;
            // Explicitly register Roboto VFS — do not rely on window.pdfMake side-effect (unreliable in Next.js ESM)
            const vfsFonts: any = await import('pdfmake/build/vfs_fonts');
            _ecPm.addVirtualFileSystem(vfsFonts.default ?? vfsFonts);
            const blobToBase64 = (blob: Blob): Promise<string> =>
                new Promise((res, rej) => {
                    const r = new FileReader();
                    r.onload = () => res((r.result as string).split(',')[1]);
                    r.onerror = rej;
                    r.readAsDataURL(blob);
                });
            const [rr, br] = await Promise.all([
                fetch('/fonts/NotoSansBengali-Regular.ttf'),
                fetch('/fonts/NotoSansBengali-Bold.ttf'),
            ]);
            if (rr.ok && br.ok) {
                const [rb64, bb64] = await Promise.all([rr.blob().then(blobToBase64), br.blob().then(blobToBase64)]);
                // pdfMake 0.3 public API — writes to internal singleton VirtualFileSystem
                _ecPm.addVirtualFileSystem({
                    'NotoSansBengali-Regular.ttf': rb64,
                    'NotoSansBengali-Bold.ttf': bb64,
                });
                _ecPm.addFonts({
                    NotoSansBengali: {
                        normal: 'NotoSansBengali-Regular.ttf',
                        bold: 'NotoSansBengali-Bold.ttf',
                        italics: 'NotoSansBengali-Regular.ttf',
                        bolditalics: 'NotoSansBengali-Bold.ttf',
                    },
                });
                _ecBnLoaded = true;
            }
        } catch {
            _ecLoadPromise = null;
        }
    })();
    return _ecLoadPromise;
};

export async function generateOrderInvoicePDF(payload: InvoicePayload, reservedPdfWindow?: Window | null) {
    await _ensureEcPdf();

    // Language detection from cookie
    const isBn = typeof document !== 'undefined'
        ? document.cookie.split(';').some((c) => c.trim().startsWith('i18nextLng=bn'))
        : false;

    // Translation helper — falls back to English key if translation missing
    const locale = isBn ? (bnLocale as unknown as Record<string, string>) : (enLocale as unknown as Record<string, string>);
    const t = (key: string): string => locale[key] || (enLocale as unknown as Record<string, string>)[key] || key;

    const useBnFont = isBn && _ecBnLoaded;

    const { invoice, order_id, order_status, customer, items, store_items_count, store_items_subtotal, store_total, paymentMethod, paymentStatus, notes, store } = payload;
    const currency = { ...DEFAULT_CURRENCY, ...(store.currency || {}) } as typeof DEFAULT_CURRENCY;
    const fmt = (n: number) => formatCurrency(n, currency);
    const numberToWords = useBnFont ? numberToWordsBn : numberToWordsEn;
    const daysLabel = t('lbl_days');

    const now = new Date();
    const currentDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const totalQty = items.reduce((s, i) => s + Number(i.quantity || 0), 0);
    const content: Content = [];

    // ---------- Header ----------
    const headerColumns: any[] = [];
    if (store.logo_base64 && store.logo_base64.startsWith('data:')) {
        headerColumns.push({ image: store.logo_base64, width: 80, alignment: 'left' });
    }
    headerColumns.push({
        stack: [
            { text: store.store_name || t('lbl_store_name'), style: 'companyName' },
            ...((store.store_location || '').replace(/[\s,;.|/-]/g, '').length > 0 ? [{ text: store.store_location!, style: 'companyInfo' }] : []),
            {
                text: [
                    store.store_email ? store.store_email : '',
                    store.store_email && store.store_contact ? ' | ' : '',
                    store.store_contact ? `${t('lbl_phone')}: ${store.store_contact}` : '',
                ],
                style: 'companyInfo',
            },
        ],
        width: '*',
        alignment: 'left',
    });
    content.push({ columns: headerColumns, margin: [0, 0, 0, 10] });

    content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2 }], margin: [0, 5, 0, 10] });

    content.push({
        text: t('lbl_invoice').toUpperCase(),
        style: 'invoiceTitle',
        alignment: 'center',
        margin: [0, 0, 0, 10],
    });

    // ---------- Meta + customer ----------
    const leftStack: any[] = [
        { text: [{ text: `${t('lbl_invoice_no')}: `, bold: true }, invoice] },
        { text: [{ text: `${t('lbl_date')}: `, bold: true }, `${currentDate} ${currentTime}`] },
    ];
    if (order_id) leftStack.push({ text: [{ text: `${t('lbl_order_id')}: `, bold: true }, `#${order_id}`] });
    leftStack.push({
        text: [
            { text: `${t('lbl_order_status')}: `, bold: true },
            {
                text: (order_status || 'Pending').charAt(0).toUpperCase() + (order_status || 'pending').slice(1),
                color: getStatusColor(order_status),
                bold: true,
            },
        ],
    });
    leftStack.push({ text: [{ text: `${t('lbl_payment_method')}: `, bold: true }, paymentMethod || t('lbl_cash')] });
    if (paymentStatus) {
        leftStack.push({
            text: [
                { text: `${t('lbl_payment_status')}: `, bold: true },
                {
                    text: paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1),
                    color: getStatusColor(paymentStatus),
                    bold: true,
                },
            ],
        });
    }

    const rightStack: any[] = [{ text: [{ text: `${t('lbl_to')}: `, bold: true }, customer.name || t('pos_walk_in_customer')] }];
    if (customer.email) rightStack.push({ text: [{ text: `${t('lbl_email')}: `, bold: true }, customer.email] });
    if (customer.phone) rightStack.push({ text: [{ text: `${t('lbl_contact')}: `, bold: true }, customer.phone] });

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
            { text: t('lbl_product_name'), style: 'tableHeader' },
            { text: t('lbl_qty'), style: 'tableHeader', alignment: 'center' },
            { text: t('lbl_unit_price'), style: 'tableHeader', alignment: 'right' },
            { text: t('lbl_amount'), style: 'tableHeader', alignment: 'right' },
        ],
    ];

    items.forEach((product, index) => {
        const productCell: any[] = [{ text: product.title, bold: true }];
        if (product.variantName) productCell.push({ text: `\n${t('lbl_variant')}: ${product.variantName}`, fontSize: 8, color: '#4338ca' });
        const warrantyText = formatWarranty(product.warranty, daysLabel);
        if (warrantyText) productCell.push({ text: `\n${t('lbl_warranty')}: ${warrantyText}`, fontSize: 8, color: '#6b7280' });
        if (product.serials?.length) productCell.push({ text: `\n${product.serials.map((s) => s.serial_number).join(' ')}`, fontSize: 8, color: '#6b7280' });

        tableBody.push([
            { text: (index + 1).toString(), alignment: 'center' },
            { stack: productCell },
            { text: `${Number(product.quantity).toFixed(2)} ${product.unit || t('lbl_pcs')}`, alignment: 'center' },
            { text: fmt(product.price), alignment: 'right' },
            { text: fmt(product.amount), alignment: 'right', bold: true },
        ]);
    });

    content.push({
        table: { headerRows: 1, widths: [25, '*', 80, 90, 90], body: tableBody },
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
    const border0: [boolean, boolean, boolean, boolean] = [false, false, false, false];
    const borderT: [boolean, boolean, boolean, boolean] = [false, true, false, false];
    const borderTB: [boolean, boolean, boolean, boolean] = [false, true, false, true];

    content.push({
        table: {
            widths: ['*', 100],
            body: [
                [
                    { text: t('lbl_total_qty'), bold: true, border: borderT },
                    { text: `${totalQty.toFixed(2)} ${items[0]?.unit || t('lbl_pcs')}`, alignment: 'right', border: borderT },
                ],
                [
                    { text: t('lbl_store_items'), bold: true, border: border0 },
                    { text: `${store_items_count ?? items.length}`, alignment: 'right', border: border0 },
                ],
                [
                    { text: t('lbl_subtotal'), bold: true, border: border0 },
                    { text: fmt(store_items_subtotal), alignment: 'right', border: border0 },
                ],
                [
                    { text: t('lbl_grand_total'), bold: true, fontSize: 11, fillColor: '#f3f4f6', border: borderTB },
                    { text: fmt(store_total), alignment: 'right', bold: true, fontSize: 11, fillColor: '#f3f4f6', border: borderTB },
                ],
            ],
        },
        layout: 'noBorders',
        margin: [300, 0, 0, 10],
        fontSize: 9,
    });

    content.push({
        text: [{ text: `${t('lbl_in_word')}: `, bold: true }, numberToWords(store_total)],
        margin: [0, 5, 0, 15],
        fontSize: 9,
    });

    if (notes) {
        content.push({
            text: [{ text: `${t('lbl_notes')}: `, bold: true }, notes],
            margin: [0, 0, 0, 15],
            fontSize: 9,
        });
    }

    // Signatures
    content.push({
        columns: [
            {
                stack: [
                    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 1 }] },
                    { text: t('lbl_received_by'), alignment: 'center', margin: [0, 5, 0, 0], fontSize: 9, bold: true },
                ],
                width: '33.33%',
            },
            {
                stack: [
                    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 1 }] },
                    { text: t('lbl_checked_by'), alignment: 'center', margin: [0, 5, 0, 0], fontSize: 9, bold: true },
                ],
                width: '33.33%',
            },
            {
                stack: [
                    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 1 }] },
                    { text: t('lbl_authorized_by'), alignment: 'center', margin: [0, 5, 0, 0], fontSize: 9, bold: true },
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
            { text: `${t('lbl_print_date')}: ${currentDate} ${currentTime}`, alignment: 'center', fontSize: 8, color: '#6b7280' },
            { text: `${t('lbl_powered_by')}: AndgatePOS | ${invoice} | ${t('lbl_page')}: 1 ${t('lbl_of')} 1`, alignment: 'center', fontSize: 8, color: '#6b7280' },
        ],
    });

    const docDefinition: any = {
        content,
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        styles: {
            companyName: { fontSize: 18, bold: true, color: '#1f2937', margin: [0, 0, 0, 5] },
            companyInfo: { fontSize: 9, color: '#6b7280', margin: [0, 2, 0, 0] },
            invoiceTitle: { fontSize: 20, bold: true },
            tableHeader: { bold: true, fontSize: 9, color: '#1f2937' },
        },
        defaultStyle: { fontSize: 9, font: 'Roboto' },
    };

    // Route Bengali text nodes to NotoSansBengali; Latin inherits Roboto defaultStyle
    if (useBnFont) {
        docDefinition.content = (docDefinition.content as any[]).map(_fixPdfNode);
    }

    // pdfMake 0.3: createPdf(docDef, options) — fonts/vfs already registered on singleton
    await downloadPdfMake(_ecPm.createPdf(docDefinition), `invoice-${invoice || 'order'}.pdf`, reservedPdfWindow);
}
