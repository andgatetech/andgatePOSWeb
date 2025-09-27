'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetAdjustmentTypesQuery } from '@/store/features/AdjustmentType/adjustmentTypeApi';
import { useFullStoreListWithFilterQuery } from '@/store/features/store/storeApi';
import { Filter, MoreHorizontal, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import CreateAdjustmentTypeModal from './__components/CreateAdjustmentTypeModal';

const AdjustmentTypesPage = () => {
    const { currentStoreId, currentStore } = useCurrentStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        store_id: currentStoreId || '',
        type: '',
        search: '',
    });

    useEffect(() => {
        if (currentStoreId) {
            setFilters((prev) => ({
                ...prev,
                store_id: currentStoreId,
                page: 1,
            }));
        }
    }, [currentStoreId]);

    // API queries
    const { data: adjustmentTypesData, isLoading: isLoadingAdjustmentTypes, refetch: refetchAdjustmentTypes } = useGetAdjustmentTypesQuery(filters);

    // const { data: storesData, isLoading: isLoadingStores } = useAllStoresQuery();
    const { data: storesData, isLoading: isLoadingStores } = useFullStoreListWithFilterQuery();

    const adjustmentTypes = adjustmentTypesData?.data || [];
    const stores = storesData?.data || [];

    // Filter adjustment types based on search
    const filteredAdjustmentTypes = adjustmentTypes.filter(
        (item) => item.type.toLowerCase().includes(filters.search.toLowerCase()) || item.description.toLowerCase().includes(filters.search.toLowerCase())
    );

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const clearFilters = () => {
        setFilters({
            store_id: '',
            type: '',
            search: '',
        });
    };

    const uniqueTypes = [...new Set(adjustmentTypes.map((item) => item.type))];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Adjustment Types Management</h1>
                    <p className="text-gray-600">Manage inventory adjustment types for your stores</p>
                </div>

                {/* Filters and Actions */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                            {/* Search */}
                            <div className="relative max-w-md flex-1">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search adjustment types..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Store Filter */}
                                <select
                                    value={filters.store_id}
                                    onChange={(e) => handleFilterChange('store_id', e.target.value)}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoadingStores}
                                >
                                    <option value="">All Stores</option>
                                    {stores.map((store) => (
                                        <option key={store.id} value={store.id}>
                                            {store.store_name}
                                        </option>
                                    ))}
                                </select>

                                {/* Type Filter */}
                                <select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Types</option>
                                    {uniqueTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>

                                {/* Clear Filters */}
                                {(filters.store_id || filters.type || filters.search) && (
                                    <button onClick={clearFilters} className="px-3 py-2 text-sm text-gray-600 transition-colors hover:text-gray-800">
                                        Clear filters
                                    </button>
                                )}

                                {/* Create Button */}
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Adjustment Type
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                                Showing {filteredAdjustmentTypes.length} of {adjustmentTypes.length} adjustment types
                            </span>
                            {isLoadingAdjustmentTypes && <span className="text-blue-600">Loading...</span>}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Store</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created Date</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoadingAdjustmentTypes ? (
                                    // Loading skeleton
                                    [...Array(5)].map((_, index) => (
                                        <tr key={index} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-20 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-40 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-24 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-28 rounded bg-gray-200"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="ml-auto h-8 w-8 rounded bg-gray-200"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredAdjustmentTypes.length === 0 ? (
                                    // Empty state
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <Filter className="mb-4 h-12 w-12 text-gray-300" />
                                                <h3 className="mb-2 text-lg font-medium">No adjustment types found</h3>
                                                <p className="text-sm">
                                                    {filters.search || filters.store_id || filters.type
                                                        ? 'Try adjusting your filters or search terms'
                                                        : 'Create your first adjustment type to get started'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    // Data rows
                                    filteredAdjustmentTypes.map((adjustmentType) => {
                                        const store = stores.find((s) => s.id === adjustmentType.store_id);
                                        return (
                                            <tr key={adjustmentType.id} className="transition-colors hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">{adjustmentType.type}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{adjustmentType.description}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{store ? store.name : 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{adjustmentType.created_at ? new Date(adjustmentType.created_at).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="relative inline-block">
                                                        <button className="rounded-md p-1 transition-colors hover:bg-gray-100">
                                                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Modal */}
                <CreateAdjustmentTypeModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        refetchAdjustmentTypes();
                    }}
                />
            </div>
        </div>
    );
};

export default AdjustmentTypesPage;
