'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { closeReservedPdfWindow, isMobilePdfDownloadRisk, reservePdfWindow } from '@/lib/pdf-mobile-download';
import enLocale from '@/public/locales/en.json';
import { useGetCashFlowStatementQuery } from '@/store/features/accounting/accountingApi';
import { FileText, Loader2, Printer } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    buildHeaderRow,
    buildPdfFooter,
    buildPdfHeader,
    buildTableLayout,
    clampPdfText,
    computeColumnWidths,
    ensureAccountingPdf,
    outputPdf,
    PdfColumnDef,
    sanText,
} from '../_shared/AccountingPdf';

interface CashFlowEntry {
    reference_type: string;
    label: string;
    cash_in: number;
    cash_out: number;
    net: number;
}

interface CashFlowData {
    period: { from: string; to: string };
    opening_balance: number;
    closing_balance: number;
    net_change: number;
    operating: CashFlowEntry[];
    other: CashFlowEntry[];
    operating_total: number;
    other_total: number;
}

type ExportAction = 'print' | 'pdf';

const today = new Date().toISOString().split('T')[0];
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];

const NetBadge = ({ value }: { value: number }) => {
    const { formatCurrency } = useCurrency();
    const positive = value >= 0;
    return (
        <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                positive
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
            }`}
        >
            {positive ? '+' : ''}{formatCurrency(value)}
        </span>
    );
};

const SectionTable = ({
    title,
    rows,
    total,
}: {
    title: string;
    rows: CashFlowEntry[];
    total: number;
}) => {
    const { formatCurrency } = useCurrency();
    if (rows.length === 0) return null;
    return (
        <div className="rounded-xl border border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">{title}</h3>
                <NetBadge value={total} />
            </div>
            <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/50">
                    <tr>
                        <th className="px-5 py-2 text-left">Activity</th>
                        <th className="px-5 py-2 text-right text-green-600">Cash In</th>
                        <th className="px-5 py-2 text-right text-red-500">Cash Out</th>
                        <th className="px-5 py-2 text-right">Net</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {rows.map((row) => (
                        <tr key={row.reference_type} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                            <td className="px-5 py-3 text-gray-800 dark:text-gray-100 font-medium">{row.label}</td>
                            <td className="px-5 py-3 text-right text-green-600 dark:text-green-400">
                                {row.cash_in > 0 ? formatCurrency(row.cash_in) : '—'}
                            </td>
                            <td className="px-5 py-3 text-right text-red-500 dark:text-red-400">
                                {row.cash_out > 0 ? formatCurrency(row.cash_out) : '—'}
                            </td>
                            <td className="px-5 py-3 text-right">
                                <NetBadge value={row.net} />
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold">
                        <td className="px-5 py-3 text-xs uppercase tracking-wider text-gray-500">Section Total</td>
                        <td className="px-5 py-3 text-right text-green-600">
                            {formatCurrency(rows.reduce((s, r) => s + r.cash_in, 0))}
                        </td>
                        <td className="px-5 py-3 text-right text-red-500">
                            {formatCurrency(rows.reduce((s, r) => s + r.cash_out, 0))}
                        </td>
                        <td className="px-5 py-3 text-right">
                            <NetBadge value={total} />
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

const CashFlowPage = () => {
    const { t, i18n } = getTranslation();
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore } = useCurrentStore();

    const [from, setFrom] = useState(firstOfMonth);
    const [to, setTo] = useState(today);
    const [queryParams, setQueryParams] = useState({ from: firstOfMonth, to: today });
    const [activeExport, setActiveExport] = useState<ExportAction | null>(null);

    const isBn = i18n.language === 'bn';

    useEffect(() => { ensureAccountingPdf(); }, []);

    const { data, isLoading, isFetching } = useGetCashFlowStatementQuery(
        { store_id: currentStoreId, ...queryParams },
        { skip: !currentStoreId }
    );

    const cf = data?.data as CashFlowData | undefined;

    const handleRun = () => setQueryParams({ from, to });

    const loading = isLoading || isFetching;

    const storeDetails = useMemo(
        () => ({
            name: currentStore?.store_name || 'My Store',
            contact: currentStore?.store_contact || '',
            location: currentStore?.store_location || '',
        }),
        [currentStore]
    );

    const generatePdf = useCallback(
        async (mode: 'download' | 'print', reservedPdfWindow?: Window | null) => {
            const currentCf = cf;
            if (!currentCf) return;

            await ensureAccountingPdf();

            const useBnFont = isBn;
            const tDoc = (key: string): string =>
                useBnFont ? t(key) : ((enLocale as unknown as Record<string, string>)[key] || key);
            const san = (text: string): string => sanText(text, useBnFont);

            const marginPts = 28;
            const pageW = 595.28;
            const usableW = pageW - marginPts * 2;

            const columns: PdfColumnDef[] = [
                { key: 'label', label: tDoc('lbl_activity'), width: 30 },
                { key: 'cash_in', label: tDoc('lbl_cash_in'), width: 14, numeric: true },
                { key: 'cash_out', label: tDoc('lbl_cash_out'), width: 14, numeric: true },
                { key: 'net', label: tDoc('lbl_net'), width: 14, numeric: true },
            ];

            const colWidths = computeColumnWidths(columns, usableW);

            const buildSectionBody = (rows: CashFlowEntry[], sectionTotal: number): any[][] => {
                const sectionHeaderRow = buildHeaderRow(columns);

                const dataRows = rows.map((row) =>
                    columns.map((col) => {
                        let txt: string;
                        if (col.key === 'label') {
                            txt = row.label || '';
                        } else if (col.numeric) {
                            const val = Number(row[col.key as keyof CashFlowEntry]);
                            txt = val !== 0 ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
                        } else {
                            txt = String(row[col.key as keyof CashFlowEntry] ?? '');
                        }
                        return {
                            text: san(clampPdfText(txt, col.numeric ? 26 : 70)),
                            alignment: col.numeric ? 'right' : 'left',
                            fontSize: 7.5,
                            noWrap: false,
                        };
                    })
                );

                const totalCashIn = rows.reduce((s, r) => s + r.cash_in, 0);
                const totalCashOut = rows.reduce((s, r) => s + r.cash_out, 0);

                const totalsRow: any[] = columns.map((col, idx) => {
                    let txt = '';
                    if (idx === 0) txt = tDoc('lbl_section_total').toUpperCase();
                    else if (col.key === 'cash_in') txt = totalCashIn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    else if (col.key === 'cash_out') txt = totalCashOut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    else if (col.key === 'net') txt = sectionTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    return {
                        text: san(clampPdfText(txt, 28)),
                        bold: true,
                        alignment: col.numeric ? 'right' : 'left',
                        fontSize: 8,
                        noWrap: false,
                    };
                });

                return [sectionHeaderRow, ...dataRows, totalsRow];
            };

            const periodText = `${currentCf.period.from} — ${currentCf.period.to}`;

            const summaryText = [
                `${tDoc('lbl_opening_balance')}: ${currentCf.opening_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                `${tDoc('lbl_closing_balance')}: ${currentCf.closing_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                `${tDoc('lbl_net_change')}: ${currentCf.net_change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            ].join('   |   ');

            const generatedText = `${tDoc('lbl_generated')}: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

            const headerBlocks = buildPdfHeader({
                storeName: storeDetails.name,
                storeContact: storeDetails.contact,
                storeLocation: storeDetails.location,
                reportTitle: tDoc('lbl_cash_flow_statement'),
                periodText,
                storeDisplayText: storeDetails.name,
                generatedText,
                tDoc,
                san,
                marginPts,
                usableW,
            });

            const content: any[] = [
                ...headerBlocks,
                { text: san(summaryText), fontSize: 8, color: '#3c3c3c', margin: [0, 0, 0, 8] },
            ];

            if (currentCf.operating.length > 0) {
                content.push(
                    { text: san(tDoc('lbl_operating_activities')), fontSize: 9, bold: true, color: '#3b82f6', margin: [0, 8, 0, 4] },
                    {
                        table: {
                            headerRows: 1,
                            widths: colWidths,
                            body: buildSectionBody(currentCf.operating, currentCf.operating_total),
                        },
                        dontBreakRows: true,
                        layout: buildTableLayout(true),
                    }
                );
            }

            if (currentCf.other.length > 0) {
                content.push(
                    { text: san(tDoc('lbl_investing_other_activities')), fontSize: 9, bold: true, color: '#3b82f6', margin: [0, 8, 0, 4] },
                    {
                        table: {
                            headerRows: 1,
                            widths: colWidths,
                            body: buildSectionBody(currentCf.other, currentCf.other_total),
                        },
                        dontBreakRows: true,
                        layout: buildTableLayout(true),
                    }
                );
            }

            const docDefinition: any = {
                pageOrientation: 'portrait',
                pageSize: 'A4',
                pageMargins: [marginPts, marginPts, marginPts, marginPts + 15],
                content,
                footer: buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_cash_flow_statement')}`, marginPts, tDoc),
                defaultStyle: { font: 'Roboto', fontSize: 7.5 },
            };

            const footerFn = buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_cash_flow_statement')}`, marginPts, tDoc);
            await outputPdf(docDefinition, useBnFont, mode, `cash_flow_${queryParams.from}_${queryParams.to}.pdf`, reservedPdfWindow, footerFn);
        },
        [cf, isBn, t, storeDetails, queryParams.from, queryParams.to]
    );

    const handlePdfExport = useCallback(async () => {
        const mobilePdfWindow = reservePdfWindow(`cash_flow_${queryParams.from}_${queryParams.to}.pdf`);
        setActiveExport('pdf');
        try { await generatePdf('download', mobilePdfWindow); } catch (error) { closeReservedPdfWindow(mobilePdfWindow); console.error('[PDF] cash flow export failed:', error); } finally { setActiveExport(null); }
    }, [generatePdf, queryParams.from, queryParams.to]);

    const handlePrint = useCallback(async () => {
        const mobilePdfWindow = isMobilePdfDownloadRisk()
            ? reservePdfWindow(`cash_flow_${queryParams.from}_${queryParams.to}.pdf`)
            : null;
        setActiveExport('print');
        try {
            await generatePdf('print', mobilePdfWindow);
        } catch (error) {
            closeReservedPdfWindow(mobilePdfWindow);
            console.error('[PDF] cash flow print failed:', error);
        } finally {
            setActiveExport(null);
        }
    }, [generatePdf, queryParams.from, queryParams.to]);

    const isExporting = activeExport !== null;

    return (
        <div className="p-4 md:p-6 space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">Cash Flow Statement</h1>
                    {cf && (
                        <p className="text-xs text-gray-400 mt-0.5">
                            {cf.period.from} — {cf.period.to}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        disabled={isExporting || !cf}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
                    >
                        {activeExport === 'print' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                        <span>{t('btn_print')}</span>
                    </button>
                    <button
                        onClick={handlePdfExport}
                        disabled={isExporting || !cf}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
                    >
                        {activeExport === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                        <span>{t('btn_pdf')}</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
                <div className="flex-1 min-w-[160px]">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">From</label>
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="form-input w-full rounded-lg border-gray-200 dark:border-gray-700 py-2 text-sm dark:bg-gray-900 dark:text-gray-100"
                    />
                </div>
                <div className="flex-1 min-w-[160px]">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">To</label>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="form-input w-full rounded-lg border-gray-200 dark:border-gray-700 py-2 text-sm dark:bg-gray-900 dark:text-gray-100"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleRun}
                    disabled={loading}
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-primary/90"
                >
                    {loading ? 'Loading...' : 'Run Report'}
                </button>
            </div>

            {loading && <Loader fullScreen={false} className="py-20" />}

            {!loading && cf && (
                <>
                    {/* Balance Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Opening Balance</p>
                            <p className="mt-1 text-2xl font-black text-gray-800 dark:text-gray-100">
                                {formatCurrency(cf.opening_balance)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Before {cf.period.from}</p>
                        </div>
                        <div
                            className={`rounded-xl border p-5 ${
                                cf.net_change >= 0
                                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                                    : 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                            }`}
                        >
                            <p className={`text-xs font-semibold uppercase tracking-wider ${cf.net_change >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                Net Change
                            </p>
                            <p className={`mt-1 text-2xl font-black ${cf.net_change >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {cf.net_change >= 0 ? '+' : ''}{formatCurrency(cf.net_change)}
                            </p>
                            <p className={`text-xs mt-0.5 opacity-60 ${cf.net_change >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {cf.period.from} — {cf.period.to}
                            </p>
                        </div>
                        <div className="rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-5 text-primary">
                            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Closing Balance</p>
                            <p className="mt-1 text-2xl font-black">{formatCurrency(cf.closing_balance)}</p>
                            <p className="text-xs mt-0.5 opacity-60">As of {cf.period.to}</p>
                        </div>
                    </div>

                    {/* Operating Activities */}
                    <SectionTable
                        title="Operating Activities"
                        rows={cf.operating}
                        total={cf.operating_total}
                    />

                    {/* Other Activities */}
                    <SectionTable
                        title="Investing & Other Activities"
                        rows={cf.other}
                        total={cf.other_total}
                    />

                    {cf.operating.length === 0 && cf.other.length === 0 && (
                        <div className="rounded-xl border border-gray-100 py-16 text-center text-sm text-gray-400">
                            No cash activity found for the selected period.
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CashFlowPage;
