'use client';

import { Search, RefreshCw, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

const JournalFilters = ({ filters, stores, onFilterChange, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onFilterChange({ search: searchTerm });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleStoreChange = (e) => {
        onFilterChange({ store_id: e.target.value });
    };

    const handlePerPageChange = (e) => {
        onFilterChange({ per_page: parseInt(e.target.value) });
    };

    const clearFilters = () => {
        setSearchTerm('');
        onFilterChange({
            search: '',
            store_id: '',
            per_page: 10,
        });
    };

    return (
        <div className="border-b border-slate-200 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                {/* Search Input */}
                <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by notes or ledger name..."
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Store Filter */}
                <div className="relative">
                    <select
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        value={filters.store_id || ''}
                        onChange={handleStoreChange}
                    >
                        <option value="">All Stores</option>
                        {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.store_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Per Page */}
                <div className="relative">
                    <select
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        value={filters.per_page}
                        onChange={handlePerPageChange}
                    >
                        <option value={10}>10 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={onRefresh}
                        className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                        title="Refresh data"
                    >
                        <RefreshCw size={16} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <button
                        onClick={clearFilters}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        title="Clear all filters"
                    >
                        <Filter size={16} />
                        <span className="hidden sm:inline">Clear</span>
                    </button>
                </div>
            </div>

            {/* Active Filters Display */}
            {(filters.search || filters.store_id) && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Active filters:</span>

                    {filters.search && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                            Search: "{filters.search}"
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    onFilterChange({ search: '' });
                                }}
                                className="ml-1 hover:text-emerald-900"
                            >
                                ×
                            </button>
                        </span>
                    )}

                    {filters.store_id && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            Store: {stores.find((s) => s.id == filters.store_id)?.name || 'Unknown'}
                            <button onClick={() => onFilterChange({ store_id: '' })} className="ml-1 hover:text-blue-900">
                                ×
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default JournalFilters;
