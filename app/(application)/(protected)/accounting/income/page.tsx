'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { closeReservedPdfWindow, isMobilePdfDownloadRisk, reservePdfWindow } from '@/lib/pdf-mobile-download';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import enLocale from '@/public/locales/en.json';
import {
    useCreateIncomeMutation,
    useDeleteIncomeMutation,
    useGetIncomeQuery,
} from '@/store/features/accounting/accountingApi';
import { FileText, Loader2, Plus, Printer, Trash2 } from 'lucide-react';
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

const paymentMethods = ['cash', 'bank', 'bkash', 'nagad', 'rocket'];

const emptyForm = {
    description: '',
    amount: '',
    payment_method: 'cash',
    income_date: new Date().toISOString().split('T')[0],
    notes: '',
};

type ExportAction = 'print' | 'pdf';

const IncomePage = () => {
    const { t, i18n } = getTranslation();
    const { currentStoreId, currentStore } = useCurrentStore();

    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [from, setFrom] = useState(firstOfMonth);
    const [to, setTo] = useState(today);
    const [page, setPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [activeExport, setActiveExport] = useState<ExportAction | null>(null);

    const isBn = i18n.language === 'bn';

    useEffect(() => { ensureAccountingPdf(); }, []);

    const { data, isLoading } = useGetIncomeQuery(
        { store_id: currentStoreId, from, to, page, per_page: 15 },
        { skip: !currentStoreId }
    );

    const [createIncome, { isLoading: creating }] = useCreateIncomeMutation();
    const [deleteIncome] = useDeleteIncomeMutation();

    const items: any[] = useMemo(() => data?.data?.data ?? [], [data]);
    const lastPage = data?.data?.last_page ?? 1;
    const total = data?.data?.total ?? 0;
    const totalAmount = items.reduce((sum, e) => sum + (e.amount ?? 0), 0);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.description || !form.amount || !form.income_date) return;
        try {
            await createIncome({
                store_id: currentStoreId,
                description: form.description,
                amount: parseFloat(form.amount),
                payment_method: form.payment_method,
                income_date: form.income_date,
                notes: form.notes,
            }).unwrap();
            showSuccessDialog(t('msg_income_created'));
            setForm(emptyForm);
            setShowForm(false);
        } catch {
            showErrorDialog(t('msg_error_generic'));
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirmDialog(t('msg_delete_confirm'), t('lbl_delete'));
        if (!confirmed) return;
        try {
            await deleteIncome(id).unwrap();
            showSuccessDialog(t('msg_deleted'));
        } catch {
            showErrorDialog(t('msg_error_generic'));
        }
    };

    const pmLabel: Record<string, string> = {
        cash: t('lbl_cash'),
        bank: t('lbl_bank'),
        bkash: 'bKash',
        nagad: 'Nagad',
        rocket: 'Rocket',
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
                { key: 'income_date', label: tDoc('lbl_date'), width: 12 },
                { key: 'description', label: tDoc('lbl_description'), width: 16 },
                { key: 'payment_method', label: tDoc('lbl_payment_method'), width: 14 },
                { key: 'user_name', label: tDoc('lbl_recorded_by'), width: 12 },
                { key: 'amount', label: tDoc('lbl_amount'), width: 14, numeric: true },
            ];

            const colWidths = computeColumnWidths(columns, usableW);

            const headerRow = buildHeaderRow(columns);

            const currentItems = items;
            const bodyRows = currentItems.map((row: any) =>
                columns.map((col) => {
                    let txt: string;
                    if (col.key === 'payment_method') {
                        txt = row[col.key] || '';
                    } else if (col.numeric) {
                        const val = Number(row[col.key]);
                        txt = val > 0 ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
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

            const totalAmountPdf = currentItems.reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0);

            bodyRows.push(
                columns.map((col, idx) => {
                    let txt = '';
                    if (idx === 0) txt = tDoc('lbl_total').toUpperCase();
                    if (col.key === 'amount') txt = totalAmountPdf.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    return {
                        text: san(clampPdfText(txt, 28)),
                        bold: true,
                        alignment: col.numeric ? 'right' : 'left',
                        fontSize: 8,
                        noWrap: false,
                    };
                }) as any
            );

            const summaryText = `${tDoc('lbl_total_entries')}: ${currentItems.length}   |   ${tDoc('lbl_total_amount')}: ${totalAmountPdf.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            const generatedText = `${tDoc('lbl_generated')}: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

            const headerBlocks = buildPdfHeader({
                storeName: storeDetails.name,
                storeContact: storeDetails.contact,
                storeLocation: storeDetails.location,
                reportTitle: tDoc('lbl_income_manager'),
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
                footer: buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_income_manager')}`, marginPts, tDoc),
                defaultStyle: { font: 'Roboto', fontSize: 7.5 },
            };

            const footerFn = buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_income_manager')}`, marginPts, tDoc);
            await outputPdf(docDefinition, useBnFont, mode, `income_${from}_${to}.pdf`, reservedPdfWindow, footerFn);
        },
        [items, isBn, t, storeDetails, dateDisplayText, from, to]
    );

    const handlePdfExport = useCallback(async () => {
        const mobilePdfWindow = reservePdfWindow(`income_${from}_${to}.pdf`);
        setActiveExport('pdf');
        try { await generatePdf('download', mobilePdfWindow); } catch (error) { closeReservedPdfWindow(mobilePdfWindow); console.error('[PDF] income export failed:', error); } finally { setActiveExport(null); }
    }, [generatePdf, from, to]);

    const handlePrint = useCallback(async () => {
        const mobilePdfWindow = isMobilePdfDownloadRisk()
            ? reservePdfWindow(`income_${from}_${to}.pdf`)
            : null;
        setActiveExport('print');
        try {
            await generatePdf('print', mobilePdfWindow);
        } catch (error) {
            closeReservedPdfWindow(mobilePdfWindow);
            console.error('[PDF] income print failed:', error);
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
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('lbl_income_manager')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('msg_income_manager_desc')}</p>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <button onClick={() => setShowForm(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90">
                        <Plus className="h-4 w-4" />
                        {t('lbl_add_income')}
                    </button>
                    <button
                        onClick={handlePrint}
                        disabled={isExporting || items.length === 0}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
                    >
                        {activeExport === 'print' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                        <span>{t('btn_print')}</span>
                    </button>
                    <button
                        onClick={handlePdfExport}
                        disabled={isExporting || items.length === 0}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
                    >
                        {activeExport === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                        <span>{t('btn_pdf')}</span>
                    </button>
                </div>
            </div>

            {/* Summary + Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('lbl_period_total')}</p>
                    <p className="text-2xl font-bold text-success mt-1">৳{totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{total} {t('lbl_entries')}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-3 flex-wrap">
                    <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-transparent text-gray-800 dark:text-gray-100" />
                    <span className="text-gray-400">—</span>
                    <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-transparent text-gray-800 dark:text-gray-100" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {isLoading ? (
                    <Loader fullScreen={false} className="py-20" />
                ) : items.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 dark:text-gray-500">{t('msg_no_records')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left">{t('lbl_date')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_description')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_payment_method')}</th>
                                    <th className="px-4 py-3 text-left">{t('lbl_recorded_by')}</th>
                                    <th className="px-4 py-3 text-right">{t('lbl_amount')}</th>
                                    <th className="px-4 py-3 text-center">{t('lbl_actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {items.map((entry: any) => (
                                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{entry.income_date}</td>
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                                            <p>{entry.description}</p>
                                            {entry.notes && <p className="text-xs text-gray-400 mt-0.5">{entry.notes}</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                                                {pmLabel[entry.payment_method] ?? entry.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{entry.user_name}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-success">৳{Number(entry.amount).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => handleDelete(entry.id)}
                                                className="p-1.5 rounded-lg hover:bg-danger/10 text-danger">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="flex justify-center gap-2">
                    <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                        className="px-4 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">
                        {t('lbl_prev')}
                    </button>
                    <span className="self-center text-sm text-gray-500">{page} / {lastPage}</span>
                    <button disabled={page === lastPage} onClick={() => setPage((p) => p + 1)}
                        className="px-4 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">
                        {t('lbl_next')}
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('lbl_add_income')}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_description')} *</label>
                                <input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder={t('ph_income_description')}
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_amount')} *</label>
                                    <input required type="number" min="0.01" step="0.01" value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_date')} *</label>
                                    <input required type="date" value={form.income_date}
                                        onChange={(e) => setForm({ ...form, income_date: e.target.value })}
                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_payment_method')}</label>
                                <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900">
                                    {paymentMethods.map((pm) => <option key={pm} value={pm}>{pmLabel[pm] ?? pm}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_notes')}</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    rows={2} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    {t('lbl_cancel')}
                                </button>
                                <button type="submit" disabled={creating}
                                    className="flex-1 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-60">
                                    {creating ? t('lbl_saving') : t('lbl_save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomePage;
