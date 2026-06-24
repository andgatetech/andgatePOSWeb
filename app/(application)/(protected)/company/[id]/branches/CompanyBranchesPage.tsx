'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useGetCompanyBranchesQuery } from '@/store/features/company/companyApi';
import { ArrowLeft, ExternalLink, GitBranch, Plus, Store } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function resolveLogoUrl(logoPath?: string | null): string | null {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    return `${API_BASE}${logoPath.startsWith('/') ? '' : '/storage/'}${logoPath}`;
}

export default function CompanyBranchesPage() {
    const { t } = getTranslation();
    const router = useRouter();
    const params = useParams();
    const companyId = Number(params.id);

    const { data, isLoading } = useGetCompanyBranchesQuery(companyId, { skip: !companyId, refetchOnMountOrArgChange: 30 });

    const companyName = useMemo(() => {
        const d = data as any;
        return d?.data?.company_name ?? '';
    }, [data]);

    const branches = useMemo(() => {
        const d = data as any;
        if (!d) return [];
        if (Array.isArray(d?.data?.branches)) return d.data.branches;
        if (Array.isArray(d?.branches)) return d.branches;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d)) return d;
        return [];
    }, [data]);

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'store_name',
                label: t('lbl_branch_name'),
                render: (value, row) => {
                    const logo = resolveLogoUrl(row.logo_path);
                    return (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 overflow-hidden">
                                {logo ? (
                                    <Image src={logo} alt={value} width={40} height={40} className="h-10 w-10 object-cover rounded-lg" unoptimized />
                                ) : (
                                    <Store className="h-5 w-5 text-gray-400" />
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
                key: 'timezone',
                label: t('lbl_timezone'),
                render: (value) => <span className="text-sm text-gray-600">{value || '-'}</span>,
            },
            {
                key: 'currency',
                label: t('lbl_currency'),
                render: (value) => <span className="text-sm text-gray-700">{value?.code ?? '-'}</span>,
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
                label: t('company_branch_manage'),
                icon: <ExternalLink className="h-4 w-4" />,
                className: 'text-gray-700',
                onClick: () => router.push('/store'),
            },
        ],
        [router, t]
    );

    if (isLoading) return <Loader message={t('company_branches_loading')} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/company')}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <GitBranch className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('company_branches_title')}</h1>
                        {companyName && <p className="text-sm text-gray-500">{companyName}</p>}
                    </div>
                </div>
                <Link
                    href="/store/create"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    {t('company_add_branch')}
                </Link>
            </div>

            <ReusableTable
                data={branches}
                columns={columns}
                actions={actions}
                emptyState={{
                    icon: <GitBranch className="mx-auto h-16 w-16" />,
                    title: t('company_branches_empty'),
                    description: t('company_branches_empty_desc'),
                }}
            />
        </div>
    );
}
