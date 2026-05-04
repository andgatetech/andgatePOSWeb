'use client';

import SupplierFilter from '@/components/filters/SupplierFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useDeleteSupplierMutation, useGetSuppliersQuery } from '@/store/features/supplier/supplierApi';
import { Plus, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import SuppliersTable from '../components/SuppliersTable';
import ViewSupplierModal from '../components/ViewSupplierModal';

const SuppliersPage = () => {
    const { t } = getTranslation();
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
            const confirmed = await showConfirmDialog(t('msg_confirm_delete_title'), t('supplier_delete_confirm'), t('msg_confirm_delete_btn'), t('btn_cancel'), false);

            if (confirmed) {
                try {
                    await deleteSupplier(supplier.id).unwrap();
                    showSuccessDialog(t('msg_success'), t('supplier_deleted'));
                } catch (error: any) {
                    showErrorDialog(t('msg_error'), error?.data?.message || t('supplier_error_delete'));
                }
            }
        },
        [deleteSupplier, t]
    );

    const handleAddNew = () => {
        router.push('/suppliers/create');
    };

    if (isLoading) {
        return <Loader message={t('supplier_loading')} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('supplier_page_title')}</h1>
                        <p className="text-sm text-gray-500">{t('supplier_page_desc')}</p>
                    </div>
                </div>
                <button onClick={handleAddNew} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    {t('supplier_add')}
                </button>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <SupplierFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Table */}
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

            {/* View Supplier Modal */}
            <ViewSupplierModal supplier={selectedSupplier} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default SuppliersPage;
