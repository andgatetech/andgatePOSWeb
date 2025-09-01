'use client';

import { useDeleteProductMutation, useGetAllProductsQuery, useUpdateAvailabilityMutation } from '@/store/Product/productApi';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, Filter, MoreVertical, Package, Search, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
// import Dropdown from '../dropdown';
import ImageShowModal from '@/__components/ImageShowModal';
import Dropdown from '@/components/dropdown';
import IconEye from '../icon/icon-eye';

const ProductTable = () => {
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    // API calls
    const { data: pds, isLoading } = useGetAllProductsQuery();
    const products = pds?.data || [];
    console.log('products', products);

    const [updateAvailability] = useUpdateAvailabilityMutation();
    const [deleteProduct] = useDeleteProductMutation();

    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('product_name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');

    // Toast notification
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-0 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await deleteProduct(productId).unwrap();
            showToast('Product deleted successfully', 'success');
        } catch (error) {
            showToast('Failed to delete product', 'error');
        }
    };

    // Handle availability toggle
    const handleAvailabilityToggle = async (productId, currentAvailability) => {
        const newAvailability = currentAvailability === 'yes' ? 'no' : 'yes';

        try {
            await updateAvailability({ id: productId, available: newAvailability }).unwrap();
            showToast(`Product availability updated to "${newAvailability === 'yes' ? 'Available' : 'Unavailable'}"`, 'success');
        } catch (error) {
            showToast('Failed to update product availability', 'error');
        }
    };

    // Get stock level status and percentage
    const getStockStatus = (quantity) => {
        if (quantity === 0) {
            return { status: 'out', color: 'bg-gray-400', textColor: 'text-gray-600', percentage: 0 };
        } else if (quantity <= 10) {
            return { status: 'critical', color: 'bg-red-500', textColor: 'text-red-600', percentage: 25 };
        } else if (quantity <= 50) {
            return { status: 'low', color: 'bg-yellow-500', textColor: 'text-yellow-600', percentage: 50 };
        } else if (quantity <= 100) {
            return { status: 'medium', color: 'bg-blue-500', textColor: 'text-blue-600', percentage: 75 };
        } else {
            return { status: 'high', color: 'bg-green-500', textColor: 'text-green-600', percentage: 100 };
        }
    };

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products.filter((product) => {
            const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || product.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAvailability = availabilityFilter === 'all' || product.available === availabilityFilter;
            return matchesSearch && matchesAvailability;
        });

        // Sort products
        filtered.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [products, searchTerm, availabilityFilter, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
    const currentProducts = filteredAndSortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, availabilityFilter]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    const handleImageShow = (product) => {
        setSelectedProduct(product);
        setOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Available</p>
                                <p className="text-3xl font-bold text-green-600">{products.filter((p) => p.available === 'yes').length}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Unavailable</p>
                                <p className="text-3xl font-bold text-red-600">{products.filter((p) => p.available === 'no').length}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                                <p className="text-3xl font-bold text-orange-600">{products.filter((p) => p.quantity <= 10).length}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="mb-6 rounded-lg border bg-white shadow-sm">
                    <div className="p-6">
                        <div className="flex flex-col gap-4 lg:flex-row">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products by name or description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Availability Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-gray-400" />
                                <select
                                    value={availabilityFilter}
                                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Products</option>
                                    <option value="yes">Available Only</option>
                                    <option value="no">Unavailable Only</option>
                                </select>
                            </div>

                            {/* Items per page */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Show:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        className="cursor-pointer px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                                        onClick={() => handleSort('product_name')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Product Name
                                            {sortField === 'product_name' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
                                    <th
                                        className="cursor-pointer px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                                        onClick={() => handleSort('quantity')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Stock Level
                                            {sortField === 'quantity' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th className="cursor-pointer px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100">
                                        <div className="flex items-center gap-2">See Images</div>
                                    </th>
                                    <th
                                        className="cursor-pointer px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                                        onClick={() => handleSort('available')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Availability
                                            {sortField === 'available' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                                        onClick={() => handleSort('purchase_price')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Purchase Price
                                            {sortField === 'purchase_price' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th className="cursor-pointer px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100" onClick={() => handleSort('price')}>
                                        <div className="flex items-center gap-2">
                                            Selling Price
                                            {sortField === 'price' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th className="cursor-pointer px-6 py-4 text-left text-xs font-medium uppercase tracking-tight text-gray-500 hover:bg-gray-100" onClick={() => handleSort('price')}>
                                        <div className="flex items-center gap-2">Action</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {currentProducts.map((product, index) => {
                                    const stockStatus = getStockStatus(product.quantity);
                                    return (
                                        <tr key={product.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="font-medium text-gray-900">{product.product_name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs truncate text-sm text-gray-600" title={product.description}>
                                                    {product.description}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-20 rounded-full bg-gray-200">
                                                            <div className={`h-2 rounded-full transition-all duration-300 ${stockStatus.color}`} style={{ width: `${stockStatus.percentage}%` }}></div>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-bold ${stockStatus.textColor}`}>{product.quantity}</span>
                                                            <span className="text-xs capitalize text-gray-500">
                                                                {stockStatus.status === 'out'
                                                                    ? 'Out of Stock'
                                                                    : stockStatus.status === 'critical'
                                                                    ? 'Critical'
                                                                    : stockStatus.status === 'low'
                                                                    ? 'Low Stock'
                                                                    : stockStatus.status === 'medium'
                                                                    ? 'Medium'
                                                                    : 'In Stock'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <button className="cursor-pointer" onClick={() => handleImageShow(product)}>
                                                    <IconEye />
                                                </button>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <button
                                                    onClick={() => handleAvailabilityToggle(product.id, product.available)}
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors duration-200 ${
                                                        product.available === 'yes' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {product.available === 'yes' ? (
                                                        <>
                                                            <CheckCircle className="mr-1 h-4 w-4" />
                                                            Available
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="mr-1 h-4 w-4" />
                                                            Unavailable
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">৳{Number(product.purchase_price).toFixed(2)}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">৳{Number(product.price).toFixed(2)}</div>
                                                <div className="text-xs text-green-600">+৳{(Number(product.price) - Number(product.purchase_price)).toFixed(2)} profit</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <Dropdown offset={[0, 5]} placement="bottom-end" btnClassName="text-gray-600 hover:text-gray-800" button={<MoreVertical className="h-5 w-5" />}>
                                                    <ul className="rounded-md bg-white shadow-md">
                                                        <li>
                                                            <Link href={`/apps/products/edit/${product.id}`}>
                                                                <div className="cursor-pointer px-3 py-1 hover:bg-gray-100">Edit</div>
                                                            </Link>
                                                        </li>
                                                        <li onClick={() => handleDeleteProduct(product.id)} className="cursor-pointer px-3 py-1 text-red-500 hover:bg-gray-100">
                                                            Delete
                                                        </li>
                                                    </ul>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="border-t border-gray-200 bg-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length}{' '}
                                    products
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`rounded-md px-3 py-1 text-sm font-medium ${
                                                    currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {currentProducts.length === 0 && (
                        <div className="py-12 text-center">
                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || availabilityFilter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first product.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <ImageShowModal isOpen={open} onClose={() => setOpen(false)} product={selectedProduct} />
        </div>
    );
};

export default ProductTable;
