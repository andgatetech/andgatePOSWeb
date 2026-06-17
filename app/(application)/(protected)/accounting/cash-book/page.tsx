'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { isMobilePdfDownloadRisk, reservePdfWindow } from '@/lib/pdf-mobile-download';
import enLocale from '@/public/locales/en.json';
import { useGetCashBookQuery } from '@/store/features/accounting/accountingApi';
import { ArrowDownCircle, ArrowUpCircle, FileText, Loader2, Printer, TrendingUp } from 'lucide-react';
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

type ExportAction = 'print' | 'pdf';

const CashBookPage = () => {
    const { t, i18n } = getTranslation();
    const { currentStoreId, currentStore } = useCurrentStore();

    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [from, setFrom] = useState(firstOfMonth);
    const [to, setTo] = useState(today);
    const [activeExport, setActiveExport] = useState<ExportAction | null>(null);

    const isBn = i18n.language === 'bn';

    useEffect(() => { ensureAccountingPdf(); }, []);

    const { data, isLoading, refetch } = useGetCashBookQuery(
        { store_id: currentStoreId, from, to },
        { skip: !currentStoreId }
    );

    const cashBook = data?.data;
    const entries = useMemo(() => cashBook?.entries ?? [], [cashBook]);

    const refTypeLabel = useMemo<Record<string, string>>(() => ({
        sale: t('lbl_sale'),
        expense: t('lbl_expense'),
        income: t('lbl_income'),
        purchase: t('lbl_purchase'),
        customer_payment: t('lbl_customer_payment'),
        supplier_payment: t('lbl_supplier_payment'),
        manual: t('lbl_manual'),
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
                { key: 'entry_date', label: tDoc('lbl_date'), width: 12 },
                { key: 'description', label: tDoc('lbl_description'), width: 16 },
                { key: 'reference_type', label: tDoc('lbl_type'), width: 10 },
                { key: 'account_name', label: tDoc('lbl_account'), width: 12 },
                { key: 'debit', label: tDoc('lbl_cash_in'), width: 14, numeric: true },
                { key: 'credit', label: tDoc('lbl_cash_out'), width: 14, numeric: true },
            ];

            const colWidths = computeColumnWidths(columns, usableW);

            const headerRow = buildHeaderRow(columns);

            const currentEntries = entries;
            const bodyRows = currentEntries.map((row: any) =>
                columns.map((col) => {
                    let txt: string;
                    if (col.key === 'reference_type') {
                        txt = (refTypeLabel[row[col.key]] ?? row[col.key]) || '';
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

            const totalDebit = currentEntries.reduce((sum: number, r: any) => sum + (Number(r.debit) || 0), 0);
            const totalCredit = currentEntries.reduce((sum: number, r: any) => sum + (Number(r.credit) || 0), 0);

            bodyRows.push(
                columns.map((col, idx) => {
                    let txt = '';
                    if (idx === 0) txt = tDoc('lbl_total').toUpperCase();
                    if (col.key === 'debit') txt = totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    if (col.key === 'credit') txt = totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    return {
                        text: san(clampPdfText(txt, 28)),
                        bold: true,
                        alignment: col.numeric ? 'right' : 'left',
                        fontSize: 8,
                        noWrap: false,
                    };
                }) as any
            );

            const summaryText = [
                `${tDoc('lbl_cash_in')}: ${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                `${tDoc('lbl_cash_out')}: ${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                `${tDoc('lbl_net_balance')}: ${(totalDebit - totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            ].join('   |   ');

            const generatedText = `${tDoc('lbl_generated')}: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

            const headerBlocks = buildPdfHeader({
                storeName: storeDetails.name,
                storeContact: storeDetails.contact,
                storeLocation: storeDetails.location,
                reportTitle: tDoc('lbl_cash_book'),
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
                footer: buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_cash_book')}`, marginPts, tDoc),
                defaultStyle: { font: 'Roboto', fontSize: 7.5 },
            };

            const footerFn = buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_cash_book')}`, marginPts, tDoc);
            await outputPdf(docDefinition, useBnFont, mode, `cash_book_${from}_${to}.pdf`, reservedPdfWindow, footerFn);
        },
        [entries, isBn, t, storeDetails, dateDisplayText, from, to, refTypeLabel]
    );

    const handlePdfExport = useCallback(async () => {
        const mobilePdfWindow = reservePdfWindow(`cash_book_${from}_${to}.pdf`);
        setActiveExport('pdf');
        try { await generatePdf('download', mobilePdfWindow); } catch (error) { closeReservedPdfWindow(mobilePdfWindow); console.error('[PDF] cash book export failed:', error); } finally { setActiveExport(null); }
    }, [generatePdf, from, to]);

    const handlePrint = useCallback(async () => {
        const mobilePdfWindow = isMobilePdfDownloadRisk()
            ? reservePdfWindow(`cash_book_${from}_${to}.pdf`)
            : null;
        setActiveExport('print');
        try {
            await generatePdf('print', mobilePdfWindow);
        } catch (error) {
            closeReservedPdfWindow(mobilePdfWindow);
            console.error('[PDF] cash book print failed:', error);
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
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('lbl_cash_book')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('msg_cash_book_desc')}</p>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="input input-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                    />
                    <span className="self-center text-gray-400">—</span>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="input input-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                    />
                    <button onClick={refetch} className="btn btn-sm bg-primary text-white rounded-lg px-4 py-1.5 text-sm hover:opacity-90">
                        {t('lbl_refresh')}
                    </button>
                    <button
                        onClick={handlePrint}
                        disabled={isExporting || entries.length === 0}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
                    >
                        {activeExport === 'print' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                        <span>{t('btn_print')}</span>
                    </button>
                    <button
                        onClick={handlePdfExport}
                        disabled={isExporting || entries.length === 0}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
                    >
                        {activeExport === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                        <span>{t('btn_pdf')}</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {cashBook && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-success/10">
                            <ArrowDownCircle className="h-6 w-6 text-success" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_cash_in')}</p>
                            <p className="text-xl font-bold text-success">৳{Number(cashBook.total_in).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-danger/10">
                            <ArrowUpCircle className="h-6 w-6 text-danger" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_cash_out')}</p>
                            <p className="text-xl font-bold text-danger">৳{Number(cashBook.total_out).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${cashBook.net >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
                            <TrendingUp className={`h-6 w-6 ${cashBook.net >= 0 ? 'text-success' : 'text-danger'}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_net_balance')}</p>
                            <p className={`text-xl font-bold ${cashBook.net >= 0 ? 'text-success' : 'text-danger'}`}>
                                ৳{Number(cashBook.net).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {isLoading ? (
                    <Loader fullScreen={false} className="py-20" />
                ) : entries.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 dark:text-gray-500">{t('msg_no_records')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left">{t('lbl_date')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_description')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_type')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_account')}</th>
                                    <th className="px-4 py-3 text-right text-success">{t('lbl_cash_in')}</th>
                                    <th className="px-4 py-3 text-right text-danger">{t('lbl_cash_out')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {entries.map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{row.entry_date}</td>
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-100">{row.description}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                                                {refTypeLabel[row.reference_type] ?? row.reference_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{row.account_name}</td>
                                        <td className="px-4 py-3 text-right font-medium text-success">
                                            {row.debit > 0 ? `৳${Number(row.debit).toLocaleString()}` : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-danger">
                                            {row.credit > 0 ? `৳${Number(row.credit).toLocaleString()}` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashBookPage;
