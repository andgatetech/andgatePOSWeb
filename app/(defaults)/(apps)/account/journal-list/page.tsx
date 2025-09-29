'use client';
import Dropdown from '@/components/dropdown';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetJournalsQuery } from '@/store/features/journals/journals';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Edit, MoreVertical, Plus, RotateCcw, Search, Store, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CreateJournalModal from './__components/CreateJournalModal';

// Filters Component
const JournalFilters = ({ filters, onFiltersChange, ledgers, isLoadingLedgers, currentStoreId }) => {
    const handleFilterChange = (key, value) => {
        onFiltersChange({ ...filters, [key]: value, page: 1 });
    };

    const handleReset = () => {
        const resetFilters = {
            search: '',
            ledger_id: '',
            store_id: currentStoreId || '',
            per_page: 10,
            page: 1,
        };
        onFiltersChange(resetFilters);
    };

    return (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search journal entries..."
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Ledger Filter */}
                <div>
                    <select
                        value={filters.ledger_id || ''}
                        onChange={(e) => handleFilterChange('ledger_id', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        disabled={isLoadingLedgers}
                    >
                        <option value="">All Ledgers</option>
                        {ledgers?.data?.data?.map((ledger) => (
                            <option key={ledger.id} value={ledger.id}>
                                {ledger.title}
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

                {/* Reset Button */}
                <div>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-600 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        title="Reset Filters"
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span className="text-sm">Reset</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Journal Table Component
const JournalTable = ({ journals, isLoading, sortField, sortDirection, onSort }) => {
    if (isLoading) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading journal entries...</p>
                </div>
            </div>
        );
    }

    if (!journals || journals.length === 0) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-8 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No journal entries found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
            </div>
        );
    }

    const formatCurrency = (amount) => {
        return `৳${parseFloat(amount).toLocaleString()}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th
                                className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-200"
                                onClick={() => onSort('created_at')}
                            >
                                <div className="flex items-center gap-2">
                                    Date
                                    {sortField === 'created_at' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                </div>
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Ledger</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Notes</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Debit</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Credit</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Balance</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">User</th>
                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {journals.map((journal, index) => (
                            <tr key={journal.id} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="px-4 py-4">
                                    <div className="text-sm font-medium text-gray-900">{formatDate(journal.created_at)}</div>
                                    <div className="text-xs text-gray-500">ID: {journal.id}</div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="text-sm font-medium text-gray-900">{journal.ledger?.title || '-'}</div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="max-w-xs truncate text-sm text-gray-900" title={journal.notes}>
                                        {journal.notes}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`text-sm font-medium ${parseFloat(journal.debit) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                        {parseFloat(journal.debit) > 0 ? formatCurrency(journal.debit) : '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`text-sm font-medium ${parseFloat(journal.credit) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                        {parseFloat(journal.credit) > 0 ? formatCurrency(journal.credit) : '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            parseFloat(journal.balance) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {formatCurrency(journal.balance)}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="text-sm font-medium text-gray-900">{journal.user?.name || '-'}</div>
                                    <div className="text-xs text-gray-500">{journal.user?.email || '-'}</div>
                                </td>
                                <td className="px-4 py-4">
                                    <Dropdown
                                        offset={[0, 5]}
                                        placement="bottom-end"
                                        btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        button={<MoreVertical className="h-5 w-5" />}
                                    >
                                        <ul className="min-w-[140px] rounded-lg border bg-white shadow-lg">
                                            <li>
                                                <button onClick={() => {}} className="flex w-full items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Entry
                                                </button>
                                            </li>
                                            <li className="border-t">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`Are you sure you want to delete this journal entry? This action cannot be undone.`)) {
                                                            // Handle delete
                                                        }
                                                    }}
                                                    className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Entry
                                                </button>
                                            </li>
                                        </ul>
                                    </Dropdown>
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
        <div className="rounded-b-xl border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                    Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{total}</span> results
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onPageChange(current_page - 1)}
                        disabled={current_page === 1}
                        className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {getPageNumbers().map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`relative inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                page === current_page ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => onPageChange(current_page + 1)}
                        disabled={current_page === last_page}
                        className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Journal List Component
const JournalListSystem = () => {
    const { currentStoreId, currentStore } = useCurrentStore();

    const [filters, setFilters] = useState({
        search: '',
        ledger_id: '',
        per_page: 10,
        page: 1,
        store_id: currentStoreId || '',
    });

    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');

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

    // Redux queries
    const { data: ledgersData, isLoading: isLoadingLedgers } = useGetLedgersQuery({ store_id: currentStoreId });
    const { data: journalsData, isLoading: isLoadingJournals, error } = useGetJournalsQuery(filters);

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handlePageChange = (page) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        toast.success('Journal entry created successfully!');
    };

    const journals = journalsData?.data || [];

    // Sort journals
    const sortedJournals = [...journals].sort((a, b) => {
        let aValue = a[sortField] || '';
        let bValue = b[sortField] || '';

        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="mx-auto">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-red-800">Error loading journal entries. Please try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 shadow-md">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Journal Management</h1>
                                    <p className="text-sm text-gray-500">
                                        {currentStore ? `Manage journal entries for ${currentStore.store_name}` : 'Manage and view journal entries for your accounting records'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                                <Plus className="h-4 w-4" />
                                Create Entry
                            </button>
                        </div>
                        {currentStore && (
                            <div className="rounded-lg bg-green-50 p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                                        <Store className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-green-900">Current Store: {currentStore.store_name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <JournalFilters filters={filters} onFiltersChange={handleFiltersChange} ledgers={ledgersData} isLoadingLedgers={isLoadingLedgers} currentStoreId={currentStoreId} />

                {/* Journal Table */}
                <JournalTable journals={sortedJournals} isLoading={isLoadingJournals} sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />

                {/* Pagination */}
                {journalsData?.meta && <Pagination meta={journalsData.meta} onPageChange={handlePageChange} />}

                {/* Create Journal Modal */}
                <CreateJournalModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />
            </div>
        </div>
    );
};

export default JournalListSystem;
