'use client';

import JournalFilter from '@/components/filters/JournalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useDeleteJournalMutation, useGetJournalsQuery } from '@/store/features/journals/journals';
import { BookOpen, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import CreateJournalModal from './components/CreateJournalModal';
import EditJournalModal from './components/EditJournalModal';
import JournalsTable from './components/JournalsTable';
import ViewJournalModal from './components/ViewJournalModal';

const JournalListPage = () => {
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
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
            const confirmed = await showConfirmDialog('Delete Journal Entry?', `Are you sure you want to delete this journal entry? This action cannot be undone.`, 'Yes, delete it!', 'Cancel', false);

            if (confirmed) {
                try {
                    await deleteJournal(journal.id).unwrap();
                    showSuccessDialog('Deleted!', 'Journal entry has been deleted successfully.');
                } catch (error: any) {
                    showErrorDialog('Error!', error?.data?.message || 'Failed to delete journal entry.');
                }
            }
        },
        [deleteJournal]
    );

    const handleCreateSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleEditSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Journals</h1>
                            <p className="text-sm text-gray-600">Manage your accounting journal entries</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 font-semibold text-white shadow-lg transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
                >
                    <Plus className="h-5 w-5" />
                    Add Entry
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
            <CreateJournalModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />
            <EditJournalModal journal={selectedJournal} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={handleEditSuccess} />
        </div>
    );
};

export default JournalListPage;
