'use client';

import InvoiceModal from '@/__components/InvoiceModal';
import IconEye from '@/components/icon/icon-eye';
import { useGetAllOrdersQuery } from '@/store/features/Order/Order';
import { sortBy } from 'lodash';
import { FileText, Printer } from 'lucide-react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import OrderItemsModal from './ordeo_items_modal';

const ComponentsAppsInvoiceList = () => {
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
        <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
            <div className="invoice-table">
                <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center" />

                <div className="datatables pagination-padding">
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={records}
                        columns={[
                            {
                                accessor: 'invoice',
                                sortable: true,
                                render: ({ invoice }) => <div className="font-semibold text-primary underline hover:no-underline">#{invoice}</div>,
                            },
                            {
                                accessor: 'name',
                                sortable: true,
                                render: ({ name }) => (
                                    <div className="flex items-center font-semibold">
                                        <div>{name}</div>
                                    </div>
                                ),
                            },
                            { accessor: 'email', sortable: true },
                            { accessor: 'date', sortable: true },
                            {
                                accessor: 'amount',
                                sortable: true,
                                titleClassName: 'text-right',
                                render: ({ amount }) => <div className="text-right font-semibold">৳{amount.toFixed(2)}</div>,
                            },
                            {
                                accessor: 'status',
                                sortable: true,
                                render: ({ status }) => <span className={`badge badge-outline-${status.color}`}>{status.tooltip}</span>,
                            },
                            {
                                accessor: 'action',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: (record) => (
                                    <div className="mx-auto flex w-max items-center gap-2">
                                        {/* Details Button */}
                                        <button type="button" className="flex hover:text-primary" onClick={() => handleViewDetails(record.originalOrder)} title="View Details">
                                            <IconEye />
                                        </button>

                                        {/* Invoice Button */}
                                        <button type="button" className="flex hover:text-info" onClick={() => handleViewInvoice(record.originalOrder)} title="View Invoice">
                                            {/* <IconFileText /> */}
                                            <FileText className="h-4 w-4" />
                                        </button>

                                        {/* Receipt Button */}
                                        <button type="button" className="flex hover:text-success" onClick={() => handleViewReceipt(record.originalOrder)} title="View Receipt">
                                            {/* <IconPrinter /> */}
                                            <Printer className="h-4 w-4" />
                                        </button>
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
                        paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
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
