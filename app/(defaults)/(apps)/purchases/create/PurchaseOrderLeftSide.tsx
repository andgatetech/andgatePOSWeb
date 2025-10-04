'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import type { RootState } from '@/store';
// ✅ Changed to use Purchase Order Redux instead of Order/Invoice
import { addItemRedux } from '@/store/features/PurchaseOrder/PurchaseOrderSlice';
import { useGetAllProductsQuery } from '@/store/Product/productApi';

import ImageShowModal from '@/app/(defaults)/components/Image Modal/ImageModal2';
import { Award, Eye, Package, Plus, Search, Tag, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { useGetBrandsQuery } from '@/store/features/brand/brandApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';

const PurchaseOrderLeftSide = () => {
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedBrand, setSelectedBrand] = useState<any>(null);
    const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);
    const [brandPanelOpen, setBrandPanelOpen] = useState(false);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [brandSearchTerm, setBrandSearchTerm] = useState('');

    const dispatch = useDispatch();
    const itemsPerPage = 6;

    // Get current store from hook
    const { currentStoreId, currentStore } = useCurrentStore();

    // Build query parameters for current store only
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            available: 'yes', // Only show available products in POS
        };

        // Always use current store from sidebar for POS
        if (currentStoreId) {
            params.store_id = currentStoreId;
        }

        // Add category filter - send category ID
        if (selectedCategory) {
            params.category_id = selectedCategory.id;
        }

        // Add brand filter - send brand ID
        if (selectedBrand) {
            params.brand_id = selectedBrand.id;
        }

        return params;
    }, [currentStoreId, selectedCategory, selectedBrand]);

    // Category and Brand query params for current store
    const filterQueryParams = useMemo(() => {
        return currentStoreId ? { store_id: currentStoreId } : {};
    }, [currentStoreId]);

    // Fetch products for current store only
    const { data: productsData, isLoading } = useGetAllProductsQuery(queryParams);
    const products = productsData?.data || [];

    // Fetch categories and brands for current store
    const { data: categoriesResponse, isLoading: catLoading } = useGetCategoryQuery(filterQueryParams);
    const categories = categoriesResponse?.data || [];

    const { data: brandsResponse, isLoading: brandLoading } = useGetBrandsQuery(filterQueryParams);
    const brands = brandsResponse?.data || [];
    // Debug logging
    useEffect(() => {
        console.log('Categories Response:', categoriesResponse);
        console.log('Brands Response:', brandsResponse);
        console.log('Current Store ID:', currentStoreId);
    }, [categoriesResponse, brandsResponse, currentStoreId]);

    // ✅ Use purchaseOrder state instead of invoice state
    const reduxItems = useSelector((state: RootState) => state.purchaseOrder.items);
    const beepRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        beepRef.current = new Audio('/assets/sound/store-scanner-beep-90395.mp3');
    }, []);

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 2000,
            customClass: { container: 'toast' },
        });
        toast.fire({ icon: type, title: msg, padding: '8px 16px' });
    };

    const addToCart = (product: any) => {
        // Calculate total quantity from stocks
        const totalQuantity = product.stocks?.reduce((sum: number, stock: any) => sum + parseFloat(stock.quantity || '0'), 0) || 0;

        if (beepRef.current) {
            beepRef.current.currentTime = 0;
            beepRef.current.play().catch(() => {});
        }

        const uniqueId = Date.now() + Math.floor(Math.random() * 1000);

        // Get purchase price from product
        const purchasePrice = parseFloat(product.purchase_price || product.price || '0');

        console.log('Adding product to cart:', {
            product_name: product.product_name,
            purchase_price: product.purchase_price,
            price: product.price,
            final_purchase_price: purchasePrice,
        });

        // ✅ Purchase order item structure (different from sales invoice)
        const itemToAdd = {
            id: uniqueId,
            productId: product.id,
            itemType: 'existing' as const, // Mark as existing product
            title: product.product_name,
            description: product.description || '',
            purchasePrice: purchasePrice,
            quantity: 1,
            amount: purchasePrice,
            availableStock: totalQuantity, // Track current stock
            unit: product.unit || (product.stocks && product.stocks.length > 0 ? product.stocks[0].unit : 'piece'),
            status: 'ordered',
        };

        dispatch(addItemRedux(itemToAdd));
        showMessage('Product added to purchase order!');

        // Reset filters and search after adding product
        setSearchTerm('');
        setSelectedCategory(null);
        setSelectedBrand(null);
        setCurrentPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);

        // 🔑 Auto-add when SKU format detected
        if (value.toLowerCase().startsWith('sku-') && value.length > 10) {
            const foundProduct = products.find((p: any) => p.sku?.toLowerCase() === value.toLowerCase());
            if (foundProduct) {
                addToCart(foundProduct);
                setSearchTerm(''); // clear after adding
            }
        }
    };

    const handleImageShow = (product: any) => {
        setSelectedProduct(product);
        setOpen(true);
    };

    const handleCategorySelect = (category: any) => {
        setSelectedCategory(category);
        setCategoryPanelOpen(false);
        setCategorySearchTerm('');
        setCurrentPage(1);
    };

    const handleBrandSelect = (brand: any) => {
        setSelectedBrand(brand);
        setBrandPanelOpen(false);
        setBrandSearchTerm('');
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSelectedCategory(null);
        setSelectedBrand(null);
        setCurrentPage(1);
    };

    // Filter categories and brands based on search
    const filteredCategories = categories.filter((cat: any) => (cat.name || cat.category_name || '').toLowerCase().includes(categorySearchTerm.toLowerCase()));

    const filteredBrands = brands.filter((brand: any) => (brand.name || brand.brand_name || '').toLowerCase().includes(brandSearchTerm.toLowerCase()));

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const filteredProducts = products.filter(
        (p: any) =>
            p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="relative flex overflow-hidden">
            {/* Category Panel Overlay */}
            {categoryPanelOpen && (
                <div className="absolute inset-0 z-50 flex">
                    <div className="flex w-80 flex-col overflow-hidden border-r bg-white shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b bg-gray-50 p-4">
                            <div className="flex items-center space-x-2">
                                <Tag className="h-5 w-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Select Category</h2>
                            </div>
                            <button onClick={() => setCategoryPanelOpen(false)} className="rounded-full p-2 transition-colors hover:bg-gray-200">
                                <X className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="border-b p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    value={categorySearchTerm}
                                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Categories List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="grid grid-cols-2 gap-3">
                                {catLoading ? (
                                    <div className="col-span-2 py-8 text-center">
                                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                    </div>
                                ) : filteredCategories.length > 0 ? (
                                    filteredCategories.map((category: any) => (
                                        <div
                                            key={category.id}
                                            onClick={() => handleCategorySelect(category)}
                                            className="cursor-pointer rounded-lg border border-gray-200 p-3 text-center transition-all duration-200 hover:border-blue-300 hover:bg-blue-50"
                                        >
                                            {category.image ? (
                                                <div className="mx-auto mb-2 h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                                                    <Image
                                                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${category.image}`}
                                                        alt={category.name || category.category_name}
                                                        width={48}
                                                        height={48}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                                    <Tag className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                            <p className="truncate text-xs font-medium text-gray-900">{category.name || category.category_name}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-8 text-center text-gray-500">No categories found</div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-black bg-opacity-25" onClick={() => setCategoryPanelOpen(false)}></div>
                </div>
            )}

            {/* Brand Panel Overlay */}
            {brandPanelOpen && (
                <div className="absolute inset-0 z-50 flex">
                    <div className="flex w-80 flex-col overflow-hidden border-r bg-white shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b bg-gray-50 p-4">
                            <div className="flex items-center space-x-2">
                                <Award className="h-5 w-5 text-green-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Select Brand</h2>
                            </div>
                            <button onClick={() => setBrandPanelOpen(false)} className="rounded-full p-2 transition-colors hover:bg-gray-200">
                                <X className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="border-b p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search brands..."
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500"
                                    value={brandSearchTerm}
                                    onChange={(e) => setBrandSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Brands List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="grid grid-cols-2 gap-3">
                                {brandLoading ? (
                                    <div className="col-span-2 py-8 text-center">
                                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-green-600"></div>
                                    </div>
                                ) : filteredBrands.length > 0 ? (
                                    filteredBrands.map((brand: any) => (
                                        <div
                                            key={brand.id}
                                            onClick={() => handleBrandSelect(brand)}
                                            className="cursor-pointer rounded-lg border border-gray-200 p-3 text-center transition-all duration-200 hover:border-green-300 hover:bg-green-50"
                                        >
                                            {brand.image ? (
                                                <div className="mx-auto mb-2 h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                                                    <Image
                                                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${brand.image}`}
                                                        alt={brand.name || brand.brand_name}
                                                        width={48}
                                                        height={48}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                                    <Award className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                            <p className="truncate text-xs font-medium text-gray-900">{brand.name || brand.brand_name}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-8 text-center text-gray-500">No brands found</div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-black bg-opacity-25" onClick={() => setBrandPanelOpen(false)}></div>
                </div>
            )}

            {/* Products Section */}
            <div className="flex w-full flex-col">
                <div className="panel h-full overflow-auto px-6 py-6">
                    <div className="mb-6">
                        <h1 className="mb-1 text-2xl font-bold text-gray-900">Select Products</h1>
                        <p className="text-sm text-gray-600">Click or scan a product to add it to your order</p>
                    </div>

                    {/* Filter Buttons */}
                    <div className="mb-4 flex flex-wrap gap-2">
                        <button
                            onClick={() => setCategoryPanelOpen(true)}
                            className="flex items-center space-x-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 transition-colors hover:bg-blue-100"
                        >
                            <Tag className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">{selectedCategory ? selectedCategory.name || selectedCategory.category_name : 'Category'}</span>
                        </button>

                        <button
                            onClick={() => setBrandPanelOpen(true)}
                            className="flex items-center space-x-2 rounded-lg border border-green-300 bg-green-50 px-4 py-2 transition-colors hover:bg-green-100"
                        >
                            <Award className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">{selectedBrand ? selectedBrand.name || selectedBrand.brand_name : 'Brand'}</span>
                        </button>

                        {(selectedCategory || selectedBrand) && (
                            <button onClick={clearFilters} className="flex items-center space-x-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 transition-colors hover:bg-red-100">
                                <X className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-700">Clear</span>
                            </button>
                        )}

                        {/* New Product Button */}
                        <Link href="/products/create" className="flex items-center space-x-2 rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 transition-colors hover:bg-purple-100">
                            <Plus className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">New Product</span>
                        </Link>
                    </div>

                    {/* Active Filters Display */}
                    {(selectedCategory || selectedBrand) && (
                        <div className="mb-4 rounded-lg bg-gray-50 p-3">
                            <div className="flex flex-wrap gap-2">
                                {selectedCategory && (
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                        <Tag className="mr-1 h-3 w-3" />
                                        {selectedCategory.name || selectedCategory.category_name}
                                    </span>
                                )}
                                {selectedBrand && (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                        <Award className="mr-1 h-3 w-3" />
                                        {selectedBrand.name || selectedBrand.brand_name}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, SKU, or scan barcode..."
                            className="form-input w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Products Grid - Responsive based on width */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {currentProducts.map((product: any) => {
                            // Calculate total quantity from stocks
                            const totalQuantity = product.stocks?.reduce((sum: number, stock: any) => sum + parseFloat(stock.quantity || '0'), 0) || 0;
                            const isUnavailable = product.available === false || totalQuantity <= 0;

                            return (
                                <div
                                    key={product.id}
                                    className={`relative cursor-pointer rounded-lg border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
                                        isUnavailable ? 'opacity-60' : 'hover:scale-[1.02]'
                                    }`}
                                    onClick={() => !isUnavailable && addToCart(product)}
                                >
                                    {/* Product Image */}
                                    <div className="relative h-44 overflow-hidden rounded-t-lg bg-gray-100">
                                        {product.images && product.images.length > 0 ? (
                                            <Image src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${product.images[0].image_path}`} alt={product.product_name} fill className="object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-400">
                                                <Package className="mb-2 h-12 w-12" />
                                                <span className="text-sm font-medium">No Image Available</span>
                                            </div>
                                        )}

                                        {/* Open modal */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleImageShow(product);
                                            }}
                                            className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900">{product.product_name}</h3>

                                        {/* SKU */}
                                        {product.sku && <div className="mb-1 text-xs text-gray-400">SKU: {product.sku}</div>}

                                        {/* Unit */}
                                        <div className="mb-1 text-xs font-medium text-blue-600">
                                            Unit: {product.unit || (product.stocks && product.stocks.length > 0 ? product.stocks[0].unit : 'N/A')}
                                        </div>

                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-base font-bold text-primary">৳{parseFloat(product.price).toFixed(2)}</span>
                                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Stock: {totalQuantity}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-center space-x-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for all images & description */}
            <ImageShowModal isOpen={open} onClose={() => setOpen(false)} product={selectedProduct} />
        </div>
    );
};

export default PurchaseOrderLeftSide;
