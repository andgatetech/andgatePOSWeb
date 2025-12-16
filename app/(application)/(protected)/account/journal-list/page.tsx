'use client';
import UpdateJournalModal from '@/components/custom/UpdateJournalModal';
import Dropdown from '@/components/dropdown';
import JournalFilter from '@/components/filters/JournalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useDeleteJournalMutation, useGetJournalsQuery } from '@/store/features/journals/journals';
import { BookOpen, ChevronDown, ChevronUp, Edit, MoreVertical, Plus, Store, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import CreateJournalModal from './__components/CreateJournalModal';

// Journal Table Component
const JournalTable = ({ journals, isLoading, onEdit, onDelete, sortField, sortDirection, onSort }) => {
    if (isLoading) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
                    <p className="mt-2 text-sm text-gray-600 sm:text-base">Loading journal entries...</p>
                </div>
            </div>
        );
    }

    if (!journals || journals.length === 0) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-6 text-center sm:p-8">
                    <BookOpen className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No journal entries found</h3>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">Try adjusting your search or filter criteria.</p>
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
        <>
            {/* Desktop Table View */}
            <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm lg:block">
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
                                <tr key={journal.id} className={`transition-colors hover:bg-green-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-4 py-4">
                                        <div className="text-sm font-medium text-gray-900">{formatDate(journal.created_at)}</div>
                                        <div className="text-xs text-gray-500">ID: {journal.id}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-sm font-medium text-gray-900">{journal.ledger?.title || '-'}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="max-w-xs truncate text-sm text-gray-900" title={journal.notes}>
                                            {journal.notes || '-'}
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
                                                    <button onClick={() => onEdit(journal)} className="flex w-full items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Entry
                                                    </button>
                                                </li>
                                                <li className="border-t">
                                                    <button
                                                        onClick={() => onDelete(journal.id, journal.notes)}
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

            {/* Mobile/Tablet Card View */}
            <div className="space-y-4 lg:hidden">
                {journals.map((journal) => (
                    <div key={journal.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                        <div className="p-4">
                            {/* Header */}
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="h-14 w-14 flex-shrink-0 sm:h-16 sm:w-16">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-100 sm:h-16 sm:w-16">
                                            <BookOpen className="h-7 w-7 text-green-600 sm:h-8 sm:w-8" />
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg">{journal.ledger?.title || 'N/A'}</h3>
                                        <p className="text-xs text-gray-500 sm:text-sm">{formatDate(journal.created_at)}</p>
                                        <p className="text-xs text-gray-400">ID: {journal.id}</p>
                                    </div>
                                </div>
                                <Dropdown
                                    offset={[0, 5]}
                                    placement="bottom-end"
                                    btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    button={<MoreVertical className="h-5 w-5" />}
                                >
                                    <ul className="min-w-[140px] rounded-lg border bg-white shadow-lg">
                                        <li>
                                            <button onClick={() => onEdit(journal)} className="flex w-full items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Entry
                                            </button>
                                        </li>
                                        <li className="border-t">
                                            <button onClick={() => onDelete(journal.id, journal.notes)} className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Entry
                                            </button>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 border-t border-gray-100 pt-3">
                                {/* Notes */}
                                <div>
                                    <p className="text-xs font-medium text-gray-500 sm:text-sm">Notes</p>
                                    <p className="mt-0.5 text-xs text-gray-700 sm:text-sm">{journal.notes || '-'}</p>
                                </div>

                                {/* Financial Info */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Debit</p>
                                        <p className={`mt-0.5 text-xs font-semibold sm:text-sm ${parseFloat(journal.debit) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                            {parseFloat(journal.debit) > 0 ? formatCurrency(journal.debit) : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Credit</p>
                                        <p className={`mt-0.5 text-xs font-semibold sm:text-sm ${parseFloat(journal.credit) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                            {parseFloat(journal.credit) > 0 ? formatCurrency(journal.credit) : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Balance</p>
                                        <p className="mt-0.5">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    parseFloat(journal.balance) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {formatCurrency(journal.balance)}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Created By</p>
                                    <p className="mt-0.5 text-xs text-gray-700 sm:text-sm">{journal.user?.name || '-'}</p>
                                    <p className="text-xs text-gray-500">{journal.user?.email || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

// Main Journal Management Component
const JournalManagement = () => {
    const { currentStoreId, currentStore } = useCurrentStore();
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedJournal, setSelectedJournal] = useState(null);

    const [apiParams, setApiParams] = useState({
        store_ids: 'all',
        start_date: '',
        end_date: '',
        search: '',
        ledger_id: '',
        per_page: 10,
        page: 1,
    });

    // Build query parameters correctly
    const queryParams = (() => {
        if (apiParams.store_ids === 'all') {
            return {
                ...apiParams,
                store_ids: 'all',
                store_id: undefined,
            };
        }

        if (apiParams.store_id && apiParams.store_id !== 'all') {
            return {
                ...apiParams,
                store_ids: undefined,
            };
        }

        return apiParams;
    })();

    const { data: journalsResponse, error, isLoading } = useGetJournalsQuery(queryParams);
    const [deleteJournal] = useDeleteJournalMutation();

    // Reset filter when current store changes
    useEffect(() => {

        setApiParams({
            store_ids: 'all',
            start_date: '',
            end_date: '',
            search: '',
            ledger_id: '',
            per_page: 10,
            page: 1,
        });
    }, [currentStoreId]);

    // Handle filter changes
    const handleFilterChange = useCallback((newApiParams) => {


        if (newApiParams.store_id === 'all') {
            setApiParams({
                ...newApiParams,
                store_ids: 'all',
                store_id: undefined,
            });
        } else {
            setApiParams(newApiParams);
        }
    }, []);

    const journals = journalsResponse?.data?.data || [];
    const meta = journalsResponse?.data?.meta;

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

    const handleEditJournal = (journal) => {
        setSelectedJournal(journal);
        setIsUpdateModalOpen(true);
    };

    const handleDeleteJournal = async (journalId, journalNotes) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert this journal entry: "${journalNotes?.substring(0, 50) || 'Entry'}"!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                await deleteJournal(journalId).unwrap();
                toast.dismiss();
                toast.success('Journal entry deleted successfully', { toastId: 'delete-journal' });
            } catch (error) {

                toast.dismiss();
                toast.error('Failed to delete journal entry', { toastId: 'delete-journal-error' });
            }
        }
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        toast.dismiss();
        toast.success('Journal entry created successfully!', { toastId: 'create-journal' });
    };

    const handleUpdateSuccess = () => {
        setIsUpdateModalOpen(false);
        setSelectedJournal(null);
        toast.dismiss();
        toast.success('Journal entry updated successfully!', { toastId: 'update-journal' });
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4">
                <div className="mx-auto">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-800 sm:text-base">Error loading journal entries. Please try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 lg:p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-sm sm:p-6">
                        <div className="mb-4 sm:mb-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 shadow-md sm:h-12 sm:w-12">
                                        <BookOpen className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">Journal Management</h1>
                                        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                            {currentStore ? (
                                                <span className="hidden sm:inline">Manage journal entries for {currentStore.store_name}</span>
                                            ) : (
                                                <span className="hidden sm:inline">Manage and view your accounting journal entries</span>
                                            )}
                                            <span className="sm:hidden">Manage your journals</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto sm:px-5 sm:py-2.5"
                                >
                                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="hidden sm:inline">Create Entry</span>
                                    <span className="sm:hidden">Create New</span>
                                </button>
                            </div>
                        </div>

                        {currentStore && (
                            <div className="rounded-lg bg-green-50 p-3 sm:p-4">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 sm:h-8 sm:w-8">
                                        <Store className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-green-900 sm:text-sm">
                                            <span className="hidden sm:inline">Current Store: </span>
                                            {currentStore.store_name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-4 sm:mb-6">
                    <JournalFilter key={`journal-filter-${currentStoreId}`} onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />
                </div>

                {/* Journal Table/Cards */}
                <JournalTable
                    journals={sortedJournals}
                    isLoading={isLoading}
                    onEdit={handleEditJournal}
                    onDelete={handleDeleteJournal}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                />

                {/* Pagination info */}
                {meta && (
                    <div className="mt-4 rounded-lg bg-white p-3 text-center text-sm text-gray-600 shadow-sm">
                        Showing {meta.from || 0} to {meta.to || 0} of {meta.total || 0} entries
                    </div>
                )}

                {/* Modals */}
                <CreateJournalModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />

                {selectedJournal && <UpdateJournalModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} onSuccess={handleUpdateSuccess} journal={selectedJournal} />}
            </div>
        </div>
    );
};

export default JournalManagement;
