'use client';
import SubscriptionError from '@/components/common/SubscriptionError';
import StoreFilter from '@/components/filters/StoreFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import useSubscriptionError from '@/hooks/useSubscriptionError';
import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useDeleteStoreMutation, useGetStoreQuery } from '@/store/features/store/storeApi';
import { Plus, Store } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CreateStoreModal from './components/CreateStoreModal';
import StoresTable from './components/StoresTable';

const StoreComponent = () => {
    const { t } = getTranslation();
    // Get current store from Redux
    const { currentStoreId, userStores } = useCurrentStore();

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Fetch detailed store data from API for the current store only
    const {
        data: storeData,
        isLoading: isLoadingStore,
        error,
        refetch,
    } = useGetStoreQuery(currentStoreId ? { store_id: currentStoreId } : undefined, {
        refetchOnMountOrArgChange: 30,
        skip: !currentStoreId,
    });

    // Check for subscription errors
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
        const confirmed = await showConfirmDialog(t('msg_are_you_sure'), `${t('msg_delete_store_confirm')} "${store.store_name}"? ${t('msg_cannot_be_undone')}`);

        if (confirmed) {
            try {
                await deleteStore(store.id).unwrap();
                showSuccessDialog(t('msg_deleted'), t('msg_store_deleted'));
            } catch (error) {
                showErrorDialog(t('msg_error'), t('msg_failed_delete_store'));
            }
        }
    };

    // Merge detailed API data for current store with Redux stores
    const allStores = useMemo(() => {
        const stores = [...userStores];

        // Replace current store with detailed API data if available
        if (storeData?.data?.store) {
            const apiStore = storeData.data.store;
            const index = stores.findIndex((s) => s.id === currentStoreId);
            if (index !== -1) {
                stores[index] = apiStore;
            }
        }

        return stores;
    }, [userStores, storeData, currentStoreId]);

    const filteredStores = useMemo(() => {
        let result = [...allStores];

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
    }, [allStores, apiParams, sortField, sortDirection]);

    const totalItems = filteredStores.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedStores = filteredStores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Show subscription error component if subscription middleware error occurs
    if (hasSubscriptionError) {
        return <SubscriptionError errorType={subscriptionError.errorType!} message={subscriptionError.message} details={subscriptionError.details} />;
    }

    if (isLoadingStore) {
        return <Loader message={t('msg_loading_stores')} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                        <Store className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('store_management_title')}</h1>
                        <p className="text-sm text-gray-500">{t('store_management_subtitle')}</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    {t('store_create_new')}
                </button>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <StoreFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Table */}
            <StoresTable
                stores={paginatedStores}
                isLoading={isLoadingStore}
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

            {/* Create Store Modal */}
            <CreateStoreModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </div>
    );
};

export default StoreComponent;
