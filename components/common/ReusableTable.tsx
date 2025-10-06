'use client';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ReactNode } from 'react';

export interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: any) => ReactNode;
    className?: string;
}

export interface TableAction {
    label: string;
    onClick: (row: any) => void;
    className?: string;
    icon?: ReactNode;
}

export interface ReusableTableProps {
    data: any[];
    columns: TableColumn[];
    actions?: TableAction[];
    isLoading?: boolean;
    emptyState?: {
        icon?: ReactNode;
        title: string;
        description: string;
        action?: ReactNode;
    };
    pagination?: {
        currentPage: number;
        totalPages: number;
        itemsPerPage: number;
        totalItems: number;
        onPageChange: (page: number) => void;
        onItemsPerPageChange: (items: number) => void;
    };
    sorting?: {
        field: string;
        direction: 'asc' | 'desc';
        onSort: (field: string) => void;
    };
    className?: string;
    rowClassName?: (row: any, index: number) => string;
}

const ReusableTable: React.FC<ReusableTableProps> = ({ data, columns, actions, isLoading = false, emptyState, pagination, sorting, className = '', rowClassName }) => {
    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                    <p className="mt-4 text-sm text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    console.log(data);

    const handleSort = (field: string) => {
        if (sorting?.onSort) {
            sorting.onSort(field);
        }
    };

    const getDefaultRowClassName = (row: any, index: number) => {
        const baseClass = 'transition-colors hover:bg-blue-50';
        const stripeClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        return `${baseClass} ${stripeClass}`;
    };

    return (
        <div className={`overflow-hidden rounded-xl border bg-white shadow-sm ${className}`}>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors ${
                                        column.sortable ? 'cursor-pointer hover:bg-gray-200' : ''
                                    } ${column.className || ''}`}
                                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {column.sortable &&
                                            sorting &&
                                            sorting.field === column.key &&
                                            (sorting.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                    </div>
                                </th>
                            ))}
                            {actions && actions.length > 0 && <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {data.map((row, index) => {
                            const finalRowClassName = rowClassName ? rowClassName(row, index) : getDefaultRowClassName(row, index);

                            return (
                                <tr key={row.id || index} className={finalRowClassName}>
                                    {columns.map((column) => (
                                        <td key={column.key} className={`px-4 py-4 ${column.className || ''}`}>
                                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                                        </td>
                                    ))}
                                    {actions && actions.length > 0 && (
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                {actions.map((action, actionIndex) => (
                                                    <button
                                                        key={actionIndex}
                                                        onClick={() => action.onClick(row)}
                                                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${action.className || 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                                    >
                                                        {action.icon && <span className="mr-1">{action.icon}</span>}
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        {/* Items per page */}
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> of{' '}
                                <span className="font-medium">{pagination.totalItems}</span> items
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="whitespace-nowrap text-sm text-gray-600">Show:</span>
                                <select
                                    value={pagination.itemsPerPage}
                                    onChange={(e) => pagination.onItemsPerPageChange(Number(e.target.value))}
                                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>

                        {/* Page navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
                                disabled={pagination.currentPage === 1}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <div className="flex items-center gap-1">
                                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => pagination.onPageChange(pageNum)}
                                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                                pagination.currentPage === pageNum ? 'bg-blue-600 text-white shadow-md' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {data.length === 0 && emptyState && (
                <div className="py-16 text-center">
                    {emptyState.icon && <div className="mx-auto mb-4 text-gray-400">{emptyState.icon}</div>}
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{emptyState.title}</h3>
                    <p className="mb-6 text-gray-500">{emptyState.description}</p>
                    {emptyState.action && emptyState.action}
                </div>
            )}
        </div>
    );
};

export default ReusableTable;
