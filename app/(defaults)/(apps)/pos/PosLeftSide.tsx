'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import type { RootState } from '@/store';
import { addItemRedux } from '@/store/features/Order/OrderSlice';
import { useGetAllProductsQuery } from '@/store/features/Product/productApi';

import ImageShowModal from '@/app/(defaults)/components/Image Modal/ImageModal2';
import { useGetBrandsQuery } from '@/store/features/brand/brandApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { Award, Camera, Eye, GripVertical, Package, Search, ShoppingCart, Tag, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BarcodeReader from 'react-barcode-reader';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import PosRightSide from './PosRightSide';

// Dynamically import the barcode scanner to avoid SSR issues
const BarcodeScannerComponent = dynamic(() => import('react-qr-barcode-scanner'), { ssr: false });

const PosLeftSide = () => {
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

    // Resizable layout state
    const [leftWidth, setLeftWidth] = useState(40); // percentage
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Mobile view states
    const [showMobileCart, setShowMobileCart] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [barcodeEnabled, setBarcodeEnabled] = useState(false);
    const [showCameraScanner, setShowCameraScanner] = useState(false);

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

    const reduxItems = useSelector((state: RootState) => state.invoice.items);
    const beepRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        beepRef.current = new Audio('/assets/sound/store-scanner-beep-90395.mp3');
    }, []);

    // Mobile view detection
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth < 1024); // lg breakpoint
        };

        checkMobileView();
        window.addEventListener('resize', checkMobileView);

        return () => window.removeEventListener('resize', checkMobileView);
    }, []);

    // Barcode scan handler (for both keyboard scanner and camera scanner)
    const handleBarcodeScan = (data: string) => {
        if (data) {
            setSearchTerm(data);
            setShowCameraScanner(false); // Close camera scanner after successful scan

            // Auto-add logic already exists in handleSearchChange
            handleSearchChange(data);

            // Play beep sound
            if (beepRef.current) {
                beepRef.current.currentTime = 0;
                beepRef.current.play().catch(() => {});
            }
        }
    };

    const handleBarcodeError = (err: any) => {
        console.error('Barcode scan error:', err);
    };

    // Camera scanner update handler
    const handleCameraScan = (err: any, result: any) => {
        if (result) {
            handleBarcodeScan(result.text);
        }
    };

    // Toggle camera scanner
    const toggleCameraScanner = () => {
        setShowCameraScanner(!showCameraScanner);
        if (!showCameraScanner) {
            setBarcodeEnabled(false); // Disable keyboard scanner when camera is active
        }
    };

    // Resizable functionality
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Constrain between 30% and 80%
            const constrainedWidth = Math.max(30, Math.min(80, newLeftWidth));
            setLeftWidth(constrainedWidth);
        },
        [isDragging]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

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

        if (product.available === false || totalQuantity <= 0) {
            showMessage('Product is not available', 'error');
            return;
        }

        // Check stock limit
        const currentQuantityInCart = reduxItems.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);

        if (currentQuantityInCart >= totalQuantity) {
            showMessage('Cannot add more, stock limit reached!', 'error');
            return;
        }

        if (beepRef.current) {
            beepRef.current.currentTime = 0;
            beepRef.current.play().catch(() => {});
        }

        const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
        const itemToAdd = {
            id: uniqueId,
            productId: product.id,
            title: product.product_name,
            description: product.description,
            rate: parseFloat(product.price),
            quantity: 1,
            amount: parseFloat(product.price),
            PlaceholderQuantity: totalQuantity,
            tax_rate: product.tax?.rate ? parseFloat(product.tax.rate) : 0,
            tax_included: product.tax?.included === true,
            unit: product.unit || (product.stocks && product.stocks.length > 0 ? product.stocks[0].unit : 'piece'),
        };

        dispatch(addItemRedux(itemToAdd));
        showMessage('Item added successfully!');

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
        <>
            {/* Barcode Reader - Hidden component that listens for scans */}
            {barcodeEnabled && <BarcodeReader onScan={handleBarcodeScan} onError={handleBarcodeError} />}

            {/* Mobile Cart Toggle Button - Fixed at bottom */}
            {isMobileView && (
                <button
                    onClick={() => setShowMobileCart(!showMobileCart)}
                    className="hover:bg-primary-dark fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg lg:hidden"
                >
                    {showMobileCart ? <Package className="h-6 w-6" /> : <ShoppingCart className="h-6 w-6" />}
                    {reduxItems.length > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{reduxItems.length}</span>
                    )}
                </button>
            )}

            <div ref={containerRef} className="relative flex h-screen overflow-hidden" style={{ userSelect: isDragging ? 'none' : 'auto' }}>
                {/* Category Panel Overlay */}
                {categoryPanelOpen && (
                    <div className="absolute inset-0 z-50 flex">
                        <div className="flex w-full flex-col overflow-hidden border-r bg-white shadow-2xl sm:w-96 md:w-[28rem]">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b bg-gray-50 p-3 sm:p-4">
                                <div className="flex items-center space-x-2">
                                    <Tag className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Select Category</h2>
                                </div>
                                <button onClick={() => setCategoryPanelOpen(false)} className="rounded-full p-1.5 transition-colors hover:bg-gray-200 sm:p-2">
                                    <X className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="border-b p-3 sm:p-4">
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
                        <div className="flex w-full flex-col overflow-hidden border-r bg-white shadow-2xl sm:w-96 md:w-[28rem]">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b bg-gray-50 p-3 sm:p-4">
                                <div className="flex items-center space-x-2">
                                    <Award className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Select Brand</h2>
                                </div>
                                <button onClick={() => setBrandPanelOpen(false)} className="rounded-full p-1.5 transition-colors hover:bg-gray-200 sm:p-2">
                                    <X className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="border-b p-3 sm:p-4">
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

                {/* Products Section - Resizable Left Panel */}
                <div
                    className={`flex flex-col overflow-hidden ${isMobileView ? 'w-full' : ''} ${isMobileView && showMobileCart ? 'hidden' : ''}`}
                    style={!isMobileView ? { width: `${leftWidth}%` } : {}}
                >
                    <div className="panel flex-1 overflow-auto px-3 py-4 sm:px-6 sm:py-6">
                        <div className="mb-4 sm:mb-6">
                            <h1 className="mb-1 text-xl font-bold text-gray-900 sm:text-2xl">Select Products</h1>
                            <p className="text-xs text-gray-600 sm:text-sm">Click or scan a product to add it to your order</p>
                        </div>

                        {/* Filter Buttons */}
                        <div className="mb-3 flex flex-wrap gap-2 sm:mb-4">
                            <button
                                onClick={() => setCategoryPanelOpen(true)}
                                className="flex items-center space-x-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs transition-colors hover:bg-blue-100 sm:space-x-2 sm:px-4 sm:py-2 sm:text-sm"
                            >
                                <Tag className="h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4" />
                                <span className="font-medium text-blue-700">{selectedCategory ? selectedCategory.name || selectedCategory.category_name : 'Category'}</span>
                            </button>

                            <button
                                onClick={() => setBrandPanelOpen(true)}
                                className="flex items-center space-x-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs transition-colors hover:bg-green-100 sm:space-x-2 sm:px-4 sm:py-2 sm:text-sm"
                            >
                                <Award className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4" />
                                <span className="font-medium text-green-700">{selectedBrand ? selectedBrand.name || selectedBrand.brand_name : 'Brand'}</span>
                            </button>

                            {(selectedCategory || selectedBrand) && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center space-x-1.5 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-xs transition-colors hover:bg-red-100 sm:space-x-2 sm:px-3 sm:py-2 sm:text-sm"
                                >
                                    <X className="h-3.5 w-3.5 text-red-600 sm:h-4 sm:w-4" />
                                    <span className="font-medium text-red-700">Clear</span>
                                </button>
                            )}
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

                        {/* Search with Barcode Scanner */}
                        <div className="relative mb-4 sm:mb-6">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-5 sm:w-5" />
                                    <input
                                        type="text"
                                        placeholder="Search or scan..."
                                        className="form-input w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary sm:py-3 sm:pl-10 sm:pr-4 sm:text-base"
                                        value={searchTerm}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                {/* Keyboard Scanner Button */}
                                <button
                                    onClick={() => {
                                        setBarcodeEnabled(!barcodeEnabled);
                                        if (showCameraScanner) setShowCameraScanner(false);
                                    }}
                                    className={`flex items-center justify-center rounded-lg px-3 py-2 transition-colors sm:px-4 sm:py-3 ${
                                        barcodeEnabled ? 'bg-purple-500 text-white hover:bg-purple-600' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                    title={barcodeEnabled ? 'USB Scanner active' : 'Enable USB Scanner'}
                                >
                                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                {/* Camera Scanner Button */}
                                <button
                                    onClick={toggleCameraScanner}
                                    className={`flex items-center justify-center rounded-lg px-3 py-2 transition-colors sm:px-4 sm:py-3 ${
                                        showCameraScanner ? 'bg-green-500 text-white hover:bg-green-600' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                    title={showCameraScanner ? 'Close camera scanner' : 'Open camera scanner'}
                                >
                                    <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                            </div>
                            {barcodeEnabled && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                                    Keyboard scanner active - Ready to scan with USB/Bluetooth scanner
                                </div>
                            )}
                        </div>

                        {/* Camera Scanner - Inline View */}
                        {showCameraScanner && (
                            <div className="mb-4 overflow-hidden rounded-lg border-2 border-blue-500 bg-white shadow-lg">
                                <div className="flex items-center justify-between border-b bg-blue-500 px-4 py-3">
                                    <div className="flex items-center gap-2 text-white">
                                        <Camera className="h-5 w-5" />
                                        <span className="font-semibold">Camera Scanner Active</span>
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-white"></span>
                                    </div>
                                    <button onClick={() => setShowCameraScanner(false)} className="rounded-full p-1.5 text-white hover:bg-blue-600">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="relative bg-black">
                                    <BarcodeScannerComponent width="100%" height={isMobileView ? 250 : 300} onUpdate={handleCameraScan} />
                                </div>

                                <div className="bg-gray-50 px-4 py-3 text-center text-sm text-gray-700">
                                    <p className="font-medium">Point camera at barcode or QR code</p>
                                    <p className="mt-1 text-xs text-gray-500">Scanner will automatically detect and add product to cart</p>
                                </div>
                            </div>
                        )}

                        {/* Products Grid - Responsive based on width */}
                        <div
                            className="grid gap-3 sm:gap-4"
                            style={{
                                gridTemplateColumns: isMobileView
                                    ? 'repeat(auto-fill, minmax(140px, 1fr))'
                                    : leftWidth > 60
                                    ? 'repeat(auto-fill, minmax(200px, 1fr))'
                                    : leftWidth > 45
                                    ? 'repeat(auto-fill, minmax(180px, 1fr))'
                                    : 'repeat(auto-fill, minmax(160px, 1fr))',
                            }}
                        >
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
                                        <div className="relative h-32 overflow-hidden rounded-t-lg bg-gray-100 sm:h-40 md:h-44">
                                            {product.images && product.images.length > 0 ? (
                                                <Image
                                                    src={
                                                        typeof product.images[0] === 'string'
                                                            ? product.images[0]
                                                            : `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${product.images[0].image_path || product.images[0]}`
                                                    }
                                                    alt={product.product_name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-400">
                                                    <Package className="mb-1 h-8 w-8 sm:mb-2 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                                                    <span className="text-xs font-medium sm:text-sm">No Image</span>
                                                </div>
                                            )}

                                            {/* Open modal */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleImageShow(product);
                                                }}
                                                className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 sm:right-2 sm:top-2 sm:p-2"
                                            >
                                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </button>
                                        </div>

                                        {/* Info */}
                                        <div className="p-2 sm:p-3">
                                            <h3 className="mb-1 line-clamp-2 text-xs font-semibold text-gray-900 sm:text-sm">{product.product_name}</h3>

                                            {/* SKU */}
                                            {product.sku && <div className="mb-0.5 text-[10px] text-gray-400 sm:mb-1 sm:text-xs">SKU: {product.sku}</div>}

                                            {/* Unit */}
                                            <div className="mb-1 text-[10px] font-medium text-blue-600 sm:text-xs">
                                                Unit: {product.unit || (product.stocks && product.stocks.length > 0 ? product.stocks[0].unit : 'N/A')}
                                            </div>

                                            <div className="mt-1.5 flex items-center justify-between sm:mt-2">
                                                <span className="text-sm font-bold text-primary sm:text-base">৳{parseFloat(product.price).toFixed(2)}</span>
                                                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 sm:px-2 sm:text-xs">Stock: {totalQuantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-4 flex items-center justify-center space-x-2 pb-16 sm:mt-6 sm:pb-0 lg:pb-0">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-md border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-50 disabled:opacity-50 sm:px-3 sm:text-sm"
                                >
                                    Prev
                                </button>
                                <span className="text-xs text-gray-600 sm:text-sm">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-md border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-50 disabled:opacity-50 sm:px-3 sm:text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Resizable Divider - WHITE COLOR - Hide on mobile */}
                {!isMobileView && (
                    <div
                        className={`flex w-2 cursor-col-resize items-center justify-center border-l border-r border-white bg-white hover:bg-gray-50 ${isDragging ? 'bg-white' : ''}`}
                        onMouseDown={handleMouseDown}
                    >
                        <GripVertical className="h-6 w-6 text-white" />
                    </div>
                )}

                {/* Bill Form Section - Resizable Right Panel */}
                <div
                    className={`flex flex-col overflow-hidden ${isMobileView ? 'w-full' : ''} ${isMobileView && !showMobileCart ? 'hidden' : ''}`}
                    style={!isMobileView ? { width: `${100 - leftWidth}%` } : {}}
                >
                    <div className="flex-1 overflow-auto">
                        <PosRightSide />
                    </div>
                </div>

                {/* Modal for all images & description */}
                <ImageShowModal isOpen={open} onClose={() => setOpen(false)} product={selectedProduct} />
            </div>
        </>
    );
};

export default PosLeftSide;
