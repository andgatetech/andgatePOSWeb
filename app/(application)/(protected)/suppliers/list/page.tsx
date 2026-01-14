'use client';

import SupplierFilter from '@/components/filters/SupplierFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useDeleteSupplierMutation, useGetSuppliersQuery } from '@/store/features/supplier/supplierApi';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import SuppliersTable from '../components/SuppliersTable';
import ViewSupplierModal from '../components/ViewSupplierModal';

const SuppliersPage = () => {
    const router = useRouter();
    const { currentStoreId } = useCurrentStore();

    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const { data: suppliersResponse, isLoading } = useGetSuppliersQuery(queryParams, {
        skip: !filterParams.store_id && !filterParams.store_ids, // Skip until store_id is available from filter
    });
    const [deleteSupplier] = useDeleteSupplierMutation();

    const suppliers = suppliersResponse?.data?.items || [];
    const pagination = suppliersResponse?.data?.pagination || {
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
    };

    const handleFilterChange = useCallback((params: Record<string, any>) => {
        setFilterParams(params);
        setCurrentPage(1); // Reset to first page when filters change
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

    const handleViewDetails = useCallback((supplier: any) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback(
        (supplier: any) => {
            router.push(`/suppliers/edit/${supplier.id}`);
        },
        [router]
    );

    const handleDelete = useCallback(
        async (supplier: any) => {
            const confirmed = await showConfirmDialog('Delete Supplier?', `Are you sure you want to delete ${supplier.name}? This action cannot be undone.`, 'Yes, delete it!', 'Cancel', false);

            if (confirmed) {
                try {
                    await deleteSupplier(supplier.id).unwrap();
                    showSuccessDialog('Deleted!', 'Supplier has been deleted successfully.');
                } catch (error: any) {
                    showErrorDialog('Error!', error?.data?.message || 'Failed to delete supplier.');
                }
            }
        },
        [deleteSupplier]
    );

    const handleAddNew = () => {
        router.push('/suppliers/create');
    };

    if (isLoading) {
        return <Loader message="Loading suppliers..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
                    <p className="mt-1 text-sm text-gray-600">Manage your suppliers and their information</p>
                </div>
                <button onClick={handleAddNew} className="btn btn-primary">
                    <Plus className="mr-2 h-5 w-5" />
                    Add Supplier
                </button>
            </div>

            {/* Filters */}
            <div className="panel">
                <SupplierFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Table */}
            <div className="panel">
                <SuppliersTable
                    suppliers={suppliers}
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

            {/* View Supplier Modal */}
            <ViewSupplierModal supplier={selectedSupplier} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default SuppliersPage;
