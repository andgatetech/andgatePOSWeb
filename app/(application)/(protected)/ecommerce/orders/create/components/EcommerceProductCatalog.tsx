'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
    Search,
    X,
    Package,
    Plus,
    Check,
    Eye,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
} from 'lucide-react';
import BarcodeReader from 'react-barcode-reader';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCurrency } from '@/hooks/useCurrency';
import { useTranslation } from '@/components/i18n/TranslationProvider';
import { useGetEcommerceProductsQuery } from '@/store/features/ecommerce/ecommerceManagementApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { useGetBrandsQuery } from '@/store/features/brand/brandApi';
import { resolveProductImageUrl } from '@/lib/image-url';
import { getResponseItems, getResponsePagination } from '@/app/(application)/(protected)/ecommerce/components/ecommerceUtils';
import FilterButtons from '@/app/(application)/(protected)/pos/pos-left-side/FilterButtons';
import CategoryPanel from '@/app/(application)/(protected)/pos/pos-left-side/CategoryPanel';
import BrandPanel from '@/app/(application)/(protected)/pos/pos-left-side/BrandPanel';
import SearchBar from '@/app/(application)/(protected)/pos/pos-left-side/SearchBar';
import CameraScanner from '@/app/(application)/(protected)/pos/pos-left-side/CameraScanner';
import ImageShowModal from '@/app/(application)/(protected)/products/component/Image Modal/ImageModal2';
import type { CartItem, EcommerceProduct, ProductStock } from '../types';

interface EcommerceProductCatalogProps {
    onAddToCart: (item: CartItem) => void;
    cart: CartItem[];
}

