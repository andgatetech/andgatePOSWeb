import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-4 flex items-center justify-center space-x-2 pb-16 sm:mt-6 sm:pb-0 lg:pb-0">
            <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-50 disabled:opacity-50 sm:px-3 sm:text-sm"
            >
                Prev
            </button>
            <span className="text-xs text-gray-600 sm:text-sm">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-50 disabled:opacity-50 sm:px-3 sm:text-sm"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
