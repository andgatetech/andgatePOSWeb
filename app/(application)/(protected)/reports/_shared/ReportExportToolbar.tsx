'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import enLocale from '@/public/locales/en.json';
import { RootState } from '@/store';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileSpreadsheet, FileText, Loader2, Printer } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';

// Module-level Bengali font cache — loaded once per browser session
const bnFont = { regular: '', bold: '', loaded: false };
let bnFontPromise: Promise<void> | null = null;

const loadBengaliFonts = (): Promise<void> => {
    if (bnFont.loaded) return Promise.resolve();
    if (bnFontPromise) return bnFontPromise;

    const toBase64 = (buf: ArrayBuffer): string => {
        const bytes = new Uint8Array(buf);
        let b = '';
        for (let i = 0; i < bytes.byteLength; i++) b += String.fromCharCode(bytes[i]);
        return btoa(b);
    };

    bnFontPromise = Promise.all([
        fetch('/fonts/NotoSansBengali-Regular.ttf'),
        fetch('/fonts/NotoSansBengali-Bold.ttf'),
    ])
        .then(([r, b]) => (r.ok && b.ok ? Promise.all([r.arrayBuffer(), b.arrayBuffer()]) : Promise.reject()))
        .then(([rBuf, bBuf]) => {
            bnFont.regular = toBase64(rBuf);
            bnFont.bold = toBase64(bBuf);
            bnFont.loaded = true;
        })
        .catch(() => { bnFontPromise = null; });

    return bnFontPromise;
};

// Extend jsPDF type for autoTable
declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable: { finalY: number };
    }
}

export interface ExportColumn {
    key: string;
    label: string;
    width?: number;
    format?: (value: any, row?: any) => string;
}

export interface ReportExportToolbarProps {
    reportTitle: string;
    reportDescription?: string; // NEW: Optional description for the report
    reportIcon?: React.ReactNode; // NEW: Optional icon for the report
    iconBgClass?: string; // NEW: Optional background class for icon
    data: any[];
    columns: ExportColumn[];
    summary?: { label: string; value: string | number }[]; // label = i18n key (looked up in English for PDF)
    filterSummary?: {
        dateRange?: { startDate?: string; endDate?: string; type?: string };
        storeName?: string;
        customFilters?: { label: string; value: string }[];
    };
    fileName?: string;
    // Optional: function to fetch ALL data for export (bypasses pagination)
    fetchAllData?: () => Promise<any[]>;
}

