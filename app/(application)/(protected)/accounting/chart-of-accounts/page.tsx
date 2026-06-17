'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { closeReservedPdfWindow, isMobilePdfDownloadRisk, reservePdfWindow } from '@/lib/pdf-mobile-download';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import enLocale from '@/public/locales/en.json';
import {
    useCreateAccountMutation,
    useGetAccountsQuery,
    useSeedDefaultAccountsMutation,
    useUpdateAccountMutation,
} from '@/store/features/accounting/accountingApi';
import { Edit2, FileText, Loader2, Plus, Printer, RefreshCw, Shield } from 'lucide-react';
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

const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'revenue', 'cogs', 'expense'] as const;

const typeColors: Record<string, string> = {
    asset:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    liability: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    equity:    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    revenue:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    cogs:      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    expense:   'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

const emptyForm = {
    account_code: '',
    name: '',
    name_bn: '',
    type: 'asset' as string,
    subtype: '',
    normal_balance: 'debit' as string,
    description: '',
};

const ChartOfAccountsPage = () => {
    const { t, i18n } = getTranslation();
    const { currentStoreId, currentStore } = useCurrentStore();

    const [filterType, setFilterType] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [activeExport, setActiveExport] = useState<'print' | 'pdf' | null>(null);

    const isBn = i18n.language === 'bn';

    useEffect(() => { ensureAccountingPdf(); }, []);

    const { data, isLoading, refetch } = useGetAccountsQuery(
        { store_id: currentStoreId, type: filterType || undefined },
        { skip: !currentStoreId }
    );

    const [createAccount, { isLoading: creating }] = useCreateAccountMutation();
    const [updateAccount, { isLoading: updating }] = useUpdateAccountMutation();
    const [seedDefaults, { isLoading: seeding }] = useSeedDefaultAccountsMutation();

    const accounts: any[] = data?.data ?? [];
    const grouped = ACCOUNT_TYPES.reduce<Record<string, any[]>>((acc, type) => {
        acc[type] = accounts.filter((a) => a.type === type);
        return acc;
    }, {} as Record<string, any[]>);

    const storeDetails = useMemo(
        () => ({
            name: currentStore?.store_name || 'My Store',
            contact: currentStore?.store_contact || '',
            location: currentStore?.store_location || '',
        }),
        [currentStore]
    );

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (a: any) => {
        if (a.is_system) return;
        setEditingId(a.id);
        setForm({
            account_code: a.account_code,
            name: a.name,
            name_bn: a.name_bn ?? '',
            type: a.type,
            subtype: a.subtype ?? '',
            normal_balance: a.normal_balance,
            description: a.description ?? '',
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateAccount({ id: editingId, name: form.name, name_bn: form.name_bn, subtype: form.subtype, description: form.description }).unwrap();
            } else {
                await createAccount({ ...form, store_id: currentStoreId }).unwrap();
            }
            showSuccessDialog(editingId ? t('msg_account_updated') : t('msg_account_created'));
            setShowForm(false);
        } catch {
            showErrorDialog(t('msg_error_generic'));
        }
    };

    const handleSeedDefaults = async () => {
        const confirmed = await showConfirmDialog(t('msg_seed_defaults_confirm'), t('lbl_seed_defaults'));
        if (!confirmed) return;
        try {
            await seedDefaults({ store_id: currentStoreId }).unwrap();
            showSuccessDialog(t('msg_seeded'));
            refetch();
        } catch {
            showErrorDialog(t('msg_error_generic'));
        }
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

            const sectionTypes = filterType ? [filterType] : [...ACCOUNT_TYPES];

            const columns: PdfColumnDef[] = [
                { key: 'account_code', label: tDoc('lbl_code'), width: 14 },
                { key: 'name', label: tDoc('lbl_account_name'), width: 30 },
                { key: 'subtype', label: tDoc('lbl_subtype'), width: 16 },
                { key: 'normal_balance', label: tDoc('lbl_normal_balance'), width: 16 },
            ];

            const colWidths = computeColumnWidths(columns, usableW);
            const headerRow = buildHeaderRow(columns);

            const now = new Date();
            const generatedText = `${tDoc('lbl_generated')}: ${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
            const periodText = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

            const headerBlocks = buildPdfHeader({
                storeName: storeDetails.name,
                storeContact: storeDetails.contact,
                storeLocation: storeDetails.location,
                reportTitle: tDoc('lbl_chart_of_accounts'),
                periodText,
                storeDisplayText: storeDetails.name,
                generatedText,
                tDoc,
                san,
                marginPts,
                usableW,
            });

            const content: any[] = [...headerBlocks];

            for (const type of sectionTypes) {
                const rows = grouped[type] ?? [];
                if (!rows.length) continue;

                const bodyRows: any[][] = rows.map((row: any) =>
                    columns.map((col) => {
                        let txt: string;
                        if (col.key === 'normal_balance') {
                            txt = row.normal_balance === 'debit' ? tDoc('lbl_debit') : tDoc('lbl_credit');
                        } else {
                            txt = String(row[col.key] ?? '');
                        }
                        return {
                            text: san(clampPdfText(txt, 70)),
                            alignment: 'left',
                            fontSize: 7.5,
                            noWrap: false,
                        };
                    })
                );

                const sectionTitle = tDoc(`lbl_type_${type}`);

                content.push({
                    stack: [
                        { text: san(sectionTitle), fontSize: 9, bold: true, color: '#3b82f6', margin: [0, 8, 0, 4] },
                        {
                            table: {
                                headerRows: 1,
                                widths: colWidths,
                                body: [headerRow, ...bodyRows],
                            },
                            dontBreakRows: true,
                            layout: buildTableLayout(false),
                        },
                    ],
                });
            }

            const docDefinition: any = {
                pageOrientation: 'portrait',
                pageSize: 'A4',
                pageMargins: [marginPts, marginPts, marginPts, marginPts + 15],
                content,
                footer: buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_chart_of_accounts')}`, marginPts, tDoc),
                defaultStyle: { font: 'Roboto', fontSize: 7.5 },
            };

            const footerFn = buildPdfFooter(`${san(storeDetails.name)} - ${tDoc('lbl_chart_of_accounts')}`, marginPts, tDoc);
            await outputPdf(docDefinition, useBnFont, mode, `chart_of_accounts.pdf`, reservedPdfWindow, footerFn);
        },
        [isBn, t, storeDetails, filterType, grouped]
    );

    const handlePdfExport = useCallback(async () => {
        const mobilePdfWindow = reservePdfWindow(`chart_of_accounts.pdf`);
        setActiveExport('pdf');
        try { await generatePdf('download', mobilePdfWindow); } catch (error) { closeReservedPdfWindow(mobilePdfWindow); console.error('[PDF] chart of accounts export failed:', error); } finally { setActiveExport(null); }
    }, [generatePdf]);

    const handlePrint = useCallback(async () => {
        const mobilePdfWindow = isMobilePdfDownloadRisk()
            ? reservePdfWindow(`chart_of_accounts.pdf`)
            : null;
        setActiveExport('print');
        try {
            await generatePdf('print', mobilePdfWindow);
        } catch (error) {
            closeReservedPdfWindow(mobilePdfWindow);
            console.error('[PDF] chart of accounts print failed:', error);
        } finally {
            setActiveExport(null);
        }
    }, [generatePdf]);

    const isExporting = activeExport !== null;
    const visibleTypes = filterType ? [filterType] : ACCOUNT_TYPES;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('lbl_chart_of_accounts')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('msg_chart_of_accounts_desc')}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={handleSeedDefaults} disabled={seeding}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <RefreshCw className={`h-4 w-4 ${seeding ? 'animate-spin' : ''}`} />
                        {t('lbl_seed_defaults')}
                    </button>
                    <button onClick={openCreate}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm bg-primary text-white hover:opacity-90">
                        <Plus className="h-4 w-4" />
                        {t('lbl_add_account')}
                    </button>
                    {accounts.length > 0 && (
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

            {/* Type filter */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilterType('')}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${!filterType ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {t('lbl_all')}
                </button>
                {ACCOUNT_TYPES.map((type) => (
                    <button key={type} onClick={() => setFilterType(type)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${filterType === type ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        {t(`lbl_type_${type}`)}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <Loader fullScreen={false} className="py-20" />
            ) : (
                <div className="space-y-4">
                    {visibleTypes.map((type) => {
                        const rows = grouped[type] ?? [];
                        if (!rows.length) return null;
                        return (
                            <div key={type} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-widest ${typeColors[type]}`}>
                                    {t(`lbl_type_${type}`)} ({rows.length})
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-400 uppercase">
                                            <tr>
                                                <th className="px-4 py-2.5 text-left">{t('lbl_code')}</th>
                                                <th className="px-4 py-2.5 text-left">{t('lbl_account_name')}</th>
                                                <th className="px-4 py-2.5 text-left">{t('lbl_subtype')}</th>
                                                <th className="px-4 py-2.5 text-left">{t('lbl_normal_balance')}</th>
                                                <th className="px-4 py-2.5 text-center">{t('lbl_system')}</th>
                                                <th className="px-4 py-2.5 text-center">{t('lbl_actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {rows.map((a: any) => (
                                                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-300">{a.account_code}</td>
                                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                                                        {a.name}
                                                        {a.name_bn && <span className="ml-2 text-xs text-gray-400">{a.name_bn}</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{a.subtype ?? '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs font-medium ${a.normal_balance === 'debit' ? 'text-success' : 'text-danger'}`}>
                                                            {a.normal_balance === 'debit' ? t('lbl_debit') : t('lbl_credit')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {a.is_system && <Shield className="h-3.5 w-3.5 text-gray-400 mx-auto" />}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {!a.is_system && (
                                                            <button onClick={() => openEdit(a)}
                                                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {editingId ? t('lbl_edit_account') : t('lbl_add_account')}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {!editingId && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_account_code')} *</label>
                                        <input required value={form.account_code} onChange={(e) => setForm({ ...form, account_code: e.target.value })}
                                            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_type')} *</label>
                                        <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                                            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900">
                                            {ACCOUNT_TYPES.map((t2) => <option key={t2} value={t2}>{t2}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_account_name')} *</label>
                                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_name_bn')}</label>
                                <input value={form.name_bn} onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_subtype')}</label>
                                    <input value={form.subtype} onChange={(e) => setForm({ ...form, subtype: e.target.value })}
                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent" />
                                </div>
                                {!editingId && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_normal_balance')} *</label>
                                        <select required value={form.normal_balance} onChange={(e) => setForm({ ...form, normal_balance: e.target.value })}
                                            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900">
                                            <option value="debit">{t('lbl_debit')}</option>
                                            <option value="credit">{t('lbl_credit')}</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('lbl_description')}</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    {t('lbl_cancel')}
                                </button>
                                <button type="submit" disabled={creating || updating}
                                    className="flex-1 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-60">
                                    {creating || updating ? t('lbl_saving') : t('lbl_save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartOfAccountsPage;
