'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { closeReservedPdfWindow, downloadPdfMake, isMobilePdfDownloadRisk, reservePdfWindow } from '@/lib/pdf-mobile-download';
import enLocale from '@/public/locales/en.json';
import { RootState } from '@/store';
import { format } from 'date-fns';
import { FileSpreadsheet, FileText, Loader2, Printer } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';

// Module-level cache — pdfMake 0.3 is a singleton; we track Bengali font state here
const _rptPdf: { pm: any; bnLoaded: boolean } = { pm: null, bnLoaded: false };
let _rptPdfPromise: Promise<void> | null = null;

const _ensureRptPdf = (): Promise<void> => {
    if (_rptPdf.pm && _rptPdf.bnLoaded) return Promise.resolve();
    if (_rptPdfPromise) return _rptPdfPromise;

    const blobToBase64 = (blob: Blob): Promise<string> =>
        new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () => res((r.result as string).split(',')[1]);
            r.onerror = rej;
            r.readAsDataURL(blob);
        });

    _rptPdfPromise = (async () => {
        try {
            // pdfmake must load first so window.pdfMake is set before vfs_fonts runs
            const pmMod: any = await import('pdfmake/build/pdfmake');
            const pm = pmMod.default || pmMod;
            _rptPdf.pm = pm;
            // Explicitly register Roboto VFS — do not rely on window.pdfMake side-effect (unreliable in Next.js ESM)
            const vfsFonts: any = await import('pdfmake/build/vfs_fonts');
            pm.addVirtualFileSystem(vfsFonts.default ?? vfsFonts);

            const [rr, br] = await Promise.all([
                fetch('/fonts/NotoSansBengali-Regular.ttf'),
                fetch('/fonts/NotoSansBengali-Bold.ttf'),
            ]);
            if (rr.ok && br.ok) {
                const [rb64, bb64] = await Promise.all([rr.blob().then(blobToBase64), br.blob().then(blobToBase64)]);
                // pdfMake 0.3 public API — writes to the internal singleton VirtualFileSystem
                pm.addVirtualFileSystem({
                    'NotoSansBengali-Regular.ttf': rb64,
                    'NotoSansBengali-Bold.ttf': bb64,
                });
                pm.addFonts({
                    NotoSansBengali: {
                        normal: 'NotoSansBengali-Regular.ttf',
                        bold: 'NotoSansBengali-Bold.ttf',
                        italics: 'NotoSansBengali-Regular.ttf',
                        bolditalics: 'NotoSansBengali-Bold.ttf',
                    },
                });
                _rptPdf.bnLoaded = true;
            }
        } catch {
            _rptPdfPromise = null; // allow retry
        }
    })();
    return _rptPdfPromise;
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

export interface ExportColumn {
    key: string;
    label: string;
    width?: number;
    format?: (value: any, row?: any) => string;
}

export interface ReportExportToolbarProps {
    reportTitle: string;
    reportDescription?: string;
    reportIcon?: React.ReactNode;
    iconBgClass?: string;
    data: any[];
    columns: ExportColumn[];
    summary?: { label: string; value: string | number }[];
    filterSummary?: {
        dateRange?: { startDate?: string; endDate?: string; type?: string };
        storeName?: string;
        customFilters?: { label: string; value: string }[];
    };
    fileName?: string;
    fetchAllData?: () => Promise<any[]>;
}

const parseSafeDate = (dateStr: string): Date => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
};

