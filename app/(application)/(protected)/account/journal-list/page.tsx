'use client';

import JournalFilter from '@/components/filters/JournalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useDeleteJournalMutation, useGetJournalsQuery } from '@/store/features/journals/journals';
import { BookOpen, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import EditJournalModal from './components/EditJournalModal';
import JournalsTable from './components/JournalsTable';
import ViewJournalModal from './components/ViewJournalModal';

const JournalListPage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStoreId } = useCurrentStore();

    // Filter and pagination state
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Modal states
    const [selectedJournal, setSelectedJournal] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Build query params
    const queryParams = useMemo(() => {
        return {
            ...filterParams,
            page: currentPage,
            per_page: itemsPerPage,
            sort_field: sortField,
            sort_direction: sortDirection,
        };
    }, [filterParams, currentPage, itemsPerPage, sortField, sortDirection]);

    // API hooks
    const {
        data: journalsResponse,
        isLoading,
        refetch,
    } = useGetJournalsQuery(queryParams, {
        skip: !filterParams.store_id && !filterParams.store_ids,
    });
    const [deleteJournal] = useDeleteJournalMutation();

    // Data extraction
    const journals = journalsResponse?.data?.data || journalsResponse?.data?.items || [];
    const pagination = journalsResponse?.data?.meta ||
        journalsResponse?.data?.pagination || {
            current_page: 1,
            per_page: 10,
            total: 0,
            last_page: 1,
        };

    // Handlers
    const handleFilterChange = useCallback((params: Record<string, any>) => {
        setFilterParams(params);
        setCurrentPage(1);
    }, []);

    const handleSort = useCallback(
        (field: string) => {
            if (sortField === field) {
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            } else {
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

    const handleEdit = useCallback((journal: any) => {
        setSelectedJournal(journal);
        setIsEditModalOpen(true);
    }, []);

    const handleDelete = useCallback(
        async (journal: any) => {
            const confirmed = await showConfirmDialog(t('msg_delete_journal_confirm'), t('msg_are_you_sure_delete_journal'), t('btn_yes_delete_it'), t('btn_cancel'), false);

            if (confirmed) {
                try {
                    await deleteJournal(journal.id).unwrap();
                    showSuccessDialog(t('msg_deleted'), t('msg_journal_deleted'));
                } catch (error: any) {
                    showErrorDialog(t('msg_error'), error?.data?.message || t('msg_failed_delete_journal'));
                }
            }
        },
        [deleteJournal]
    );

    const handleEditSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    if (isLoading) {
        return <Loader message={t('account_loading_journals')} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('account_journals')}</h1>
                        <p className="text-sm text-gray-500">{t('account_journals_desc')}</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push('/account/journal-list/create')}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-105"
                >
                    <Plus className="h-4 w-4" />
                    {t('btn_add_entry')}
                </button>
            </div>

            {/* Filters */}
            <div className="panel">
                <JournalFilter onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />
            </div>

            {/* Table */}
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
                    sorting={{
                        field: sortField,
                        direction: sortDirection,
                        onSort: handleSort,
                    }}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {/* Modals */}
            <ViewJournalModal journal={selectedJournal} isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
            <EditJournalModal journal={selectedJournal} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={handleEditSuccess} />
        </div>
    );
};

export default JournalListPage;
