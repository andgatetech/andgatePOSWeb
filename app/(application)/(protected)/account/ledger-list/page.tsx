'use client';

import LegacyAccountingReadOnlyNotice from '@/components/accounting/LegacyAccountingReadOnlyNotice';
import LedgerFilter from '@/components/filters/LedgerFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { BookOpen } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import LedgersTable from './components/LedgersTable';
import ViewLedgerModal from './components/ViewLedgerModal';

const LedgerListPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedLedger, setSelectedLedger] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const queryParams = useMemo(
        () => ({ ...filterParams, page: currentPage, per_page: itemsPerPage, sort_field: sortField, sort_direction: sortDirection }),
        [filterParams, currentPage, itemsPerPage, sortField, sortDirection]
    );
    const { data: ledgersResponse, isLoading } = useGetLedgersQuery(queryParams, { skip: !filterParams.store_id && !filterParams.store_ids });
    const ledgers = ledgersResponse?.data?.items || [];
    const pagination = ledgersResponse?.data?.pagination || { current_page: 1, per_page: 10, total: 0, last_page: 1 };
    const handleFilterChange = useCallback((params: Record<string, any>) => {
        setFilterParams(params);
        setCurrentPage(1);
    }, []);
    const handleSort = useCallback(
        (field: string) => {
            if (sortField === field) setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            else {
                setSortField(field);
                setSortDirection('asc');
            }
        },
        [sortField]
    );
    const handleViewDetails = useCallback((ledger: any) => {
        setSelectedLedger(ledger);
        setIsViewModalOpen(true);
    }, []);

    if (isLoading) return <Loader message={t('account_loading_ledgers')} />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                    <BookOpen className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('lbl_ledgers')}</h1>
                    <p className="text-sm text-gray-500">{t('legacy_accounting_history_desc')}</p>
                </div>
            </div>
            <LegacyAccountingReadOnlyNotice kind="ledger" />
            <div className="panel">
                <LedgerFilter onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />
            </div>
            <div className="panel">
                <LedgersTable
                    ledgers={ledgers}
                    isLoading={isLoading}
                    pagination={{
                        currentPage: pagination.current_page,
                        totalPages: pagination.last_page,
                        itemsPerPage: pagination.per_page,
                        totalItems: pagination.total,
                        onPageChange: setCurrentPage,
                        onItemsPerPageChange: (items) => {
                            setItemsPerPage(items);
                            setCurrentPage(1);
                        },
                    }}
                    sorting={{ field: sortField, direction: sortDirection, onSort: handleSort }}
                    onViewDetails={handleViewDetails}
                />
            </div>
            <ViewLedgerModal ledger={selectedLedger} isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
        </div>
    );
};

export default LedgerListPage;
