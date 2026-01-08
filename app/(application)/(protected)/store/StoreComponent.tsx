'use client';
import SubscriptionError from '@/components/common/SubscriptionError';
import StoreFilter from '@/components/filters/StoreFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import useSubscriptionError from '@/hooks/useSubscriptionError';
import { useDeleteStoreMutation, useGetStoreQuery } from '@/store/features/store/storeApi';
import { Plus, Store } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import CreateStoreModal from './components/CreateStoreModal';
import StoresTable from './components/StoresTable';

const StoreComponent = () => {
    // Get current store from Redux
    const { currentStoreId, userStores } = useCurrentStore();
    
    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Use the correct API query that calls your getStore endpoint
    const {
        error,
        refetch,
    } = useGetStoreQuery(currentStoreId ? { store_id: currentStoreId } : undefined, {
        refetchOnMountOrArgChange: true,
        skip: !currentStoreId,
    });

    // Check for subscription errors (from getStore query only now)
    const { hasSubscriptionError, subscriptionError } = useSubscriptionError(error);

    // Force refetch when store ID changes
    useEffect(() => {
        if (currentStoreId && refetch) {
            refetch();
        }
    }, [currentStoreId, refetch]);

    // Table State & Logic
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [deleteStore] = useDeleteStoreMutation();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleFilterChange = useCallback((newApiParams: Record<string, any>) => {
        setApiParams(newApiParams);
    }, []);

    const handleDeleteStore = async (store: any) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete "${store.store_name}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                await deleteStore(store.id).unwrap();
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Store has been deleted successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete store. Please try again.',
                    icon: 'error',
                });
            }
        }
    };

    const filteredStores = useMemo(() => {
        let result = Array.isArray(userStores) ? [...userStores] : [];

        if (apiParams.status && apiParams.status !== 'all') {
            const statusFilter = apiParams.status;
            result = result.filter((store) => {
                const isActive = (store.is_active === true || store.is_active === 1 || store.is_active === '1') && !store.store_disabled;
                if (statusFilter === 'active') return isActive;
                if (statusFilter === 'inactive') return !isActive;
                return true;
            });
        }

        if (apiParams.search) {
            const searchLower = apiParams.search.toLowerCase();
            result = result.filter(
                (store) => (store.store_name && store.store_name.toLowerCase().includes(searchLower)) || (store.store_location && store.store_location.toLowerCase().includes(searchLower))
            );
        }

        if (sortField) {
            result.sort((a, b) => {
                const aValue = a[sortField];
                const bValue = b[sortField];
                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [userStores, apiParams, sortField, sortDirection]);

    const totalItems = filteredStores.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedStores = filteredStores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Show subscription error component if subscription middleware error occurs
    if (hasSubscriptionError) {
        return <SubscriptionError errorType={subscriptionError.errorType!} message={subscriptionError.message} details={subscriptionError.details} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Title Section */}
            <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-sm sm:p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md sm:h-12 sm:w-12">
                            <Store className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Store Management</h1>
                            <p className="text-xs text-gray-500 sm:text-sm">Manage your store operations and settings</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-start sm:justify-end">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto sm:px-6 sm:py-3"
                        >
                            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-110 sm:h-5 sm:w-5" />
                            <span className="whitespace-nowrap">Create New Store</span>
                            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                    </div>
                </div>
            </div>

            <main className="min-h-screen py-8">
                {/* List of Stores */}
                <section className="grid grid-cols-1 gap-6">
                    <div className="space-y-4">
                        <StoreFilter onFilterChange={handleFilterChange} />
                        <StoresTable
                            stores={paginatedStores}
                            isLoading={false}
                            onDelete={handleDeleteStore}
                            pagination={{
                                currentPage,
                                totalPages,
                                itemsPerPage,
                                totalItems,
                                onPageChange: setCurrentPage,
                                onItemsPerPageChange: setItemsPerPage,
                            }}
                            sorting={{
                                field: sortField,
                                direction: sortDirection,
                                onSort: (field) => {
                                    if (field === sortField) {
                                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                    } else {
                                        setSortField(field);
                                        setSortDirection('asc');
                                    }
                                },
                            }}
                        />
                    </div>
                </section>
            </main>

            {/* Create Store Modal */}
            <CreateStoreModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </div>
    );
};

export default StoreComponent;
