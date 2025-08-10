'use client';
import { useGetAllProductsQuery } from '@/store/Product/productApi';
import sortBy from 'lodash/sortBy';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import 'tippy.js/dist/tippy.css';

const ComponentsDatatablesMultipleTables = () => {
    let products;
    const { data: pds, isLoading } = useGetAllProductsQuery();
    products = pds?.data;
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    const [sortedRecords, setSortedRecords] = useState([]);
    const [records, setRecords] = useState([]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'product_name',
        direction: 'asc',
    });

    useEffect(() => {
        setSortedRecords(sortBy(products, sortStatus.columnAccessor));
    }, [products, sortStatus]);

    // pagination
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords(sortStatus.direction === 'desc' ? sortedRecords.slice(from, to).reverse() : sortedRecords.slice(from, to));
    }, [page, pageSize, sortedRecords, sortStatus]);

    if (isLoading) return <div>Loading...</div>;
    return (
        <div className="panel mt-6">
            <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">Product List</h5>
                {/* <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search2} onChange={(e) => setSearch2(e.target.value)} />
                    </div> */}
            </div>
            <div className="datatables">
                <DataTable
                    className="table-hover whitespace-nowrap"
                    records={records}
                    columns={[
                        { accessor: 'product_name', title: 'Product Name', sortable: true },
                        { accessor: 'description', title: 'Description', sortable: false },
                        {
                            accessor: 'quantity',
                            title: 'Quantity',
                            sortable: true,
                            render: ({ quantity }) => (
                                <div className="progress-bar" style={{ width: `${quantity}%`, backgroundColor: '#4caf50', height: '20px', borderRadius: '4px' }}>
                                    <span style={{ paddingLeft: 5, color: 'white' }}>{quantity}</span>
                                </div>
                            ),
                        },
                        { accessor: 'price', title: 'Price', sortable: true, render: ({ price }) => `$${Number(price).toFixed(2)}` },
                        { accessor: 'available', title: 'Available', sortable: true },
                        { accessor: 'purchase_price', title: 'Purchase Price', sortable: true, render: ({ purchase_price }) => `$${Number(purchase_price).toFixed(2)}` },
                    ]}
                    totalRecords={products.length}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={setPage}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    sortStatus={sortStatus}
                    onSortStatusChange={setSortStatus}
                    minHeight={300}
                    paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} products`}
                />
            </div>
        </div>
    );
};

export default ComponentsDatatablesMultipleTables;