export default function EcommerceProductCatalog({
    onAddToCart,
    cart,
}: EcommerceProductCatalogProps) {
    const { isBn } = useTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const { currentStoreId } = useCurrentStore();

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedBrand, setSelectedBrand] = useState<any>(null);
    const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);
    const [brandPanelOpen, setBrandPanelOpen] = useState(false);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [brandSearchTerm, setBrandSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [addingItemId, setAddingItemId] = useState<number | null>(null);

    // Barcode and Camera Scanner state (POS Left Side UI)
    const [barcodeEnabled, setBarcodeEnabled] = useState(false);
    const [showCameraScanner, setShowCameraScanner] = useState(false);

    // Modal states
    const [variantProduct, setVariantProduct] = useState<EcommerceProduct | null>(null);
    const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Categories & Brands queries for filters
    const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoryQuery(
        currentStoreId ? { store_id: currentStoreId } : {},
        { refetchOnMountOrArgChange: 30 }
    );
    const { data: brandsData, isLoading: isBrandsLoading } = useGetBrandsQuery(
        currentStoreId ? { store_id: currentStoreId } : {},
        { refetchOnMountOrArgChange: 30 }
    );

    const categories = useMemo(() => {
        const raw = categoriesData?.data || categoriesData || [];
        return Array.isArray(raw) ? raw : [];
    }, [categoriesData]);

    const brands = useMemo(() => {
        const raw = brandsData?.data || brandsData || [];
        return Array.isArray(raw) ? raw : [];
    }, [brandsData]);

    // Query active eCommerce products ONLY
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            page: currentPage,
            per_page: 18,
            visibility: 'active',
            status: 'active',
        };
        if (currentStoreId) params.store_id = currentStoreId;
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (selectedCategory?.id) params.category_id = selectedCategory.id;
        if (selectedBrand?.id) params.brand_id = selectedBrand.id;
        return params;
    }, [currentPage, currentStoreId, debouncedSearch, selectedCategory, selectedBrand]);

    // Single API call: eCommerce products endpoint
    const {
        data: ecomProductsResponse,
        isLoading,
        isFetching,
    } = useGetEcommerceProductsQuery(queryParams, {
        refetchOnMountOrArgChange: 30,
        skip: !currentStoreId,
    });

    // Normalize active ecommerce products
    const { products, pagination } = useMemo(() => {
        const ecomItems = getResponseItems(ecomProductsResponse);
        const paginationMeta = getResponsePagination(ecomProductsResponse);

        return {
            products: ecomItems as EcommerceProduct[],
            pagination: {
                currentPage: Number(paginationMeta?.current_page || currentPage),
                totalPages: Number(paginationMeta?.last_page || 1),
                totalItems: Number(paginationMeta?.total || ecomItems.length),
            },
        };
    }, [ecomProductsResponse, currentPage]);

    // Format product for ImageShowModal
    const productForModal = useMemo(() => {
        if (!selectedProductForModal) return null;
        const stocks = (selectedProductForModal.stocks && selectedProductForModal.stocks.length > 0)
            ? selectedProductForModal.stocks
            : selectedProductForModal.primary_stock
            ? [selectedProductForModal.primary_stock]
            : [];
        return {
            ...selectedProductForModal,
            stocks,
            category_name: selectedProductForModal.category?.name || selectedProductForModal.category_name,
            brand_name: selectedProductForModal.brand?.name || selectedProductForModal.brand_name,
            sku: selectedProductForModal.primary_stock?.sku || selectedProductForModal.sku,
            price: selectedProductForModal.primary_stock?.price ?? selectedProductForModal.price,
            quantity: selectedProductForModal.primary_stock?.quantity ?? selectedProductForModal.quantity,
        };
    }, [selectedProductForModal]);

    // Handle filter actions
    const handleCategorySelect = (category: any) => {
        setSelectedCategory(category);
        setCategoryPanelOpen(false);
        setCurrentPage(1);
    };

    const handleBrandSelect = (brand: any) => {
        setSelectedBrand(brand);
        setBrandPanelOpen(false);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSelectedCategory(null);
        setSelectedBrand(null);
        setCurrentPage(1);
    };

    // Barcode scanner handlers
    const toggleBarcodeScanner = () => {
        setBarcodeEnabled(!barcodeEnabled);
        if (showCameraScanner) setShowCameraScanner(false);
    };

    const toggleCameraScanner = () => {
        setShowCameraScanner(!showCameraScanner);
        if (!showCameraScanner) {
            setBarcodeEnabled(false);
        }
    };

    const handleCameraClose = useCallback(() => {
        setShowCameraScanner(false);
        setSearchTerm('');
        setCurrentPage(1);
    }, []);

    const handleCameraScan = useCallback((data: string) => {
        if (!data) return;
        setSearchTerm(data);
        setCurrentPage(1);
    }, []);

    const handleBarcodeScan = useCallback((data: string) => {
        if (data) {
            setSearchTerm(data);
            setCurrentPage(1);
        }
    }, []);

    const handleBarcodeError = () => {};

    // Handle quick add or open variant modal
    const handleProductClick = (product: EcommerceProduct) => {
        const stocks = (product.stocks && product.stocks.length > 0)
            ? product.stocks
            : product.primary_stock
            ? [product.primary_stock]
            : [];

        const validStocks = stocks.filter((s) => Number(s.quantity ?? 0) >= 0);
        const hasMultipleVariants = validStocks.length > 1 || validStocks.some((s) => s.is_variant);

        if (hasMultipleVariants) {
            setVariantProduct(product);
            return;
        }

        const stock = validStocks[0] || product.primary_stock || {
            id: product.id,
            product_id: product.id,
            sku: product.sku || `SKU-${product.id}`,
            price: product.price || product.selling_price || 0,
            quantity: product.quantity || 0,
            unit: product.unit || 'Pcs',
        };

        const priceNum = Number(stock.price ?? product.primary_stock?.price ?? product.price ?? product.selling_price ?? 0);
        const qtyNum = Number(stock.quantity ?? product.primary_stock?.quantity ?? product.quantity ?? 999);
        const stockId = stock.id || product.primary_stock?.id || product.id;
        const skuStr = stock.sku || product.primary_stock?.sku || product.sku || `SKU-${product.id}`;

        const cartItem: CartItem = {
            stock_id: stockId,
            product_id: product.id,
            product_name: product.product_name || product.name || 'Product',
            sku: skuStr,
            price: priceNum,
            originalPrice: priceNum,
            quantity: 1,
            unit: stock.unit || product.unit || 'Pcs',
            image: resolveProductImageUrl(
                stock.images?.[0] ||
                product.primary_stock?.images?.[0] ||
                product.image ||
                product.images?.[0] ||
                product.product_image
            ),
            availableStock: qtyNum,
            variantName: stock.variant_name || '',
        };

        setAddingItemId(product.id);
        onAddToCart(cartItem);
        setTimeout(() => setAddingItemId(null), 600);
    };

    // Add specific variant from modal
    const handleSelectVariant = (stock: ProductStock) => {
        if (!variantProduct) return;
        const priceNum = Number(stock.price ?? variantProduct.primary_stock?.price ?? variantProduct.price ?? 0);
        const stockId = stock.id || variantProduct.id;

        const cartItem: CartItem = {
            stock_id: stockId,
            product_id: variantProduct.id,
            product_name: variantProduct.product_name || variantProduct.name || 'Product',
            sku: stock.sku || variantProduct.sku || `SKU-${variantProduct.id}`,
            price: priceNum,
            originalPrice: priceNum,
            quantity: 1,
            unit: stock.unit || variantProduct.unit || 'Pcs',
            image: resolveProductImageUrl(
                stock.images?.[0] ||
                variantProduct.primary_stock?.images?.[0] ||
                variantProduct.image ||
                variantProduct.product_image ||
                variantProduct.images?.[0]
            ),
            availableStock: Number(stock.quantity ?? 999),
            variantName: stock.variant_name || (stock.sku ? `SKU: ${stock.sku}` : 'Variant'),
            variantData: stock.variant_attributes,
        };

        setAddingItemId(variantProduct.id);
        onAddToCart(cartItem);
        setVariantProduct(null);
        setTimeout(() => setAddingItemId(null), 600);
    };

    return (
        <div className="relative rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-md">
            {/* Barcode Reader - Hidden component that listens for hardware scanner inputs */}
            {barcodeEnabled && <BarcodeReader onScan={handleBarcodeScan} onError={handleBarcodeError} />}

            {/* Slide-over Panels for Category & Brand */}
            <CategoryPanel
                isOpen={categoryPanelOpen}
                categories={categories}
                isLoading={isCategoriesLoading}
                searchTerm={categorySearchTerm}
                onSearchChange={setCategorySearchTerm}
                onSelect={handleCategorySelect}
                onClose={() => setCategoryPanelOpen(false)}
            />

            <BrandPanel
                isOpen={brandPanelOpen}
                brands={brands}
                isLoading={isBrandsLoading}
                searchTerm={brandSearchTerm}
                onSearchChange={setBrandSearchTerm}
                onSelect={handleBrandSelect}
                onClose={() => setBrandPanelOpen(false)}
            />

            {/* Header: POS Left-Side title */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-slate-900">
                                {isBn ? '১. সক্রিয় পণ্য ক্যাটালগ ও সার্চ' : '1. Active Product Catalog & Search'}
                            </h2>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {isBn ? 'শুধু সক্রিয় ই-কমার্স পণ্য' : 'Active Online Products Only'}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            {isBn ? 'অর্ডারে যুক্ত করতে পণ্যের উপর ক্লিক করুন' : 'Click any product card to add to the order'}
                        </p>
                    </div>
                </div>

                {/* Live count */}
                <div className="text-right">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                        {isBn ? `মোট পণ্য: ${formatNumber(pagination.totalItems)}` : `Catalog: ${formatNumber(pagination.totalItems)} Items`}
                    </span>
                </div>
            </div>

            {/* Filter Pills (POS Left-Side Category & Brand buttons) */}
            <FilterButtons
                selectedCategory={selectedCategory}
                selectedBrand={selectedBrand}
                onCategoryClick={() => setCategoryPanelOpen(true)}
                onBrandClick={() => setBrandPanelOpen(true)}
                onClearFilters={handleClearFilters}
            />

            {/* POS Left-Side SearchBar with Keyboard Barcode & Camera Scanner buttons */}
            <SearchBar
                searchTerm={searchTerm}
                barcodeEnabled={barcodeEnabled}
                showCameraScanner={showCameraScanner}
                placeholder={isBn ? 'পণ্যের নাম, SKU বা বারকোড দিয়ে খুঁজুন...' : 'Search active product name, SKU, or barcode...'}
                onSearchChange={(val) => {
                    setSearchTerm(val);
                    setCurrentPage(1);
                }}
                onToggleBarcodeScanner={toggleBarcodeScanner}
                onToggleCameraScanner={toggleCameraScanner}
            />

            {/* Camera Scanner Modal / Drawer */}
            <CameraScanner
                isOpen={showCameraScanner}
                onClose={handleCameraClose}
                onScan={handleCameraScan}
                autoClose={false}
            />

            {/* Product Grid Area */}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 py-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="animate-pulse rounded-xl border border-slate-100 bg-slate-50 p-2.5 space-y-2">
                            <div className="h-28 w-full rounded-lg bg-slate-200" />
                            <div className="h-3 w-3/4 rounded bg-slate-200" />
                            <div className="h-3 w-1/2 rounded bg-slate-200" />
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
                        <Package className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                        {isBn ? 'কোন সক্রিয় ই-কমার্স পণ্য পাওয়া যায়নি' : 'No active online products found'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        {isBn ? 'অনুগ্রহ করে সার্চ বা ক্যাটাগরি ফিল্টার পরিবর্তন করুন' : 'Try adjusting your search or category filters'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                    {products.map((product) => {
                        const stocks = (product.stocks && product.stocks.length > 0)
                            ? product.stocks
                            : product.primary_stock
                            ? [product.primary_stock]
                            : [];

                        const totalQty = stocks.length > 0
                            ? stocks.reduce((sum, s) => sum + Number(s.quantity || 0), 0)
                            : Number(product.primary_stock?.quantity ?? product.quantity ?? 0);

                        const isMultiVariant = stocks.length > 1 || stocks.some((s) => s.is_variant);
                        const isOut = totalQty <= 0;
                        const isAdding = addingItemId === product.id;

                        // Display Price
                        let displayPrice = Number(product.primary_stock?.price ?? product.price ?? product.selling_price ?? 0);
                        let minPrice = displayPrice;
                        let maxPrice = displayPrice;
                        if (stocks.length > 0) {
                            const prices = stocks.map((s) => Number(s.price || 0)).filter((p) => p > 0);
                            if (prices.length > 0) {
                                minPrice = Math.min(...prices);
                                maxPrice = Math.max(...prices);
                                displayPrice = minPrice;
                            }
                        }

                        const stockStatus = totalQty > 10 ? 'high' : totalQty > 0 ? 'low' : 'out';
                        const stockDotColor =
                            stockStatus === 'high' ? 'bg-emerald-500' :
                            stockStatus === 'low' ? 'bg-amber-500' : 'bg-rose-500';

                        const imgSrc = resolveProductImageUrl(
                            product.primary_stock?.images?.[0] ||
                            stocks[0]?.images?.[0] ||
                            product.images?.[0] ||
                            product.image ||
                            product.product_image
                        );

                        return (
                            <div
                                key={product.id}
                                onClick={() => !isOut && handleProductClick(product)}
                                className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-all duration-150 select-none ${
                                    isOut
                                        ? 'cursor-not-allowed border-slate-100 opacity-60'
                                        : isAdding
                                        ? 'scale-[0.96] border-primary ring-2 ring-primary/20 shadow-md'
                                        : 'cursor-pointer border-slate-200/80 shadow-xs hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
                                }`}
                            >
                                {/* Card Image Container (3:2 Aspect Ratio) */}
                                <div className="relative w-full overflow-hidden bg-slate-50" style={{ aspectRatio: '3/2' }}>
                                    {imgSrc ? (
                                        <Image
                                            src={imgSrc}
                                            alt={product.product_name || 'Product'}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            sizes="(max-width: 640px) 160px, 220px"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
                                            <Package className="h-6 w-6 text-slate-300" />
                                        </div>
                                    )}

                                    {/* Stock Status Indicator Dot */}
                                    <span
                                        className={`absolute left-2 top-2 h-2 w-2 rounded-full ring-2 ring-white shadow-xs ${stockDotColor}`}
                                        title={stockStatus === 'high' ? 'In Stock' : stockStatus === 'low' ? 'Low Stock' : 'Out of Stock'}
                                    />

                                    {/* Out of Stock Overlay */}
                                    {isOut && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
                                            <span className="rounded-md bg-rose-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs">
                                                {isBn ? 'স্টক নেই' : 'Out of Stock'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Add Confirmation Flash Animation */}
                                    {isAdding && (
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-[1px]">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-lg ring-4 ring-primary/20">
                                                <Check className="h-4 w-4 text-white" strokeWidth={3} />
                                            </div>
                                        </div>
                                    )}

                                    {/* View Product Details (Eye Button like POS) */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedProductForModal(product);
                                            setIsProductModalOpen(true);
                                        }}
                                        className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xs transition hover:bg-black/60 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                                        title={isBn ? 'পণ্যের বিস্তারিত দেখুন' : 'View Product Details'}
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                    </button>

                                    {/* POS Style Hover '+' Button */}
                                    {!isOut && !isAdding && (
                                        <div className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-md transition sm:scale-90 sm:opacity-0 sm:group-hover:scale-100 sm:group-hover:opacity-100">
                                            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                                        </div>
                                    )}

                                    {/* Multi-variant Tag */}
                                    {isMultiVariant && (
                                        <span className="absolute left-1.5 bottom-1.5 rounded-md bg-slate-900/70 px-1.5 py-0.5 text-[8.5px] font-bold text-white backdrop-blur-xs">
                                            {isBn ? `${stocks.length} ভ্যারিয়েন্ট` : `${stocks.length} Variants`}
                                        </span>
                                    )}
                                </div>

                                {/* Card Details Area */}
                                <div className="flex flex-1 flex-col p-2">
                                    <p
                                        className="line-clamp-2 text-[11px] font-bold leading-tight text-slate-800"
                                        title={product.product_name}
                                    >
                                        {product.product_name}
                                    </p>

                                    {/* Category / SKU subtitle */}
                                    {(product.category?.name || product.primary_stock?.sku || product.sku) && (
                                        <div className="mt-0.5 flex items-center gap-1 text-[9.5px] text-slate-400 font-medium truncate">
                                            {product.category?.name && (
                                                <span className="truncate">{product.category.name}</span>
                                            )}
                                            {product.category?.name && (product.primary_stock?.sku || product.sku) && (
                                                <span>•</span>
                                            )}
                                            {(product.primary_stock?.sku || product.sku) && (
                                                <span className="font-mono text-[9px]">{product.primary_stock?.sku || product.sku}</span>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-auto flex items-center justify-between pt-1.5">
                                        <span className="text-xs font-extrabold text-primary">
                                            {formatCurrency(displayPrice)}
                                            {minPrice !== maxPrice && <span className="text-[10px] text-primary/60 font-semibold"> +</span>}
                                        </span>

                                        {/* Stock quantity badge */}
                                        <span
                                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums ${
                                                stockStatus === 'high'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : stockStatus === 'low'
                                                    ? 'bg-amber-50 text-amber-700'
                                                    : 'bg-rose-50 text-rose-600'
                                            }`}
                                        >
                                            {formatNumber(totalQty)} {product.unit || 'Pcs'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* POS Style Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-500">
                        {isBn
                            ? `পৃষ্ঠা ${formatNumber(pagination.currentPage)} / ${formatNumber(pagination.totalPages)}`
                            : `Page ${formatNumber(pagination.currentPage)} of ${formatNumber(pagination.totalPages)}`}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={pagination.currentPage <= 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            <span>{isBn ? 'আগের' : 'Prev'}</span>
                        </button>
                        <button
                            type="button"
                            disabled={pagination.currentPage >= pagination.totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <span>{isBn ? 'পরের' : 'Next'}</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal: Variant Selection Modal */}
            {variantProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in duration-150">
                        <div className="mb-4 flex items-start justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    {isBn ? 'পণ্য ভ্যারিয়েন্ট ও স্টক নির্বাচন করুন' : 'Select Product Variant'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">{variantProduct.product_name}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setVariantProduct(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                            {((variantProduct.stocks && variantProduct.stocks.length > 0)
                                ? variantProduct.stocks
                                : variantProduct.primary_stock
                                ? [variantProduct.primary_stock]
                                : []
                            ).map((stock) => {
                                const stockQty = Number(stock.quantity ?? 0);
                                const isStockOut = stockQty <= 0;
                                const priceNum = Number(stock.price ?? variantProduct.primary_stock?.price ?? variantProduct.price ?? 0);
                                return (
                                    <div
                                        key={stock.id}
                                        onClick={() => !isStockOut && handleSelectVariant(stock)}
                                        className={`flex items-center justify-between rounded-xl border p-3 transition ${
                                            isStockOut
                                                ? 'opacity-50 bg-slate-50 border-slate-200 cursor-not-allowed'
                                                : 'border-slate-200 hover:border-primary hover:bg-primary/5 cursor-pointer shadow-2xs'
                                        }`}
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">
                                                {stock.variant_name || stock.sku || 'Default Variant'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-slate-400">SKU: {stock.sku || '--'}</span>
                                                <span
                                                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                                                        stockQty > 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                                                    }`}
                                                >
                                                    {isBn ? `স্টক: ${formatNumber(stockQty)}` : `Stock: ${formatNumber(stockQty)}`}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-extrabold text-primary">
                                                {formatCurrency(priceNum)}
                                            </span>
                                            {!isStockOut && (
                                                <button
                                                    type="button"
                                                    className="block text-[10px] font-bold text-primary hover:underline mt-0.5"
                                                >
                                                    + {isBn ? 'যুক্ত করুন' : 'Add to Order'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Product Details Modal (POS ImageShowModal) */}
            {isProductModalOpen && (
                <ImageShowModal
                    isOpen={isProductModalOpen}
                    onClose={() => {
                        setIsProductModalOpen(false);
                        setSelectedProductForModal(null);
                    }}
                    product={productForModal}
                />
            )}
        </div>
    );
}


