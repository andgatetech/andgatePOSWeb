'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { RootState } from '@/store';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileSpreadsheet, FileText, Loader2, Printer } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';

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
    summary?: { label: string; value: string | number }[];
    filterSummary?: {
        dateRange?: { startDate?: string; endDate?: string; type?: string };
        storeName?: string;
        customFilters?: { label: string; value: string }[];
    };
    fileName?: string;
    // Optional: function to fetch ALL data for export (bypasses pagination)
    fetchAllData?: () => Promise<any[]>;
}

const ReportExportToolbar: React.FC<ReportExportToolbarProps> = ({
    reportTitle,
    reportDescription,
    reportIcon,
    iconBgClass = 'bg-gradient-to-r from-blue-600 to-blue-700',
    data,
    columns,
    summary = [],
    filterSummary,
    fileName,
    fetchAllData,
}) => {
    const { currentStore } = useCurrentStore();
    const { code, symbol } = useCurrency();
    const user = useSelector((state: RootState) => state.auth?.user);
    const [isExporting, setIsExporting] = useState(false);

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
        if (!filterSummary?.dateRange) return 'All Time';
        const { type, startDate, endDate } = filterSummary.dateRange;

        if (type === 'none' || (!startDate && !endDate)) return 'All Time';
        if (type === 'today') return 'Today';
        if (type === 'yesterday') return 'Yesterday';
        if (type === 'this_week') return 'This Week';
        if (type === 'last_week') return 'Last Week';
        if (type === 'this_month') return 'This Month';
        if (type === 'last_month') return 'Last Month';
        if (type === 'this_year') return 'This Year';

        if (startDate && endDate) {
            return `${format(new Date(startDate), 'dd MMM yyyy')} - ${format(new Date(endDate), 'dd MMM yyyy')}`;
        }
        if (startDate) return `From ${format(new Date(startDate), 'dd MMM yyyy')}`;
        if (endDate) return `Until ${format(new Date(endDate), 'dd MMM yyyy')}`;

        return 'Custom Range';
    }, [filterSummary?.dateRange]);

    const storeDisplayText = filterSummary?.storeName || currentStore?.store_name || 'All Stores';
    const baseFileName = fileName || reportTitle.toLowerCase().replace(/\s+/g, '_');

    // Build dynamic title with filter info
    const displayTitle = useMemo(() => {
        const filterParts: string[] = [];

        // Add date range if not "All Time"
        if (dateDisplayText && dateDisplayText !== 'All Time') {
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
    }, [reportTitle, dateDisplayText, filterSummary?.customFilters]);

    // Helper to sanitize text for PDF (replace unsupported Unicode)
    const sanitizeForPdf = useCallback(
        (text: string): string => {
            if (!text) return '';
            // Replace currency symbol with code for better PDF font support
            let cleanText = String(text);
            if (symbol) {
                // Escape symbol for regex
                const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                cleanText = cleanText.replace(new RegExp(escapedSymbol, 'g'), `${code} `);
            }
            // Fallback for Bengali Taka symbol if any hardcoded instances remain
            cleanText = cleanText.replace(/৳/g, 'BDT ');
            return cleanText.replace(/[^\x00-\x7F]/g, '');
        },
        [symbol, code]
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
                        totalRow[col.label] = 'TOTAL:';
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
            const exportData = await getExportData();
            // Force landscape if many columns (e.g. > 6)
            const isLandscape = columns.length > 6;
            const doc = new jsPDF({ orientation: isLandscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 14;
            const tableWidth = pageWidth - margin * 2;
            let yPos = 12;

            // === HEADER SECTION ===
            // Left side: Store Details
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30);
            doc.text(sanitizeForPdf(storeDetails.name), margin, yPos);
            yPos += 5;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100);
            if (storeDetails.contact) {
                doc.text(`Phone: ${storeDetails.contact}`, margin, yPos);
                yPos += 4;
            }
            if (storeDetails.location) {
                doc.text(`Address: ${sanitizeForPdf(storeDetails.location)}`, margin, yPos);
                yPos += 4;
            }

            // Right side: Report Info (at same height as store name)
            const rightX = pageWidth - margin;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(59, 130, 246);
            doc.text(reportTitle, rightX, 12, { align: 'right' });

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100);
            doc.text(`Period: ${dateDisplayText}`, rightX, 17, { align: 'right' });
            doc.text(`Store: ${storeDisplayText}`, rightX, 21, { align: 'right' });
            doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, rightX, 25, { align: 'right' });

            // Custom filters
            if (filterSummary?.customFilters && filterSummary.customFilters.length > 0) {
                const filterText = filterSummary.customFilters.map((f) => `${f.label}: ${f.value}`).join(' | ');
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
                doc.setTextColor(60);
                const summaryText = summary.map((s) => `${s.label}: ${sanitizeForPdf(String(s.value))}`).join('   |   ');

                // Wrap text if too long
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
                    if (idx === 0) return 'TOTAL';
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
                head: [columns.map((col) => col.label)],
                body: tableData,
                styles: {
                    fontSize: fontSize,
                    cellPadding: 2,
                    overflow: 'linebreak',
                    halign: 'left',
                    valign: 'middle',
                    lineWidth: 0.1,
                    lineColor: [230, 230, 230],
                },
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center', // Headers centered looks better usually
                    lineWidth: 0,
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { left: margin, right: margin },
                tableWidth: 'auto', // We set specific col widths so auto is fine, or set strict tableWidth
                columnStyles: columnStyles,
                didParseCell: (data) => {
                    // Style the totals row
                    if (tableData.length > 0 && data.row.index === tableData.length - 1) {
                        const isTotalRow =
                            data.cell.raw === 'TOTAL' ||
                            Object.values(totals).some((v) => data.cell.text.includes(v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })));

                        // Double check it's the last row
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.fillColor = [220, 230, 245]; // Darker blue-gray
                        data.cell.styles.textColor = [0, 0, 0];
                        data.cell.styles.fontSize = fontSize + 1; // Slightly larger
                    }
                },
            });

            // Footer with page numbers
            const pageCount = doc.internal.pages.length - 1;
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(7);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
                doc.text(`${storeDetails.name} - ${reportTitle}`, margin, pageHeight - 10);
            }

            return doc;
        },
        [getExportData, columns, getTotals, storeDetails, reportTitle, dateDisplayText, storeDisplayText, filterSummary, summary, sanitizeForPdf]
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
        <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Simplified Header Section */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Left: Report Icon + Title + Description */}
                    <div className="flex items-center gap-4">
                        {reportIcon && <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${iconBgClass} shadow-md`}>{reportIcon}</div>}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{displayTitle}</h1>
                            {reportDescription && <p className="mt-0.5 text-sm text-gray-500">{reportDescription}</p>}
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
                            <span>Print</span>
                        </button>

                        <button
                            onClick={handlePdfExport}
                            disabled={isExporting}
                            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-100 hover:shadow-sm disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                            <span>PDF</span>
                        </button>

                        <button
                            onClick={handleExcelExport}
                            disabled={isExporting}
                            className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-all hover:bg-green-100 hover:shadow-sm disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                            <span>Excel</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportExportToolbar;
