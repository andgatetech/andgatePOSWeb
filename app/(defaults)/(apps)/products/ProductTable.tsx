'use client';

import ImageShowModal from '@/__components/ImageShowModal';
import Dropdown from '@/components/dropdown';
import ProductFilter from '@/components/filters/ProductFilter';
import IconEye from '@/components/icon/icon-eye';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useDeleteProductMutation, useGetAllProductsQuery, useUpdateAvailabilityMutation } from '@/store/Product/productApi';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, MoreVertical, Package, Percent, Tag, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

const ProductTable = () => {
    const { currentStoreId, userStores } = useCurrentStore();
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [apiParams, setApiParams] = useState<Record<string, any>>({});

    // Memoize query parameters to prevent infinite re-renders
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {};

        if (Object.keys(apiParams).length > 0) {
            // Filter is active - build parameters from filter

            // Handle store filtering
            if (apiParams.storeId === 'all' || apiParams.store_ids === 'all') {
                // "All Stores" selected - send all user's store IDs as comma-separated string
                const allStoreIds = userStores.map((store: any) => store.id);
                params.store_ids = allStoreIds.join(',');
            } else if (apiParams.store_id) {
                // Specific store ID from filter
                params.store_id = apiParams.store_id;
            } else if (apiParams.storeId && apiParams.storeId !== 'all') {
                // Specific store selected in filter dropdown
                params.store_id = apiParams.storeId;
            } else {
                // No specific store in filter - use current store from sidebar
                if (currentStoreId) {
                    params.store_id = currentStoreId;
                }
            }

            // Handle other filters
            if (apiParams.search) params.search = apiParams.search;
            if (apiParams.status) params.status = apiParams.status;
            if (apiParams.dateRange?.startDate) params.start_date = apiParams.dateRange.startDate;
            if (apiParams.dateRange?.endDate) params.end_date = apiParams.dateRange.endDate;
        } else {
            // No filter active - use current store from sidebar (default behavior)
            if (currentStoreId) {
                params.store_id = currentStoreId;
            }
        }

        return params;
    }, [apiParams, currentStoreId, userStores]);

    // API calls - RTK Query will auto-refetch when queryParams change
    const { data: pds, isLoading, refetch } = useGetAllProductsQuery(queryParams);

    const products = useMemo(() => pds?.data || [], [pds?.data]);

    // Categories are now handled by ProductFilter component

    const [updateAvailability] = useUpdateAvailabilityMutation();
    const [deleteProduct] = useDeleteProductMutation();

    // State management
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('product_name');
    const [sortDirection, setSortDirection] = useState('asc');

    // Reset filter when current store changes from sidebar
    useEffect(() => {
        setApiParams({});
    }, [currentStoreId]);

    // Handle filter changes from UniversalFilter - RTK Query will auto-refetch when queryParams change
    const handleFilterChange = useCallback(
        (newApiParams: Record<string, any>) => {
            setApiParams(newApiParams);
        },
        [] // Remove dependency to prevent infinite re-renders
    );

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

    // Sort products (filtering is now done by backend)
    const filteredAndSortedProducts = useMemo(() => {
        if (!products || products.length === 0) return [];

        // Sort products (no filtering needed since backend handles it)
        let sorted = [...products].sort((a: any, b: any) => {
            let aValue = a[sortField] || '';
            let bValue = b[sortField] || '';

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

        return sorted;
    }, [products, sortField, sortDirection]);

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

    // Calculate stats based on filtered products (from backend)
    const totalProducts = products.length;
    const availableProducts = products.filter((p: any) => p.available === 'yes').length;
    const unavailableProducts = products.filter((p: any) => p.available === 'no').length;
    const lowStockProducts = products.filter((p: any) => {
        // Calculate actual quantity from product_stocks if available
        if (p.product_stocks && p.product_stocks.length > 0) {
            const totalStock = p.product_stocks.reduce((sum: number, stock: any) => sum + (Number(stock.quantity) || 0), 0);
            return totalStock <= (p.low_stock_quantity || 10);
        }
        return (Number(p.quantity) || 0) <= (p.low_stock_quantity || 10);
    }).length;
    const outOfStockProducts = products.filter((p: any) => {
        // Calculate actual quantity from product_stocks if available
        if (p.product_stocks && p.product_stocks.length > 0) {
            const totalStock = p.product_stocks.reduce((sum: number, stock: any) => sum + (Number(stock.quantity) || 0), 0);
            return totalStock === 0;
        }
        return (Number(p.quantity) || 0) === 0;
    }).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
            <div className="">
                {/* Header */}
                <div className="mb-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-green-700 shadow-md">
                                    <Package className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                                    <p className="text-sm text-gray-500">View and manage all your store products</p>
                                </div>
                            </div>
                        </div>
                    </div>
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

                {/* Filter Bar */}
                <ProductFilter key={`product-filter-${currentStoreId}`} onFilterChange={handleFilterChange} />

                {/* Enhanced Table */}
                <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
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
                                    // Calculate actual quantity from product_stocks if available
                                    const actualQuantity =
                                        product.product_stocks && product.product_stocks.length > 0
                                            ? product.product_stocks.reduce((sum: number, stock: any) => sum + (Number(stock.quantity) || 0), 0)
                                            : Number(product.quantity) || 0;
                                    const stockStatus = getStockStatus(actualQuantity, product.low_stock_quantity || 10);
                                    const profitMargin = getProfitMargin(product.price, product.purchase_price);

                                    return (
                                        <tr key={product.id} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            {/* Product Details */}
                                            {/* SKU & Unit */}
                                            <td className="px-4 py-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-4 w-4 text-gray-400" />
                                                        <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">{product.sku || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-blue-400" />
                                                        <span className="rounded bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700">
                                                            {product.unit || (product.product_stocks && product.product_stocks.length > 0 ? product.product_stocks[0].unit : 'No Unit')}
                                                        </span>
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
                                                            <span className={`text-sm font-bold ${stockStatus.textColor}`}>
                                                                {product.product_stocks && product.product_stocks.length > 0
                                                                    ? product.product_stocks.reduce((sum: number, stock: any) => sum + (Number(stock.quantity) || 0), 0)
                                                                    : Number(product.quantity) || 0}
                                                            </span>
                                                            <div className="text-sm font-bold text-gray-500">
                                                                {product.unit || (product.product_stocks && product.product_stocks.length > 0 ? product.product_stocks[0].unit : 'N/A')}
                                                            </div>
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
                                                            <Link href={`/products/edit/${product.id}`}>
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
                        {/* Items per page and results info */}
                        <div className="mb-6 mt-6 flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
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
                                    <option value={30}>30</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                    </div>

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
