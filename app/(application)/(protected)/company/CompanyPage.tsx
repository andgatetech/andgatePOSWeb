'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useGetCompaniesQuery } from '@/store/features/company/companyApi';
import { Building2, GitBranch, Pencil } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function resolveLogoUrl(logoPath?: string | null): string | null {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    return `${API_BASE}${logoPath.startsWith('/') ? '' : '/storage/'}${logoPath}`;
}

const CompanyPage = () => {
    const { t } = getTranslation();
    const router = useRouter();

    const { data, isLoading } = useGetCompaniesQuery({}, { refetchOnMountOrArgChange: 30 });

    const companies = useMemo(() => {
        const d = data as any;
        if (!d) return [];
        if (Array.isArray(d?.data?.data)) return d.data.data;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d)) return d;
        return [];
    }, [data]);

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
                onClick: (row) => router.push(`/company/${row.id}/branches`),
            },
            {
                label: t('btn_edit'),
                icon: <Pencil className="h-4 w-4" />,
                className: 'text-[#046ca9]',
                onClick: (row) => router.push(`/company/${row.id}/edit`),
            },
        ],
        [router, t]
    );

    if (isLoading) return <Loader message={t('company_loading')} />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                    <Building2 className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('company_title')}</h1>
                    <p className="text-sm text-gray-500">{t('company_desc')}</p>
                </div>
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
        </div>
    );
};

export default CompanyPage;
