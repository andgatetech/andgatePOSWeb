'use client';

import ImageShowModal from '@/__components/ImageShowModal';
import Dropdown from '@/components/dropdown';
import ProductFilter from '@/components/filters/ProductFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { useDeleteProductMutation, useGetAllProductsQuery, useGetUnitsQuery, useUpdateAvailabilityMutation } from '@/store/Product/productApi';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, MoreVertical, Package, Percent, Tag, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import IconEye from '../icon/icon-eye';

const ProductTable = () => {
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // API calls - RTK Query will auto-refetch when apiParams change
    const { data: pds, isLoading } = useGetAllProductsQuery(apiParams);
    const products = useMemo(() => pds?.data || [], [pds]);

    const { data: unitsResponse } = useGetUnitsQuery({});
    const productUnits = unitsResponse?.data || [];

    const [updateAvailability] = useUpdateAvailabilityMutation();
    const [deleteProduct] = useDeleteProductMutation();

    // State management
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('product_name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [apiParams, setApiParams] = useState<Record<string, any>>({});

    // Universal filter hook
    const { buildApiParams } = useUniversalFilter();

    // Handle filter changes from UniversalFilter
    const handleFilterChange = (newApiParams: Record<string, any>) => {
        console.log('Filter params:', newApiParams);
        setApiParams(newApiParams);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Mock categories for the filter (you can replace this with real data)
    const mockCategories = [
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Clothing' },
        { id: 3, name: 'Food & Beverage' },
        { id: 4, name: 'Home & Garden' },
    ];

    // Toast notification
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
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

    const handleDeleteProduct = async (productId: number) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await deleteProduct(productId).unwrap();
            showToast('Product deleted successfully', 'success');
        } catch (error) {
            showToast('Failed to delete product', 'error');
        }
    };

    // Handle availability toggle
    const handleAvailabilityToggle = async (productId: number, currentAvailability: string) => {
        const newAvailability = currentAvailability === 'yes' ? 'no' : 'yes';

        try {
            await updateAvailability({ id: productId, available: newAvailability }).unwrap();
            showToast(`Product availability updated to "${newAvailability === 'yes' ? 'Available' : 'Unavailable'}"`, 'success');
        } catch (error) {
            showToast('Failed to update product availability', 'error');
        }
    };

    // Get stock level status and percentage based on product's low_stock_quantity
    const getStockStatus = (quantity: number, low_stock_quantity: number) => {
        // Convert to numbers in case they're strings from API
        const qty = parseFloat(quantity);
        const lowQty = parseFloat(low_stock_quantity);

        if (qty <= 0) {
            return { status: 'out', color: 'bg-gray-400', textColor: 'text-gray-600', percentage: 0 };
        } else if (qty <= lowQty) {
            return { status: 'low', color: 'bg-red-500', textColor: 'text-red-600', percentage: 25 };
        } else if (qty <= lowQty * 3) {
            // medium range example
            return { status: 'medium', color: 'bg-yellow-500', textColor: 'text-yellow-600', percentage: 50 };
        } else {
            return { status: 'full', color: 'bg-green-500', textColor: 'text-green-600', percentage: 100 };
        }
    };

    // Calculate profit margin percentage
    const getProfitMargin = (sellingPrice: number, purchasePrice: number) => {
        const profit = sellingPrice - purchasePrice;
        return purchasePrice > 0 ? ((profit / purchasePrice) * 100).toFixed(1) : 0;
    };

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products.filter((product: any) => {
            // Search filter
            const matchesSearch =
                !apiParams.search ||
                product.product_name.toLowerCase().includes(apiParams.search.toLowerCase()) ||
                product.description?.toLowerCase().includes(apiParams.search.toLowerCase()) ||
                product.sku?.toLowerCase().includes(apiParams.search.toLowerCase());

            // Store filter (if you have store_id in product data)
            const matchesStore = !apiParams.store_id || apiParams.store_id === 'all' || product.store_id === apiParams.store_id;

            // Status filter (from custom filters)
            const matchesStatus = !apiParams.status || apiParams.status === 'all' || product.available === apiParams.status;

            // Category filter (from custom filters)
            const matchesCategory = !apiParams.category_id || apiParams.category_id === 'all' || product.category_id === apiParams.category_id;

            // Date filter (if you have created_at or updated_at in product data)
            let matchesDate = true;
            if (apiParams.start_date && apiParams.end_date) {
                const productDate = new Date(product.created_at || product.updated_at);
                const startDate = new Date(apiParams.start_date);
                const endDate = new Date(apiParams.end_date);
                matchesDate = productDate >= startDate && productDate <= endDate;
            }

            return matchesSearch && matchesStore && matchesStatus && matchesCategory && matchesDate;
        });

        // Sort products
        filtered.sort((a: any, b: any) => {
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
    }, [products, apiParams, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
    const currentProducts = filteredAndSortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Handle sorting
    const handleSort = (field: string) => {
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
    }, [apiParams]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700">Loading products...</p>
                </div>
            </div>
        );
    }

    const handleImageShow = (product: any) => {
        setSelectedProduct(product);
        setOpen(true);
    };

    // Calculate stats
    const totalProducts = products.length;
    const availableProducts = products.filter((p: any) => p.available === 'yes').length;
    const unavailableProducts = products.filter((p: any) => p.available === 'no').length;
    const lowStockProducts = products.filter((p: any) => p.quantity <= 10).length;
    const outOfStockProducts = products.filter((p: any) => p.quantity === 0).length;
    const totalValue = products.reduce((sum: number, p: any) => sum + p.price * p.quantity, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="mx-auto max-w-[1600px]">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Product Management</h1>
                    <p className="text-gray-600">Manage your inventory with advanced filtering and sorting</p>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Available</p>
                                <p className="text-2xl font-bold text-green-600">{availableProducts}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Unavailable</p>
                                <p className="text-2xl font-bold text-red-600">{unavailableProducts}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                                <p className="text-2xl font-bold text-orange-600">{lowStockProducts}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-400" />
                        </div>
                    </div>
                </div>

                {/* Universal Product Filter */}
                <ProductFilter onFilterChange={handleFilterChange} categories={mockCategories} />

                {/* Items per page and results info */}
                <div className="mb-6 flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-medium">{filteredAndSortedProducts.length}</span> products
                        {apiParams.search && <span> matching &quot;{apiParams.search}&quot;</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap text-sm text-gray-600">Show:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                {/* Enhanced Table */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    {' '}
                                    <th
                                        className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-200"
                                        onClick={() => handleSort('sku')}
                                    >
                                        <div className="flex items-center gap-2">
                                            SKU
                                            {sortField === 'sku' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-200"
                                        onClick={() => handleSort('product_name')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Product Details
                                            {sortField === 'product_name' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-200"
                                        onClick={() => handleSort('quantity')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Stock Level
                                            {sortField === 'quantity' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Images</th>
                                    <th
                                        className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-200"
                                        onClick={() => handleSort('available')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Status
                                            {sortField === 'available' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Pricing & Tax</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {currentProducts.map((product: any, index: number) => {
                                    const stockStatus = getStockStatus(product.quantity, product.low_stock_quantity || 10);
                                    const profitMargin = getProfitMargin(product.price, product.purchase_price);

                                    return (
                                        <tr key={product.id} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            {/* Product Details */}
                                            {/* SKU & Unit */}
                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-4 w-4 text-gray-400" />
                                                        <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">{product.sku || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-gray-900">{product.product_name}</div>
                                                </div>
                                            </td>

                                            {/* Stock Level */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-20 rounded-full bg-gray-200">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all duration-300 ${stockStatus.color}`}
                                                                    style={{ width: `${stockStatus.percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className={`text-sm font-bold ${stockStatus.textColor}`}>{product.quantity}</span>
                                                            <div className="text-sm font-bold text-gray-500">{product.unit}</div>
                                                        </div>
                                                        <span
                                                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                                stockStatus.status === 'out'
                                                                    ? 'bg-gray-100 text-gray-700'
                                                                    : stockStatus.status === 'critical'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : stockStatus.status === 'low'
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : stockStatus.status === 'medium'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}
                                                        >
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
                                            </td>

                                            {/* Images */}
                                            <td className="px-4 py-4">
                                                <button
                                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 transition-colors hover:bg-blue-200"
                                                    onClick={() => handleImageShow(product)}
                                                    title="View Images"
                                                >
                                                    <IconEye className="text-blue-600" />
                                                </button>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => handleAvailabilityToggle(product.id, product.available)}
                                                    className={`inline-flex items-center rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                                        product.available === 'yes' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {product.available === 'yes' ? (
                                                        <>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Available
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Unavailable
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Pricing & Tax */}
                                            <td className="px-4 py-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">Purchase:</span>
                                                        <span className="text-sm font-medium">৳{Number(product.purchase_price || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">Selling:</span>
                                                        <span className="text-sm font-semibold text-green-600">৳{Number(product.price || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">Profit:</span>
                                                        <span className="text-xs font-medium text-blue-600">
                                                            +৳{(Number(product.price || 0) - Number(product.purchase_price || 0)).toFixed(2)} ({profitMargin}%)
                                                        </span>
                                                    </div>
                                                    {product.tax_rate && Number(product.tax_rate) > 0 && (
                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                            <Percent className="h-3 w-3" />
                                                            Tax: {product.tax_rate}% {product.tax_included ? '(Inc)' : '(Exc)'}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-4">
                                                <Dropdown
                                                    offset={[0, 5]}
                                                    placement="bottom-end"
                                                    btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    button={<MoreVertical className="h-5 w-5" />}
                                                >
                                                    <ul className="min-w-[120px] rounded-lg border bg-white shadow-lg">
                                                        <li>
                                                            <Link href={`/apps/products/edit/${product.id}`}>
                                                                <div className="cursor-pointer px-4 py-2 font-medium text-blue-600 hover:bg-blue-50">Edit Product</div>
                                                            </Link>
                                                        </li>
                                                        <li className="border-t">
                                                            <button
                                                                onClick={() => handleDeleteProduct(product.id)}
                                                                className="w-full cursor-pointer px-4 py-2 text-left font-medium text-red-500 hover:bg-red-50"
                                                            >
                                                                Delete Product
                                                            </button>
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

                    {/* Enhanced Pagination */}
                    {totalPages > 1 && (
                        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
                            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)}</span> of{' '}
                                    <span className="font-medium">{filteredAndSortedProducts.length}</span> products
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                                        currentPage === pageNum ? 'bg-blue-600 text-white shadow-md' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {currentProducts.length === 0 && (
                        <div className="py-16 text-center">
                            <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">No products found</h3>
                            <p className="mb-6 text-gray-500">{Object.keys(apiParams).length > 0 ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first product.'}</p>
                            {Object.keys(apiParams).length === 0 && (
                                <Link href="/apps/products/add">
                                    <button className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                                        <Package className="mr-2 h-4 w-4" />
                                        Add Your First Product
                                    </button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ImageShowModal isOpen={open} onClose={() => setOpen(false)} product={selectedProduct} />
        </div>
    );
};

export default ProductTable;
