'use client';

import InvoiceModal from '@/__components/InvoiceModal';
import IconEye from '@/components/icon/icon-eye';
import { useGetAllOrdersQuery } from '@/store/features/Order/Order';
import { sortBy } from 'lodash';
import { FileText, MoreVertical, Printer } from 'lucide-react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import OrderItemsModal from './ordeo_items_modal';
import OrderActionsComponent from '@/__components/OrderActionsComponent';

const ComponentsAppsInvoiceList = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);

    const { data: ods, isLoading } = useGetAllOrdersQuery();
    const orders = ods?.data;

    // Handle different modal actions
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setSelectedId(order.id);
        setDetailsModalOpen(true);
    };

    const handleViewInvoice = (order) => {
        setSelectedOrder(order);
        setInvoiceModalOpen(true);
    };

    const handleViewReceipt = (order) => {
        setSelectedOrder(order);
        setReceiptModalOpen(true);
    };

    const [items, setItems] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<any[]>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    // Format orders into table items
    useEffect(() => {
        if (Array.isArray(orders)) {
            const formatted = orders.map((order) => ({
                id: order.id,
                invoice: order.invoice || String(order.id).padStart(6, '0'),
                name: order.customer.name || '',
                email: order.customer.email || '',
                date: order.created_at ? new Date(order.created_at).toLocaleDateString() : '',
                amount: Number(order.grand_total) || 0,
                status: {
                    tooltip: order.payment_status || 'unknown',
                    color: order.payment_status === 'paid' ? 'success' : 'danger',
                },
                profile: 'default.jpeg',
                // Keep original order data for modals
                originalOrder: order,
            }));
            setItems(formatted);
            setInitialRecords(sortBy(formatted, 'invoice'));
        }
    }, [orders]);

    // Pagination handling
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    // Sorting handling
    useEffect(() => {
        const data2 = sortBy(initialRecords, sortStatus.columnAccessor);
        setRecords(sortStatus.direction === 'desc' ? data2.reverse() : data2);
        setPage(1);
    }, [sortStatus, initialRecords]);

    return (
        <div className="panel border-white-light px-0 shadow-sm dark:border-[#1b2e4b]">
            <div className="invoice-table">
                {/* Header Section with better spacing */}
                <div className="mb-6 flex flex-col gap-6 rounded-t-lg bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:from-gray-800 dark:to-gray-900 md:flex-row md:items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Order Management</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage and track your orders</p>
                    </div>
                </div>

                {/* DataTable with enhanced styling */}
                <div className="datatables pagination-padding px-6 pb-6">
                    <DataTable
                        className="table-hover overflow-hidden whitespace-nowrap rounded-lg border border-gray-200 dark:border-gray-700"
                        records={records}
                        columns={[
                            {
                                accessor: 'invoice',
                                sortable: true,
                                render: ({ invoice }) => <div className="px-3 py-2 font-semibold text-primary underline hover:no-underline">#{invoice}</div>,
                            },
                            {
                                accessor: 'name',
                                sortable: true,
                                render: ({ name }) => (
                                    <div className="flex items-center px-3 py-2 font-semibold">
                                        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-medium text-white">
                                            {name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>{name}</div>
                                    </div>
                                ),
                            },
                            {
                                accessor: 'email',
                                sortable: true,
                                render: ({ email }) => <div className="px-3 py-2 text-gray-600 dark:text-gray-400">{email}</div>,
                            },
                            {
                                accessor: 'date',
                                sortable: true,
                                render: ({ date }) => <div className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{date}</div>,
                            },
                            {
                                accessor: 'amount',
                                sortable: true,
                                titleClassName: 'text-right',
                                render: ({ amount }) => <div className="px-3 py-2 text-right text-lg font-bold text-green-600 dark:text-green-400">৳{amount.toFixed(2)}</div>,
                            },
                            {
                                accessor: 'status',
                                sortable: true,
                                render: ({ status }) => (
                                    <div className="px-3 py-2">
                                        <span className={`badge badge-outline-${status.color} rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide`}>{status.tooltip}</span>
                                    </div>
                                ),
                            },
                            {
                                accessor: 'action',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: (record) => (
                                    <div className="px-3 py-2">
                                        <OrderActionsComponent order={record.originalOrder} />
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={setPage}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        selectedRecords={selectedRecords}
                        onSelectedRecordsChange={setSelectedRecords}
                        paginationText={({ from, to, totalRecords }) => (
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Showing <span className="font-semibold text-gray-900 dark:text-white">{from}</span> to <span className="font-semibold text-gray-900 dark:text-white">{to}</span> of{' '}
                                <span className="font-semibold text-gray-900 dark:text-white">{totalRecords}</span> entries
                            </span>
                        )}
                        rowClassName="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                    />
                </div>
            </div>

            {/* Modals */}
            <OrderItemsModal open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} id={selectedId} />

            <InvoiceModal open={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} order={selectedOrder} />

            {/* <ReceiptModal open={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} order={selectedOrder} /> */}
        </div>
    );
};

export default ComponentsAppsInvoiceList;