const clampPdfText = (value: string, maxLength = 90): string => {
    if (!value) return '';
    const normalized = String(value).replace(/\s+/g, ' ').trim();
    return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 3)}...` : normalized;
};

const ReportExportToolbar: React.FC<ReportExportToolbarProps> = ({
    reportTitle,
    reportDescription,
    reportIcon,
    data,
    columns,
    summary = [],
    filterSummary,
    fileName,
    fetchAllData,
}) => {
    const { t, i18n } = getTranslation();
    const { currentStore } = useCurrentStore();
    const { code, symbol } = useCurrency();
    const user = useSelector((state: RootState) => state.auth?.user);
    const [isExporting, setIsExporting] = useState(false);

    // Preload on mount so fonts are ready before user clicks
    useEffect(() => { _ensureRptPdf(); }, []);

    const isBn = i18n.language === 'bn';

    // Store details from Redux
    const storeDetails = useMemo(
        () => ({
            name: currentStore?.store_name || 'My Store',
            contact: currentStore?.store_contact || '',
            location: currentStore?.store_location || '',
        }),
        [currentStore]
    );

    const dateDisplayText = useMemo(() => {
        if (!filterSummary?.dateRange) return t('lbl_all_time');
        const { type, startDate, endDate } = filterSummary.dateRange;
        if (type === 'none' || (!startDate && !endDate)) return t('lbl_all_time');
        if (type === 'today') return t('lbl_today');
        if (type === 'yesterday') return t('lbl_yesterday');
        if (type === 'this_week') return t('lbl_this_week');
        if (type === 'last_week') return t('lbl_last_week');
        if (type === 'this_month') return t('lbl_this_month');
        if (type === 'last_month') return t('lbl_last_month');
        if (type === 'this_year') return t('lbl_this_year');
        if (startDate && endDate) return `${format(parseSafeDate(startDate), 'dd MMM yyyy')} - ${format(parseSafeDate(endDate), 'dd MMM yyyy')}`;
        if (startDate) return `${t('lbl_from')} ${format(parseSafeDate(startDate), 'dd MMM yyyy')}`;
        if (endDate) return `${t('lbl_until')} ${format(parseSafeDate(endDate), 'dd MMM yyyy')}`;
        return t('lbl_custom_range');
    }, [filterSummary?.dateRange, t]);

    const storeDisplayText = filterSummary?.storeName || currentStore?.store_name || t('lbl_all_stores');
    const baseFileName = fileName || reportTitle.toLowerCase().replace(/\s+/g, '_');

    const displayTitle = useMemo(() => {
        const filterParts: string[] = [];
        if (dateDisplayText && dateDisplayText !== t('lbl_all_time')) filterParts.push(dateDisplayText);
        filterSummary?.customFilters?.forEach((f) => filterParts.push(f.value));
        return filterParts.length > 0 ? `${reportTitle} - ${filterParts.join(' / ')}` : reportTitle;
    }, [reportTitle, dateDisplayText, filterSummary?.customFilters, t]);

    const getExportData = useCallback(async (): Promise<any[]> => {
        if (fetchAllData) return await fetchAllData();
        return data;
    }, [data, fetchAllData]);

    const transformData = useCallback(
        (exportData: any[]) =>
            exportData.map((row) => {
                const exportRow: Record<string, any> = {};
                columns.forEach((col) => {
                    const value = row[col.key];
                    exportRow[col.label] = col.format ? col.format(value, row) : value ?? '';
                });
                return exportRow;
            }),
        [columns]
    );

    const getTotals = useCallback(
        (exportData: any[]) => {
            const totals: Record<string, number> = {};
            const skippedKeys = ['invoice', 'date', 'created_at', 'status', 'payment', 'customer', 'user', 'id', 'name', 'email', 'phone'];
            columns.forEach((col) => {
                if (skippedKeys.some((k) => col.key.toLowerCase().includes(k))) return;
                const values = exportData.map((row) => {
                    const val = row[col.key];
                    return typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.-]/g, '')) || 0;
                });
                const sum = values.reduce((a, b) => a + b, 0);
                if (!isNaN(sum) && sum !== 0) totals[col.label] = sum;
            });
            return totals;
        },
        [columns]
    );

    // Excel Export — unchanged
    const handleExcelExport = useCallback(async () => {
        setIsExporting(true);
        try {
            const exportData = await getExportData();
            const transformedData = transformData(exportData);
            const totals = getTotals(exportData);
            if (Object.keys(totals).length > 0) {
                const totalRow: Record<string, any> = {};
                columns.forEach((col, idx) => {
                    totalRow[col.label] = idx === 0 ? t('lbl_total').toUpperCase() + ':' : totals[col.label] !== undefined ? totals[col.label] : '';
                });
                transformedData.push(totalRow);
            }
            const worksheet = XLSX.utils.json_to_sheet(transformedData);
            const workbook = XLSX.utils.book_new();
            const colWidths = columns.map((col) => ({ wch: col.width || Math.max(col.label.length + 2, 15) }));
            worksheet['!cols'] = colWidths;
            XLSX.utils.book_append_sheet(workbook, worksheet, reportTitle.substring(0, 31));
            XLSX.writeFile(workbook, `${baseFileName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
        } finally {
            setIsExporting(false);
        }
    }, [getExportData, transformData, getTotals, columns, reportTitle, baseFileName, t]);

    // Build and output PDF using pdfMake (proper OpenType shaping for Bengali)
    const generatePdf = useCallback(
        async (mode: 'download' | 'print', reservedPdfWindow?: Window | null) => {
            await _ensureRptPdf();
            if (!_rptPdf.pm) return;

            const exportData = await getExportData();
            const useBnFont = isBn && _rptPdf.bnLoaded;
            const fontName = useBnFont ? 'NotoSansBengali' : 'Roboto';

            // Translation helper — Bengali when font ready, English fallback
            const tDoc = (key: string): string =>
                useBnFont ? t(key) : ((enLocale as unknown as Record<string, string>)[key] || key);

            // Text sanitizer — strip non-ASCII only in English mode (Roboto has no Bengali glyphs)
            const san = (text: string): string => {
                if (!text) return '';
                if (useBnFont) return String(text);
                let s = String(text).replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
                if (symbol) {
                    const esc = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    s = s.replace(new RegExp(esc, 'g'), `${code} `);
                }
                return s.replace(/[^\x00-\x7F]/g, '');
            };

            const totalWeight = columns.reduce((s, c) => s + (c.width || 10), 0);
            const isLandscape = columns.length > 6 || totalWeight > 90;
            const useWidePage = columns.length > 12 || totalWeight > 140;
            // A4 in points: portrait 595x842, landscape 842x595. A3 landscape gives very wide reports breathing room.
            const pageW = useWidePage ? 1190.55 : isLandscape ? 841.89 : 595.28;
            const marginPts = isLandscape ? 24 : 32;
            const usableW = pageW - marginPts * 2;

            // Date label for PDF header
            const pdfDateText = (() => {
                if (!filterSummary?.dateRange) return tDoc('lbl_all_time');
                const { type, startDate, endDate } = filterSummary.dateRange;
                if (type === 'none' || (!startDate && !endDate)) return tDoc('lbl_all_time');
                if (type === 'today') return tDoc('lbl_today');
                if (type === 'yesterday') return tDoc('lbl_yesterday');
                if (type === 'this_week') return tDoc('lbl_this_week');
                if (type === 'last_week') return tDoc('lbl_last_week');
                if (type === 'this_month') return tDoc('lbl_this_month');
                if (type === 'last_month') return tDoc('lbl_last_month');
                if (type === 'this_year') return tDoc('lbl_this_year');
                if (startDate && endDate) return `${format(parseSafeDate(startDate), 'dd MMM yyyy')} - ${format(parseSafeDate(endDate), 'dd MMM yyyy')}`;
                if (startDate) return `${tDoc('lbl_from')} ${format(parseSafeDate(startDate), 'dd MMM yyyy')}`;
                if (endDate) return `${tDoc('lbl_until')} ${format(parseSafeDate(endDate), 'dd MMM yyyy')}`;
                return tDoc('lbl_custom_range');
            })();

            const isNumeric = (col: ExportColumn) =>
                ['amount', 'price', 'total', 'tax', 'discount', 'subtotal', 'due', 'paid'].some(
                    (k) => col.key.includes(k) || col.label.toLowerCase().includes(k)
                );

            const fontSize = columns.length > 12 ? 5 : columns.length > 10 ? 5.5 : columns.length > 8 ? 6.5 : 7.5;

            const minColWidth = columns.length > 10 ? 28 : 36;
            const rawWidths = columns.map((c) => ((c.width || 10) / totalWeight) * usableW);
            const minAdjustedWidths = rawWidths.map((width) => Math.max(minColWidth, width));
            const adjustedTotal = minAdjustedWidths.reduce((sum, width) => sum + width, 0);
            const colWidths = minAdjustedWidths.map((width) => (width / adjustedTotal) * usableW);

            // Header row
            const headerRow = columns.map((col) => ({
                text: san(clampPdfText(col.label, 28)),
                bold: true,
                color: '#ffffff',
                fontSize,
                alignment: isNumeric(col) ? 'right' : 'center',
                noWrap: false,
            }));

            // Data rows
            const bodyRows = exportData.map((row, idx) =>
                columns.map((col) => {
                    if (col.key === 'serial' || col.label === '#') return { text: String(idx + 1), alignment: 'center', fontSize };
                    const raw = row[col.key];
                    const txt = col.format ? col.format(raw, row) : String(raw ?? '');
                    return {
                        text: san(clampPdfText(txt, isNumeric(col) ? 28 : 80)),
                        alignment: isNumeric(col) ? 'right' : 'left',
                        fontSize,
                        noWrap: false,
                    };
                })
            );

            // Totals row
            const totals = getTotals(exportData);
            const hasTotals = Object.keys(totals).length > 0;
            if (hasTotals) {
                bodyRows.push(
                    columns.map((col, idx) => ({
                        text: idx === 0
                            ? tDoc('lbl_total').toUpperCase()
                            : col.key === 'serial' || col.label === '#'
                                ? ''
                                : totals[col.label] !== undefined
                                    ? totals[col.label].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : '',
                        bold: true,
                        alignment: isNumeric(col) ? 'right' : 'left',
                        fontSize: fontSize + 1,
                        noWrap: false,
                    })) as any
                );
            }

            const summaryText = summary.map((s) => `${san(String(s.label))}: ${san(String(s.value))}`).join('   |   ');
            const filtersText = filterSummary?.customFilters?.length
                ? filterSummary.customFilters.map((f) => `${san(f.label)}: ${san(f.value)}`).join(' | ')
                : '';

            const docDefinition: any = {
                pageOrientation: isLandscape ? 'landscape' : 'portrait',
                pageSize: useWidePage ? 'A3' : 'A4',
                pageMargins: [marginPts, marginPts, marginPts, marginPts + 15],
                content: [
                    // === Header ===
                    {
                        columns: [
                            {
                                stack: [
                                    { text: san(storeDetails.name), fontSize: 14, bold: true, color: '#1e1e1e', margin: [0, 0, 0, 3] },
                                    ...(storeDetails.contact.trim() ? [{ text: `${tDoc('lbl_phone')}: ${san(storeDetails.contact)}`, fontSize: 8, color: '#666666' }] : []),
                                    ...(storeDetails.location.replace(/[\s,;.|/-]/g, '').length > 0 ? [{ text: `${tDoc('lbl_address')}: ${san(storeDetails.location)}`, fontSize: 8, color: '#666666' }] : []),
                                ],
                                width: '*',
                            },
                            {
                                stack: [
                                    { text: san(reportTitle), fontSize: 12, bold: true, color: '#3b82f6', alignment: 'right' },
                                    { text: `${tDoc('lbl_period')}: ${pdfDateText}`, fontSize: 8, color: '#666666', alignment: 'right' },
                                    { text: `${tDoc('lbl_store')}: ${san(storeDisplayText)}`, fontSize: 8, color: '#666666', alignment: 'right' },
                                    { text: `${tDoc('lbl_generated')}: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, fontSize: 8, color: '#666666', alignment: 'right' },
                                    ...(filtersText ? [{ text: filtersText, fontSize: 8, color: '#666666', alignment: 'right' }] : []),
                                ],
                                width: '*',
                            },
                        ],
                        columnGap: 10,
                        margin: [0, 0, 0, 8],
                    },
                    // Divider
                    {
                        canvas: [{ type: 'line', x1: 0, y1: 0, x2: usableW, y2: 0, lineWidth: 0.5, lineColor: '#c8c8c8' }],
                        margin: [0, 0, 0, 8],
                    },
                    // Summary
                    ...(summary.length > 0 ? [{ text: summaryText, fontSize: 8, color: '#3c3c3c', margin: [0, 0, 0, 8] }] : []),
                    // Table
                    {
                        table: {
                            headerRows: 1,
                            widths: colWidths,
                            body: [headerRow, ...bodyRows],
                        },
                        dontBreakRows: true,
                        layout: {
                            hLineWidth: () => 0.1,
                            vLineWidth: () => 0.1,
                            hLineColor: () => '#e6e6e6',
                            vLineColor: () => '#e6e6e6',
                            fillColor: (rowIndex: number, node: any) => {
                                if (rowIndex === 0) return '#3b82f6';
                                if (hasTotals && rowIndex === node.table.body.length - 1) return '#dce6f5';
                                return (rowIndex - 1) % 2 === 0 ? null : '#f8fafc';
                            },
                            paddingLeft: () => 3,
                            paddingRight: () => 3,
                            paddingTop: () => 3,
                            paddingBottom: () => 3,
                        },
                    },
                ],
                footer: (currentPage: number, pageCount: number) => ({
                    columns: [
                        { text: `${san(storeDetails.name)} - ${san(reportTitle)}`, margin: [marginPts, 5, 0, 0], fontSize: 7, color: '#999999' },
                        { text: `${tDoc('lbl_page')} ${currentPage} ${tDoc('lbl_of')} ${pageCount}`, alignment: 'right', margin: [0, 5, marginPts, 0], fontSize: 7, color: '#999999' },
                    ],
                }),
                defaultStyle: {
                    font: 'Roboto',
                    fontSize,
                },
            };

            // Route Bengali text nodes to NotoSansBengali; Latin inherits Roboto defaultStyle
            if (useBnFont) {
                docDefinition.content = (docDefinition.content as any[]).map(_fixPdfNode);
                const _origFooter = docDefinition.footer;
                docDefinition.footer = (...args: any[]) => _fixPdfNode(_origFooter(...args));
            }

            // pdfMake 0.3: createPdf(docDef, options) — fonts/vfs already registered on singleton
            const pdf = _rptPdf.pm.createPdf(docDefinition);
            if (mode === 'print' && !isMobilePdfDownloadRisk()) {
                pdf.print();
            } else {
                await downloadPdfMake(pdf, `${baseFileName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`, reservedPdfWindow);
            }
        },
        [getExportData, getTotals, columns, isBn, t, storeDetails, reportTitle, storeDisplayText, filterSummary, summary, baseFileName, symbol, code]
    );

    const handlePdfExport = useCallback(async () => {
        const mobilePdfWindow = reservePdfWindow(`${baseFileName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        setIsExporting(true);
        try { await generatePdf('download', mobilePdfWindow); } catch (error) { closeReservedPdfWindow(mobilePdfWindow); console.error('[PDF] report export failed:', error); } finally { setIsExporting(false); }
    }, [generatePdf, baseFileName]);

    const handlePrint = useCallback(async () => {
        const mobilePdfWindow = isMobilePdfDownloadRisk()
            ? reservePdfWindow(`${baseFileName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
            : null;
        setIsExporting(true);
        try {
            await generatePdf('print', mobilePdfWindow);
        } catch (error) {
            closeReservedPdfWindow(mobilePdfWindow);
            console.error('[PDF] print failed:', error);
        } finally {
            setIsExporting(false);
        }
    }, [generatePdf, baseFileName]);

    return (
        <div className="mb-6">
            <div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Left: Report Icon + Title + Description */}
                    <div className="flex items-center gap-3">
                        {reportIcon && <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">{reportIcon}</div>}
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{displayTitle}</h1>
                            {reportDescription && <p className="text-sm text-gray-500">{reportDescription}</p>}
                        </div>
                    </div>

                    {/* Right: Export Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            disabled={isExporting}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                            <span>{t('btn_print')}</span>
                        </button>

                        <button
                            onClick={handlePdfExport}
                            disabled={isExporting}
                            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-100 hover:shadow-sm disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                            <span>{t('btn_pdf')}</span>
                        </button>

                        <button
                            onClick={handleExcelExport}
                            disabled={isExporting}
                            className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-all hover:bg-green-100 hover:shadow-sm disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                            <span>{t('btn_excel')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportExportToolbar;
