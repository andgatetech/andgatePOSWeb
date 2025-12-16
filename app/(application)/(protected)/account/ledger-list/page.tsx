'use client';
import UpdateLedgerModal from '@/components/custom/UpdateLedgerModal';
import Dropdown from '@/components/dropdown';
import LedgerFilter from '@/components/filters/LedgerFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useDeleteLedgerMutation, useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { BookText, ChevronDown, ChevronUp, Edit, Eye, MoreVertical, Plus, Store, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import CreateLedgerModal from './__component/CreateLedgerModal';

// Ledger Table Component (unchanged)
const LedgerTable = ({ ledgers, isLoading, onView, onEdit, onDelete, sortField, sortDirection, onSort }) => {
    if (isLoading) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-600 sm:text-base">Loading ledgers...</p>
                </div>
            </div>
        );
    }

    if (!ledgers || ledgers.length === 0) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="p-6 text-center sm:p-8">
                    <BookText className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No ledgers found</h3>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">Try adjusting your search or filter criteria.</p>
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
        <>
            {/* Desktop Table View */}
            <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th
                                    className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-200"
                                    onClick={() => onSort('title')}
                                >
                                    <div className="flex items-center gap-2">
                                        Ledger
                                        {sortField === 'title' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Store</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Journal Count</th>
                                <th
                                    className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-200"
                                    onClick={() => onSort('created_at')}
                                >
                                    <div className="flex items-center gap-2">
                                        Created
                                        {sortField === 'created_at' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {ledgers.map((ledger, index) => (
                                <tr key={ledger.id} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 flex-shrink-0">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                                    <BookText className="h-6 w-6 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">{ledger.title}</div>
                                                <div className="text-xs text-gray-500">ID: {ledger.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center">
                                            <Store className="mr-2 h-4 w-4 text-purple-500" />
                                            <div className="text-sm font-medium text-gray-900">{ledger.store?.store_name || '-'}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                            {ledger.journals?.length || 0} entries
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">{formatDate(ledger.created_at)}</td>
                                    <td className="px-4 py-4">
                                        <Dropdown
                                            offset={[0, 5]}
                                            placement="bottom-end"
                                            btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            button={<MoreVertical className="h-5 w-5" />}
                                        >
                                            <ul className="min-w-[140px] rounded-lg border bg-white shadow-lg">
                                                {/* <li>
                                                    <button onClick={() => onView(ledger.id)} className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Journals
                                                    </button>
                                                </li> */}
                                                <li>
                                                    <button onClick={() => onEdit(ledger)} className="flex w-full items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Ledger
                                                    </button>
                                                </li>
                                                <li className="border-t">
                                                    <button
                                                        onClick={() => onDelete(ledger.id, ledger.title)}
                                                        className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Ledger
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
                {ledgers.map((ledger) => (
                    <div key={ledger.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                        <div className="p-4">
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="h-14 w-14 flex-shrink-0 sm:h-16 sm:w-16">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-100 sm:h-16 sm:w-16">
                                            <BookText className="h-7 w-7 text-blue-600 sm:h-8 sm:w-8" />
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg">{ledger.title}</h3>
                                        <p className="text-xs text-gray-500 sm:text-sm">ID: {ledger.id}</p>
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
                                            <button onClick={() => onView(ledger.id)} className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Journals
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={() => onEdit(ledger)} className="flex w-full items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Ledger
                                            </button>
                                        </li>
                                        <li className="border-t">
                                            <button onClick={() => onDelete(ledger.id, ledger.title)} className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Ledger
                                            </button>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div>

                            <div className="space-y-2 border-t border-gray-100 pt-3">
                                <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-500">Store</p>
                                        <div className="mt-0.5 flex items-center">
                                            <Store className="mr-1 h-3 w-3 text-purple-500" />
                                            <p className="truncate text-gray-700">{ledger.store?.store_name || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-500">Journal Count</p>
                                        <p className="mt-0.5">
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                                {ledger.journals?.length || 0} entries
                                            </span>
                                        </p>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-500">Created</p>
                                        <p className="mt-0.5 text-gray-700">{formatDate(ledger.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

// Main Ledger Management Component
const LedgerManagement = () => {
    const router = useRouter();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [sortField, setSortField] = useState('title');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedLedger, setSelectedLedger] = useState(null);

    const [apiParams, setApiParams] = useState({
        store_ids: 'all',
        start_date: '',
        end_date: '',
        search: '',
    });

    // ✅ Build query parameters correctly
    const queryParams = (() => {
        // If "All Stores" is selected
        if (apiParams.store_ids === 'all') {
            return {
                ...apiParams,
                store_ids: 'all',
                store_id: undefined, // Remove single store_id
            };
        }

        // If a specific store is selected
        if (apiParams.store_id && apiParams.store_id !== 'all') {
            return {
                ...apiParams,
                store_ids: undefined, // Remove store_ids when single store is selected
            };
        }

        // Default: return as-is
        return apiParams;
    })();

    const { data: ledgersResponse, error, isLoading } = useGetLedgersQuery(queryParams);
    const [deleteLedger] = useDeleteLedgerMutation();

    // Reset filter when current store changes from sidebar
    useEffect(() => {
        console.log('Ledgers - Current store changed, resetting filters');
        setApiParams({
            store_ids: 'all',
            start_date: '',
            end_date: '',
            search: '',
        });
    }, [currentStoreId]);

    // Handle filter changes
    const handleFilterChange = useCallback((newApiParams) => {
        console.log('Filter changed:', newApiParams);

        // ✅ Normalize "All Stores" selection
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

    const ledgers = ledgersResponse?.data || [];

    // Sort ledgers
    const sortedLedgers = [...ledgers].sort((a, b) => {
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

    const handleViewLedger = (ledgerId) => {
        router.push(`/protected/account/ledger-list/${ledgerId}`);
    };

    const handleEditLedger = (ledger) => {
        setSelectedLedger(ledger);
        setIsUpdateModalOpen(true);
    };

    const handleDeleteLedger = async (ledgerId, ledgerTitle) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert "${ledgerTitle}"!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                await deleteLedger(ledgerId).unwrap();
                toast.dismiss();
                toast.success('Ledger deleted successfully', { toastId: 'delete-ledger' });
            } catch (error) {
                console.error('Error deleting ledger:', error);
                toast.dismiss();
                toast.error('Failed to delete ledger', { toastId: 'delete-ledger-error' });
            }
        }
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        toast.dismiss();
        toast.success('Ledger created successfully!', { toastId: 'create-ledger' });
    };

    const handleUpdateSuccess = () => {
        setIsUpdateModalOpen(false);
        setSelectedLedger(null);
        toast.dismiss();
        toast.success('Ledger updated successfully!', { toastId: 'update-ledger' });
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4">
                <div className="mx-auto">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-800 sm:text-base">Error loading ledgers. Please try again.</p>
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
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md sm:h-12 sm:w-12">
                                        <BookText className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">Ledger Management</h1>
                                        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                            {currentStore ? (
                                                <span className="hidden sm:inline">Manage ledgers for {currentStore.store_name}</span>
                                            ) : (
                                                <span className="hidden sm:inline">Manage and organize your accounting ledgers</span>
                                            )}
                                            <span className="sm:hidden">Manage your ledgers</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto sm:px-5 sm:py-2.5"
                                >
                                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="hidden sm:inline">Create Ledger</span>
                                    <span className="sm:hidden">Create New</span>
                                </button>
                            </div>
                        </div>

                        {currentStore && (
                            <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-8 sm:w-8">
                                        <Store className="h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-blue-900 sm:text-sm">
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
                    <LedgerFilter key={`ledger-filter-${currentStoreId}`} onFilterChange={handleFilterChange} currentStoreId={currentStoreId} />
                </div>

                {/* Ledger Table/Cards */}
                <LedgerTable
                    ledgers={sortedLedgers}
                    isLoading={isLoading}
                    onView={handleViewLedger}
                    onEdit={handleEditLedger}
                    onDelete={handleDeleteLedger}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                />

                {/* Modals */}
                <CreateLedgerModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />

                {selectedLedger && <UpdateLedgerModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} onSuccess={handleUpdateSuccess} ledger={selectedLedger} />}
            </div>
        </div>
    );
};

export default LedgerManagement;
