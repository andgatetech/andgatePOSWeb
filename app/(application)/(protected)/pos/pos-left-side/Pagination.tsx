import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const [jumpPage, setJumpPage] = useState('');

    useEffect(() => {
        setJumpPage(currentPage.toString());
    }, [currentPage]);

    if (totalPages <= 0) return null;

    const handleJumpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pageNum = parseInt(jumpPage);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum);
        } else {
            setJumpPage(currentPage.toString());
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const delta = 1; // Number of pages to show on each side of current
        const left = currentPage - delta;
        const right = currentPage + delta + 1;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= left && i < right)) {
                pages.push(i);
            } else if ((i === left - 1 && i > 1) || (i === right && i < totalPages)) {
                pages.push('...');
            }
        }

        // Remove duplicates and sort
        return [...new Set(pages)];
    };

    return (
        <div className="flex w-full flex-col px-4 py-3 sm:px-6">
            {/* Mobile View */}
            <div className="flex items-center justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                    Prev
                </button>

                {/* Mobile "Go To" - Centered Input */}
                <form onSubmit={handleJumpSubmit} className="flex items-center justify-center space-x-2">
                    <div className="relative rounded-md shadow-sm">
                        <input
                            type="number"
                            className="block w-12 rounded-md border-0 py-1.5 text-center text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={jumpPage}
                            onChange={(e) => setJumpPage(e.target.value)}
                            min={1}
                            max={totalPages}
                        />
                    </div>
                    <span className="text-sm font-medium text-gray-500">/ {totalPages}</span>
                </form>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                    Next
                </button>
            </div>

            {/* Desktop View */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                    </p>
                </div>

                <div className="flex items-center gap-x-4">
                    {/* Page Numbers */}
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>

                        {getPageNumbers().map((page, idx) => (
                            <React.Fragment key={idx}>
                                {page === '...' ? (
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">...</span>
                                ) : (
                                    <button
                                        onClick={() => onPageChange(page as number)}
                                        aria-current={currentPage === page ? 'page' : undefined}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                                            currentPage === page
                                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )}
                            </React.Fragment>
                        ))}

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>

                    {/* Go To Input (Desktop) */}
                    <form onSubmit={handleJumpSubmit} className="flex items-center gap-x-2">
                        <span className="text-sm text-gray-500">Go to</span>
                        <div className="relative rounded-md shadow-sm">
                            <input
                                type="number"
                                name="page"
                                id="page-desktop"
                                className="block w-16 rounded-md border-0 py-1.5 pl-3 pr-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Page"
                                value={jumpPage}
                                onChange={(e) => setJumpPage(e.target.value)}
                                min={1}
                                max={totalPages}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
