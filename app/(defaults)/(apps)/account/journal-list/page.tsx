'use client';
// import { useDeleteJournalMutation, useGetJournalsQuery } from '@/store/features/journal/journalApi';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetJournalsQuery } from '@/store/features/journals/journals';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { BookOpen, ChevronLeft, ChevronRight, MoreVertical, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import CreateJournalModal from './__components/CreateJournalModal';

// Action Dropdown Component
const ActionDropdown = ({ journal }) => {
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

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete this journal entry? This action cannot be undone.`)) {
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
                    <button className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                        <Trash2 className="mr-3 h-4 w-4" />
                        Delete Entry
                    </button>
                </div>
            )}
        </div>
    );
};

// Filters Component
const JournalFilters = ({ filters, onFiltersChange, ledgers, isLoadingLedgers }) => {
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
            </div>
        </div>
    );
};

// Journal Table Component
const JournalTable = ({ journals, isLoading }) => {
    if (isLoading) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading journal entries...</p>
                </div>
            </div>
        );
    }

    if (!journals || journals.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
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
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ledger</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Notes</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Debit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Credit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Balance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {journals.map((journal) => (
                            <tr key={journal.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{formatDate(journal.created_at)}</div>
                                    <div className="text-sm text-gray-500">ID: {journal.id}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{journal.ledger?.title}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="max-w-xs truncate text-sm text-gray-900" title={journal.notes}>
                                        {journal.notes}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`text-sm font-medium ${parseFloat(journal.debit) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                        {parseFloat(journal.debit) > 0 ? formatCurrency(journal.debit) : '-'}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`text-sm font-medium ${parseFloat(journal.credit) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                        {parseFloat(journal.credit) > 0 ? formatCurrency(journal.credit) : '-'}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`text-sm font-medium ${parseFloat(journal.balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(journal.balance)}</span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm text-gray-900">{journal.user?.name}</div>
                                    <div className="text-sm text-gray-500">{journal.user?.email}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <ActionDropdown journal={journal} />
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

        // Adjust if we're near the beginning or end
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

// Main Journal List Component
const JournalListSystem = () => {
    const { currentStoreId } = useCurrentStore();

    const [filters, setFilters] = useState({
        search: '',
        ledger_id: '',
        per_page: 10,
        page: 1,
        store_id: currentStoreId,
    });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Update filters when store changes
    useEffect(() => {
        setFilters((prev) => ({ ...prev, store_id: currentStoreId }));
    }, [currentStoreId]);

    // Redux queries and mutations
    const { data: ledgersData, isLoading: isLoadingLedgers } = useGetLedgersQuery({ store_id: currentStoreId });
    const { data: journalsData, isLoading: isLoadingJournals, error } = useGetJournalsQuery(filters);
    // const [deleteJournal, { isLoading: isDeleting }] = useDeleteJournalMutation();

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

    // const handleDeleteJournal = async (journalId) => {
    //     try {
    //         await deleteJournal(journalId).unwrap();
    //         toast.success('Journal entry deleted successfully!');
    //     } catch (error) {
    //         console.error('Failed to delete journal entry:', error);
    //         toast.error('Failed to delete journal entry. Please try again.');
    //     }
    // };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-red-800">Error loading journal entries. Please try again.</p>
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
                            <BookOpen className="mr-2 h-6 w-6" />
                            Journal Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">Manage and view journal entries for your accounting records</p>
                    </div>

                    {/* Create Journal Button */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Entry
                    </button>
                </div>

                {/* Filters */}
                <JournalFilters filters={filters} onFiltersChange={handleFiltersChange} ledgers={ledgersData} isLoadingLedgers={isLoadingLedgers} />

                {/* Journal Table */}
                <JournalTable journals={journalsData?.data} isLoading={isLoadingJournals} />

                {/* Pagination */}
                {journalsData?.meta && <Pagination meta={journalsData.meta} onPageChange={handlePageChange} />}

                {/* Create Journal Modal */}
                <CreateJournalModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />
            </div>
        </div>
    );
};

export default JournalListSystem;
