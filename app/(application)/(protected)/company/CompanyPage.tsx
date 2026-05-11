'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import {
    useCreateCompanyMutation,
    useDeleteCompanyMutation,
    useGetCompaniesQuery,
    useGetCompanyBranchesQuery,
    useUpdateCompanyMutation,
} from '@/store/features/company/companyApi';
import { Building2, GitBranch, Pencil, Plus, Store, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function resolveLogoUrl(logoPath?: string | null): string | null {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    return `${API_BASE}${logoPath.startsWith('/') ? '' : '/storage/'}${logoPath}`;
}

function BranchesModal({ company, onClose }: { company: any; onClose: () => void }) {
    const { t } = getTranslation();
    const { data, isLoading } = useGetCompanyBranchesQuery(company.id);

    const branches = useMemo(() => {
        const d = data as any;
        if (!d) return [];
        if (Array.isArray(d?.data?.branches)) return d.data.branches;
        if (Array.isArray(d?.branches)) return d.branches;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d)) return d;
        return [];
    }, [data]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold text-gray-900">{t('company_branches_title')} — {company.name}</h2>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : branches.length === 0 ? (
                        <div className="flex flex-col items-center py-12 text-gray-400">
                            <Store className="mb-3 h-12 w-12" />
                            <p className="text-sm">{t('company_branches_empty')}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {branches.map((branch: any) => {
                                const branchLogo = resolveLogoUrl(branch.logo_path);
                                return (
                                    <div key={branch.id} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 overflow-hidden">
                                            {branchLogo ? (
                                                <Image src={branchLogo} alt={branch.store_name} width={40} height={40} className="h-10 w-10 object-cover rounded-lg" unoptimized />
                                            ) : (
                                                <Store className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{branch.store_name}</p>
                                            <p className="text-xs text-gray-500">{branch.slug} · {branch.timezone}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${branch.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {branch.is_active ? t('lbl_active') : t('lbl_inactive')}
                                            </span>
                                            <span className="text-xs text-gray-400">{branch.currency}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex justify-end border-t border-gray-200 px-6 py-4">
                    <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        {t('btn_close')}
                    </button>
                </div>
            </div>
        </div>
    );
}

const CompanyPage = () => {
    const { t } = getTranslation();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<any>(null);
    const [branchesCompany, setBranchesCompany] = useState<any>(null);
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formAddress, setFormAddress] = useState('');
    const [formCountry, setFormCountry] = useState('');
    const [formIsActive, setFormIsActive] = useState(true);
    const [formLogo, setFormLogo] = useState<File | null>(null);

    const { data, isLoading } = useGetCompaniesQuery({}, { refetchOnMountOrArgChange: 30 });
    const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
    const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();
    const [deleteCompany] = useDeleteCompanyMutation();

    const companies = useMemo(() => {
        const d = data as any;
        if (!d) return [];
        if (Array.isArray(d?.data?.data)) return d.data.data;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d)) return d;
        return [];
    }, [data]);

    const openCreate = useCallback(() => {
        setEditingCompany(null);
        setFormName(''); setFormEmail(''); setFormPhone(''); setFormAddress(''); setFormCountry('');
        setFormIsActive(true); setFormLogo(null);
        setModalOpen(true);
    }, []);

    const openEdit = useCallback((company: any) => {
        setEditingCompany(company);
        setFormName(company.name || '');
        setFormEmail(company.billing_email || '');
        setFormPhone(company.billing_phone || '');
        setFormAddress(company.billing_address || '');
        setFormCountry(company.country_code || '');
        setFormIsActive(company.is_active ?? true);
        setFormLogo(null);
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setEditingCompany(null);
    }, []);

    const handleSubmit = async () => {
        if (!formName.trim()) {
            showErrorDialog(t('company_name_required_title'), t('company_name_required_desc'));
            return;
        }

        const formData = new FormData();
        formData.append('name', formName.trim());
        if (formEmail) formData.append('billing_email', formEmail);
        if (formPhone) formData.append('billing_phone', formPhone);
        if (formAddress) formData.append('billing_address', formAddress);
        if (formCountry) formData.append('country_code', formCountry);
        if (formLogo) formData.append('logo', formLogo);
        if (editingCompany) formData.append('is_active', formIsActive ? '1' : '0');

        try {
            if (editingCompany) {
                await updateCompany({ id: editingCompany.id, data: formData }).unwrap();
                showSuccessDialog(t('company_updated_title'), t('company_updated_desc'));
            } else {
                await createCompany(formData).unwrap();
                showSuccessDialog(t('company_created_title'), t('company_created_desc'));
            }
            closeModal();
        } catch {
            showErrorDialog(t('company_save_failed_title'), t('company_save_failed_desc'));
        }
    };

    const handleDelete = useCallback(async (company: any) => {
        const confirmed = await showConfirmDialog(
            t('company_delete_confirm_title'),
            t('company_delete_confirm_desc').replace('{name}', company.name),
            t('btn_delete'), t('btn_cancel'), false
        );
        if (!confirmed) return;
        try {
            await deleteCompany(company.id).unwrap();
            showSuccessDialog(t('company_deleted_title'), t('company_deleted_desc'));
        } catch {
            showErrorDialog(t('company_delete_failed_title'), t('company_delete_failed_desc'));
        }
    }, [deleteCompany, t]);

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'name',
                label: t('lbl_company_name'),
                render: (value, row) => {
                    const logoUrl = resolveLogoUrl(row.logo_path);
                    return (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 overflow-hidden">
                                {logoUrl ? (
                                    <Image src={logoUrl} alt={value} width={40} height={40} className="h-10 w-10 object-cover rounded-lg" unoptimized />
                                ) : (
                                    <Building2 className="h-5 w-5 text-gray-400" />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-900">{value}</span>
                                <span className="text-xs text-gray-500">{row.slug}</span>
                            </div>
                        </div>
                    );
                },
            },
            {
                key: 'billing_email',
                label: t('lbl_email'),
                render: (value) => <span className="text-sm text-gray-700">{value || '-'}</span>,
            },
            {
                key: 'billing_phone',
                label: t('lbl_phone'),
                render: (value) => <span className="text-sm text-gray-700">{value || '-'}</span>,
            },
            {
                key: 'stores_count',
                label: t('lbl_branches'),
                render: (value) => (
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {value ?? 0}
                    </span>
                ),
            },
            {
                key: 'subscription',
                label: t('company_plan'),
                render: (value) => {
                    if (!value?.plan_name) return <span className="text-xs text-gray-400">{t('company_no_plan')}</span>;
                    const isActive = value.status === 'active';
                    const expireDate = value.expire_date ? new Date(value.expire_date).toLocaleDateString() : null;
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                {value.plan_name}
                            </span>
                            {expireDate && <span className="text-xs text-gray-400">{t('company_plan_expires')}: {expireDate}</span>}
                        </div>
                    );
                },
            },
            {
                key: 'is_active',
                label: t('lbl_status'),
                render: (value) => (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {value ? t('lbl_active') : t('lbl_inactive')}
                    </span>
                ),
            },
        ],
        [t]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: t('company_view_branches'),
                icon: <GitBranch className="h-4 w-4" />,
                className: 'text-indigo-600',
                onClick: (row) => setBranchesCompany(row),
            },
            {
                label: t('btn_edit'),
                icon: <Pencil className="h-4 w-4" />,
                className: 'text-blue-600',
                onClick: openEdit,
            },
            {
                label: t('btn_delete'),
                icon: <Trash2 className="h-4 w-4" />,
                className: 'text-red-600',
                onClick: handleDelete,
            },
        ],
        [openEdit, handleDelete, t]
    );

    const existingLogoUrl = editingCompany ? resolveLogoUrl(editingCompany.logo_path) : null;

    if (isLoading) return <Loader message={t('company_loading')} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('company_title')}</h1>
                        <p className="text-sm text-gray-500">{t('company_desc')}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    {t('company_create')}
                </button>
            </div>

            <ReusableTable
                data={companies}
                columns={columns}
                actions={actions}
                emptyState={{
                    icon: <Building2 className="mx-auto h-16 w-16" />,
                    title: t('company_empty_title'),
                    description: t('company_empty_desc'),
                }}
            />

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg font-bold text-gray-900">{editingCompany ? t('company_edit') : t('company_create')}</h2>
                            <button onClick={closeModal} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('lbl_company_name')} *</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder={t('company_name_placeholder')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('lbl_email')}</label>
                                <input
                                    type="email"
                                    value={formEmail}
                                    onChange={(e) => setFormEmail(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('lbl_phone')}</label>
                                <input
                                    type="text"
                                    value={formPhone}
                                    onChange={(e) => setFormPhone(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('lbl_address')}</label>
                                <textarea
                                    value={formAddress}
                                    onChange={(e) => setFormAddress(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('lbl_country')}</label>
                                <input
                                    type="text"
                                    value={formCountry}
                                    onChange={(e) => setFormCountry(e.target.value)}
                                    placeholder="BD"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('lbl_company_logo')}</label>
                                {existingLogoUrl && (
                                    <div className="mb-2 flex items-center gap-3">
                                        <Image
                                            src={existingLogoUrl}
                                            alt={t('company_current_logo')}
                                            width={48}
                                            height={48}
                                            className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                            unoptimized
                                        />
                                        <span className="text-xs text-gray-500">{t('company_current_logo')}</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormLogo(e.target.files?.[0] ?? null)}
                                    className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
                                />
                            </div>
                            {editingCompany && (
                                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{t('company_is_active')}</p>
                                        <p className="text-xs text-gray-500">{formIsActive ? t('lbl_active') : t('lbl_inactive')}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormIsActive((v) => !v)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formIsActive ? 'bg-primary' : 'bg-gray-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formIsActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                            <button onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                {t('btn_cancel')}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isCreating || isUpdating}
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#046ca9] to-[#034d79] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                            >
                                {(isCreating || isUpdating) && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                                {editingCompany ? t('btn_update') : t('btn_create')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {branchesCompany && (
                <BranchesModal company={branchesCompany} onClose={() => setBranchesCompany(null)} />
            )}
        </div>
    );
};

export default CompanyPage;
