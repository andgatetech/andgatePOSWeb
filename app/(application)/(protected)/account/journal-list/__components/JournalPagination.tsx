'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const JournalPagination = ({ pagination, onPageChange }) => {
    const { current_page, last_page, per_page, total, from, to } = pagination;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show on each side of current page
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, current_page - delta); i <= Math.min(last_page - 1, current_page + delta); i++) {
            range.push(i);
        }

        if (current_page - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (current_page + delta < last_page - 1) {
            rangeWithDots.push('...', last_page);
        } else {
            rangeWithDots.push(last_page);
        }

        return rangeWithDots;
    };

    const pageNumbers = last_page > 1 ? getPageNumbers() : [];

    return (
        <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Results Info */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="hidden sm:inline">Showing</span>
                <span className="font-medium text-slate-900">{from}</span>
                <span>to</span>
                <span className="font-medium text-slate-900">{to}</span>
                <span>of</span>
                <span className="font-medium text-slate-900">{total}</span>
                <span>entries</span>
            </div>

            {/* Pagination Controls */}
            {last_page > 1 && (
                <div className="flex items-center gap-1">
                    {/* First Page */}
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={current_page === 1}
                        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                        title="First page"
                    >
                        <ChevronsLeft size={16} />
                    </button>

                    {/* Previous Page */}
                    <button
                        onClick={() => onPageChange(current_page - 1)}
                        disabled={current_page === 1}
                        className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                        <ChevronLeft size={14} />
                        <span className="hidden sm:inline">Previous</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                        {pageNumbers.map((page, index) =>
                            page === '...' ? (
                                <span key={`dots-${index}`} className="px-2 py-2 text-slate-400">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`min-w-[40px] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        page === current_page ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                        )}
                    </div>

                    {/* Next Page */}
                    <button
                        onClick={() => onPageChange(current_page + 1)}
                        disabled={current_page === last_page}
                        className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight size={14} />
                    </button>

                    {/* Last Page */}
                    <button
                        onClick={() => onPageChange(last_page)}
                        disabled={current_page === last_page}
                        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                        title="Last page"
                    >
                        <ChevronsRight size={16} />
                    </button>
                </div>
            )}

            {/* Mobile Page Info */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 sm:hidden">
                <span>Page</span>
                <span className="font-medium text-slate-900">{current_page}</span>
                <span>of</span>
                <span className="font-medium text-slate-900">{last_page}</span>
            </div>
        </div>
    );
};

export default JournalPagination;
