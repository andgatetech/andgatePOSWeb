'use client';

import { useGetLedgerJournalsQuery } from '@/store/features/ledger/ledger';
import { ArrowUpDown, Building2, Calendar, CalendarRange, ChevronLeft, ChevronRight, Clock, FileText, Filter, Search, Store, TrendingDown, TrendingUp, User, X, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

const JournalListPage = () => {
    const { id } = useParams();

    // Filter states
    const [filters, setFilters] = useState({
        store_id: '',
        user_id: '',
        user_name: '',
        notes: '',
        type: '', // 'debit' or 'credit'
        date: '',
        from_date: '',
        to_date: '',
        per_page: 10,
        page: 1,
    });

    const [showFilters, setShowFilters] = useState(false);
    const [dateFilterType, setDateFilterType] = useState('specific'); // 'specific' or 'range'

    // RTK Query calls
    // const { data: storesData, isLoading: storesLoading } = useAllStoresQuery();
    const {
        data: journalsData,
        isLoading: journalsLoading,
        error,
        refetch,
    } = useGetLedgerJournalsQuery({
        ledgerId: id,
        params: filters,
    });

    // const stores = storesData?.data || [];
    const journals = journalsData?.journals?.data || [];
    const pagination = journalsData?.journals || {};
    console.log(journals);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: 1, // Reset to first page when filters change
        }));
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            store_id: '',
            user_id: '',
            user_name: '',
            notes: '',
            type: '',
            date: '',
            from_date: '',
            to_date: '',
            per_page: 10,
            page: 1,
        });
        setDateFilterType('specific');
    };

    const formatCurrency = (amount) => {
        return `৳${new Intl.NumberFormat('en-BD', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0)}`;
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>

                    {pages.map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`rounded-lg px-3 py-2 text-sm transition-colors ${page === pagination.current_page ? 'bg-blue-600 text-white' : 'border border-slate-300 hover:bg-slate-50'}`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
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
                                <Link href="/apps/account/ledger-list" className="rounded-lg bg-white/20 p-2 transition-all duration-200 hover:bg-white/30">
                                    <ChevronLeft className="h-6 w-6" />
                                </Link>
                                <div className="rounded-lg bg-white/20 p-3">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">{journals[0] ? `${journals[0].ledger?.title} Journals` : 'Journal Entries'}</h1>
                                    <p className="mt-1 text-blue-100">Ledger ID: {id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 rounded-lg bg-white/20 px-6 py-3 font-medium transition-all duration-200 hover:scale-105 hover:bg-white/30"
                            >
                                <Filter size={20} />
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="border-b border-slate-200 p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="flex items-center text-lg font-semibold text-slate-900">
                                    <Filter className="mr-2 h-5 w-5 text-blue-600" />
                                    Filters & Search
                                </h3>
                                <button onClick={clearFilters} className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-200">
                                    <X size={16} />
                                    Clear All
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                {/* Store Filter */}
                                {/* <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <select
                                        value={filters.store_id}
                                        onChange={(e) => handleFilterChange('store_id', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        disabled={storesLoading}
                                    >
                                        <option value="">All Stores</option>
                                        {stores.map((store) => (
                                            <option key={store.id} value={store.id}>
                                                {store.name}
                                            </option>
                                        ))}
                                    </select>
                                </div> */}

                                {/* Type Filter */}
                                <div className="relative">
                                    <ArrowUpDown className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <select
                                        value={filters.type}
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="">All Types</option>
                                        <option value="debit">Debit</option>
                                        <option value="credit">Credit</option>
                                    </select>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by user or notes..."
                                        value={filters.search || ''}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                {/* Refresh */}
                                <button
                                    onClick={() => refetch()}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-slate-700 transition-colors hover:bg-slate-200"
                                >
                                    <RefreshCw size={16} className={journalsLoading ? 'animate-spin' : ''} />
                                    Refresh
                                </button>
                            </div>

                            {/* Date Filters */}
                            <div className="mt-6 border-t border-slate-200 pt-6">
                                <div className="mb-4 flex items-center space-x-6">
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <input
                                            type="radio"
                                            name="dateFilterType"
                                            value="specific"
                                            checked={dateFilterType === 'specific'}
                                            onChange={(e) => setDateFilterType(e.target.value)}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <Calendar className="h-4 w-4" />
                                        Specific Date
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <input
                                            type="radio"
                                            name="dateFilterType"
                                            value="range"
                                            checked={dateFilterType === 'range'}
                                            onChange={(e) => setDateFilterType(e.target.value)}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <CalendarRange className="h-4 w-4" />
                                        Date Range
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    {dateFilterType === 'specific' ? (
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
                                            <input
                                                type="date"
                                                value={filters.date}
                                                onChange={(e) => {
                                                    handleFilterChange('date', e.target.value);
                                                    handleFilterChange('from_date', '');
                                                    handleFilterChange('to_date', '');
                                                }}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700">From Date</label>
                                                <input
                                                    type="date"
                                                    value={filters.from_date}
                                                    onChange={(e) => {
                                                        handleFilterChange('from_date', e.target.value);
                                                        handleFilterChange('date', '');
                                                    }}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700">To Date</label>
                                                <input
                                                    type="date"
                                                    value={filters.to_date}
                                                    onChange={(e) => {
                                                        handleFilterChange('to_date', e.target.value);
                                                        handleFilterChange('date', '');
                                                    }}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Per Page */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">Per Page</label>
                                        <select
                                            value={filters.per_page}
                                            onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="p-6">
                        {journalsLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <div className="text-center">
                                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                    <p className="text-slate-600">Loading journal entries...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="py-12 text-center">
                                <div className="mb-4 text-6xl">⚠️</div>
                                <h3 className="mb-2 text-xl font-semibold text-slate-600">Error loading journals</h3>
                                <p className="mb-4 text-slate-400">Something went wrong. Please try again.</p>
                                <button onClick={() => refetch()} className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
                                    Retry
                                </button>
                            </div>
                        ) : journals.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="mb-4 text-6xl">📊</div>
                                <h3 className="mb-2 text-xl font-semibold text-slate-600">No journal entries found</h3>
                                <p className="mb-4 text-slate-400">
                                    {Object.values(filters).some((val) => val && val !== 10 && val !== 1) ? 'Try adjusting your search criteria' : 'No journal entries have been created yet'}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="flex items-center text-xl font-semibold text-slate-900">
                                        <FileText className="mr-3 h-6 w-6 text-blue-600" />
                                        Journal Entries ({pagination.total || 0})
                                    </h3>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-200">
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Date & Time</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Type</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Amount</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Notes</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Store</th>
                                                <th className="px-4 py-4 text-left font-semibold text-slate-700">Created By</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {journals.map((journal, index) => (
                                                <tr key={journal.id} className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3 text-sm text-slate-900">
                                                            <div className="rounded-lg bg-slate-100 p-2">
                                                                <Clock className="h-4 w-4 text-slate-600" />
                                                            </div>
                                                            <span>{formatDate(journal.created_at)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {journal.debit ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                                                                <TrendingUp className="h-3 w-3" />
                                                                Debit
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                                                <TrendingDown className="h-3 w-3" />
                                                                Credit
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className={`text-base font-bold ${journal.debit ? 'text-red-600' : 'text-green-600'}`}>
                                                            {formatCurrency(journal.debit > 0 ? journal.debit : journal.credit)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="max-w-xs">
                                                            <span className="text-sm text-slate-600" title={journal.notes}>
                                                                {journal.notes || '-'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-slate-400" />
                                                            <span className="text-slate-600">{journal.store?.store_name || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-slate-400" />
                                                            <span className="text-slate-600">{journal.user?.name || 'N/A'}</span>
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
            </div>
        </div>
    );
};

export default JournalListPage;
