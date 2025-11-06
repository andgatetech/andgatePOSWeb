'use client';

import ImageShowModal from '@/app/(defaults)/(apps)/products/component/Image Modal/ImageModal2';
import Dropdown from '@/components/dropdown';
import ProductFilter from '@/components/filters/ProductFilter';
import IconEye from '@/components/icon/icon-eye';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useDeleteProductMutation, useGetAllProductsQuery, useUpdateAvailabilityMutation } from '@/store/features/Product/productApi';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, MoreVertical, Package, Percent, Tag, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

const ProductTable = () => {
    const { currentStoreId, userStores } = useCurrentStore();
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('product_name');
    const [sortDirection, setSortDirection] = useState('asc');

    // Memoize query parameters to prevent infinite re-renders
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            page: currentPage,
            per_page: itemsPerPage,
            sort_field: sortField,
            sort_direction: sortDirection,
        };

        const hasFilterParams = Object.keys(apiParams).length > 0;

        if (hasFilterParams) {
            // Handle store filtering
            if (apiParams.store_ids) {
                params.store_ids = apiParams.store_ids;
            } else if (apiParams.storeId === 'all' || apiParams.store_ids === 'all') {
                const allStoreIds = userStores.map((store: any) => store.id);
                if (allStoreIds.length === 1) {
                    params.store_id = allStoreIds[0];
                } else if (allStoreIds.length > 1) {
                    params.store_ids = allStoreIds.join(',');
                }
            } else if (apiParams.store_id) {
                params.store_id = apiParams.store_id;
            } else if (apiParams.storeId && apiParams.storeId !== 'all') {
                params.store_id = apiParams.storeId;
            }

            // Handle other filters
            if (apiParams.search) params.search = apiParams.search;
            if (apiParams.status) params.status = apiParams.status;
            if (apiParams.category_id) params.category_id = apiParams.category_id;
            if (apiParams.start_date) params.start_date = apiParams.start_date;
            if (apiParams.end_date) params.end_date = apiParams.end_date;
        }

        // Default to current store if not explicitly provided
        if (!params.store_id && !params.store_ids && currentStoreId) {
            params.store_id = currentStoreId;
        }

        return params;
    }, [apiParams, currentStoreId, userStores, currentPage, itemsPerPage, sortField, sortDirection]);

    // API calls - RTK Query will auto-refetch when queryParams change
    const { data: pds, isLoading } = useGetAllProductsQuery(queryParams);

    const ensureArray = (value: unknown): any[] => {
        if (Array.isArray(value)) {
            return value;
        }
        if (value && typeof value === 'object') {
            const container = value as Record<string, unknown>;
            if (Array.isArray(container.data)) {
                return container.data as any[];
            }
            if (Array.isArray(container.items)) {
                return container.items as any[];
            }
            if (Array.isArray(container.results)) {
                return container.results as any[];
            }
        }
        return [];
    };

    const products = useMemo(() => {
        const primary = ensureArray(pds?.data);
        if (primary.length > 0 || Array.isArray(pds?.data)) {
            return primary;
        }
        return ensureArray(pds);
    }, [pds]);

    const metaContainer: Record<string, any> | undefined = useMemo(() => {
        if (pds?.meta && typeof pds.meta === 'object') {
            return pds.meta as Record<string, any>;
        }

        const nestedData = pds?.data;
        if (nestedData && typeof nestedData === 'object' && !Array.isArray(nestedData)) {
            const nestedMeta = (nestedData as Record<string, any>).meta;
            if (nestedMeta && typeof nestedMeta === 'object') {
                return nestedMeta as Record<string, any>;
            }

            const { pagination, summary, stats } = nestedData as Record<string, any>;
            if (pagination || summary || stats) {
                return {
                    pagination,
                    summary,
                    stats,
                };
            }
        }

        return undefined;
    }, [pds]);

    const paginationMeta = useMemo(() => {
        if (!metaContainer) return undefined;
        if (metaContainer.pagination && typeof metaContainer.pagination === 'object') {
            return metaContainer.pagination as Record<string, any>;
        }
        if ('page' in metaContainer || 'total_pages' in metaContainer || 'per_page' in metaContainer || 'total_records' in metaContainer) {
            return metaContainer;
        }
        return undefined;
    }, [metaContainer]);

    const summaryMeta = useMemo(() => {
        if (!metaContainer) return undefined;
        if (metaContainer.summary && typeof metaContainer.summary === 'object') {
            return metaContainer.summary as Record<string, any>;
        }
        if (metaContainer.stats && typeof metaContainer.stats === 'object') {
            return metaContainer.stats as Record<string, any>;
        }
        return undefined;
    }, [metaContainer]);

    // Categories are now handled by ProductFilter component

    const [updateAvailability] = useUpdateAvailabilityMutation();
    const [deleteProduct] = useDeleteProductMutation();

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

    const handleDeleteProduct = async (productId: number) => {
        const confirmed = await showConfirmDialog(
            'Are you sure?',
            'This product will be permanently deleted!',
            'Yes, delete it!',
            'Cancel',
            false // Don't show toast on confirm
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteProduct(productId).unwrap();
            showSuccessDialog('Deleted!', 'Product has been deleted successfully.');
        } catch (error) {
            showErrorDialog('Delete Failed!', 'Failed to delete product. Please try again.');
        }
    };

    // Handle availability toggle
    const handleAvailabilityToggle = async (productId: number, currentAvailability: boolean) => {
        const newAvailability = currentAvailability ? 'no' : 'yes';
        const statusText = newAvailability === 'yes' ? 'Available' : 'Unavailable';

        try {
            await updateAvailability({ id: productId, available: newAvailability }).unwrap();
            showSuccessDialog('Updated!', `Product is now ${statusText}.`);
        } catch (error) {
            showErrorDialog('Update Failed!', 'Failed to update product availability. Please try again.');
        }
    };

    // Get stock level status and percentage based on product's low_stock_quantity
    const getStockStatus = (quantity: number, low_stock_quantity: number) => {
        // Convert to numbers in case they're strings from API
        const qty = Number(quantity);
        const lowQty = Number(low_stock_quantity);

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

    const effectivePerPage = paginationMeta?.per_page && paginationMeta.per_page > 0 ? paginationMeta.per_page : itemsPerPage;
    const totalRecords = paginationMeta?.total_records ?? pds?.meta?.total ?? products.length;
    const activePage = paginationMeta?.page && paginationMeta.page > 0 ? paginationMeta.page : currentPage;
    const totalPages = paginationMeta?.total_pages ?? Math.max(1, effectivePerPage > 0 ? Math.ceil((totalRecords || 0) / effectivePerPage) : 1);
    const startRecord = totalRecords === 0 ? 0 : (activePage - 1) * effectivePerPage + 1;
    const endRecord = totalRecords === 0 ? 0 : startRecord + products.length - 1;

    const fallbackStats = useMemo(() => {
        let available = 0;
        let unavailable = 0;
        let lowStock = 0;
        let outOfStock = 0;

        products.forEach((product: any) => {
            const isAvailable =
                product.stocks && product.stocks.length > 0 ? product.stocks.some((stock: any) => stock.available === 'yes') : product.available === true || product.available === 'yes';

            if (isAvailable) {
                available += 1;
            } else {
                unavailable += 1;
            }

            const totalStock = product.stocks && product.stocks.length > 0 ? product.stocks.reduce((sum: number, stock: any) => sum + (Number(stock.quantity) || 0), 0) : Number(product.quantity) || 0;

            const lowStockThreshold = product.low_stock_quantity || 10;

            if (totalStock <= lowStockThreshold) {
                lowStock += 1;
            }

            if (totalStock === 0) {
                outOfStock += 1;
            }
        });

        return {
            total: totalRecords,
            available,
            unavailable,
            lowStock,
            outOfStock,
        };
    }, [products, totalRecords]);

    const goToPage = useCallback(
        (pageNumber: number) => {
            const boundedTotalPages = totalPages || 1;
            const target = Math.min(Math.max(pageNumber, 1), boundedTotalPages);
            setCurrentPage(target);
        },
        [setCurrentPage, totalPages]
    );

    // Handle sorting
    const handleSort = (field: string) => {
        goToPage(1);
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
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

    const totalProducts = summaryMeta?.total ?? summaryMeta?.count ?? fallbackStats.total ?? totalRecords;
    const availableProducts = summaryMeta?.available ?? summaryMeta?.active ?? fallbackStats.available;
    const unavailableProducts = summaryMeta?.unavailable ?? summaryMeta?.inactive ?? fallbackStats.unavailable;
    const lowStockProducts = summaryMeta?.low_stock ?? summaryMeta?.lowStock ?? fallbackStats.lowStock;
    const outOfStockProducts = summaryMeta?.out_of_stock ?? summaryMeta?.outOfStock ?? fallbackStats.outOfStock;

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
                                            Product name
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
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Details</th>
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
                                {products.map((product: any, index: number) => {
                                    // Calculate actual quantity from stocks if available
                                    const actualQuantity =
                                        product.stocks && product.stocks.length > 0
                                            ? product.stocks.reduce((sum: number, stock: any) => sum + (Number(stock.quantity) || 0), 0)
                                            : Number(product.quantity) || 0;

                                    // Get first stock or primary stock for pricing display
                                    const primaryStock = product.stocks && product.stocks.length > 0 ? product.stocks[0] : null;
                                    const displayPrice = primaryStock?.price || product.price || 0;
                                    const displayPurchasePrice = primaryStock?.purchase_price || product.purchase_price || 0;
                                    const displayLowStock = primaryStock?.low_stock_quantity || product.low_stock_quantity || 10;

                                    // Calculate available status - check if any stock is available
                                    const isAvailable =
                                        product.stocks && product.stocks.length > 0
                                            ? product.stocks.some((stock: any) => stock.available === 'yes')
                                            : product.available === true || product.available === 'yes';

                                    const stockStatus = getStockStatus(actualQuantity, displayLowStock);
                                    const profitMargin = getProfitMargin(displayPrice, displayPurchasePrice);

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
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <div className="max-w-[150px] truncate font-semibold text-gray-900">{product.product_name}</div>
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
                                                                {product.stocks && product.stocks.length > 0
                                                                    ? product.stocks.reduce((sum: number, stock: any) => sum + (Number(stock.quantity) || 0), 0)
                                                                    : Number(product.quantity) || 0}
                                                            </span>
                                                            <div className="text-sm font-bold text-gray-500">
                                                                {product.unit || (product.stocks && product.stocks.length > 0 ? product.stocks[0].unit : 'N/A')}
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
                                                    onClick={() => handleAvailabilityToggle(product.id, isAvailable)}
                                                    className={`inline-flex items-center rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                                        isAvailable ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {isAvailable ? (
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

                                            {/* Pricing & Tax - Show range for variants, details for simple products */}
                                            <td className="px-4 py-4">
                                                <div className="space-y-2">
                                                    {product.stocks && product.stocks.length > 0 && product.stocks[0].is_variant ? (
                                                        // Show price range for variant products
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-500">Price Range:</span>
                                                            <span className="text-sm font-semibold text-green-600">
                                                                ৳{Math.min(...product.stocks.map((s: any) => Number(s.price))).toFixed(0)} - ৳
                                                                {Math.max(...product.stocks.map((s: any) => Number(s.price))).toFixed(0)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-gray-500">Purchase:</span>
                                                                <span className="text-sm font-medium">৳{Number(displayPurchasePrice).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-gray-500">Selling:</span>
                                                                <span className="text-sm font-semibold text-green-600">৳{Number(displayPrice).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-gray-500">Profit:</span>
                                                                <span className="text-xs font-medium text-blue-600">
                                                                    +৳{(Number(displayPrice) - Number(displayPurchasePrice)).toFixed(2)} ({profitMargin}%)
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {primaryStock?.tax_rate && Number(primaryStock.tax_rate) > 0 && (
                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                            <Percent className="h-3 w-3" />
                                                            Tax: {primaryStock.tax_rate}% {primaryStock.tax_included ? '(Inc)' : '(Exc)'}
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
                        <div className="mb-6 mt-6 flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                            <div className="text-sm text-gray-600">
                                {totalRecords === 0 ? (
                                    <>
                                        Showing <span className="font-medium">0</span> products
                                    </>
                                ) : (
                                    <>
                                        Showing <span className="font-medium">{startRecord}</span>-<span className="font-medium">{endRecord}</span> of{' '}
                                        <span className="font-medium">{totalRecords}</span> products
                                    </>
                                )}
                                {apiParams.search && totalRecords > 0 && <span> matching &quot;{apiParams.search}&quot;</span>}
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="whitespace-nowrap text-sm text-gray-600">Show:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            goToPage(1);
                                            setItemsPerPage(value);
                                        }}
                                        className="rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={30}>30</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => goToPage(activePage - 1)}
                                        disabled={activePage <= 1}
                                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                            activePage <= 1 ? 'cursor-not-allowed border-gray-200 text-gray-400' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page <span className="font-medium">{totalRecords === 0 ? 0 : activePage}</span> of <span className="font-medium">{totalRecords === 0 ? 0 : totalPages}</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => goToPage(activePage + 1)}
                                        disabled={activePage >= totalPages || totalRecords === 0}
                                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                            activePage >= totalPages || totalRecords === 0 ? 'cursor-not-allowed border-gray-200 text-gray-400' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Empty state */}
                    {products.length === 0 && (
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
