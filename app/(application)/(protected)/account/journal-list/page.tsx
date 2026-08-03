'use client';

import LegacyAccountingReadOnlyNotice from '@/components/accounting/LegacyAccountingReadOnlyNotice';
import JournalFilter from '@/components/filters/JournalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useGetJournalsQuery } from '@/store/features/journals/journals';
import { BookOpen } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import JournalsTable from './components/JournalsTable';
import ViewJournalModal from './components/ViewJournalModal';

const JournalListPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedJournal, setSelectedJournal] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const queryParams = useMemo(
        () => ({ ...filterParams, page: currentPage, per_page: itemsPerPage, sort_field: sortField, sort_direction: sortDirection }),
        [filterParams, currentPage, itemsPerPage, sortField, sortDirection]
    );
    const { data: journalsResponse, isLoading } = useGetJournalsQuery(queryParams, { skip: !filterParams.store_id && !filterParams.store_ids });
    const journals = journalsResponse?.data?.data || journalsResponse?.data?.items || [];
    const pagination = journalsResponse?.data?.meta || journalsResponse?.data?.pagination || { current_page: 1, per_page: 10, total: 0, last_page: 1 };
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
    const handleViewDetails = useCallback((journal: any) => {
        setSelectedJournal(journal);
        setIsViewModalOpen(true);
    }, []);

    if (isLoading) return <Loader message={t('account_loading_journals')} />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                    <BookOpen className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('account_journals')}</h1>
                    <p className="text-sm text-gray-500">{t('legacy_accounting_history_desc')}</p>
                </div>
            </div>
            <LegacyAccountingReadOnlyNotice kind="journal" />
            <div className="panel">
                <JournalFilter onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />
            </div>
            <div className="panel">
                <JournalsTable
                    journals={journals}
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
            <ViewJournalModal journal={selectedJournal} isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
        </div>
    );
};

export default JournalListPage;
