'use client';
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { getTranslation } from '@/i18n';

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

// Actions Dropdown Component
interface ActionsDropdownProps {
    actions: TableAction[];
    row: any;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({ actions, row, isOpen, onToggle, onClose }) => {
    const { t } = getTranslation();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 192;
            const dropdownHeight = actions.length * 48;
            const viewportWidth = window.innerWidth;

            let top = rect.bottom + 5;
            let left = rect.right - dropdownWidth;

            if (top + dropdownHeight > window.innerHeight) {
                top = rect.top - dropdownHeight - 5;
            }
            if (left < 8) left = 8;
            if (left + dropdownWidth > viewportWidth - 8) left = viewportWidth - dropdownWidth - 8;

            setPosition({ top, left });
        }
    }, [isOpen, actions.length]);

    return (
        <div className="relative flex justify-center">
            <button
                ref={buttonRef}
                onClick={onToggle}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                title={t('lbl_actions')}
            >
                <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={onClose} />
                    <div
                        ref={dropdownRef}
                        className="fixed z-[101] w-48 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
                        style={{ top: `${position.top}px`, left: `${position.left}px` }}
                    >
                        {actions.map((action, actionIndex) => (
                            <button
                                key={actionIndex}
                                onClick={() => { action.onClick(row); onClose(); }}
                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                                    action.className?.includes('text-red')
                                        ? 'text-red-600 hover:bg-red-50'
                                        : action.className?.includes('text-green')
                                        ? 'text-green-700 hover:bg-green-50'
                                        : action.className?.includes('text-blue')
                                        ? 'text-blue-700 hover:bg-blue-50'
                                        : 'text-gray-700 hover:bg-gray-50'
                                } ${actionIndex > 0 ? 'border-t border-gray-50' : ''}`}
                            >
                                {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const ReusableTable: React.FC<ReusableTableProps> = ({
    data,
    columns,
    actions,
    isLoading = false,
    emptyState,
    pagination,
    sorting,
    className = '',
    rowClassName,
}) => {
    const { t } = getTranslation();
    const [openDropdownId, setOpenDropdownId] = useState<string | number | null>(null);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
                    <p className="mt-3 text-sm text-gray-500">{t('lbl_loading')}</p>
                </div>
            </div>
        );
    }

    const handleSort = (field: string) => {
        if (sorting?.onSort) sorting.onSort(field);
    };

    const getDefaultRowClassName = (_row: any, index: number) =>
        `border-b border-gray-100 transition-colors last:border-0 ${
            index % 2 === 0 ? 'bg-white hover:bg-primary/5' : 'bg-slate-50/60 hover:bg-primary/5'
        }`;

    const startRecord = pagination ? (pagination.currentPage - 1) * pagination.itemsPerPage + 1 : 0;
    const endRecord = pagination ? Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems) : 0;

    return (
        <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-primary">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-white/90 transition-colors ${
                                        column.sortable ? 'cursor-pointer select-none hover:bg-white/10' : ''
                                    } ${column.className || ''}`}
                                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {column.label}
                                        {column.sortable && sorting && sorting.field === column.key && (
                                            sorting.direction === 'asc'
                                                ? <ChevronUp className="h-3.5 w-3.5 text-white" />
                                                : <ChevronDown className="h-3.5 w-3.5 text-white" />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && actions.length > 0 && (
                                <th className="w-16 px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-white/90">
                                    {t('lbl_actions')}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => {
                            const finalRowClassName = rowClassName ? rowClassName(row, index) : getDefaultRowClassName(row, index);
                            const rowId = row.id ?? index;
                            const isDropdownOpen = openDropdownId === rowId;

                            return (
                                <tr key={rowId} className={finalRowClassName}>
                                    {columns.map((column) => (
                                        <td key={column.key} className={`px-4 py-3.5 text-sm ${column.className || ''}`}>
                                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                                        </td>
                                    ))}
                                    {actions && actions.length > 0 && (
                                        <td className="px-4 py-3.5 text-center">
                                            <ActionsDropdown
                                                actions={actions}
                                                row={row}
                                                isOpen={isDropdownOpen}
                                                onToggle={() => setOpenDropdownId(isDropdownOpen ? null : rowId)}
                                                onClose={() => setOpenDropdownId(null)}
                                            />
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Empty state */}
            {data.length === 0 && emptyState && (
                <div className="py-16 text-center">
                    {emptyState.icon && (
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            {emptyState.icon}
                        </div>
                    )}
                    <h3 className="mb-1 text-base font-semibold text-gray-700">{emptyState.title}</h3>
                    <p className="mb-6 text-sm text-gray-400">{emptyState.description}</p>
                    {emptyState.action && emptyState.action}
                </div>
            )}

            {/* Pagination */}
            {pagination && (pagination.totalPages > 1 || pagination.totalItems > 0) && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/80 px-5 py-3 sm:flex-row">
                    {/* Showing info + per-page */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                            {t('lbl_showing')}{' '}
                            <span className="font-semibold text-gray-700">{startRecord}</span>
                            {' '}{t('lbl_to')}{' '}
                            <span className="font-semibold text-gray-700">{endRecord}</span>
                            {' '}{t('lbl_of')}{' '}
                            <span className="font-semibold text-gray-700">{pagination.totalItems}</span>
                            {' '}{t('lbl_items')}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs">{t('lbl_show')}:</span>
                            <select
                                value={pagination.itemsPerPage}
                                onChange={(e) => pagination.onItemsPerPageChange(Number(e.target.value))}
                                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    {/* Page navigation */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
                            disabled={pagination.currentPage === 1}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {t('btn_previous')}
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                let pageNum: number;
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
                                        className={`min-w-[32px] rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                                            pagination.currentPage === pageNum
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary'
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
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {t('btn_next')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReusableTable;
