'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { closeReservedPdfWindow, isMobilePdfDownloadRisk, reservePdfWindow } from '@/lib/pdf-mobile-download';
import enLocale from '@/public/locales/en.json';
import { useGetProfitAndLossQuery } from '@/store/features/accounting/accountingApi';
import { FileText, Loader2, Printer, TrendingDown, TrendingUp } from 'lucide-react';
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

const ProfitLossPage = () => {
    const { t, i18n } = getTranslation();
    const { currentStoreId, currentStore } = useCurrentStore();

    const firstOfYear = `${new Date().getFullYear()}-01-01`;
    const today = new Date().toISOString().split('T')[0];

    const [from, setFrom] = useState(firstOfYear);
    const [to, setTo] = useState(today);
    const [activeExport, setActiveExport] = useState<ExportAction | null>(null);

    const isBn = i18n.language === 'bn';

    useEffect(() => { ensureAccountingPdf(); }, []);

    const { data, isLoading, refetch } = useGetProfitAndLossQuery(
        { store_id: currentStoreId, from, to },
        { skip: !currentStoreId }
    );

    const pl = data?.data;

    const summaryCards = pl
        ? [
              { label: t('lbl_gross_revenue'), value: pl.revenue, color: 'text-success', bg: 'bg-success/10' },
              { label: t('lbl_sales_returns'), value: -pl.sales_returns, color: 'text-warning', bg: 'bg-warning/10' },
              { label: t('lbl_net_revenue'), value: pl.net_revenue, color: 'text-primary', bg: 'bg-primary/10' },
              { label: t('lbl_cogs'), value: -pl.cogs, color: 'text-danger', bg: 'bg-danger/10' },
              { label: t('lbl_gross_profit'), value: pl.gross_profit, color: pl.gross_profit >= 0 ? 'text-success' : 'text-danger', bg: pl.gross_profit >= 0 ? 'bg-success/10' : 'bg-danger/10' },
              { label: t('lbl_total_expenses'), value: -pl.expenses, color: 'text-danger', bg: 'bg-danger/10' },
          ]
        : [];

    const netProfit = pl?.net_profit ?? 0;

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

    const revenueRows = useMemo(() => pl?.breakdown?.revenue ?? [], [pl]);
    const expenseRows = useMemo(() => [...(pl?.breakdown?.expense ?? []), ...(pl?.breakdown?.cogs ?? [])], [pl]);

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

            const fmt = (val: number): string =>
                val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            const summaryLine = [
                `${tDoc('lbl_gross_revenue')}: ${fmt(Number(pl?.revenue ?? 0))}`,
                `${tDoc('lbl_sales_returns')}: ${fmt(Number(pl?.sales_returns ?? 0))}`,
                `${tDoc('lbl_net_revenue')}: ${fmt(Number(pl?.net_revenue ?? 0))}`,
                `${tDoc('lbl_cogs')}: ${fmt(Number(pl?.cogs ?? 0))}`,
                `${tDoc('lbl_gross_profit')}: ${fmt(Number(pl?.gross_profit ?? 0))}`,
                `${tDoc('lbl_total_expenses')}: ${fmt(Number(pl?.expenses ?? 0))}`,
                `${tDoc('lbl_net_profit')}: ${fmt(Number(pl?.net_profit ?? 0))}`,
            ].join('   |   ');

            const generatedText = `${tDoc('lbl_generated')}: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

            const headerBlocks = buildPdfHeader({
                storeName: storeDetails.name,
                storeContact: storeDetails.contact,
                storeLocation: storeDetails.location,
                reportTitle: tDoc('lbl_profit_loss'),
                periodText: dateDisplayText,
                storeDisplayText: storeDetails.name,
                generatedText,
                tDoc,
                san,
                marginPts,
                usableW,
            });

            const breakdownColumns: PdfColumnDef[] = [
                { key: 'account_code', label: tDoc('lbl_account_code'), width: 18 },
                { key: 'name', label: tDoc('lbl_account_name'), width: 30 },
                { key: 'balance', label: tDoc('lbl_balance'), width: 18, numeric: true },
            ];

            const buildBreakdownTable = (sectionTitle: string, rows: any[]): any => {
                if (!rows.length) return null;
                const colWidths = computeColumnWidths(breakdownColumns, usableW);
                const headerRow = buildHeaderRow(breakdownColumns);

                const bodyRows: any[][] = rows.map((row: any) =>
                    breakdownColumns.map((col) => {
                        let txt: string;
                        if (col.numeric) {
                            txt = Math.abs(Number(row.balance ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

                const total = rows.reduce((s: number, r: any) => s + Math.abs(Number(r.balance ?? 0)), 0);
                bodyRows.push(
                    breakdownColumns.map((col, idx) => {
                        let txt = '';
                        if (idx === 0) txt = tDoc('lbl_total').toUpperCase();
                        if (col.numeric) txt = total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        return {
                            text: san(clampPdfText(txt, 28)),
                            bold: true,
                            alignment: col.numeric ? 'right' : 'left',
                            fontSize: 8,
                            noWrap: false,
                        };
                    }) as any
                );

                return {
                    stack: [
                        { text: san(sectionTitle), fontSize: 9, bold: true, color: '#3b82f6', margin: [0, 8, 0, 4] },
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
                };
            };

            const revenueTable = buildBreakdownTable(tDoc('lbl_revenue_breakdown'), revenueRows);
            const expenseTable = buildBreakdownTable(tDoc('lbl_expense_breakdown'), expenseRows);

            const content: any[] = [
                ...headerBlocks,
                { text: san(summaryLine), fontSize: 8, color: '#3c3c3c', margin: [0, 0, 0, 8] },
            ];
            if (revenueTable) content.push(revenueTable);
            if (expenseTable) content.push(expenseTable);

            const docDefinition: any = {
                pageOrientation: 'portrait',
                pageSize: 'A4',
                pageMargins: [marginPts, marginPts, marginPts, marginPts + 15],
                content,
                footer: buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_profit_loss')}`, marginPts, tDoc),
                defaultStyle: { font: 'Roboto', fontSize: 7.5 },
            };

            const footerFn = buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_profit_loss')}`, marginPts, tDoc);
            await outputPdf(docDefinition, useBnFont, mode, `profit_loss_${from}_${to}.pdf`, reservedPdfWindow, footerFn);
        },
        [pl, isBn, t, storeDetails, dateDisplayText, from, to, revenueRows, expenseRows]
    );

    const handlePdfExport = useCallback(async () => {
        const mobilePdfWindow = reservePdfWindow(`profit_loss_${from}_${to}.pdf`);
        setActiveExport('pdf');
        try { await generatePdf('download', mobilePdfWindow); } catch (error) { closeReservedPdfWindow(mobilePdfWindow); console.error('[PDF] profit-loss export failed:', error); } finally { setActiveExport(null); }
    }, [generatePdf, from, to]);

    const handlePrint = useCallback(async () => {
        const mobilePdfWindow = isMobilePdfDownloadRisk()
            ? reservePdfWindow(`profit_loss_${from}_${to}.pdf`)
            : null;
        setActiveExport('print');
        try {
            await generatePdf('print', mobilePdfWindow);
        } catch (error) {
            closeReservedPdfWindow(mobilePdfWindow);
            console.error('[PDF] profit-loss print failed:', error);
        } finally {
            setActiveExport(null);
        }
    }, [generatePdf, from, to]);

    const isExporting = activeExport !== null;
    const hasData = pl != null;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('lbl_profit_loss')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('msg_profit_loss_desc')}</p>
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
                    <button
                        onClick={handlePrint}
                        disabled={isExporting || !hasData}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
                    >
                        {activeExport === 'print' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                        <span>{t('btn_print')}</span>
                    </button>
                    <button
                        onClick={handlePdfExport}
                        disabled={isExporting || !hasData}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
                    >
                        {activeExport === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                        <span>{t('btn_pdf')}</span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <Loader fullScreen={false} className="py-20" />
            ) : !pl ? null : (
                <>
                    {/* Net Profit Banner */}
                    <div className={`rounded-2xl p-6 flex items-center gap-5 ${netProfit >= 0 ? 'bg-success/10 border border-success/20' : 'bg-danger/10 border border-danger/20'}`}>
                        <div className={`p-4 rounded-xl ${netProfit >= 0 ? 'bg-success/20' : 'bg-danger/20'}`}>
                            {netProfit >= 0
                                ? <TrendingUp className="h-8 w-8 text-success" />
                                : <TrendingDown className="h-8 w-8 text-danger" />}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('lbl_net_profit')}</p>
                            <p className={`text-4xl font-bold mt-1 ${netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                                ৳{Math.abs(netProfit).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {pl.period.from} → {pl.period.to}
                            </p>
                        </div>
                        {netProfit < 0 && (
                            <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-danger/20 text-danger">{t('lbl_net_loss')}</span>
                        )}
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {summaryCards.map((card) => (
                            <div key={card.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                                <p className={`text-xl font-bold mt-1 ${card.color}`}>
                                    {card.value < 0 ? '-' : ''}৳{Math.abs(card.value).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Breakdown Tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue */}
                        <BreakdownTable
                            title={t('lbl_revenue_breakdown')}
                            rows={pl.breakdown?.revenue ?? []}
                            positiveColor="text-success"
                            t={t}
                        />
                        {/* Expenses */}
                        <BreakdownTable
                            title={t('lbl_expense_breakdown')}
                            rows={[...(pl.breakdown?.expense ?? []), ...(pl.breakdown?.cogs ?? [])]}
                            positiveColor="text-danger"
                            t={t}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

interface BreakdownTableProps {
    title: string;
    rows: any[];
    positiveColor: string;
    t: (key: string) => string;
}

const BreakdownTable = ({ title, rows, positiveColor, t }: BreakdownTableProps) => {
    if (!rows.length) return null;
    const total = rows.reduce((s: number, r: any) => s + Math.abs(Number(r.balance ?? 0)), 0);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h3>
                <span className={`text-sm font-bold ${positiveColor}`}>৳{total.toLocaleString()}</span>
            </div>
            <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-400 uppercase">
                    <tr>
                        <th className="px-5 py-2.5 text-left">{t('lbl_account')}</th>
                        <th className="px-5 py-2.5 text-right">{t('lbl_balance')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {rows.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                            <td className="px-5 py-2.5 text-gray-700 dark:text-gray-300">
                                <span className="font-mono text-xs text-gray-400 mr-2">{row.account_code}</span>
                                {row.name}
                            </td>
                            <td className={`px-5 py-2.5 text-right font-medium ${positiveColor}`}>
                                ৳{Math.abs(Number(row.balance ?? 0)).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProfitLossPage;
