'use client';

import IconEye from '@/components/icon/icon-eye';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { useGetAllOrdersQuery, useGetOrderItemsQuery } from '@/store/features/Order/Order';
import { sortBy } from 'lodash';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import OrderItemsModal from './ordeo_items_modal';

const ComponentsAppsInvoiceList = () => {
    // const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const { data: ods, isLoading } = useGetAllOrdersQuery();
    const orders = ods?.data;
    // console.log('orders', orders);

    const handleViewItems = async (id) => {
        try {
            // setSelectedItems(items);
            setSelectedId(id);
            setModalOpen(true);
        } catch (err) {
            console.error('Failed to fetch items', err);
        }
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
                invoice: String(order.id).padStart(6, '0'),
                name: order.customer_name || '',
                email: order.customer_email || '',
                date: order.created_at ? new Date(order.created_at).toLocaleDateString() : '',
                amount: Number(order.grand_total) || 0,
                status: {
                    tooltip: order.payment_status || 'unknown',
                    color: order.payment_status === 'paid' ? 'success' : 'danger',
                },
                profile: 'default.jpeg',
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

    // Delete row handler
    const deleteRow = (id: any = null) => {
        if (window.confirm('Are you sure you want to delete selected row(s)?')) {
            if (id) {
                const updated = items.filter((user) => user.id !== id);
                setItems(updated);
                setInitialRecords(updated);
                setRecords(updated);
                setSelectedRecords([]);
            } else {
                const idsToDelete = selectedRecords.map((d: any) => d.id);
                const updated = items.filter((d) => !idsToDelete.includes(d.id));
                setItems(updated);
                setInitialRecords(updated);
                setRecords(updated);
                setSelectedRecords([]);
                setPage(1);
            }
        }
    };

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
                                        <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2">
                                            <img className="h-8 w-8 rounded-full object-cover" src={`/assets/images/default.jpeg`} alt="" />
                                        </div>
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
                                render: ({ amount }) => <div className="text-right font-semibold">${amount.toFixed(2)}</div>,
                            },
                            {
                                accessor: 'status',
                                sortable: true,
                                render: ({ status }) => <span className={`badge badge-outline-${status.color}`}>{status.tooltip}</span>,
                            },
                            {
                                accessor: 'action',
                                title: 'View Items',
                                sortable: false,
                                textAlignment: 'center',
                                render: ({ id }) => (
                                    <div className="mx-auto flex w-max items-center gap-4">
                                        <button type="button" className="flex hover:text-danger" onClick={() => handleViewItems(id)}>
                                            <IconEye />
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
            {/* Modal */}
            <OrderItemsModal open={modalOpen} onClose={() => setModalOpen(false)} id={selectedId} />
        </div>
    );
};

export default ComponentsAppsInvoiceList;
