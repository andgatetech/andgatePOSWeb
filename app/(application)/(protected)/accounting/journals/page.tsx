'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { closeReservedPdfWindow, isMobilePdfDownloadRisk, reservePdfWindow } from '@/lib/pdf-mobile-download';
import enLocale from '@/public/locales/en.json';
import { useGetJournalsQuery } from '@/store/features/accounting/accountingApi';
import { ChevronDown, ChevronUp, FileText, Loader2, Printer } from 'lucide-react';
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

const JournalsPage = () => {
    const { t, i18n } = getTranslation();
    const { currentStoreId, currentStore } = useCurrentStore();

    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [from, setFrom] = useState(firstOfMonth);
    const [to, setTo] = useState(today);
    const [refType, setRefType] = useState('');
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [activeExport, setActiveExport] = useState<ExportAction | null>(null);

    const isBn = i18n.language === 'bn';

    useEffect(() => { ensureAccountingPdf(); }, []);

    const { data, isLoading } = useGetJournalsQuery(
        { store_id: currentStoreId, from, to, reference_type: refType || undefined, page, per_page: 20 },
        { skip: !currentStoreId }
    );

    const journals = useMemo(() => data?.data?.data ?? [], [data?.data?.data]);
    const lastPage = data?.data?.last_page ?? 1;
    const total = data?.data?.total ?? 0;

    const refTypeLabel = useMemo<Record<string, string>>(() => ({
        sale: t('lbl_sale'),
        sale_return: t('lbl_sale_return'),
        expense: t('lbl_expense'),
        income: t('lbl_income'),
        purchase: t('lbl_purchase'),
        customer_payment: t('lbl_customer_payment'),
        supplier_payment: t('lbl_supplier_payment'),
        manual: t('lbl_manual'),
    }), [t]);

    const refTypeBadgeColor: Record<string, string> = {
        sale: 'bg-success/10 text-success',
        sale_return: 'bg-warning/10 text-warning',
        expense: 'bg-danger/10 text-danger',
        income: 'bg-primary/10 text-primary',
        purchase: 'bg-purple-100 text-purple-700',
        customer_payment: 'bg-teal-100 text-teal-700',
        supplier_payment: 'bg-orange-100 text-orange-700',
        manual: 'bg-gray-100 text-gray-600',
    };

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
                { key: 'entry_date', label: tDoc('lbl_date'), width: 14 },
                { key: 'description', label: tDoc('lbl_description'), width: 28 },
                { key: 'reference_type', label: tDoc('lbl_type'), width: 12 },
                { key: 'total_debit', label: tDoc('lbl_debit'), width: 14, numeric: true },
                { key: 'total_credit', label: tDoc('lbl_credit'), width: 14, numeric: true },
            ];

            const colWidths = computeColumnWidths(columns, usableW);
            const headerRow = buildHeaderRow(columns);

            const currentJournals = journals;
            const bodyRows: any[][] = [];

            let sumDebit = 0;
            let sumCredit = 0;

            currentJournals.forEach((entry: any) => {
                // Main entry row
                bodyRows.push(
                    columns.map((col) => {
                        let txt: string;
                        if (col.key === 'entry_date') {
                            txt = entry.entry_date ?? '';
                        } else if (col.key === 'reference_type') {
                            txt = refTypeLabel[entry.reference_type] ?? entry.reference_type ?? '';
                        } else if (col.numeric) {
                            const val = Number(entry[col.key] || 0);
                            txt = val > 0 ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
                        } else {
                            txt = String(entry[col.key] ?? '');
                        }
                        return {
                            text: san(clampPdfText(txt, col.numeric ? 26 : 70)),
                            alignment: col.numeric ? 'right' : 'left',
                            fontSize: 7.5,
                            noWrap: false,
                            bold: false,
                        };
                    })
                );

                sumDebit += Number(entry.total_debit || 0);
                sumCredit += Number(entry.total_credit || 0);

                // Line item sub-rows
                if (Array.isArray(entry.lines) && entry.lines.length > 0) {
                    entry.lines.forEach((line: any) => {
                        bodyRows.push(
                            columns.map((col) => {
                                let txt = '';
                                if (col.key === 'entry_date') {
                                    txt = `─ ${String(line.account_code ?? '')} — ${String(line.account_name ?? '')}`;
                                } else if (col.key === 'description') {
                                    txt = String(line.description ?? '');
                                } else if (col.key === 'reference_type') {
                                    txt = '';
                                } else if (col.key === 'total_debit') {
                                    const val = Number(line.debit || 0);
                                    txt = val > 0 ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
                                } else if (col.key === 'total_credit') {
                                    const val = Number(line.credit || 0);
                                    txt = val > 0 ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
                                }
                                return {
                                    text: san(clampPdfText(txt, col.numeric ? 26 : 90)),
                                    alignment: col.numeric ? 'right' : 'left',
                                    fontSize: 7,
                                    noWrap: false,
                                    bold: false,
                                    color: '#555555',
                                };
                            })
                        );
                    });
                }
            });

            // Totals row
            bodyRows.push(
                columns.map((col, idx) => {
                    let txt = '';
                    if (idx === 0) txt = tDoc('lbl_total').toUpperCase();
                    else if (col.key === 'total_debit') txt = sumDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    else if (col.key === 'total_credit') txt = sumCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    return {
                        text: san(clampPdfText(txt, 28)),
                        bold: true,
                        alignment: col.numeric ? 'right' : 'left',
                        fontSize: 8,
                        noWrap: false,
                    };
                })
            );

            const generatedText = `${tDoc('lbl_generated')}: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

            const headerBlocks = buildPdfHeader({
                storeName: storeDetails.name,
                storeContact: storeDetails.contact,
                storeLocation: storeDetails.location,
                reportTitle: tDoc('lbl_journal_ledger'),
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
                footer: buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_journal_ledger')}`, marginPts, tDoc),
                defaultStyle: { font: 'Roboto', fontSize: 7.5 },
            };

            const footerFn = buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_journal_ledger')}`, marginPts, tDoc);
            await outputPdf(docDefinition, useBnFont, mode, `journal_ledger_${from}_${to}.pdf`, reservedPdfWindow, footerFn);
        },
        [journals, isBn, t, storeDetails, dateDisplayText, from, to, refTypeLabel]
    );

    const handlePdfExport = useCallback(async () => {
        const mobilePdfWindow = reservePdfWindow(`journal_ledger_${from}_${to}.pdf`);
        setActiveExport('pdf');
        try { await generatePdf('download', mobilePdfWindow); } catch (error) { closeReservedPdfWindow(mobilePdfWindow); console.error('[PDF] journal ledger export failed:', error); } finally { setActiveExport(null); }
    }, [generatePdf, from, to]);

    const handlePrint = useCallback(async () => {
        const mobilePdfWindow = isMobilePdfDownloadRisk()
            ? reservePdfWindow(`journal_ledger_${from}_${to}.pdf`)
            : null;
        setActiveExport('print');
        try {
            await generatePdf('print', mobilePdfWindow);
        } catch (error) {
            closeReservedPdfWindow(mobilePdfWindow);
            console.error('[PDF] journal ledger print failed:', error);
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
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('lbl_journal_ledger')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('msg_journal_ledger_desc')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{t('lbl_total')}: {total}</span>
                    {journals.length > 0 && (
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
                        </>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex flex-wrap gap-3">
                <input
                    type="date"
                    value={from}
                    onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-transparent text-gray-800 dark:text-gray-100"
                />
                <span className="self-center text-gray-400">—</span>
                <input
                    type="date"
                    value={to}
                    onChange={(e) => { setTo(e.target.value); setPage(1); }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-transparent text-gray-800 dark:text-gray-100"
                />
                <select
                    value={refType}
                    onChange={(e) => { setRefType(e.target.value); setPage(1); }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                >
                    <option value="">{t('lbl_all_types')}</option>
                    {Object.keys(refTypeLabel).map((k) => (
                        <option key={k} value={k}>{refTypeLabel[k]}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {isLoading ? (
                    <Loader fullScreen={false} className="py-20" />
                ) : journals.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 dark:text-gray-500">{t('msg_no_records')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left w-8"></th>
                                    <th className="px-4 py-3 text-left">{t('lbl_date')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_description')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_type')}</th>
                                    <th className="px-4 py-3 text-right">{t('lbl_debit')}</th>
                                    <th className="px-4 py-3 text-right">{t('lbl_credit')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {journals.map((j: any) => (
                                    <>
                                        <tr
                                            key={j.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                            onClick={() => setExpandedId(expandedId === j.id ? null : j.id)}
                                        >
                                            <td className="px-4 py-3 text-gray-400">
                                                {expandedId === j.id
                                                    ? <ChevronUp className="h-4 w-4" />
                                                    : <ChevronDown className="h-4 w-4" />}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{j.entry_date}</td>
                                            <td className="px-4 py-3 text-gray-800 dark:text-gray-100">{j.description}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${refTypeBadgeColor[j.reference_type] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {refTypeLabel[j.reference_type] ?? j.reference_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-200">৳{Number(j.total_debit).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-200">৳{Number(j.total_credit).toLocaleString()}</td>
                                        </tr>
                                        {expandedId === j.id && (
                                            <tr key={`${j.id}-lines`} className="bg-gray-50 dark:bg-gray-800/40">
                                                <td colSpan={6} className="px-8 py-3">
                                                    <table className="w-full text-xs">
                                                        <thead>
                                                            <tr className="text-gray-400 dark:text-gray-500 uppercase">
                                                                <th className="text-left pb-1">{t('lbl_account')}</th>
                                                                <th className="text-left pb-1">{t('lbl_note')}</th>
                                                                <th className="text-right pb-1 text-success">{t('lbl_debit')}</th>
                                                                <th className="text-right pb-1 text-danger">{t('lbl_credit')}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                            {j.lines.map((line: any, li: number) => (
                                                                <tr key={li}>
                                                                    <td className="py-1 text-gray-700 dark:text-gray-300 font-medium">
                                                                        {line.account_code} — {line.account_name}
                                                                    </td>
                                                                    <td className="py-1 text-gray-500 dark:text-gray-400">{line.description}</td>
                                                                    <td className="py-1 text-right text-success">
                                                                        {line.debit > 0 ? `৳${Number(line.debit).toLocaleString()}` : ''}
                                                                    </td>
                                                                    <td className="py-1 text-right text-danger">
                                                                        {line.credit > 0 ? `৳${Number(line.credit).toLocaleString()}` : ''}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-4 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        {t('lbl_prev')}
                    </button>
                    <span className="self-center text-sm text-gray-500">{page} / {lastPage}</span>
                    <button
                        disabled={page === lastPage}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-4 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        {t('lbl_next')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default JournalsPage;
