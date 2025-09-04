'use client';
import { useGetJournalsQuery } from '@/store/features/journals/journals';
import { Plus, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import JournalCreateModal from '../__components/JournalCreateModal';
import JournalFilters from '../__components/JournalFilters';
import JournalPagination from '../__components/JournalPagination';
import JournalTable from '../__components/JournalTable';

const JournalList = () => {
    const [filters, setFilters] = useState({
        search: '',
        store_id: '',
        per_page: 10,
        page: 1,
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [stores, setStores] = useState([]);

    const token = useSelector((state) => state.auth.token);

    // RTK Query for fetching journals
    const { data: journalData, isLoading, isError, refetch } = useGetJournalsQuery(filters);

    const journals = journalData?.data || [];
    const pagination = journalData
        ? {
              current_page: journalData.current_page,
              last_page: journalData.last_page,
              per_page: journalData.per_page,
              total: journalData.total,
              from: journalData.from,
              to: journalData.to,
          }
        : null;

    // Fetch stores for filter dropdown
    const fetchStores = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/stores', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                setStores(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters, page: 1 });
    };

    const handlePageChange = (page) => {
        setFilters({ ...filters, page });
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        refetch();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="rounded-t-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">Journal Management</h1>
                                <p className="mt-1 text-emerald-100">Track your accounting journal entries</p>
                            </div>
                            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 transition-all duration-200 hover:bg-white/30">
                                <Plus size={20} />
                                Create Journal Entry
                            </button>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <JournalFilters filters={filters} stores={stores} onFilterChange={handleFilterChange} onRefresh={refetch} />
                </div>

                {/* Journal Table */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600"></div>
                                    <p className="text-slate-600">Loading journal entries...</p>
                                </div>
                            </div>
                        ) : isError ? (
                            <div className="py-12 text-center">
                                <div className="mb-4 text-6xl">⚠️</div>
                                <h3 className="mb-2 text-xl font-semibold text-slate-600">Error loading journals</h3>
                                <p className="mb-4 text-slate-400">Something went wrong while fetching journal entries</p>
                                <button onClick={refetch} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700">
                                    <RefreshCw size={16} />
                                    Try Again
                                </button>
                            </div>
                        ) : journals.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="mb-4 text-6xl">📚</div>
                                <h3 className="mb-2 text-xl font-semibold text-slate-600">No journal entries found</h3>
                                <p className="mb-4 text-slate-400">Create your first journal entry to get started</p>
                                <button onClick={() => setShowCreateModal(true)} className="rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700">
                                    Create Journal Entry
                                </button>
                            </div>
                        ) : (
                            <>
                                <JournalTable journals={journals} />

                                {/* Pagination */}
                                {pagination && pagination.last_page > 1 && <JournalPagination pagination={pagination} onPageChange={handlePageChange} />}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && <JournalCreateModal onClose={() => setShowCreateModal(false)} onSuccess={handleCreateSuccess} />}
        </div>
    );
};

export default JournalList;
