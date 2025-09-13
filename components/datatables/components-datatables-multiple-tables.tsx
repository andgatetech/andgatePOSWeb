'use client';

import { useDeleteProductMutation, useGetAllProductsQuery, useGetUnitsQuery, useUpdateAvailabilityMutation } from '@/store/Product/productApi';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, Filter, MoreVertical, Package, Search, XCircle, Tag, Calculator, Percent } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ImageShowModal from '@/__components/ImageShowModal';
import Dropdown from '@/components/dropdown';
import IconEye from '../icon/icon-eye';

const ProductTable = () => {
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // API calls
    const { data: pds, isLoading } = useGetAllProductsQuery();
    const products = pds?.data || [];

    const { data: unitsResponse } = useGetUnitsQuery();
    const productUnits = unitsResponse?.data || [];

    const [updateAvailability] = useUpdateAvailabilityMutation();
    const [deleteProduct] = useDeleteProductMutation();

    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('product_name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');

    // Helper function to get unit name by ID
    const getUnitName = (unitId) => {
        if (!unitId) return 'piece';
        const unit = productUnits.find(u => u.id === parseInt(unitId));
        return unit ? unit.name : 'piece';
    };

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
    const handleAvailabilityToggle = async (productId, currentAvailability) => {
        const newAvailability = currentAvailability === 'yes' ? 'no' : 'yes';

        try {
            await updateAvailability({ id: productId, available: newAvailability }).unwrap();
            showToast(`Product availability updated to "${newAvailability === 'yes' ? 'Available' : 'Unavailable'}"`, 'success');
        } catch (error) {
            showToast('Failed to update product availability', 'error');
        }
    };

    // Get stock level status and percentage based on product's low_stock_quantity
const getStockStatus = (quantity, low_stock_quantity) => {
    // Convert to numbers in case they're strings from API
    const qty = parseFloat(quantity);
    const lowQty = parseFloat(low_stock_quantity);

    if (qty <= 0) {
        return { status: 'out', color: 'bg-gray-400', textColor: 'text-gray-600', percentage: 0 };
    } else if (qty <= lowQty) {
        return { status: 'low', color: 'bg-red-500', textColor: 'text-red-600', percentage: 25 };
    } else if (qty <= lowQty * 5) { // medium range example
        return { status: 'medium', color: 'bg-yellow-500', textColor: 'text-yellow-600', percentage: 50 };
    } else {
        return { status: 'full', color: 'bg-green-500', textColor: 'text-green-600', percentage: 100 };
    }
};




    // Calculate profit margin percentage
    const getProfitMargin = (sellingPrice, purchasePrice) => {
        const profit = sellingPrice - purchasePrice;
        return purchasePrice > 0 ? ((profit / purchasePrice) * 100).toFixed(1) : 0;
    };

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products.filter((product) => {
            const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesAvailability = availabilityFilter === 'all' || product.available === availabilityFilter;
            
            const matchesStock = stockFilter === 'all' || 
                               (stockFilter === 'out' && product.quantity === 0) ||
                               (stockFilter === 'low' && product.quantity > 0 && product.quantity <= 10) ||
                               (stockFilter === 'medium' && product.quantity > 10 && product.quantity <= 100) ||
                               (stockFilter === 'high' && product.quantity > 100);
            
            return matchesSearch && matchesAvailability && matchesStock;
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
    }, [products, searchTerm, availabilityFilter, stockFilter, sortField, sortDirection]);

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
    }, [searchTerm, availabilityFilter, stockFilter]);

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

    const handleImageShow = (product) => {
        setSelectedProduct(product);
        setOpen(true);
    };

    // Calculate stats
    const totalProducts = products.length;
    const availableProducts = products.filter(p => p.available === 'yes').length;
    const unavailableProducts = products.filter(p => p.available === 'no').length;
    const lowStockProducts = products.filter(p => p.quantity <= 10).length;
    const outOfStockProducts = products.filter(p => p.quantity === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="mx-auto max-w-[1600px]">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
                    <p className="text-gray-600">Manage your inventory with advanced filtering and sorting</p>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Available</p>
                                <p className="text-2xl font-bold text-green-600">{availableProducts}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Unavailable</p>
                                <p className="text-2xl font-bold text-red-600">{unavailableProducts}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                                <p className="text-2xl font-bold text-orange-600">{lowStockProducts}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-400" />
                        </div>
                    </div>

                    
                </div>

                {/* Enhanced Filters and Search */}
                <div className="mb-6 rounded-xl border bg-white shadow-sm">
                    <div className="p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, description, or SKU..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Availability Filter */}
                                <div className="flex items-center gap-2">
                                    <Filter className="h-5 w-5 text-gray-400" />
                                    <select
                                        value={availabilityFilter}
                                        onChange={(e) => setAvailabilityFilter(e.target.value)}
                                        className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="yes">Available Only</option>
                                        <option value="no">Unavailable Only</option>
                                    </select>
                                </div>

                                {/* Stock Filter */}
                                <select
                                    value={stockFilter}
                                    onChange={(e) => setStockFilter(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                >
                                    <option value="all">All Stock Levels</option>
                                    <option value="out">Out of Stock</option>
                                    <option value="low">Low Stock (≤10)</option>
                                    <option value="medium">Medium Stock (11-100)</option>
                                    <option value="high">High Stock (>100)</option>
                                </select>

                                {/* Items per page */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 whitespace-nowrap">Show:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Table */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th
                                        className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-200 transition-colors"
                                        onClick={() => handleSort('product_name')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Product Details
                                            {sortField === 'product_name' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-200 transition-colors"
                                        onClick={() => handleSort('sku')}
                                    >
                                        <div className="flex items-center gap-2">
                                            SKU & Unit
                                            {sortField === 'sku' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-200 transition-colors"
                                        onClick={() => handleSort('quantity')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Stock Level
                                            {sortField === 'quantity' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Images
                                    </th>
                                    <th
                                        className="cursor-pointer px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-200 transition-colors"
                                        onClick={() => handleSort('available')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Status
                                            {sortField === 'available' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Pricing & Tax
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {currentProducts.map((product, index) => {
                                    const stockStatus = getStockStatus(product.quantity, product.low_stock_quantity || 10);
                                    const profitMargin = getProfitMargin(product.price, product.purchase_price);
                                    
                                    return (
                                        <tr key={product.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            {/* Product Details */}
                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-gray-900">{product.product_name}</div>
                                                    <div className="max-w-xs truncate text-sm text-gray-600" title={product.description}>
                                                        {product.description || 'No description'}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* SKU & Unit */}
                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                            {product.sku || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        Unit: <span className="font-medium">{getUnitName(product.unit)}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Stock Level */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-20 rounded-full bg-gray-200">
                                                                <div className={`h-2 rounded-full transition-all duration-300 ${stockStatus.color}`} style={{ width: `${stockStatus.percentage}%` }}></div>
                                                            </div>
                                                            <span className={`text-sm font-bold ${stockStatus.textColor}`}>{product.quantity}</span>
                                                        </div>
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                            stockStatus.status === 'out' ? 'bg-gray-100 text-gray-700' :
                                                            stockStatus.status === 'critical' ? 'bg-red-100 text-red-700' :
                                                            stockStatus.status === 'low' ? 'bg-yellow-100 text-yellow-700' :
                                                            stockStatus.status === 'medium' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                            {stockStatus.status === 'out' ? 'Out of Stock' :
                                                             stockStatus.status === 'critical' ? 'Critical' :
                                                             stockStatus.status === 'low' ? 'Low Stock' :
                                                             stockStatus.status === 'medium' ? 'Medium' :
                                                             'In Stock'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Images */}
                                            <td className="px-4 py-4">
                                                <button 
                                                    className="flex items-center justify-center w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
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
                                                        product.available === 'yes' 
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
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
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-500">Purchase:</span>
                                                        <span className="text-sm font-medium">৳{Number(product.purchase_price || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-500">Selling:</span>
                                                        <span className="text-sm font-semibold text-green-600">৳{Number(product.price || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
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
                                                    <ul className="rounded-lg bg-white shadow-lg border min-w-[120px]">
                                                        <li>
                                                            <Link href={`/apps/products/edit/${product.id}`}>
                                                                <div className="cursor-pointer px-4 py-2 hover:bg-blue-50 text-blue-600 font-medium">
                                                                    Edit Product
                                                                </div>
                                                            </Link>
                                                        </li>
                                                        <li className="border-t">
                                                            <button 
                                                                onClick={() => handleDeleteProduct(product.id)} 
                                                                className="w-full text-left cursor-pointer px-4 py-2 text-red-500 hover:bg-red-50 font-medium"
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
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)}</span> of{' '}
                                    <span className="font-medium">{filteredAndSortedProducts.length}</span> products
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
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
                                                        currentPage === pageNum 
                                                            ? 'bg-blue-600 text-white shadow-md' 
                                                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
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
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
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
                            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm || availabilityFilter !== 'all' || stockFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria.' 
                                    : 'Get started by adding your first product.'}
                            </p>
                            {!searchTerm && availabilityFilter === 'all' && stockFilter === 'all' && (
                                <Link href="/apps/products/add">
                                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        <Package className="h-4 w-4 mr-2" />
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