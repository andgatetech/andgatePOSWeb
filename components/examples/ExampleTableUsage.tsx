'use client';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { CheckCircle, Edit, Package, Trash2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Example usage of ReusableTable
const ExampleTableUsage = () => {
    // Sample data
    const [data] = useState([
        {
            id: 1,
            name: 'iPhone 15 Pro',
            sku: 'IP15P001',
            category: 'Electronics',
            price: 999,
            stock: 50,
            status: 'active',
            created_at: '2024-01-15',
        },
        {
            id: 2,
            name: 'Samsung Galaxy S24',
            sku: 'SGS24001',
            category: 'Electronics',
            price: 899,
            stock: 0,
            status: 'active',
            created_at: '2024-01-10',
        },
        {
            id: 3,
            name: 'Nike Air Jordan',
            sku: 'NAJ001',
            category: 'Shoes',
            price: 200,
            stock: 25,
            status: 'inactive',
            created_at: '2024-01-05',
        },
    ]);

    // Table state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Define columns
    const columns: TableColumn[] = [
        {
            key: 'sku',
            label: 'SKU',
            sortable: true,
            render: (value) => (
                <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">{value}</span>
            ),
        },
        {
            key: 'name',
            label: 'Product Name',
            sortable: true,
            render: (value) => (
                <div className="font-semibold text-gray-900">{value}</div>
            ),
        },
        {
            key: 'category',
            label: 'Category',
            sortable: true,
            render: (value) => (
                <span className="rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-700">{value}</span>
            ),
        },
        {
            key: 'price',
            label: 'Price',
            sortable: true,
            render: (value) => (
                <span className="font-semibold text-green-600">৳{value}</span>
            ),
        },
        {
            key: 'stock',
            label: 'Stock',
            sortable: true,
            render: (value, row) => (
                <div className="flex items-center gap-2">
                    <span className={`font-bold ${value <= 0 ? 'text-red-600' : value <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {value}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        value <= 0 ? 'bg-red-100 text-red-700' : 
                        value <= 10 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-green-100 text-green-700'
                    }`}>
                        {value <= 0 ? 'Out of Stock' : value <= 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value) => (
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {value === 'active' ? (
                        <>
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Active
                        </>
                    ) : (
                        <>
                            <XCircle className="mr-1 h-4 w-4" />
                            Inactive
                        </>
                    )}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Created Date',
            sortable: true,
            render: (value) => (
                <span className="text-gray-600">{new Date(value).toLocaleDateString()}</span>
            ),
        },
    ];

    // Define actions
    const actions: TableAction[] = [
        {
            label: 'Edit',
            icon: <Edit className="h-4 w-4" />,
            className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
            onClick: (row) => {
                console.log('Edit:', row);
                // Handle edit action
            },
        },
        {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            className: 'bg-red-100 text-red-700 hover:bg-red-200',
            onClick: (row) => {
                console.log('Delete:', row);
                // Handle delete action
            },
        },
    ];

    // Handle sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (items: number) => {
        setItemsPerPage(items);
        setCurrentPage(1);
    };

    // Calculate pagination
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Example Table</h1>
                <p className="text-gray-600">This is an example of how to use the ReusableTable component</p>
            </div>

            <ReusableTable
                data={paginatedData}
                columns={columns}
                actions={actions}
                isLoading={false}
                emptyState={{
                    icon: <Package className="h-16 w-16" />,
                    title: 'No items found',
                    description: 'There are no items to display at the moment.',
                    action: (
                        <Link href="/add-item">
                            <button className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                <Package className="mr-2 h-4 w-4" />
                                Add Item
                            </button>
                        </Link>
                    ),
                }}
                pagination={{
                    currentPage,
                    totalPages,
                    itemsPerPage,
                    totalItems: data.length,
                    onPageChange: handlePageChange,
                    onItemsPerPageChange: handleItemsPerPageChange,
                }}
                sorting={{
                    field: sortField,
                    direction: sortDirection,
                    onSort: handleSort,
                }}
            />
        </div>
    );
};

export default ExampleTableUsage;