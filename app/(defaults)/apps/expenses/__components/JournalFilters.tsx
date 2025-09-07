'use client';

import { Search, RefreshCw, Filter, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

const JournalFilters = ({ filters, stores, ledgers, onFilterChange, onRefresh }) => {
    console.log('JournalFilters - Ledgers:', ledgers);
    console.log('JournalFilters - Selected store_id:', filters.store_id);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onFilterChange({ search: searchTerm });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, onFilterChange]);

    const handleStoreChange = (e) => {
        const storeId = e.target.value;
        // When store changes, clear ledger filter
        onFilterChange({
            store_id: storeId,
            ledger_id: '', // Reset ledger filter when store changes
        });
    };

    const handleLedgerChange = (e) => {
        onFilterChange({ ledger_id: e.target.value });
    };

    const handlePerPageChange = (e) => {
        onFilterChange({ per_page: parseInt(e.target.value) });
    };

    const clearFilters = () => {
        setSearchTerm('');
        onFilterChange({
            search: '',
            store_id: '',
            ledger_id: '',
            per_page: 10,
        });
    };

    // Filter ledgers based on selected store - check multiple possible store_id locations
    const filteredLedgers = filters.store_id
        ? ledgers.filter((ledger) => {
              // Check direct store_id
              if (ledger.store_id == filters.store_id) return true;

              // Check nested store.id
              if (ledger.store && ledger.store.id == filters.store_id) return true;

              // Check nested account.store_id
              if (ledger.account && ledger.account.store_id == filters.store_id) return true;

              return false;
          })
        : ledgers;

    console.log('Filtered ledgers:', filteredLedgers);

    const getSelectedStoreName = () => {
        return stores.find((s) => s.id == filters.store_id)?.store_name || 'Unknown';
    };

    const getSelectedLedgerName = () => {
        return ledgers.find((l) => l.id == filters.ledger_id)?.name || ledgers.find((l) => l.id == filters.ledger_id)?.title || 'Unknown';
    };

    return (
        <div className="border-b border-slate-200 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
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

                {/* Ledger Filter */}
                <div className="relative">
                    <select
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        value={filters.ledger_id || ''}
                        onChange={handleLedgerChange}
                        disabled={filters.store_id && filteredLedgers.length === 0}
                    >
                        <option value="">{filters.store_id ? 'All Ledgers (Selected Store)' : 'All Ledgers'}</option>
                        {filteredLedgers.map((ledger) => (
                            <option key={ledger.id} value={ledger.id}>
                                {ledger.name || ledger.title}
                                {ledger.account && ` (${ledger.account.name})`}
                                {ledger.type && ` - ${ledger.type.charAt(0).toUpperCase() + ledger.type.slice(1)}`}
                            </option>
                        ))}
                    </select>
                    {filters.store_id && filteredLedgers.length === 0 && (
                        <div className="absolute right-3 top-3 text-slate-400">
                            <BookOpen size={16} />
                        </div>
                    )}
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
            {(filters.search || filters.store_id || filters.ledger_id) && (
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
                            Store: {getSelectedStoreName()}
                            <button onClick={() => onFilterChange({ store_id: '', ledger_id: '' })} className="ml-1 hover:text-blue-900">
                                ×
                            </button>
                        </span>
                    )}

                    {filters.ledger_id && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                            Ledger: {getSelectedLedgerName()}
                            <button onClick={() => onFilterChange({ ledger_id: '' })} className="ml-1 hover:text-purple-900">
                                ×
                            </button>
                        </span>
                    )}
                </div>
            )}

            {/* Info message when store is selected but no ledgers found */}
            {filters.store_id && filteredLedgers.length === 0 && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-start gap-2">
                        <BookOpen size={16} className="mt-0.5 text-amber-600" />
                        <div className="text-sm text-amber-700">
                            <p className="mb-2">No ledgers found for the selected store.</p>
                            <details className="mb-2">
                                <summary className="cursor-pointer font-medium hover:text-amber-800">Show debug information</summary>
                                <div className="mt-2 rounded bg-amber-100 p-3 font-mono text-xs">
                                    <div className="space-y-2">
                                        <div>
                                            <strong>Selected Store ID:</strong> {filters.store_id}
                                        </div>
                                        <div>
                                            <strong>Total Ledgers:</strong> {ledgers.length}
                                        </div>
                                        <div>
                                            <strong>Filtered Ledgers:</strong> {filteredLedgers.length}
                                        </div>

                                        {ledgers.length > 0 && (
                                            <div>
                                                <strong>Sample Ledger Structure:</strong>
                                                <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-white p-2 text-xs">{JSON.stringify(ledgers[0], null, 2)}</pre>
                                            </div>
                                        )}

                                        {ledgers.length > 0 && (
                                            <div>
                                                <strong>All Ledger Store IDs:</strong>
                                                <div className="mt-1 rounded bg-white p-2">
                                                    {ledgers
                                                        .map((ledger, index) => (
                                                            <div key={index} className="text-xs">
                                                                Ledger {ledger.id}:{ledger.store_id && ` store_id=${ledger.store_id}`}
                                                                {ledger.store?.id && ` store.id=${ledger.store.id}`}
                                                                {ledger.account?.store_id && ` account.store_id=${ledger.account.store_id}`}
                                                            </div>
                                                        ))
                                                        .slice(0, 5)}
                                                    {ledgers.length > 5 && <div className="text-xs">... and {ledgers.length - 5} more</div>}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-2 rounded bg-blue-50 p-2">
                                            <strong>Possible Solutions:</strong>
                                            <ul className="mt-1 space-y-1 text-xs">
                                                <li>• Check if ledger has 'store_id' field</li>
                                                <li>• Check if ledger has nested 'store.id'</li>
                                                <li>• Check if ledger has 'account.store_id'</li>
                                                <li>• Verify the store-ledger relationship in your API</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </details>
                            <p className="text-xs">Try selecting a different store or clear the store filter.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JournalFilters;
