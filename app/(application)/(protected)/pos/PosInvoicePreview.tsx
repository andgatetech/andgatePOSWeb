'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetStoreLogoQuery, useGetStoreQuery } from '@/store/features/store/storeApi';
import { RootState } from '@/store';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

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
    discount?: number;
    tax_rate?: number;
    tax_included?: boolean;
    tax?: number;
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
    autoPrint?: 'invoice' | 'receipt' | null;
}

// --- Module-level PDF font cache (singleton, survives component unmount/remount) ---
const _pdfCache: {
    vfs: Record<string, string>;
    fonts: Record<string, any>;
    bnLoaded: boolean;
    pdfMake: any;
} = {
    vfs: {},
    fonts: {
        Roboto: {
            normal: 'Roboto-Regular.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-MediumItalic.ttf',
        },
    },
    bnLoaded: false,
    pdfMake: null,
};
let _pdfLoadPromise: Promise<void> | null = null;
const BN_REGULAR_FONT = 'NotoSansBengali-Regular.ttf';
const BN_BOLD_FONT = 'NotoSansBengali-Bold.ttf';

const hasBengaliPdfFonts = () => Boolean(_pdfCache.vfs[BN_REGULAR_FONT] && _pdfCache.vfs[BN_BOLD_FONT]);

const _ensurePdfFonts = (): Promise<void> => {
    if (_pdfCache.bnLoaded && _pdfCache.pdfMake) return Promise.resolve();
    if (_pdfLoadPromise) return _pdfLoadPromise;
    _pdfLoadPromise = (async () => {
        try {
            const [pdfMakeModule, pdfFontsModule] = await Promise.all([
                import('pdfmake/build/pdfmake') as any,
                import('pdfmake/build/vfs_fonts') as any,
            ]);
            const instance = pdfMakeModule.default || pdfMakeModule;
            const vfsFonts =
                pdfFontsModule.default?.pdfMake?.vfs ||
                pdfFontsModule.pdfMake?.vfs ||
                pdfFontsModule.default?.vfs ||
                pdfFontsModule.vfs ||
                pdfFontsModule.default;
            if (instance) _pdfCache.pdfMake = instance;
            if (vfsFonts) _pdfCache.vfs = { ...vfsFonts };

            const blobToBase64 = (blob: Blob): Promise<string> =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });

            const [regResp, boldResp] = await Promise.all([
                fetch('/fonts/NotoSansBengali-Regular.ttf'),
                fetch('/fonts/NotoSansBengali-Bold.ttf'),
            ]);

            if (regResp.ok && boldResp.ok) {
                const [regB64, boldB64] = await Promise.all([
                    regResp.blob().then(blobToBase64),
                    boldResp.blob().then(blobToBase64),
                ]);
                _pdfCache.vfs = {
                    ..._pdfCache.vfs,
                    [BN_REGULAR_FONT]: regB64,
                    [BN_BOLD_FONT]: boldB64,
                };
                _pdfCache.fonts = {
                    ..._pdfCache.fonts,
                    NotoSansBengali: {
                        normal: BN_REGULAR_FONT,
                        bold: BN_BOLD_FONT,
                        italics: BN_REGULAR_FONT,
                        bolditalics: BN_BOLD_FONT,
                    },
                };
                _pdfCache.bnLoaded = hasBengaliPdfFonts();
            }
        } catch {
            _pdfLoadPromise = null; // allow retry on next click
        }
    })();
    return _pdfLoadPromise;
};