const parseSafeDate = (dateStr: string): Date => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
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
    const fontReadyRef = useRef(bnFont.loaded);

    // Preload Bengali fonts on mount so they're ready when user clicks PDF
    useEffect(() => {
        loadBengaliFonts().then(() => { fontReadyRef.current = bnFont.loaded; });
    }, []);

    const isBn = i18n.language === 'bn';

    // Use current-language translation in PDF when Bengali font is loaded; English fallback otherwise
    const tPdf = (key: string): string => {
        if (isBn && fontReadyRef.current) return t(key);
        return (enLocale as Record<string, string>)[key] || key;
    };

    // Store details from Redux
    const storeDetails = useMemo(
        () => ({
            name: currentStore?.store_name || 'My Store',
            contact: currentStore?.store_contact || '',
            location: currentStore?.store_location || '',
        }),
        [currentStore]
    );

    // Get date display text
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

        if (startDate && endDate) {
            return `${format(parseSafeDate(startDate), 'dd MMM yyyy')} - ${format(parseSafeDate(endDate), 'dd MMM yyyy')}`;
        }
        if (startDate) return `${t('lbl_from')} ${format(parseSafeDate(startDate), 'dd MMM yyyy')}`;
        if (endDate) return `${t('lbl_until')} ${format(parseSafeDate(endDate), 'dd MMM yyyy')}`;

        return t('lbl_custom_range');
    }, [filterSummary?.dateRange, t]);

    const storeDisplayText = filterSummary?.storeName || currentStore?.store_name || t('lbl_all_stores');
    const baseFileName = fileName || reportTitle.toLowerCase().replace(/\s+/g, '_');

    // Build dynamic title with filter info
    const displayTitle = useMemo(() => {
        const filterParts: string[] = [];

        // Add date range if not "All Time"
        if (dateDisplayText && dateDisplayText !== t('lbl_all_time')) {
            filterParts.push(dateDisplayText);
        }

        // Add custom filters
        if (filterSummary?.customFilters && filterSummary.customFilters.length > 0) {
            filterSummary.customFilters.forEach((filter) => {
                filterParts.push(filter.value);
            });
        }

        // Combine: "Sales Report - This Month / Paid"
        if (filterParts.length > 0) {
            return `${reportTitle} - ${filterParts.join(' / ')}`;
        }

        return reportTitle;
    }, [reportTitle, dateDisplayText, filterSummary?.customFilters, t]);

    // Sanitize text for PDF rendering
    const sanitizeForPdf = useCallback(
        (text: string): string => {
            if (!text) return '';
            let cleanText = String(text);

            // When Bengali font is loaded, pass text through as-is (font handles Unicode)
            if (isBn && fontReadyRef.current) return cleanText;

            // English mode: normalize to ASCII
            // Bengali digits → ASCII digits
            cleanText = cleanText.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
            // Currency symbol → code
            if (symbol) {
                const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                cleanText = cleanText.replace(new RegExp(escapedSymbol, 'g'), `${code} `);
            }
            // Strip remaining non-ASCII
            return cleanText.replace(/[^\x00-\x7F]/g, '');
        },
        [isBn, symbol, code]
    );

    // Get export data (all rows)
    const getExportData = useCallback(async (): Promise<any[]> => {
        if (fetchAllData) {
            return await fetchAllData();
        }
        return data;
    }, [data, fetchAllData]);

    // Transform data for export
    const transformData = useCallback(
        (exportData: any[]) => {
            return exportData.map((row) => {
                const exportRow: Record<string, any> = {};
                columns.forEach((col) => {
                    const value = row[col.key];
                    exportRow[col.label] = col.format ? col.format(value, row) : value ?? '';
                });
                return exportRow;
            });
        },
        [columns]
    );

    // Calculate totals for numeric columns
    const getTotals = useCallback(
        (exportData: any[]) => {
            const totals: Record<string, number> = {};
            const skippedKeys = ['invoice', 'date', 'created_at', 'status', 'payment', 'customer', 'user', 'id', 'name', 'email', 'phone'];

            columns.forEach((col) => {
                // Skip columns that shouldn't be summed
                if (skippedKeys.some((key) => col.key.toLowerCase().includes(key))) return;

                const values = exportData.map((row) => {
                    const val = row[col.key];
                    return typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.-]/g, '')) || 0;
                });
                const sum = values.reduce((a, b) => a + b, 0);
                if (!isNaN(sum) && sum !== 0) {
                    totals[col.label] = sum;
                }
            });
            return totals;
        },
        [columns]
    );

    // Excel Export
    const handleExcelExport = useCallback(async () => {
        setIsExporting(true);
        try {
            const exportData = await getExportData();
            const transformedData = transformData(exportData);
            const totals = getTotals(exportData);

            // Add totals row
            if (Object.keys(totals).length > 0) {
                const totalRow: Record<string, any> = {};
                columns.forEach((col, idx) => {
                    if (idx === 0) {
                        totalRow[col.label] = t('lbl_total').toUpperCase() + ':';
                    } else {
                        totalRow[col.label] = totals[col.label] !== undefined ? totals[col.label] : '';
                    }
                });
                transformedData.push(totalRow);
            }

            const worksheet = XLSX.utils.json_to_sheet(transformedData);
            const workbook = XLSX.utils.book_new();

            // Set column widths
            const colWidths = columns.map((col) => ({ wch: col.width || Math.max(col.label.length + 2, 15) }));
            worksheet['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(workbook, worksheet, reportTitle.substring(0, 31));
            XLSX.writeFile(workbook, `${baseFileName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
        } finally {
            setIsExporting(false);
        }
    }, [getExportData, transformData, getTotals, columns, reportTitle, baseFileName]);

    // Generate PDF/Print content
    const generatePdfDocument = useCallback(
        async (forPrint: boolean = false) => {
            // Ensure Bengali font is ready before generating (no-op if already loaded)
            if (isBn) await loadBengaliFonts();

            const exportData = await getExportData();
            const isLandscape = columns.length > 6;
            const doc = new jsPDF({ orientation: isLandscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });

            // Register Bengali font with jsPDF if loaded
            const useBnFont = isBn && bnFont.loaded;
            if (useBnFont) {
                doc.addFileToVFS('NotoSansBengali-Regular.ttf', bnFont.regular);
                doc.addFileToVFS('NotoSansBengali-Bold.ttf', bnFont.bold);
                doc.addFont('NotoSansBengali-Regular.ttf', 'NotoSansBengali', 'normal');
                doc.addFont('NotoSansBengali-Bold.ttf', 'NotoSansBengali', 'bold');
            }

            // Font helpers — switch between Bengali and Helvetica transparently
            const fontName = useBnFont ? 'NotoSansBengali' : 'helvetica';
            const setNormal = () => doc.setFont(fontName, 'normal');
            const setBold   = () => doc.setFont(fontName, 'bold');

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 14;
            const tableWidth = pageWidth - margin * 2;
            let yPos = 12;

            // Date label (uses tPdf which respects language when font is ready)
            const pdfDateText = (() => {
                if (!filterSummary?.dateRange) return tPdf('lbl_all_time');
                const { type, startDate, endDate } = filterSummary.dateRange;
                if (type === 'none' || (!startDate && !endDate)) return tPdf('lbl_all_time');
                if (type === 'today') return tPdf('lbl_today');
                if (type === 'yesterday') return tPdf('lbl_yesterday');
                if (type === 'this_week') return tPdf('lbl_this_week');
                if (type === 'last_week') return tPdf('lbl_last_week');
                if (type === 'this_month') return tPdf('lbl_this_month');
                if (type === 'last_month') return tPdf('lbl_last_month');
                if (type === 'this_year') return tPdf('lbl_this_year');
                if (startDate && endDate) return `${format(parseSafeDate(startDate), 'dd MMM yyyy')} - ${format(parseSafeDate(endDate), 'dd MMM yyyy')}`;
                if (startDate) return `${tPdf('lbl_from')} ${format(parseSafeDate(startDate), 'dd MMM yyyy')}`;
                if (endDate) return `${tPdf('lbl_until')} ${format(parseSafeDate(endDate), 'dd MMM yyyy')}`;
                return tPdf('lbl_custom_range');
            })();

            // === HEADER SECTION ===
            // Left side: Store Details
            doc.setFontSize(14);
            setBold();
            doc.setTextColor(30);
            doc.text(sanitizeForPdf(storeDetails.name), margin, yPos);
            yPos += 5;

            doc.setFontSize(9);
            setNormal();
            doc.setTextColor(100);
            if (storeDetails.contact) {
                doc.text(`${tPdf('lbl_phone')}: ${sanitizeForPdf(storeDetails.contact)}`, margin, yPos);
                yPos += 4;
            }
            if (storeDetails.location) {
                doc.text(`${tPdf('lbl_address')}: ${sanitizeForPdf(storeDetails.location)}`, margin, yPos);
                yPos += 4;
            }

            // Right side: Report Info (at same height as store name)
            const rightX = pageWidth - margin;
            doc.setFontSize(12);
            setBold();
            doc.setTextColor(59, 130, 246);
            doc.text(sanitizeForPdf(reportTitle), rightX, 12, { align: 'right' });

            doc.setFontSize(8);
            setNormal();
            doc.setTextColor(100);
            doc.text(`${tPdf('lbl_period')}: ${pdfDateText}`, rightX, 17, { align: 'right' });
            doc.text(`${tPdf('lbl_store')}: ${sanitizeForPdf(storeDisplayText)}`, rightX, 21, { align: 'right' });
            doc.text(`${tPdf('lbl_generated')}: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, rightX, 25, { align: 'right' });

            // Custom filters
            if (filterSummary?.customFilters && filterSummary.customFilters.length > 0) {
                const filterText = filterSummary.customFilters.map((f) => `${sanitizeForPdf(f.label)}: ${sanitizeForPdf(f.value)}`).join(' | ');
                doc.text(filterText, rightX, 29, { align: 'right' });
                yPos = Math.max(yPos, 33);
            } else {
                yPos = Math.max(yPos, 29);
            }

            // Divider line
            yPos += 3;
            doc.setDrawColor(200);
            doc.setLineWidth(0.1);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 6;

            // Summary section
            if (summary.length > 0) {
                doc.setFontSize(9);
                setNormal();
                doc.setTextColor(60);
                const summaryText = summary.map((s) => `${tPdf(String(s.label))}: ${sanitizeForPdf(String(s.value))}`).join('   |   ');

                const splitTitle = doc.splitTextToSize(summaryText, tableWidth);
                doc.text(splitTitle, margin, yPos);
                yPos += splitTitle.length * 4 + 4;
            }

            // Table data transformation
            const tableData = exportData.map((row, index) =>
                columns.map((col) => {
                    // Special handling for serial number if key matches
                    if (col.key === 'serial' || col.label === '#') return String(index + 1);

                    const value = row[col.key];
                    const formatted = col.format ? col.format(value, row) : String(value ?? '');
                    return sanitizeForPdf(formatted);
                })
            );

            // Add totals row
            const totals = getTotals(exportData);
            if (Object.keys(totals).length > 0) {
                const totalRow = columns.map((col, idx) => {
                    if (idx === 0) return tPdf('lbl_total').toUpperCase();
                    if (col.key === 'serial' || col.label === '#') return '';
                    // Only show total if the column was calculated in getTotals
                    return totals[col.label] !== undefined ? `${totals[col.label].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '';
                });
                tableData.push(totalRow);
            }

            // Calculate exact column widths based on weights or defaults
            // If width is provided in ExportColumn, treat it as a weight (e.g. 15, 20 etc)
            const totalWeight = columns.reduce((sum, col) => sum + (col.width || 10), 0);

            const columnStyles = columns.reduce((acc, col, idx) => {
                const weight = col.width || 10;
                // Calculate proportional width: (weight / totalWeight) * usableTableWidth
                const proportionalWidth = (weight / totalWeight) * tableWidth;

                acc[idx] = {
                    cellWidth: proportionalWidth,
                    halign: ['amount', 'price', 'total', 'tax', 'discount', 'subtotal', 'due', 'paid'].some((k) => col.key.includes(k) || col.label.toLowerCase().includes(k)) ? 'right' : 'left',
                };
                return acc;
            }, {} as Record<number, { cellWidth: number; halign: 'left' | 'right' | 'center' }>);

            // Dynamically adjust font size based on column count to fit width
            const fontSize = columns.length > 10 ? 6 : columns.length > 8 ? 7 : 8;

            autoTable(doc, {
                startY: yPos,
                head: [columns.map((col) => sanitizeForPdf(col.label))],
                body: tableData,
                styles: {
                    fontSize: fontSize,
                    cellPadding: 2,
                    overflow: 'linebreak',
                    halign: 'left',
                    valign: 'middle',
                    lineWidth: 0.1,
                    lineColor: [230, 230, 230],
                    ...(useBnFont ? { font: 'NotoSansBengali', fontStyle: 'normal' } : {}),
                },
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center',
                    lineWidth: 0,
                    ...(useBnFont ? { font: 'NotoSansBengali' } : {}),
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { left: margin, right: margin },
                tableWidth: 'auto',
                columnStyles: columnStyles,
                didParseCell: (data) => {
                    if (tableData.length > 0 && data.row.index === tableData.length - 1) {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.fillColor = [220, 230, 245];
                        data.cell.styles.textColor = [0, 0, 0];
                        data.cell.styles.fontSize = fontSize + 1;
                        if (useBnFont) data.cell.styles.font = 'NotoSansBengali';
                    }
                },
            });

            // Footer with page numbers
            const pageCount = doc.internal.pages.length - 1;
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(7);
                setNormal();
                doc.setTextColor(150);
                doc.text(`${tPdf('lbl_page')} ${i} ${tPdf('lbl_of')} ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
                doc.text(`${sanitizeForPdf(storeDetails.name)} - ${sanitizeForPdf(reportTitle)}`, margin, pageHeight - 10);
            }

            return doc;
        },
        [getExportData, columns, getTotals, storeDetails, reportTitle, dateDisplayText, storeDisplayText, filterSummary, summary, sanitizeForPdf, isBn, tPdf]
    );

    // PDF Export
    const handlePdfExport = useCallback(async () => {
        setIsExporting(true);
        try {
            const doc = await generatePdfDocument(false);
            doc.save(`${baseFileName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        } finally {
            setIsExporting(false);
        }
    }, [generatePdfDocument, baseFileName]);

    // Print - uses same PDF generation
    const handlePrint = useCallback(async () => {
        setIsExporting(true);
        try {
            const doc = await generatePdfDocument(true);
            // Open PDF in new window for printing
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const printWindow = window.open(pdfUrl, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        } finally {
            setIsExporting(false);
        }
    }, [generatePdfDocument]);

    return (
        <div className="mb-6">
            {/* Simplified Header Section */}
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
