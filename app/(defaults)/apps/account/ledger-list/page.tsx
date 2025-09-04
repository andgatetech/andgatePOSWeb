'use client';

import { Building2, Edit, Eye, FileText, Filter, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import CreateLedgerModal from './__component/LedgerModal';
import { useAllStoresQuery } from '@/store/features/store/storeApi';

const LedgerList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStore, setSelectedStore] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, ledger: null });
    const { data: st } = useAllStoresQuery();

    const stores = st?.data || [];

    // Fetch ledgers with RTK Query
    const {
        data: ledgersResponse,
        isLoading,
        isError,
        refetch,
    } = useGetLedgersQuery({
        search: searchTerm,
        store_id: selectedStore,
        page: currentPage,
        per_page: 10,
    });

    const ledgers = ledgersResponse?.data || [];
    const pagination = ledgersResponse?.meta || {};

    // Reset page when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStore]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDelete = (ledger) => {
        setDeleteModal({ show: true, ledger });
    };

    const confirmDelete = async () => {
        // Implement delete logic here
        console.log('Deleting ledger:', deleteModal.ledger);
        setDeleteModal({ show: false, ledger: null });
    };

    const renderPagination = () => {
        if (!pagination.last_page || pagination.last_page <= 1) return null;

        const pages = Array.from({ length: pagination.last_page }, (_, i) => i + 1);

        return (
            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
                <div className="text-sm text-slate-600">
                    Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} results
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>

                    {pages.map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`rounded-lg px-3 py-2 text-sm transition-colors ${page === currentPage ? 'bg-blue-600 text-white' : 'border border-slate-300 hover:bg-slate-50'}`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.last_page}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="rounded-t-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-white/20 p-3">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Ledger Management</h1>
                                    <p className="mt-1 text-blue-100">Manage your accounting ledgers efficiently</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 rounded-lg bg-white/20 px-6 py-3 font-medium transition-all duration-200 hover:scale-105 hover:bg-white/30"
                            >
                                <Plus size={20} />
                                Create Ledger
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="border-b border-slate-200 p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search ledgers by title..."
                                    className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Store Filter */}
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <select
                                    className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    value={selectedStore}
                                    onChange={(e) => setSelectedStore(e.target.value)}
                                >
                                    <option value="">All Stores</option>
                                    {stores.map((store) => (
                                        <option key={store.id} value={store.id}>
                                            {store.store_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters */}
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedStore('');
                                }}
                                className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-slate-700 transition-colors hover:bg-slate-200"
                            >
                                <Filter size={16} />
                                Clear Filters
                            </button>

                            {/* Refresh */}
                            <button onClick={() => refetch()} className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-slate-700 transition-colors hover:bg-slate-200">
                                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <div className="text-center">
                                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                    <p className="text-slate-600">Loading ledgers...</p>
                                </div>
                            </div>
                        ) : isError ? (
                            <div className="py-12 text-center">
                                <div className="mb-4 text-6xl">⚠️</div>
                                <h3 className="mb-2 text-xl font-semibold text-slate-600">Error loading ledgers</h3>
                                <p className="mb-4 text-slate-400">Something went wrong. Please try again.</p>
                                <button onClick={() => refetch()} className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
                                    Retry
                                </button>
                            </div>
                        ) : ledgers.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="mb-4 text-6xl">📚</div>
                                <h3 className="mb-2 text-xl font-semibold text-slate-600">No ledgers found</h3>
                                <p className="mb-4 text-slate-400">{searchTerm || selectedStore ? 'Try adjusting your search criteria' : 'Create your first ledger to get started'}</p>
                                <button onClick={() => setIsModalOpen(true)} className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
                                    Create Ledger
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-200">
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">ID</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Title</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Store</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Created</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ledgers.map((ledger, index) => (
                                                <tr key={ledger.id} className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                                                    <td className="px-4 py-4">
                                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">#{ledger.id}</span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="rounded-lg bg-blue-100 p-2">
                                                                <FileText className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <span className="font-medium text-slate-900">{ledger.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-slate-400" />
                                                            <span className="text-slate-600">{ledger.store?.name || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-slate-500">{ledger.created_at ? new Date(ledger.created_at).toLocaleDateString() : 'N/A'}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex gap-2">
                                                            <button className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50">
                                                                <Eye size={16} />
                                                            </button>
                                                            <button className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-50">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button onClick={() => handleDelete(ledger)} className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {renderPagination()}
                            </>
                        )}
                    </div>
                </div>

                {/* Create Ledger Modal */}
                <CreateLedgerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} stores={stores} />

                {/* Delete Confirmation Modal */}
                {deleteModal.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                            <h3 className="mb-4 text-lg font-semibold text-slate-900">Confirm Delete</h3>
                            <p className="mb-6 text-slate-600">Are you sure you want to delete the ledger "{deleteModal.ledger?.title}"? This action cannot be undone.</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteModal({ show: false, ledger: null })}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button onClick={confirmDelete} className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LedgerList;
