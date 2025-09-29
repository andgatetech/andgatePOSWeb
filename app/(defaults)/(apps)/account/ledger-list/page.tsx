'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useDeleteLedgerMutation, useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { useFullStoreListWithFilterQuery } from '@/store/features/store/storeApi';
import { BookText, ChevronLeft, ChevronRight, Eye, MoreVertical, Plus, Search, Store, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import CreateLedgerModal from './__component/CreateLedgerModal';

// Action Dropdown Component
const ActionDropdown = ({ ledger, onView, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleView = () => {
        onView(ledger.id);
        setIsOpen(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ledger "${ledger.title}"? This action cannot be undone.`)) {
            onDelete(ledger.id);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <button onClick={handleView} className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Eye className="mr-3 h-4 w-4" />
                        View Journals
                    </button>
                    <button onClick={handleDelete} className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                        <Trash2 className="mr-3 h-4 w-4" />
                        Delete Ledger
                    </button>
                </div>
            )}
        </div>
    );
};

// Filters Component
const LedgerFilters = ({ filters, onFiltersChange, stores, isLoadingStores }) => {
    const handleFilterChange = (key, value) => {
        onFiltersChange({ ...filters, [key]: value, page: 1 }); // Reset to page 1 when filtering
    };

    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search ledgers..."
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Store Filter */}
                <div>
                    <select
                        value={filters.store_id || ''}
                        onChange={(e) => handleFilterChange('store_id', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        disabled={isLoadingStores}
                    >
                        <option value="">All Stores</option>
                        {stores?.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.store_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Per Page */}
                <div>
                    <select
                        value={filters.per_page || 10}
                        onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

// Ledger Table Component
const LedgerTable = ({ ledgers, isLoading, onView, onDelete }) => {
    if (isLoading) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading ledgers...</p>
                </div>
            </div>
        );
    }

    if (!ledgers || ledgers.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="p-8 text-center">
                    <BookText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No ledgers found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ledger</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Store</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Journal Count</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {ledgers.map((ledger) => (
                            <tr key={ledger.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <BookText className="mr-3 h-5 w-5 text-blue-500" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{ledger.title}</div>
                                            <div className="text-sm text-gray-500">ID: {ledger.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <Store className="mr-2 h-4 w-4 text-purple-500" />
                                        <div className="text-sm text-gray-900">{ledger.store?.store_name}</div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">{ledger.journals?.length || 0} entries</span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(ledger.created_at)}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <ActionDropdown ledger={ledger} onView={onView} onDelete={onDelete} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Pagination Component
const Pagination = ({ meta, onPageChange }) => {
    if (!meta || meta.last_page <= 1) {
        return null;
    }

    const { current_page, last_page, total, per_page } = meta;

    const getPageNumbers = () => {
        const pages = [];
        const showPages = 5;
        const halfShow = Math.floor(showPages / 2);

        let start = Math.max(1, current_page - halfShow);
        let end = Math.min(last_page, current_page + halfShow);

        if (end - start < showPages - 1) {
            if (start === 1) {
                end = Math.min(last_page, start + showPages - 1);
            } else {
                start = Math.max(1, end - showPages + 1);
            }
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    const startItem = (current_page - 1) * per_page + 1;
    const endItem = Math.min(current_page * per_page, total);

    return (
        <div className="rounded-b-lg border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                    Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{total}</span> results
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onPageChange(current_page - 1)}
                        disabled={current_page === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    {getPageNumbers().map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${
                                page === current_page ? 'z-10 border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => onPageChange(current_page + 1)}
                        disabled={current_page === last_page}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Ledger List Component
const LedgerListSystem = () => {
    const router = useRouter();
    const { currentStoreId, currentStore } = useCurrentStore();

    const [filters, setFilters] = useState({
        search: '',
        store_id: currentStoreId || '',
        per_page: 10,
        page: 1,
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

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Redux queries and mutations
    const { data: storesData, isLoading: isLoadingStores } = useFullStoreListWithFilterQuery();
    console.log('storesData', storesData);
    const { data: ledgersData, isLoading: isLoadingLedgers, error } = useGetLedgersQuery(filters);
    const [deleteLedger, { isLoading: isDeleting }] = useDeleteLedgerMutation();

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handlePageChange = (page) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        toast.success('Ledger created successfully!');
    };

    const handleViewLedger = (ledgerId) => {
        router.push(`/apps/account/ledger-list/${ledgerId}`);
    };

    const handleDeleteLedger = async (ledgerId) => {
        try {
            await deleteLedger(ledgerId).unwrap();
            toast.success('Ledger deleted successfully!');
        } catch (error) {
            console.error('Failed to delete ledger:', error);
            toast.error('Failed to delete ledger. Please try again.');
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-red-800">Error loading ledgers. Please try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center text-2xl font-bold text-gray-900">
                            <BookText className="mr-2 h-6 w-6" />
                            Ledger Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage and organize your accounting ledgers
                            {currentStore && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                                    <Store className="mr-1 h-3 w-3" />
                                    {currentStore.store_name}
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Create Ledger Button */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Ledger
                    </button>
                </div>

                {/* Filters */}
                <LedgerFilters filters={filters} onFiltersChange={handleFiltersChange} stores={storesData?.data} isLoadingStores={isLoadingStores} />

                {/* Ledger Table */}
                <LedgerTable ledgers={ledgersData?.data?.data} isLoading={isLoadingLedgers || isDeleting} onView={handleViewLedger} onDelete={handleDeleteLedger} />

                {/* Pagination */}
                {ledgersData?.data?.meta && <Pagination meta={ledgersData.data.meta} onPageChange={handlePageChange} />}

                {/* Create Ledger Modal */}
                <CreateLedgerModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />
            </div>
        </div>
    );
};

export default LedgerListSystem;
