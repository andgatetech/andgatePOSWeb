'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { closeReservedPdfWindow, isMobilePdfDownloadRisk, reservePdfWindow } from '@/lib/pdf-mobile-download';
import enLocale from '@/public/locales/en.json';
import { useGetTrialBalanceQuery } from '@/store/features/accounting/accountingApi';
import { CheckCircle, Download, FileText, Loader2, Printer, XCircle } from 'lucide-react';
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

const typeColors: Record<string, string> = {
    asset:     'text-blue-600 dark:text-blue-400',
    liability: 'text-red-600 dark:text-red-400',
    equity:    'text-purple-600 dark:text-purple-400',
    revenue:   'text-green-600 dark:text-green-400',
    cogs:      'text-orange-600 dark:text-orange-400',
    expense:   'text-rose-600 dark:text-rose-400',
};

type ExportAction = 'print' | 'pdf';

const TrialBalancePage = () => {
    const { t, i18n } = getTranslation();
    const { currentStoreId, currentStore } = useCurrentStore();

    const today = new Date().toISOString().split('T')[0];
    const firstOfYear = `${new Date().getFullYear()}-01-01`;

    const [from, setFrom] = useState(firstOfYear);
    const [to, setTo] = useState(today);
    const [filterType, setFilterType] = useState('');
    const [activeExport, setActiveExport] = useState<ExportAction | null>(null);

    const isBn = i18n.language === 'bn';

    useEffect(() => { ensureAccountingPdf(); }, []);

    const { data, isLoading, refetch } = useGetTrialBalanceQuery(
        { store_id: currentStoreId, from, to },
        { skip: !currentStoreId }
    );

    const tb = data?.data;
    const allRows: any[] = useMemo(() => tb?.accounts ?? [], [tb]);
    const rows = filterType ? allRows.filter((r: any) => r.type === filterType) : allRows;

    const typeLabel: Record<string, string> = useMemo(() => ({
        asset:     t('lbl_type_asset'),
        liability: t('lbl_type_liability'),
        equity:    t('lbl_type_equity'),
        revenue:   t('lbl_type_revenue'),
        cogs:      t('lbl_type_cogs'),
        expense:   t('lbl_type_expense'),
    }), [t]);

    const storeDetails = useMemo(
        () => ({
            name: currentStore?.store_name || 'My Store',
            contact: currentStore?.store_contact || '',
            location: currentStore?.store_location || '',
        }),
        [currentStore]
    );

    const dateDisplayText = useMemo(() => {
        if (from && to) return `${from} - ${to}`;
        if (from) return `${t('lbl_from')} ${from}`;
        if (to) return `${t('lbl_until')} ${to}`;
        return t('lbl_all_time');
    }, [from, to, t]);

    const handleExportCSV = () => {
        const headers = ['Code', 'Account', 'Type', 'Debit', 'Credit'];
        const csvRows = rows.map((r: any) => [
            r.account_code,
            `"${r.name}"`,
            r.type,
            r.total_debit,
            r.total_credit,
        ]);
        const csv = [headers, ...csvRows].map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trial-balance-${to}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const generatePdf = useCallback(
        async (mode: 'download' | 'print', reservedPdfWindow?: Window | null) => {
            await ensureAccountingPdf();

            const useBnFont = isBn;
            const tDoc = (key: string): string =>
                useBnFont ? t(key) : ((enLocale as unknown as Record<string, string>)[key] || key);
            const san = (text: string): string => sanText(text, useBnFont);

            const marginPts = 28;
            const pageW = 595.28;
            const usableW = pageW - marginPts * 2;

            const columns: PdfColumnDef[] = [
                { key: 'account_code', label: tDoc('lbl_account_code'), width: 14 },
                { key: 'name', label: tDoc('lbl_account_name'), width: 20 },
                { key: 'type', label: tDoc('lbl_type'), width: 12 },
                { key: 'normal_balance', label: tDoc('lbl_normal_balance'), width: 14 },
                { key: 'total_debit', label: tDoc('lbl_debit'), width: 14, numeric: true },
                { key: 'total_credit', label: tDoc('lbl_credit'), width: 14, numeric: true },
            ];

            const colWidths = computeColumnWidths(columns, usableW);

            const headerRow = buildHeaderRow(columns);

            const currentRows = allRows;
            const bodyRows = currentRows.map((row: any) =>
                columns.map((col) => {
                    let txt: string;
                    if (col.key === 'type') {
                        txt = typeLabel[row.type] ?? row.type ?? '';
                    } else if (col.key === 'normal_balance') {
                        txt = row.normal_balance === 'debit' ? tDoc('lbl_debit') : tDoc('lbl_credit');
                    } else if (col.numeric) {
                        const val = Number(row[col.key]);
                        txt = val > 0 ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
                    } else {
                        txt = String(row[col.key] ?? '');
                    }
                    return {
                        text: san(clampPdfText(txt, col.numeric ? 26 : 70)),
                        alignment: col.numeric ? 'right' : 'left',
                        fontSize: 7.5,
                        noWrap: false,
                    };
                })
            );

            bodyRows.push(
                columns.map((col, idx) => {
                    let txt = '';
                    if (idx === 0) txt = tDoc('lbl_total').toUpperCase();
                    if (col.key === 'total_debit' && tb) txt = Number(tb.total_debit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    if (col.key === 'total_credit' && tb) txt = Number(tb.total_credit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    return {
                        text: san(clampPdfText(txt, 28)),
                        bold: true,
                        alignment: col.numeric ? 'right' : 'left',
                        fontSize: 8,
                        noWrap: false,
                    };
                }) as any
            );

            const statusText = tb
                ? (tb.balanced ? tDoc('msg_trial_balanced') : tDoc('msg_trial_unbalanced'))
                : '';

            const summaryText = tb
                ? [
                      `${tDoc('lbl_total_debit')}: ${Number(tb.total_debit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      `${tDoc('lbl_total_credit')}: ${Number(tb.total_credit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      `${tDoc('lbl_status')}: ${statusText}`,
                  ].join('   |   ')
                : '';

            const generatedText = `${tDoc('lbl_generated')}: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

            const headerBlocks = buildPdfHeader({
                storeName: storeDetails.name,
                storeContact: storeDetails.contact,
                storeLocation: storeDetails.location,
                reportTitle: tDoc('lbl_trial_balance'),
                periodText: dateDisplayText,
                storeDisplayText: storeDetails.name,
                generatedText,
                tDoc,
                san,
                marginPts,
                usableW,
            });

            const docDefinition: any = {
                pageOrientation: 'portrait',
                pageSize: 'A4',
                pageMargins: [marginPts, marginPts, marginPts, marginPts + 15],
                content: [
                    ...headerBlocks,
                    { text: san(summaryText), fontSize: 8, color: '#3c3c3c', margin: [0, 0, 0, 8] },
                    {
                        table: {
                            headerRows: 1,
                            widths: colWidths,
                            body: [headerRow, ...bodyRows],
                        },
                        dontBreakRows: true,
                        layout: buildTableLayout(true),
                    },
                ],
                footer: buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_trial_balance')}`, marginPts, tDoc),
                defaultStyle: { font: 'Roboto', fontSize: 7.5 },
            };

            const footerFn = buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_trial_balance')}`, marginPts, tDoc);
            await outputPdf(docDefinition, useBnFont, mode, `trial_balance_${from}_${to}.pdf`, reservedPdfWindow, footerFn);
        },
        [allRows, isBn, t, storeDetails, dateDisplayText, from, to, tb, typeLabel]
    );

    const handlePdfExport = useCallback(async () => {
        const mobilePdfWindow = reservePdfWindow(`trial_balance_${from}_${to}.pdf`);
        setActiveExport('pdf');
        try { await generatePdf('download', mobilePdfWindow); } catch (error) { closeReservedPdfWindow(mobilePdfWindow); console.error('[PDF] trial balance export failed:', error); } finally { setActiveExport(null); }
    }, [generatePdf, from, to]);

    const handlePrint = useCallback(async () => {
        const mobilePdfWindow = isMobilePdfDownloadRisk()
            ? reservePdfWindow(`trial_balance_${from}_${to}.pdf`)
            : null;
        setActiveExport('print');
        try {
            await generatePdf('print', mobilePdfWindow);
        } catch (error) {
            closeReservedPdfWindow(mobilePdfWindow);
            console.error('[PDF] trial balance print failed:', error);
        } finally {
            setActiveExport(null);
        }
    }, [generatePdf, from, to]);

    const isExporting = activeExport !== null;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('lbl_trial_balance')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('msg_trial_balance_desc')}</p>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100" />
                    <span className="text-gray-400">—</span>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100" />
                    <button onClick={refetch}
                        className="px-4 py-1.5 rounded-lg text-sm bg-primary text-white hover:opacity-90">
                        {t('lbl_apply')}
                    </button>
                    {rows.length > 0 && (
                        <>
                            <button onClick={handlePrint}
                                disabled={isExporting}
                                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50">
                                {activeExport === 'print' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                                <span>{t('btn_print')}</span>
                            </button>
                            <button onClick={handlePdfExport}
                                disabled={isExporting}
                                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-all hover:bg-red-100 disabled:opacity-50">
                                {activeExport === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                                <span>{t('btn_pdf')}</span>
                            </button>
                            <button onClick={handleExportCSV}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <Download className="h-4 w-4" />
                                CSV
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Totals + balance status */}
            {tb && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_total_debit')}</p>
                        <p className="text-2xl font-bold text-success mt-1">৳{Number(tb.total_debit).toLocaleString()}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_total_credit')}</p>
                        <p className="text-2xl font-bold text-danger mt-1">৳{Number(tb.total_credit).toLocaleString()}</p>
                    </div>
                    <div className={`rounded-xl border p-5 flex items-center gap-3 ${tb.balanced ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20'}`}>
                        {tb.balanced
                            ? <><CheckCircle className="h-6 w-6 text-success flex-shrink-0" /><p className="text-sm font-medium text-success">{t('msg_trial_balanced')}</p></>
                            : <><XCircle className="h-6 w-6 text-danger flex-shrink-0" /><p className="text-sm font-medium text-danger">{t('msg_trial_unbalanced')}</p></>}
                    </div>
                </div>
            )}

            {/* Type filter chips */}
            <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterType('')}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${!filterType ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {t('lbl_all')}
                </button>
                {Object.keys(typeLabel).map((type) => (
                    <button key={type} onClick={() => setFilterType(type)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${filterType === type ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        {typeLabel[type]}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {isLoading ? (
                    <Loader fullScreen={false} className="py-20" />
                ) : rows.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 dark:text-gray-500">{t('msg_no_records')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3 text-left">{t('lbl_account_code')}</th>
                                    <th className="px-5 py-3 text-left">{t('lbl_account_name')}</th>
                                    <th className="px-5 py-3 text-left">{t('lbl_type')}</th>
                                    <th className="px-5 py-3 text-left">{t('lbl_normal_balance')}</th>
                                    <th className="px-5 py-3 text-right text-success">{t('lbl_debit')}</th>
                                    <th className="px-5 py-3 text-right text-danger">{t('lbl_credit')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {rows.map((row: any, i: number) => {
                                    const hasActivity = row.total_debit > 0 || row.total_credit > 0;
                                    return (
                                        <tr key={i} className={`transition-colors ${hasActivity ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : 'opacity-40'}`}>
                                            <td className="px-5 py-3 font-mono text-gray-500 dark:text-gray-400">{row.account_code}</td>
                                            <td className="px-5 py-3 text-gray-800 dark:text-gray-100">{row.name}</td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs font-medium ${typeColors[row.type] ?? 'text-gray-500'}`}>
                                                    {typeLabel[row.type] ?? row.type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs ${row.normal_balance === 'debit' ? 'text-success' : 'text-danger'}`}>
                                                    {row.normal_balance === 'debit' ? t('lbl_debit') : t('lbl_credit')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium text-success">
                                                {row.total_debit > 0 ? `৳${Number(row.total_debit).toLocaleString()}` : '—'}
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium text-danger">
                                                {row.total_credit > 0 ? `৳${Number(row.total_credit).toLocaleString()}` : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {/* Footer totals */}
                            {tb && (
                                <tfoot className="bg-gray-100 dark:bg-gray-800 font-semibold text-sm">
                                    <tr>
                                        <td colSpan={4} className="px-5 py-3 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wide">
                                            {t('lbl_total')}
                                        </td>
                                        <td className="px-5 py-3 text-right text-success">৳{Number(tb.total_debit).toLocaleString()}</td>
                                        <td className="px-5 py-3 text-right text-danger">৳{Number(tb.total_credit).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrialBalancePage;
