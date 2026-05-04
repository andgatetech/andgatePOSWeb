'use client';

import CustomerFilter from '@/components/filters/CustomerFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useDeleteCustomerMutation, useGetStoreCustomersListQuery } from '@/store/features/customer/customer';
import { Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import CustomersTable from '../components/CustomersTable';
import ViewCustomerModal from '../components/ViewCustomerModal';

const CustomersPage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStoreId } = useCurrentStore();

    const [filterParams, setFilterParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
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

    const { data: customersResponse, isLoading } = useGetStoreCustomersListQuery(queryParams, {
        skip: !filterParams.store_id && !filterParams.store_ids, // Skip until store_id is available from filter
    });
    const [deleteCustomer] = useDeleteCustomerMutation();

    const customers = customersResponse?.data?.items || [];
    const pagination = customersResponse?.data?.pagination || {
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

    const handleViewDetails = useCallback((customer: any) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback(
        (customer: any) => {
            router.push(`/customers/edit/${customer.id}`);
        },
        [router]
    );

    const handleDelete = useCallback(
        async (customer: any) => {
            const confirmed = await showConfirmDialog(t('msg_confirm_delete_title'), t('msg_confirm_delete_text'), t('msg_confirm_delete_btn'), t('btn_cancel'), false);

            if (confirmed) {
                try {
                    await deleteCustomer(customer.id).unwrap();
                    showSuccessDialog(t('msg_success'), t('customer_deleted'));
                } catch (error: any) {
                    showErrorDialog(t('msg_error'), error?.data?.message || t('customer_error_delete'));
                }
            }
        },
        [deleteCustomer]
    );

    const handleAddNew = () => {
        router.push('/customers/create');
    };

    if (isLoading) {
        return <Loader message={t('customer_loading')} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('customer_page_title')}</h1>
                        <p className="text-sm text-gray-500">{t('customer_page_desc')}</p>
                    </div>
                </div>
                <button onClick={handleAddNew} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    {t('customer_add')}
                </button>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <CustomerFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Table */}
            <CustomersTable
                    customers={customers}
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

            {/* View Customer Modal */}
            <ViewCustomerModal customer={selectedCustomer} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default CustomersPage;