const PosInvoicePreview = ({ data, storeId, onClose, autoPrint }: PosInvoicePreviewProps) => {
    const { t, i18n } = getTranslation();
    const { formatCurrency, formatNumber, currency } = useCurrency();
    const currentUser = useSelector((state: RootState) => state.auth?.user);
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [printMode, setPrintMode] = useState<'invoice' | 'receipt' | null>(null);
    const [logoDataUrl, setLogoDataUrl] = useState<string>('');

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
        change_amount,
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
        keptItemsTotal = 0,
        return_reason,
        notes,
        cashier,
        created_by,
        user,
    } = data || {};

    // Use whichever is available
    const displayPaymentStatus = payment_status || paymentStatus;
    const displayPaymentMethod = payment_method || paymentMethod;

    // Calculate payment amounts
    const amountPaid = Number(amount_paid ?? partialPaymentAmount ?? 0);
    const amountDue = Number(due_amount ?? dueAmount ?? 0);
    const changeAmount = Number(change_amount ?? data?.changeAmount ?? 0);

    const invoiceItems = items as InvoiceItem[];

    const subtotal = totals.subtotal ?? totals.total ?? invoiceItems.reduce((acc: number, item: InvoiceItem) => acc + Number(item.amount || 0), 0);
    const calculatedTax = totals.tax ?? tax;
    const calculatedDiscount = totals.discount ?? discount;
    const membershipDiscount = Number(totals.membershipDiscount ?? data?.membershipDiscount ?? 0);
    const pointsDiscount = Number(totals.pointsDiscount ?? data?.pointsDiscount ?? 0);
    const balanceDiscount = Number(totals.balanceDiscount ?? data?.balanceDiscount ?? 0);
    const grandTotal = totals.grand_total ?? subtotal + calculatedTax - calculatedDiscount;

    // Tax label & registration number from store settings
    const taxLabel = currentStore?.tax_label || t('lbl_tax');
    const registrationNumber = currentStore?.tax_registration_number;
    const registrationLabel = currentStore?.tax_type === 'vat' ? 'BIN' : currentStore?.tax_type === 'gst' ? 'GST Reg.' : t('lbl_tax_registration_number');

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

    // Preload PDF fonts on mount so they're ready before user clicks Download
    useEffect(() => {
        _ensurePdfFonts();
    }, []);

    // Load logo from dedicated endpoint only
    useEffect(() => {
        // Use logo from dedicated API endpoint
        if (logoData?.data?.logo_base64) {
            setLogoDataUrl(logoData.data.logo_base64);
        }
    }, [logoData]);

    // Convert number to words — English
    const numberToWordsEn = (num: number): string => {
        if (num === 0) return 'Zero Taka Only';

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

    // Convert number to words — Bengali
    const numberToWordsBn = (num: number): string => {
        if (num === 0) return 'শূন্য টাকা মাত্র';

        const ones = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
        const tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
        const teens = ['দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ'];

        const convertLessThanThousand = (n: number): string => {
            if (n === 0) return '';
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
            return ones[Math.floor(n / 100)] + ' শত' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
        };

        const convertThousands = (n: number): string => {
            if (n < 1000) return convertLessThanThousand(n);
            if (n < 100000) {
                const thousands = Math.floor(n / 1000);
                const remainder = n % 1000;
                return convertLessThanThousand(thousands) + ' হাজার' + (remainder !== 0 ? ' ' + convertLessThanThousand(remainder) : '');
            }
            if (n < 10000000) {
                const lakhs = Math.floor(n / 100000);
                const remainder = n % 100000;
                return convertLessThanThousand(lakhs) + ' লক্ষ' + (remainder !== 0 ? ' ' + convertThousands(remainder) : '');
            }
            const crores = Math.floor(n / 10000000);
            const remainder = n % 10000000;
            return convertLessThanThousand(crores) + ' কোটি' + (remainder !== 0 ? ' ' + convertThousands(remainder) : '');
        };

        return convertThousands(Math.floor(num)) + ' টাকা মাত্র';
    };

    const numberToWords = (num: number): string =>
        i18n.language === 'bn' ? numberToWordsBn(num) : numberToWordsEn(num);

    // Format warranty duration
    const formatWarrantyDuration = (warranty: Warranty | null | undefined) => {
        if (!warranty) return null;
        if (warranty.duration_months) return `${warranty.duration_months * 30} ${t('lbl_days')}`;
        if (warranty.duration_days) return `${warranty.duration_days} ${t('lbl_days')}`;
        return t('lbl_lifetime');
    };

    const getPaymentStatusColor = (status: string) => {
        // Try to get color from store's payment_statuses first
        if (currentStore?.payment_statuses && status) {
            const paymentStatus = currentStore.payment_statuses.find((ps: { status_name: string; status_color?: string }) => ps.status_name.toLowerCase() === status.toLowerCase());
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

    const getPaymentStatusLabel = (status?: string) => {
        const normalized = status?.toLowerCase() || 'pending';
        if (normalized === 'paid') return t('status_paid');
        if (normalized === 'partial') return t('status_partial');
        if (normalized === 'due') return t('status_due');
        if (normalized === 'pending') return t('status_pending');
        return status || t('status_pending');
    };

    const totalQty = invoiceItems.reduce((sum, item) => sum + item.quantity, 0);
    const cashierName = cashier?.name || created_by?.name || user?.name || data?.user_name || currentUser?.name || t('lbl_na');
    const customerName = customer.name || t('pos_walk_in_customer');
    const receiptTitle = isReturn ? t('lbl_return_receipt') : t('lbl_receipt');

    // Calculate actual VAT amount for a single item
    const itemTaxAmount = (item: InvoiceItem): number => {
        if (!item.tax_rate) return 0;
        // Backend may send pre-calculated tax per item
        if (typeof item.tax === 'number' && item.tax > 0) return item.tax;
        const base = item.price * item.quantity;
        if (item.tax_included) {
            // Tax is embedded in price: extract it
            return base * item.tax_rate / (100 + item.tax_rate);
        }
        return base * item.tax_rate / 100;
    };
    const receiptKeptItems = keptItems as InvoiceItem[];
    const receiptExchangeItems = exchangeItems as InvoiceItem[];
    const receiptReturnedItems = returnedItems as InvoiceItem[];

    const formatReceiptQty = (item: InvoiceItem, prefix = '') => {
        const unit = item.unit || t('lbl_pcs');
        return `${prefix}${formatNumber(item.quantity)} ${unit}`;
    };

    const renderReceiptItems = (receiptItems: InvoiceItem[], sectionTitle?: string, quantityPrefix = '') => {
        if (!receiptItems.length) return null;

        return (
            <div className="space-y-1">
                {sectionTitle && <div className="border-b border-black pb-1 pt-1 text-center text-[9px] font-black">{sectionTitle}</div>}
                {receiptItems.map((item, index) => (
                    <div key={`${sectionTitle || 'item'}-${item.id}-${index}`} className="break-inside-avoid border-b border-dotted border-gray-400 pb-1">
                        <div className="flex gap-1 text-[9px] font-bold">
                            <div className="w-5 shrink-0">{formatNumber(index + 1)}.</div>
                            <div className="min-w-0 flex-1 break-words">{item.title}</div>
                            <div className="w-[18mm] shrink-0 text-right">{formatCurrency(item.amount)}</div>
                        </div>
                        <div className="ml-5 flex justify-between gap-1 text-[8px]">
                            <span>{formatReceiptQty(item, quantityPrefix)} x {formatCurrency(item.price)}</span>
                            {item.tax_rate ? <span>{taxLabel}: {formatCurrency(itemTaxAmount(item))} ({formatNumber(item.tax_rate)}%)</span> : null}
                        </div>
                        {item.variantName && <div className="ml-5 break-words text-[8px]">{t('lbl_variant')}: {item.variantName}</div>}
                        {item.has_serial && item.serials?.length ? (
                            <div className="ml-5 break-words text-[8px]">{t('lbl_serial')}: {item.serials.map((serial) => serial.serial_number).join(', ')}</div>
                        ) : null}
                        {item.has_warranty && item.warranty ? <div className="ml-5 text-[8px]">{t('lbl_warranty')}: {item.warranty.warranty_type_name || formatWarrantyDuration(item.warranty)}</div> : null}
                    </div>
                ))}
            </div>
        );
    };

    // afterprint is now handled inside printInWindow via the onDone callback — no main-window listener needed

    const autoTriggered = useRef(false);
    useEffect(() => {
        if (!autoPrint || autoTriggered.current) return;
        autoTriggered.current = true;
        const timer = setTimeout(() => {
            if (autoPrint === 'receipt') {
                setTimeout(() => printWithMode('receipt'), 450);
            } else {
                printWithMode('invoice');
            }
        }, 700);
        return () => clearTimeout(timer);
        // printWithMode is stable (no deps change) — intentionally omitted
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPrint]);

    const printWithMode = (mode: 'invoice' | 'receipt') => {
        if (isPrinting) return;
        setIsPrinting(true);
        setPrintMode(mode);

        window.requestAnimationFrame(() => {
            setTimeout(() => {
                const selector = mode === 'invoice' ? '.invoice-shell' : '.thermal-receipt-print-area';
                const sourceEl = document.querySelector(selector) as HTMLElement | null;

                if (!sourceEl) {
                    setPrintMode(null);
                    setIsPrinting(false);
                    return;
                }

                // Clone and strip UI-only nav/button elements
                const clone = sourceEl.cloneNode(true) as HTMLElement;
                clone.querySelectorAll('[class*="print:hidden"]').forEach((el) => el.remove());

                // Carry over page stylesheets so Tailwind classes render correctly
                const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                    .map((l) => l.outerHTML)
                    .join('\n');
                const inlineStyles = Array.from(document.querySelectorAll('style'))
                    .map((s) => `<style>${s.innerHTML}</style>`)
                    .join('\n');

                const printCss =
                    mode === 'invoice'
                        ? `<style>
                            @page { size: A4; margin: 10mm; }
                            body { margin: 0; padding: 0; background: #fff; }
                            .invoice-shell { width: 100%; box-shadow: none !important; }
                          </style>`
                        : `<style>
                            @page { size: 58mm auto; margin: 0; }
                            html, body {
                                margin: 0 !important;
                                padding: 0 !important;
                                height: auto !important;
                                min-height: 0 !important;
                                overflow: visible !important;
                                background: #fff;
                            }
                            body { display: block; }
                            .thermal-receipt-print-area {
                                width: 58mm !important;
                                margin: 0 !important;
                                padding: 3mm !important;
                                box-shadow: none !important;
                                break-after: avoid;
                                page-break-after: avoid;
                                overflow: visible !important;
                            }
                          </style>`;

                const html = `<!DOCTYPE html><html><head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1">
                    ${styleLinks}${inlineStyles}${printCss}
                </head><body>${clone.outerHTML}</body></html>`;

                // Open receipt in an isolated window — guaranteed single print call,
                // works with Bluetooth POS printers paired as a system printer.
                import('@/lib/printUtil').then(({ printInWindow }) => {
                    printInWindow(html, () => {
                        setPrintMode(null);
                        setIsPrinting(false);
                    });
                });
            }, 100);
        });
    };

    // Generate PDF using pdfmake
    const exportPDF = async () => {
        setIsPrinting(true);

        // Await fonts — resolves immediately if already cached, waits if still loading
        await _ensurePdfFonts();

        if (!_pdfCache.pdfMake) {
            alert(t('msg_pdf_loading'));
            setIsPrinting(false);
            return;
        }

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
            const companyInfoStack: any[] = [
                { text: currentStore?.store_name || 'andgatePOS', style: 'companyName' },
                { text: currentStore?.store_location || t('lbl_store_address'), style: 'companyInfo' },
                {
                    text: [
                        currentStore?.store_email ? `${currentStore.store_email}` : '',
                        currentStore?.store_email && currentStore?.store_contact ? ' | ' : '',
                        currentStore?.store_contact ? `${t('lbl_phone')}: ${currentStore.store_contact}` : '',
                    ],
                    style: 'companyInfo',
                },
            ];
            if (registrationNumber) {
                companyInfoStack.push({ text: `${registrationLabel}: ${registrationNumber}`, style: 'companyInfo', bold: true });
            }
            headerContent.columns.push({
                stack: companyInfoStack,
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
                text: isReturn ? t('lbl_return_receipt').toUpperCase() : t('lbl_invoice').toUpperCase(),
                style: 'invoiceTitle',
                alignment: 'center',
                margin: [0, 0, 0, 10],
            });

            // Invoice details and customer info
            const detailsContent: any = {
                columns: [
                    {
                        stack: [{ text: [{ text: `${t('lbl_invoice_no')}: `, bold: true }, invoice] }, { text: [{ text: `${t('lbl_date')}: `, bold: true }, `${currentDate} ${currentTime}`] }],
                        width: '50%',
                    },
                    {
                        stack: [
                            { text: [{ text: `${t('lbl_to')}: `, bold: true }, customer.name || t('pos_walk_in_customer')] },
                            customer.email ? { text: [{ text: `${t('lbl_email')}: `, bold: true }, customer.email] } : {},
                            customer.phone ? { text: [{ text: `${t('lbl_contact')}: `, bold: true }, customer.phone] } : {},
                        ],
                        width: '50%',
                    },
                ],
                columnGap: 20,
                margin: [0, 0, 0, 10],
                fontSize: 9,
            };

            if (order_id) {
                detailsContent.columns[0].stack.push({ text: [{ text: `${t('lbl_order_id')}: `, bold: true }, `#${order_id}`] });
            }

            detailsContent.columns[0].stack.push({
                text: [
                    { text: `${t('lbl_order_status')}: `, bold: true },
                    {
                        text: getPaymentStatusLabel(displayPaymentStatus),
                        color: getPaymentStatusColor(displayPaymentStatus || 'pending'),
                        bold: true,
                    },
                ],
            });

            detailsContent.columns[0].stack.push({
                text: [{ text: `${t('lbl_payment_method')}: `, bold: true }, displayPaymentMethod || t('lbl_cash')],
            });

            if (isReturn && original_order_id) {
                detailsContent.columns[0].stack.push({
                    text: [{ text: `${t('lbl_original_order')}: `, bold: true }, `#${original_order_id}`],
                });
            }

            content.push(detailsContent);

            // Products table
            if (!isReturn) {
                const tableBody: any[] = [
                    [
                        { text: '#', style: 'tableHeader', alignment: 'center' },
                        { text: t('lbl_product_name'), style: 'tableHeader' },
                        { text: t('lbl_qty'), style: 'tableHeader', alignment: 'center' },
                        { text: t('lbl_unit_price'), style: 'tableHeader', alignment: 'right' },
                        { text: `${t('lbl_tax')}/VAT`, style: 'tableHeader', alignment: 'right' },
                        { text: t('lbl_discount'), style: 'tableHeader', alignment: 'right' },
                        { text: t('lbl_amount'), style: 'tableHeader', alignment: 'right' },
                    ],
                ];

                invoiceItems.forEach((product, index) => {
                    const productName: any[] = [{ text: product.title, bold: true }];

                    if (product.variantName) {
                        productName.push({ text: `\n${t('lbl_variant')}: ${product.variantName}`, fontSize: 8, color: '#4338ca' });
                    }

                    if (product.warranty && formatWarrantyDuration(product.warranty)) {
                        productName.push({ text: `\n${t('lbl_warranty')}: ${formatWarrantyDuration(product.warranty)}`, fontSize: 8, color: '#6b7280' });
                    }

                    if (product.serials && product.serials.length > 0) {
                        productName.push({
                            text: `\n${product.serials.map((s) => s.serial_number).join(' ')}`,
                            fontSize: 8,
                            color: '#6b7280',
                        });
                    }

                    tableBody.push([
                        { text: formatNumber(index + 1), alignment: 'center' },
                        { stack: productName },
                        { text: `${formatNumber(product.quantity, 2)} ${product.unit || t('lbl_pcs')}`, alignment: 'center' },
                        { text: formatCurrencyPDF(product.price), alignment: 'right' },
                        {
                            text: product.tax_rate
                                ? `${formatCurrencyPDF(itemTaxAmount(product))}\n(${formatNumber(product.tax_rate)}%)`
                                : '-',
                            alignment: 'right',
                        },
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
                    content.push({ text: t('lbl_items_kept').toUpperCase(), style: 'sectionHeader', color: '#059669', margin: [0, 5, 0, 5] });
                    const keptTableBody: any[] = [
                        [
                            { text: '#', style: 'tableHeader', alignment: 'center' },
                            { text: t('lbl_product_name'), style: 'tableHeader' },
                            { text: t('lbl_qty'), style: 'tableHeader', alignment: 'center' },
                            { text: t('lbl_unit_price'), style: 'tableHeader', alignment: 'right' },
                            { text: t('lbl_amount'), style: 'tableHeader', alignment: 'right' },
                        ],
                    ];

                    keptItems.forEach((product: any, index: number) => {
                        keptTableBody.push([
                            { text: formatNumber(index + 1), alignment: 'center' },
                            { text: product.title },
                            { text: formatNumber(product.quantity), alignment: 'center' },
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
                    content.push({ text: t('lbl_returned_items').toUpperCase(), style: 'sectionHeader', color: '#dc2626', margin: [0, 5, 0, 5] });
                    const returnedTableBody: any[] = [
                        [
                            { text: '#', style: 'tableHeader', alignment: 'center' },
                            { text: t('lbl_product_name'), style: 'tableHeader' },
                            { text: t('lbl_qty'), style: 'tableHeader', alignment: 'center' },
                            { text: t('lbl_unit_price'), style: 'tableHeader', alignment: 'right' },
                            { text: t('lbl_refund'), style: 'tableHeader', alignment: 'right' },
                        ],
                    ];

                    returnedItems.forEach((product: any, index: number) => {
                        returnedTableBody.push([
                            { text: formatNumber(index + 1), alignment: 'center' },
                            { text: product.title },
                            { text: `-${formatNumber(product.quantity)}`, alignment: 'center' },
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
                    content.push({ text: t('lbl_exchange_items').toUpperCase(), style: 'sectionHeader', color: '#2563eb', margin: [0, 5, 0, 5] });
                    const exchangeTableBody: any[] = [
                        [
                            { text: '#', style: 'tableHeader', alignment: 'center' },
                            { text: t('lbl_product_name'), style: 'tableHeader' },
                            { text: t('lbl_qty'), style: 'tableHeader', alignment: 'center' },
                            { text: t('lbl_unit_price'), style: 'tableHeader', alignment: 'right' },
                            { text: t('lbl_amount'), style: 'tableHeader', alignment: 'right' },
                        ],
                    ];

                    exchangeItems.forEach((product: any, index: number) => {
                        exchangeTableBody.push([
                            { text: formatNumber(index + 1), alignment: 'center' },
                            { text: product.title },
                            { text: formatNumber(product.quantity), alignment: 'center' },
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
                    { text: t('lbl_total_qty'), bold: true, border: [false, true, false, false] },
                    { text: `${formatNumber(totalQty, 2)} ${invoiceItems[0]?.unit || t('lbl_pcs')}`, alignment: 'right', border: [false, true, false, false] },
                ]);
                totalsContent.push([
                    { text: calculatedTax > 0 ? t('lbl_subtotal_no_tax') : t('lbl_subtotal'), bold: true, border: [false, false, false, false] },
                    { text: formatCurrencyPDF(subtotal), alignment: 'right', border: [false, false, false, false] },
                ]);

                if (calculatedTax > 0) {
                    totalsContent.push([
                        { text: taxLabel, bold: true, border: [false, false, false, false] },
                        { text: formatCurrencyPDF(calculatedTax), alignment: 'right', border: [false, false, false, false] },
                    ]);
                }

                if (calculatedDiscount > 0) {
                    totalsContent.push([
                        { text: t('lbl_discount'), bold: true, border: [false, false, false, false], color: '#dc2626' },
                        { text: `-${formatCurrencyPDF(calculatedDiscount)}`, alignment: 'right', border: [false, false, false, false], color: '#dc2626' },
                    ]);
                }

                totalsContent.push([
                    { text: t('lbl_grand_total'), bold: true, fontSize: 11, fillColor: '#f3f4f6', border: [false, true, false, true] },
                    { text: formatCurrencyPDF(grandTotal), alignment: 'right', bold: true, fontSize: 11, fillColor: '#f3f4f6', border: [false, true, false, true] },
                ]);

                if ((displayPaymentStatus?.toLowerCase() === 'partial' || displayPaymentStatus?.toLowerCase() === 'due') && amountPaid > 0) {
                    totalsContent.push([
                        { text: t('lbl_amount_paid'), bold: true, border: [false, false, false, false], color: '#059669' },
                        { text: formatCurrencyPDF(amountPaid), alignment: 'right', border: [false, false, false, false], color: '#059669' },
                    ]);
                }

                if ((displayPaymentStatus?.toLowerCase() === 'partial' || displayPaymentStatus?.toLowerCase() === 'due') && amountDue > 0) {
                    totalsContent.push([
                        { text: t('lbl_total_due'), bold: true, fontSize: 11, fillColor: '#fee2e2', border: [false, true, false, true], color: '#dc2626' },
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
                        { text: t('lbl_exchange_total'), bold: true, border: [false, true, false, false] },
                        { text: formatCurrencyPDF(exchangeTotal), alignment: 'right', border: [false, true, false, false] },
                    ]);
                }

                if (returnTotal > 0) {
                    totalsContent.push([
                        { text: t('lbl_return_credit'), bold: true, border: [false, false, false, false], color: '#dc2626' },
                        { text: `-${formatCurrencyPDF(returnTotal)}`, alignment: 'right', border: [false, false, false, false], color: '#dc2626' },
                    ]);
                }

                totalsContent.push([
                    {
                        text: netTransaction >= 0 ? t('lbl_net_payable') : t('lbl_net_refund'),
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
                text: [{ text: `${t('lbl_in_word')}: `, bold: true }, numberToWords(isReturn ? Math.abs(netTransaction) : grandTotal)],
                margin: [0, 5, 0, 15],
                fontSize: 9,
            });

            // Signature section
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
                        stack: [{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 1 }] }, { text: t('lbl_checked_by'), alignment: 'center', margin: [0, 5, 0, 0], fontSize: 9, bold: true }],
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
            const footerStack: any[] = [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }], margin: [0, 0, 0, 5] },
            ];
            if (currentStore?.invoice_footer) {
                footerStack.push({ text: currentStore.invoice_footer, alignment: 'center', fontSize: 9, color: '#374151', margin: [0, 0, 0, 4] });
            }
            footerStack.push(
                { text: `${t('lbl_print_date')}: ${currentDate} ${currentTime}`, alignment: 'center', fontSize: 8, color: '#6b7280' },
                { text: `${t('lbl_powered_by')}: AndgatePOS | ${invoice} | ${t('lbl_page')}: ${formatNumber(1)} ${t('lbl_of')} ${formatNumber(1)}`, alignment: 'center', fontSize: 8, color: '#6b7280' },
            );
            content.push({ stack: footerStack });

            const useBnFont = i18n.language === 'bn' && _pdfCache.bnLoaded && hasBengaliPdfFonts();
            const docDefinition: any = {
                fonts: {
                    Roboto: {
                        normal: 'Roboto-Regular.ttf',
                        bold: 'Roboto-Medium.ttf',
                        italics: 'Roboto-Italic.ttf',
                        bolditalics: 'Roboto-MediumItalic.ttf',
                    },
                    ...(useBnFont ? {
                        NotoSansBengali: {
                            normal: 'NotoSansBengali-Regular.ttf',
                            bold: 'NotoSansBengali-Bold.ttf',
                            italics: 'NotoSansBengali-Regular.ttf',
                            bolditalics: 'NotoSansBengali-Bold.ttf',
                        },
                    } : {}),
                },
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
                    font: useBnFont ? 'NotoSansBengali' : 'Roboto',
                },
            };

            // Pass fonts + VFS directly — bypasses pdfMake module-level state
            // Register fonts on the instance (pdfMake reads this.fonts internally)
            _pdfCache.pdfMake.fonts = { ..._pdfCache.pdfMake.fonts, ..._pdfCache.fonts };
            _pdfCache.pdfMake.vfs = { ..._pdfCache.pdfMake.vfs, ..._pdfCache.vfs };
            _pdfCache.pdfMake.createPdf(docDefinition, undefined, _pdfCache.fonts, _pdfCache.vfs).download(`invoice-${invoice || 'preview'}.pdf`);
        } catch (error) {
            console.error('[PDF] generation failed:', error);
            alert(t('msg_pdf_generate_failed'));
        } finally {
            setIsPrinting(false);
        }
    };

    const handlePrint = () => {
        printWithMode('invoice');
    };

    return (
        <div className="min-h-screen bg-gray-100 print:bg-white print:p-0">
            <div className="invoice-shell mx-auto max-w-5xl bg-white shadow-lg print:shadow-none">
                {/* Compact Action Bar */}
                <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 py-2 shadow-sm print:hidden">
                    {onClose ? (
                        <button
                            onClick={onClose}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            {t('btn_close')}
                        </button>
                    ) : (
                        <div />
                    )}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            disabled={isPrinting}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>{isPrinting && printMode === 'invoice' ? t('status_opening') : t('btn_print_invoice')}</span>
                        </button>
                        <button
                            onClick={() => printWithMode('receipt')}
                            disabled={isPrinting}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{isPrinting && printMode === 'receipt' ? t('status_opening') : t('btn_print_receipt')}</span>
                        </button>
                        <button
                            onClick={exportPDF}
                            disabled={isPrinting}
                            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{isPrinting && !printMode ? t('status_generating') : t('btn_download_pdf')}</span>
                        </button>
                    </div>
                </div>

                {/* Success Message - Only show when order is just created */}
                {isOrderCreated && (
                    <div className="border-b border-green-200 bg-green-50 p-4 print:hidden">
                        <div className="flex items-center gap-3 text-green-800">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-lg font-semibold">{t('msg_order_created_successfully')}</p>
                                <p className="text-sm text-green-700">{t('msg_order_processed_saved')}</p>
                            </div>
                        </div>
                    </div>
                )}


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
                                        alt={t('lbl_company_logo')}
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
                                                : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${currentStore.logo_path.startsWith('/') ? '' : '/storage/'}${currentStore.logo_path}`
                                        }
                                        alt={t('lbl_company_logo')}
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
                                <h1 className="text-2xl font-bold text-gray-800">{currentStore?.store_name || 'andgatePOS'}</h1>
                                <p className="mt-1 text-sm text-gray-600">{currentStore?.store_location || t('lbl_store_address')}</p>
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                                    {currentStore?.store_email && <span>{currentStore.store_email}</span>}
                                    {currentStore?.store_email && currentStore?.store_contact && <span>|</span>}
                                    {currentStore?.store_contact && <span>{t('lbl_phone')}: {currentStore.store_contact}</span>}
                                </div>
                                {registrationNumber && (
                                    <p className="mt-1 text-sm font-semibold text-gray-700">{registrationLabel}: {registrationNumber}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Invoice Title */}
                    <div className="mb-4 text-center">
                        <h2 className="text-2xl font-bold text-gray-800">{isReturn ? t('lbl_return_receipt') : t('lbl_invoice')}</h2>
                    </div>

                    {/* Invoice Details and Customer Info */}
                    <div className="mb-4 grid grid-cols-2 gap-6">
                        {/* Left Side - Invoice Details */}
                        <div className="space-y-1 text-sm">
                            <p>
                                <strong>{t('lbl_invoice_no')}:</strong> {invoice}
                            </p>
                            <p>
                                <strong>{t('lbl_date')}:</strong> {currentDate} {currentTime}
                            </p>
                            {order_id && (
                                <p>
                                    <strong>{t('lbl_order_id')}:</strong> #{order_id}
                                </p>
                            )}
                            <p>
                                <strong>{t('lbl_order_status')}:</strong>{' '}
                                <span className={`font-semibold`} style={{ color: getPaymentStatusColor(displayPaymentStatus || 'pending') }}>
                                    {getPaymentStatusLabel(displayPaymentStatus)}
                                </span>
                            </p>
                            <p>
                                <strong>{t('lbl_payment_method')}:</strong> {displayPaymentMethod || t('lbl_cash')}
                            </p>
                            {isReturn && original_order_id && (
                                <p>
                                    <strong>{t('lbl_original_order')}:</strong> #{original_order_id}
                                </p>
                            )}
                        </div>

                        {/* Right Side - Customer Details */}
                        <div className="space-y-1 text-sm">
                            <p>
                                <strong>{t('lbl_to')}:</strong> {customer.name || t('pos_walk_in_customer')}
                            </p>
                            {customer.email && (
                                <p>
                                    <strong>{t('lbl_email')}:</strong> {customer.email}
                                </p>
                            )}
                            {customer.phone && (
                                <p>
                                    <strong>{t('lbl_contact_no')}:</strong> {customer.phone}
                                </p>
                            )}
                            {customer.membership && customer.membership.toLowerCase() !== 'normal' && (
                                <p>
                                    <strong>{t('lbl_membership')}:</strong> <span className="capitalize">{customer.membership}</span>
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
                                        <th className="border border-gray-300 px-2 py-2 text-left">{t('lbl_product_name')}</th>
                                        <th className="w-16 border border-gray-300 px-2 py-2 text-center">{t('lbl_qty')}</th>
                                        <th className="w-24 border border-gray-300 px-2 py-2 text-right">{t('lbl_unit_price')}</th>
                                        <th className="w-20 border border-gray-300 px-2 py-2 text-right">{t('lbl_tax')}/VAT</th>
                                        <th className="w-20 border border-gray-300 px-2 py-2 text-right">{t('lbl_disc')}</th>
                                        <th className="w-28 border border-gray-300 px-2 py-2 text-right">{t('lbl_amount')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceItems.map((product, index) => (
                                        <tr key={product.id}>
                                            <td className="border border-gray-300 px-2 py-2 align-top">{formatNumber(index + 1)}</td>
                                            <td className="border border-gray-300 px-2 py-2">
                                                <div>
                                                    <p className="font-medium">{product.title}</p>
                                                    {product.variantName && (
                                                        <p className="mt-1 text-xs text-blue-600">
                                                            <strong>{t('lbl_variant')}:</strong> {product.variantName}
                                                        </p>
                                                    )}
                                                    {product.warranty && formatWarrantyDuration(product.warranty) && (
                                                        <p className="mt-1 text-xs text-gray-600">
                                                            <strong>{t('lbl_warranty')}:</strong> {formatWarrantyDuration(product.warranty)}
                                                        </p>
                                                    )}
                                                    {product.serials && product.serials.length > 0 && (
                                                        <p className="mt-1 font-mono text-xs text-gray-600">{product.serials.map((s) => s.serial_number).join(' ')}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-center align-top">
                                                {formatNumber(product.quantity, 2)} {product.unit || t('lbl_pcs')}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right align-top">{formatCurrency(product.price)}</td>
                                            <td className="border border-gray-300 px-2 py-2 text-right align-top">
                                                {product.tax_rate
                                                    ? <><span className="block">{formatCurrency(itemTaxAmount(product))}</span><span className="text-xs text-gray-400">({formatNumber(product.tax_rate)}%)</span></>
                                                    : '-'}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-right align-top">{formatCurrency(0)}</td>
                                            <td className="border border-gray-300 px-2 py-2 text-right align-top font-semibold">{formatCurrency(product.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="mb-4 space-y-4">
                            {keptItems.length > 0 && (
                                <div>
                                    <h3 className="mb-2 text-sm font-bold text-green-700">{t('lbl_items_kept')}</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-gray-300 text-sm">
                                            <thead>
                                                <tr className="bg-green-100">
                                                    <th className="w-12 border border-gray-300 px-2 py-2 text-left">#</th>
                                                    <th className="border border-gray-300 px-2 py-2 text-left">{t('lbl_product_name')}</th>
                                                    <th className="w-16 border border-gray-300 px-2 py-2 text-center">{t('lbl_qty')}</th>
                                                    <th className="w-28 border border-gray-300 px-2 py-2 text-right">{t('lbl_unit_price')}</th>
                                                    <th className="w-28 border border-gray-300 px-2 py-2 text-right">{t('lbl_amount')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(keptItems as InvoiceItem[]).map((item, index) => (
                                                    <tr key={`kept-${item.id}-${index}`}>
                                                        <td className="border border-gray-300 px-2 py-2">{formatNumber(index + 1)}</td>
                                                        <td className="border border-gray-300 px-2 py-2">
                                                            <p className="font-medium">{item.title}</p>
                                                            {item.variantName && <p className="text-xs text-blue-600">{t('lbl_variant')}: {item.variantName}</p>}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-2 text-center">{formatNumber(item.quantity, 2)} {item.unit || t('lbl_pcs')}</td>
                                                        <td className="border border-gray-300 px-2 py-2 text-right">{formatCurrency(item.price)}</td>
                                                        <td className="border border-gray-300 px-2 py-2 text-right font-semibold">{formatCurrency(item.amount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {returnedItems.length > 0 && (
                                <div>
                                    <h3 className="mb-2 text-sm font-bold text-red-700">{t('lbl_returned_items')}</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-gray-300 text-sm">
                                            <thead>
                                                <tr className="bg-red-100">
                                                    <th className="w-12 border border-gray-300 px-2 py-2 text-left">#</th>
                                                    <th className="border border-gray-300 px-2 py-2 text-left">{t('lbl_product_name')}</th>
                                                    <th className="w-16 border border-gray-300 px-2 py-2 text-center">{t('lbl_qty')}</th>
                                                    <th className="w-28 border border-gray-300 px-2 py-2 text-right">{t('lbl_unit_price')}</th>
                                                    <th className="w-28 border border-gray-300 px-2 py-2 text-right">{t('lbl_refund')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(returnedItems as InvoiceItem[]).map((item, index) => (
                                                    <tr key={`returned-${item.id}-${index}`}>
                                                        <td className="border border-gray-300 px-2 py-2">{formatNumber(index + 1)}</td>
                                                        <td className="border border-gray-300 px-2 py-2">
                                                            <p className="font-medium">{item.title}</p>
                                                            {item.variantName && <p className="text-xs text-blue-600">{t('lbl_variant')}: {item.variantName}</p>}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-2 text-center text-red-600">-{formatNumber(item.quantity, 2)} {item.unit || t('lbl_pcs')}</td>
                                                        <td className="border border-gray-300 px-2 py-2 text-right">{formatCurrency(item.price)}</td>
                                                        <td className="border border-gray-300 px-2 py-2 text-right font-semibold text-red-600">-{formatCurrency(item.amount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {exchangeItems.length > 0 && (
                                <div>
                                    <h3 className="mb-2 text-sm font-bold text-blue-700">{t('lbl_exchange_items')}</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-gray-300 text-sm">
                                            <thead>
                                                <tr className="bg-blue-100">
                                                    <th className="w-12 border border-gray-300 px-2 py-2 text-left">#</th>
                                                    <th className="border border-gray-300 px-2 py-2 text-left">{t('lbl_product_name')}</th>
                                                    <th className="w-16 border border-gray-300 px-2 py-2 text-center">{t('lbl_qty')}</th>
                                                    <th className="w-28 border border-gray-300 px-2 py-2 text-right">{t('lbl_unit_price')}</th>
                                                    <th className="w-28 border border-gray-300 px-2 py-2 text-right">{t('lbl_amount')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(exchangeItems as InvoiceItem[]).map((item, index) => (
                                                    <tr key={`exchange-${item.id}-${index}`}>
                                                        <td className="border border-gray-300 px-2 py-2">{formatNumber(index + 1)}</td>
                                                        <td className="border border-gray-300 px-2 py-2">
                                                            <p className="font-medium">{item.title}</p>
                                                            {item.variantName && <p className="text-xs text-blue-600">{t('lbl_variant')}: {item.variantName}</p>}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-2 text-center">{formatNumber(item.quantity, 2)} {item.unit || t('lbl_pcs')}</td>
                                                        <td className="border border-gray-300 px-2 py-2 text-right">{formatCurrency(item.price)}</td>
                                                        <td className="border border-gray-300 px-2 py-2 text-right font-semibold">{formatCurrency(item.amount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Totals, Signatures, Footer - same as before */}
                    <div className="mb-4 flex justify-end">
                        <div className="w-80 text-sm">
                            {!isReturn ? (
                                <>
                                    <div className="flex justify-between border-b border-gray-300 py-1">
                                        <span>
                                            <strong>{t('lbl_total_qty')}</strong>
                                        </span>
                                        <span>
                                            {formatNumber(totalQty, 2)} {invoiceItems[0]?.unit || t('lbl_pcs')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-300 py-1">
                                        <span>
                                            <strong>{calculatedTax > 0 ? t('lbl_subtotal_no_tax') : t('lbl_subtotal')}</strong>
                                        </span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    {calculatedTax > 0 && (
                                        <div className="flex justify-between border-b border-gray-300 py-1">
                                            <span>
                                                <strong>{taxLabel}</strong>
                                            </span>
                                            <span>{formatCurrency(calculatedTax)}</span>
                                        </div>
                                    )}
                                    {calculatedDiscount > 0 && (
                                        <div className="flex justify-between border-b border-gray-300 py-1 text-red-600">
                                            <span>
                                                <strong>{t('lbl_discount')}</strong>
                                            </span>
                                            <span>-{formatCurrency(calculatedDiscount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between bg-gray-100 px-2 py-2 text-base font-bold">
                                        <span>{t('lbl_grand_total')}</span>
                                        <span>{formatCurrency(grandTotal)}</span>
                                    </div>
                                    {(displayPaymentStatus?.toLowerCase() === 'partial' || displayPaymentStatus?.toLowerCase() === 'due') && amountPaid > 0 && (
                                        <div className="flex justify-between border-b border-gray-300 py-1 text-green-600">
                                            <span>
                                                <strong>{t('lbl_amount_paid')}</strong>
                                            </span>
                                            <span>{formatCurrency(amountPaid)}</span>
                                        </div>
                                    )}
                                    {(displayPaymentStatus?.toLowerCase() === 'partial' || displayPaymentStatus?.toLowerCase() === 'due') && amountDue > 0 && (
                                        <div className="flex justify-between bg-red-50 px-2 py-2 text-base font-bold text-red-600">
                                            <span>{t('lbl_total_due')}</span>
                                            <span>{formatCurrency(amountDue)}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {exchangeTotal > 0 && (
                                        <div className="flex justify-between border-b border-gray-300 py-1">
                                            <span>
                                                <strong>{t('lbl_exchange_total')}</strong>
                                            </span>
                                            <span>{formatCurrency(exchangeTotal)}</span>
                                        </div>
                                    )}
                                    {returnTotal > 0 && (
                                        <div className="flex justify-between border-b border-gray-300 py-1 text-red-600">
                                            <span>
                                                <strong>{t('lbl_return_credit')}</strong>
                                            </span>
                                            <span>-{formatCurrency(returnTotal)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between bg-gray-100 px-2 py-2 text-base font-bold">
                                        <span>{netTransaction >= 0 ? t('lbl_net_payable') : t('lbl_net_refund')}</span>
                                        <span className={netTransaction >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(Math.abs(netTransaction))}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Amount in Words */}
                    <div className="mb-4 text-sm">
                        <p>
                            <strong>{t('lbl_in_word')}:</strong> {numberToWords(isReturn ? Math.abs(netTransaction) : grandTotal)}
                        </p>
                    </div>

                    {/* Signature Section */}
                    <div className="mb-6 grid grid-cols-3 gap-4 pt-8">
                        <div className="border-t border-gray-400 pt-2 text-center">
                            <p className="text-sm font-semibold">{t('lbl_received_by')}</p>
                        </div>
                        <div className="border-t border-gray-400 pt-2 text-center">
                            <p className="text-sm font-semibold">{t('lbl_checked_by')}</p>
                        </div>
                        <div className="border-t border-gray-400 pt-2 text-center">
                            <p className="text-sm font-semibold">{t('lbl_authorized_by')}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-300 pt-2 text-center text-xs text-gray-500">
                        {currentStore?.invoice_footer && (
                            <p className="mb-1 text-sm font-medium text-gray-600">{currentStore.invoice_footer}</p>
                        )}
                        <p>
                            {t('lbl_print_date')}: {currentDate} {currentTime}
                        </p>
                        <p>{t('lbl_powered_by')}: AndgatePOS | {invoice} | {t('lbl_page')}: {formatNumber(1)} {t('lbl_of')} {formatNumber(1)}</p>
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

                    .print-mode-invoice * {
                        visibility: hidden;
                    }

                    .print-mode-invoice .invoice-shell,
                    .print-mode-invoice .invoice-shell * {
                        visibility: visible;
                    }

                    .print-mode-invoice .invoice-shell {
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

            {/* Hidden thermal receipt — cloned by printWithMode('receipt') for isolated-window printing */}
            <div aria-hidden className="hidden">
                <div className="thermal-receipt-print-area mx-auto w-[58mm] bg-white p-[3mm] font-mono text-[10px] leading-tight text-black">
                        <div className="text-center">
                            <div className="mb-1 break-words text-[15px] font-black uppercase">{currentStore?.store_name || 'andgatePOS'}</div>
                            {currentStore?.store_location && <div className="break-words text-[8px]">{currentStore.store_location}</div>}
                            {currentStore?.store_contact && <div className="text-[8px]">{t('lbl_phone')}: {currentStore.store_contact}</div>}
                            {currentStore?.store_email && <div className="break-words text-[8px]">{currentStore.store_email}</div>}
                            {registrationNumber && (
                                <div className="mt-0.5 text-[8px] font-bold">{registrationLabel}: {registrationNumber}</div>
                            )}
                            <div className="mt-1 text-[11px] font-black uppercase">{receiptTitle}</div>
                        </div>

                        <div className="my-2 border-t border-dashed border-black" />

                        <div className="space-y-1 text-[9px]">
                            <div className="flex justify-between gap-2">
                                <span>{t('lbl_invoice_no')}</span>
                                <span className="break-all text-right font-bold">{invoice}</span>
                            </div>
                            {order_id && (
                                <div className="flex justify-between gap-2">
                                    <span>{t('lbl_order_id')}</span>
                                    <span>#{order_id}</span>
                                </div>
                            )}
                            {isReturn && original_order_id && (
                                <div className="flex justify-between gap-2">
                                    <span>{t('lbl_original_order')}</span>
                                    <span>#{original_order_id}</span>
                                </div>
                            )}
                            <div className="flex justify-between gap-2">
                                <span>{t('lbl_date')}</span>
                                <span className="text-right">{currentDate} {currentTime}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span>{t('lbl_cashier')}</span>
                                <span className="break-words text-right">{cashierName}</span>
                            </div>
                        </div>

                        <div className="my-2 border-t border-dashed border-black" />

                        <div className="space-y-1 text-[9px]">
                            <div className="flex justify-between gap-2">
                                <span>{t('lbl_customer')}</span>
                                <span className="break-words text-right font-bold">{customerName}</span>
                            </div>
                            {customer.phone && (
                                <div className="flex justify-between gap-2">
                                    <span>{t('lbl_phone')}</span>
                                    <span className="break-all text-right">{customer.phone}</span>
                                </div>
                            )}
                            {customer.membership && customer.membership.toLowerCase() !== 'normal' && (
                                <div className="flex justify-between gap-2">
                                    <span>{t('lbl_membership')}</span>
                                    <span className="capitalize">{customer.membership}</span>
                                </div>
                            )}
                        </div>

                        <div className="my-2 border-t border-dashed border-black" />

                        <div className="mb-1 flex border-b border-black pb-1 text-[9px] font-black">
                            <div className="flex-1 pr-1">{t('lbl_product_name')}</div>
                            <div className="w-[18mm] text-right">{t('lbl_amount')}</div>
                        </div>

                        {isReturn ? (
                            <>
                                {renderReceiptItems(receiptKeptItems, t('lbl_items_kept'))}
                                {renderReceiptItems(receiptExchangeItems, t('lbl_exchange_items'))}
                                {renderReceiptItems(receiptReturnedItems, t('lbl_returned_items'), '-')}
                            </>
                        ) : (
                            renderReceiptItems(invoiceItems)
                        )}

                        <div className="my-2 border-t border-black pt-2 text-[9px]">
                            <div className="flex justify-between">
                                <span>{calculatedTax > 0 ? t('lbl_subtotal_no_tax') : t('lbl_subtotal')}:</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{t('lbl_total_qty')}:</span>
                                <span>{formatNumber(totalQty, 2)}</span>
                            </div>
                            {calculatedTax > 0 && (
                                <div className="flex justify-between">
                                    <span>{taxLabel}:</span>
                                    <span>{formatCurrency(calculatedTax)}</span>
                                </div>
                            )}
                            {calculatedDiscount > 0 && (
                                <div className="flex justify-between">
                                    <span>{t('lbl_discount')}:</span>
                                    <span>-{formatCurrency(calculatedDiscount)}</span>
                                </div>
                            )}
                            {membershipDiscount > 0 && (
                                <div className="flex justify-between">
                                    <span>{t('lbl_membership')}:</span>
                                    <span>-{formatCurrency(membershipDiscount)}</span>
                                </div>
                            )}
                            {pointsDiscount > 0 && (
                                <div className="flex justify-between">
                                    <span>{t('lbl_points_discount')}:</span>
                                    <span>-{formatCurrency(pointsDiscount)}</span>
                                </div>
                            )}
                            {balanceDiscount > 0 && (
                                <div className="flex justify-between">
                                    <span>{t('lbl_balance_discount')}:</span>
                                    <span>-{formatCurrency(balanceDiscount)}</span>
                                </div>
                            )}
                            {isReturn && (
                                <>
                                    {Number(keptItemsTotal) > 0 && (
                                        <div className="flex justify-between">
                                            <span>{t('lbl_items_kept')}:</span>
                                            <span>{formatCurrency(keptItemsTotal)}</span>
                                        </div>
                                    )}
                                    {Number(returnTotal) > 0 && (
                                        <div className="flex justify-between">
                                            <span>{t('lbl_total_return_amount')}:</span>
                                            <span>{formatCurrency(returnTotal)}</span>
                                        </div>
                                    )}
                                    {Number(exchangeTotal) > 0 && (
                                        <div className="flex justify-between">
                                            <span>{t('lbl_total_new_items')}:</span>
                                            <span>{formatCurrency(exchangeTotal)}</span>
                                        </div>
                                    )}
                                    {Number(netTransaction) !== 0 && (
                                        <div className="flex justify-between font-bold">
                                            <span>{Number(netTransaction) > 0 ? t('lbl_customer_paid') : t('lbl_customer_refunded')}:</span>
                                            <span>{formatCurrency(Math.abs(Number(netTransaction)))}</span>
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="mt-1 flex justify-between border-t border-black pt-1 text-[12px] font-black">
                                <span>{t('lbl_grand_total')}:</span>
                                <span>{formatCurrency(grandTotal)}</span>
                            </div>
                            {amountPaid > 0 && (
                                <div className="flex justify-between">
                                    <span>{t('lbl_amount_paid')}:</span>
                                    <span>{formatCurrency(amountPaid)}</span>
                                </div>
                            )}
                            {changeAmount > 0 && (
                                <div className="flex justify-between">
                                    <span>{t('lbl_change')}:</span>
                                    <span>{formatCurrency(changeAmount)}</span>
                                </div>
                            )}
                            {amountDue > 0 && (
                                <div className="flex justify-between font-bold">
                                    <span>{t('lbl_amount_due')}:</span>
                                    <span>{formatCurrency(amountDue)}</span>
                                </div>
                            )}
                        </div>

                        <div className="my-2 border-t border-dashed border-black" />

                        <div className="space-y-1 text-center text-[9px]">
                            <div><strong>{t('lbl_payment_method')}:</strong> {displayPaymentMethod || t('lbl_cash')}</div>
                            <div><strong>{t('lbl_status')}:</strong> {getPaymentStatusLabel(displayPaymentStatus)}</div>
                            {isReturn && return_reason && <div><strong>{t('lbl_reason')}:</strong> {return_reason}</div>}
                            {notes && <div className="break-words"><strong>{t('lbl_notes')}:</strong> {notes}</div>}
                        </div>

                        <div className="my-2 border-t border-dashed border-black" />

                        <div className="text-center text-[9px]">
                            <div className="text-[11px] font-bold">{t('msg_thank_you')}</div>
                            <div>{t('msg_please_come_again')}</div>
                            {currentStore?.invoice_footer && (
                                <div className="mt-1 break-words text-[9px] font-medium">{currentStore.invoice_footer}</div>
                            )}
                            <div className="mt-2 text-[8px]">{t('lbl_powered_by')}: AndgatePOS</div>
                        </div>
                    </div>
                </div>
            </div>
    );
};



export default PosInvoicePreview;
