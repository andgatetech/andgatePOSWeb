'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { closeReservedPdfWindow, isMobilePdfDownloadRisk, reservePdfWindow } from '@/lib/pdf-mobile-download';
import enLocale from '@/public/locales/en.json';
import { useGetBalanceSheetQuery } from '@/store/features/accounting/accountingApi';
import { CheckCircle, FileText, Loader2, Printer, XCircle } from 'lucide-react';
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

const typeColors: Record<string, { header: string; amount: string }> = {
    asset:     { header: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',   amount: 'text-blue-700 dark:text-blue-300' },
    liability: { header: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',       amount: 'text-red-700 dark:text-red-300' },
    equity:    { header: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300', amount: 'text-purple-700 dark:text-purple-300' },
    revenue:   { header: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300', amount: 'text-green-700 dark:text-green-300' },
    cogs:      { header: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300', amount: 'text-orange-700 dark:text-orange-300' },
    expense:   { header: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300',   amount: 'text-rose-700 dark:text-rose-300' },
};

const typePdfColors: Record<string, { fill: string; text: string }> = {
    asset:     { fill: '#dbeafe', text: '#1e40af' },
    liability: { fill: '#fee2e2', text: '#991b1b' },
    equity:    { fill: '#f3e8ff', text: '#6b21a8' },
    revenue:   { fill: '#dcfce7', text: '#166534' },
    cogs:      { fill: '#ffedd5', text: '#9a3412' },
    expense:   { fill: '#ffe4e6', text: '#9f1239' },
};

const sectionOrder = ['asset', 'liability', 'equity', 'revenue', 'cogs', 'expense'] as const;

const BalanceSheetPage = () => {
    const { t, i18n } = getTranslation();
    const { currentStoreId, currentStore } = useCurrentStore();

    const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0]);
    const [activeExport, setActiveExport] = useState<'print' | 'pdf' | null>(null);

    const isBn = i18n.language === 'bn';

    useEffect(() => { ensureAccountingPdf(); }, []);

    const { data, isLoading, refetch } = useGetBalanceSheetQuery(
        { store_id: currentStoreId, as_of: asOf },
        { skip: !currentStoreId }
    );

    const bs = data?.data;

    const sectionLabel: Record<string, string> = {
        asset:     t('lbl_type_asset'),
        liability: t('lbl_type_liability'),
        equity:    t('lbl_type_equity'),
        revenue:   t('lbl_type_revenue'),
        cogs:      t('lbl_type_cogs'),
        expense:   t('lbl_type_expense'),
    };

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
            await ensureAccountingPdf();

            const useBnFont = isBn;
            const tDoc = (key: string): string =>
                useBnFont ? t(key) : ((enLocale as unknown as Record<string, string>)[key] || key);
            const san = (text: string): string => sanText(text, useBnFont);

            const marginPts = 28;
            const pageW = 595.28;
            const usableW = pageW - marginPts * 2;

            const columns: PdfColumnDef[] = [
                { key: 'account_code', label: tDoc('lbl_account_code'), width: 11 },
                { key: 'name', label: tDoc('lbl_account_name'), width: 20 },
                { key: 'balance', label: tDoc('lbl_balance'), width: 12, numeric: true },
            ];

            const colWidths = computeColumnWidths(columns, usableW);
            const headerRow = buildHeaderRow(columns);

            const generatedText = `${tDoc('lbl_generated')}: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

            const headerBlocks = buildPdfHeader({
                storeName: storeDetails.name,
                storeContact: storeDetails.contact,
                storeLocation: storeDetails.location,
                reportTitle: tDoc('lbl_balance_sheet'),
                periodText: asOf,
                storeDisplayText: storeDetails.name,
                generatedText,
                tDoc,
                san,
                marginPts,
                usableW,
            });

            const summaryText = [
                `${tDoc('lbl_total_assets')}: ${Number(bs?.assets ?? 0).toLocaleString()}`,
                `${tDoc('lbl_total_liabilities')}: ${Number(bs?.liabilities ?? 0).toLocaleString()}`,
                `${tDoc('lbl_total_equity')}: ${Number(bs?.equity ?? 0).toLocaleString()}`,
            ].join('   |   ');

            const sectionBlocks: any[] = [];

            for (const type of sectionOrder) {
                const rows: any[] = bs?.breakdown?.[type] ?? [];
                if (!rows.length) continue;
                const total = rows.reduce((s: number, r: any) => s + Math.abs(Number(r.balance ?? 0)), 0);
                const pdfColors = typePdfColors[type] ?? { fill: '#f1f5f9', text: '#334155' };

                sectionBlocks.push({
                    table: {
                        widths: ['*'],
                        body: [[
                            {
                                text: san(`${tDoc(`lbl_type_${type}`)}  —  ৳${total.toLocaleString()}`),
                                fontSize: 9,
                                bold: true,
                                fillColor: pdfColors.fill,
                                color: pdfColors.text,
                                margin: [4, 3, 4, 3],
                            },
                        ]],
                    },
                    layout: 'noBorders',
                    margin: [0, 8, 0, 0],
                });

                const dataRows = rows.map((row: any) =>
                    columns.map((col) => ({
                        text: san(clampPdfText(
                            col.numeric
                                ? Math.abs(Number(row[col.key] ?? 0)).toLocaleString()
                                : String(row[col.key] ?? ''),
                            col.numeric ? 26 : 70
                        )),
                        alignment: col.numeric ? 'right' : 'left',
                        fontSize: 7.5,
                        noWrap: false,
                    }))
                );

                sectionBlocks.push({
                    table: {
                        headerRows: 1,
                        widths: colWidths,
                        body: [headerRow, ...dataRows],
                    },
                    dontBreakRows: true,
                    layout: buildTableLayout(false),
                    margin: [0, 0, 0, 6],
                });
            }

            const docDefinition: any = {
                pageOrientation: 'portrait',
                pageSize: 'A4',
                pageMargins: [marginPts, marginPts, marginPts, marginPts + 15],
                content: [
                    ...headerBlocks,
                    { text: san(summaryText), fontSize: 8, color: '#3c3c3c', margin: [0, 0, 0, 8] },
                    ...sectionBlocks,
                ],
                footer: buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_balance_sheet')}`, marginPts, tDoc),
                defaultStyle: { font: 'Roboto', fontSize: 7.5 },
            };

            const footerFn = buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_balance_sheet')}`, marginPts, tDoc);
            await outputPdf(docDefinition, useBnFont, mode, `balance_sheet_${asOf}.pdf`, reservedPdfWindow, footerFn);
        },
        [bs, isBn, t, storeDetails, asOf]
    );

    const handlePdfExport = useCallback(async () => {
        const mobilePdfWindow = reservePdfWindow(`balance_sheet_${asOf}.pdf`);
        setActiveExport('pdf');
        try {
            await generatePdf('download', mobilePdfWindow);
        } catch (error) {
            closeReservedPdfWindow(mobilePdfWindow);
            console.error('[PDF] balance sheet export failed:', error);
        } finally {
            setActiveExport(null);
        }
    }, [generatePdf, asOf]);

    const handlePrint = useCallback(async () => {
        const mobilePdfWindow = isMobilePdfDownloadRisk()
            ? reservePdfWindow(`balance_sheet_${asOf}.pdf`)
            : null;
        setActiveExport('print');
        try {
            await generatePdf('print', mobilePdfWindow);
        } catch (error) {
            closeReservedPdfWindow(mobilePdfWindow);
            console.error('[PDF] balance sheet print failed:', error);
        } finally {
            setActiveExport(null);
        }
    }, [generatePdf, asOf]);

    const isExporting = activeExport !== null;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('lbl_balance_sheet')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('msg_balance_sheet_desc')}</p>
                </div>
                <div className="flex gap-2 items-center">
                    <label className="text-sm text-gray-500 dark:text-gray-400">{t('lbl_as_of')}</label>
                    <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100" />
                    <button onClick={refetch}
                        className="px-4 py-1.5 rounded-lg text-sm bg-primary text-white hover:opacity-90">
                        {t('lbl_apply')}
                    </button>
                    <button
                        onClick={handlePrint}
                        disabled={isExporting || !bs}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
                    >
                        {activeExport === 'print' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                        <span>{t('btn_print')}</span>
                    </button>
                    <button
                        onClick={handlePdfExport}
                        disabled={isExporting || !bs}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
                    >
                        {activeExport === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                        <span>{t('btn_pdf')}</span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <Loader fullScreen={false} className="py-20" />
            ) : !bs ? null : (
                <>
                    {/* Top summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_total_assets')}</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">৳{Number(bs.assets).toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_total_liabilities')}</p>
                            <p className="text-2xl font-bold text-red-500 mt-1">৳{Number(bs.liabilities).toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_total_equity')}</p>
                            <p className="text-2xl font-bold text-purple-600 mt-1">৳{Number(bs.equity).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Balance indicator */}
                    <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border text-sm font-medium ${bs.balanced ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'}`}>
                        {bs.balanced
                            ? <><CheckCircle className="h-4 w-4" /> {t('msg_balance_sheet_balanced')}</>
                            : <><XCircle className="h-4 w-4" /> {t('msg_balance_sheet_unbalanced')}</>}
                    </div>

                    {/* Breakdown by type */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {sectionOrder.map((type) => {
                            const rows: any[] = bs.breakdown?.[type] ?? [];
                            if (!rows.length) return null;
                            const total = rows.reduce((s: number, r: any) => s + Math.abs(Number(r.balance ?? 0)), 0);
                            const colors = typeColors[type] ?? { header: 'bg-gray-50 text-gray-600', amount: 'text-gray-700' };

                            return (
                                <div key={type} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                    <div className={`px-5 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 ${colors.header} bg-opacity-50`}>
                                        <span className="font-semibold text-sm uppercase tracking-wide">{sectionLabel[type]}</span>
                                        <span className={`font-bold ${colors.amount}`}>৳{total.toLocaleString()}</span>
                                    </div>
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {rows.map((row: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                                                    <td className="px-5 py-2.5 text-gray-600 dark:text-gray-300">
                                                        <span className="font-mono text-xs text-gray-400 mr-2">{row.account_code}</span>
                                                        {row.name}
                                                    </td>
                                                    <td className={`px-5 py-2.5 text-right font-medium ${colors.amount}`}>
                                                        ৳{Math.abs(Number(row.balance ?? 0)).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default BalanceSheetPage;
