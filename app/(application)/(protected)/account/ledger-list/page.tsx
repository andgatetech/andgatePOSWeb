'use client';

import LedgerFilter from '@/components/filters/LedgerFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useDeleteLedgerMutation, useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { BookOpen, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import CreateLedgerModal from './components/CreateLedgerModal';
import EditLedgerModal from './components/EditLedgerModal';
import LedgersTable from './components/LedgersTable';
import ViewLedgerModal from './components/ViewLedgerModal';

const LedgerListPage = () => {
    const { currentStoreId } = useCurrentStore();

    // Filter and pagination state
    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Modal states
    const [selectedLedger, setSelectedLedger] = useState<any>(null);
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
        data: ledgersResponse,
        isLoading,
        refetch,
    } = useGetLedgersQuery(queryParams, {
        skip: !filterParams.store_id && !filterParams.store_ids,
    });
    const [deleteLedger] = useDeleteLedgerMutation();

    // Data extraction
    const ledgers = ledgersResponse?.data?.items || [];
    const pagination = ledgersResponse?.data?.pagination || {
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

    const handleViewDetails = useCallback((ledger: any) => {
        setSelectedLedger(ledger);
        setIsViewModalOpen(true);
    }, []);

    const handleEdit = useCallback((ledger: any) => {
        setSelectedLedger(ledger);
        setIsEditModalOpen(true);
    }, []);

    const handleDelete = useCallback(
        async (ledger: any) => {
            const confirmed = await showConfirmDialog('Delete Ledger?', `Are you sure you want to delete "${ledger.title}"? This action cannot be undone.`, 'Yes, delete it!', 'Cancel', false);

            if (confirmed) {
                try {
                    await deleteLedger(ledger.id).unwrap();
                    showSuccessDialog('Deleted!', 'Ledger has been deleted successfully.');
                } catch (error: any) {
                    showErrorDialog('Error!', error?.data?.message || 'Failed to delete ledger.');
                }
            }
        },
        [deleteLedger]
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Ledgers</h1>
                            <p className="text-sm text-gray-600">Manage your financial ledgers and accounts</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
                >
                    <Plus className="h-5 w-5" />
                    Add Ledger
                </button>
            </div>

            {/* Filters */}
            <div className="panel">
                <LedgerFilter onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />
            </div>

            {/* Table */}
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
            <ViewLedgerModal ledger={selectedLedger} isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
            <CreateLedgerModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />
            <EditLedgerModal ledger={selectedLedger} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={handleEditSuccess} />
        </div>
    );
};

export default LedgerListPage;
