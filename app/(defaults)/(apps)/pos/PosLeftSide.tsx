'use client';

import ImageShowModal from '@/app/(defaults)/(apps)/products/component/Image Modal/ImageModal2';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import type { RootState } from '@/store';
import { useGetBrandsQuery } from '@/store/features/brand/brandApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { addItemRedux } from '@/store/features/Order/OrderSlice';
import { useGetAllProductsQuery } from '@/store/features/Product/productApi';
import { Html5Qrcode } from 'html5-qrcode';
import { GripVertical } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BarcodeReader from 'react-barcode-reader';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import BrandPanel from './pos-left-side/BrandPanel';
import CameraScanner from './pos-left-side/CameraScanner';
import CategoryPanel from './pos-left-side/CategoryPanel';
import FilterButtons from './pos-left-side/FilterButtons';
import MobileCartButton from './pos-left-side/MobileCartButton';
import Pagination from './pos-left-side/Pagination';
import ProductGrid from './pos-left-side/ProductGrid';
import SearchBar from './pos-left-side/SearchBar';
import PosRightSide from './PosRightSide';
import VariantSelectionModal from './VariantSelectionModal';

const PosLeftSide = () => {
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Variant selection modal
    const [variantModalOpen, setVariantModalOpen] = useState(false);
    const [variantProduct, setVariantProduct] = useState<any>(null);

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
    const { data: productsData, isLoading, isError, error } = useGetAllProductsQuery(queryParams);

    // Handle both success and 404 "not found" responses
    const products = useMemo(() => {
        // If API returns data array, use it
        if (productsData?.data && Array.isArray(productsData.data)) {
            return productsData.data;
        }
        // If 404 or no products found, return empty array (don't show error)
        return [];
    }, [productsData]);

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

    // Global error handler for debugging mobile crashes
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            console.error('🚨 GLOBAL ERROR CAUGHT:', event.error);
            console.error('Message:', event.message);
            console.error('Filename:', event.filename);
            console.error('Line:', event.lineno, 'Column:', event.colno);
            console.error('Stack:', event.error?.stack);

            // Show alert on mobile for debugging
            alert(`🚨 APP ERROR!\n\nMessage: ${event.message}\n\nFile: ${event.filename}\n\nLine: ${event.lineno}\n\nStack: ${event.error?.stack?.substring(0, 200)}...`);
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            console.error('🚨 UNHANDLED PROMISE REJECTION:', event.reason);
            alert(`🚨 PROMISE ERROR!\n\nReason: ${event.reason}\n\nCheck console for details`);
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
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

    const addToCart = useCallback(
        (product: any) => {
            // Check if product has variants
            const hasVariants = product.stocks && product.stocks.length > 0 && product.stocks.some((s: any) => s.is_variant);

            if (hasVariants) {
                // Open variant selection modal
                setVariantProduct(product);
                setVariantModalOpen(true);
                return;
            }

            // Simple product (no variants) - original logic
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

            // Get primary stock for simple product
            const primaryStock = product.stocks && product.stocks.length > 0 ? product.stocks[0] : null;
            const regularPrice = parseFloat(primaryStock?.price || product.price || 0);
            const wholesalePrice = parseFloat(primaryStock?.wholesale_price || 0);

            const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
            const itemToAdd = {
                id: uniqueId,
                productId: product.id,
                stockId: primaryStock?.id,
                title: product.product_name,
                description: product.description,
                rate: regularPrice,
                regularPrice: regularPrice,
                wholesalePrice: wholesalePrice > 0 ? wholesalePrice : regularPrice,
                quantity: 1,
                amount: regularPrice,
                PlaceholderQuantity: totalQuantity,
                tax_rate: primaryStock?.tax_rate ? parseFloat(primaryStock.tax_rate) : 0,
                tax_included: primaryStock?.tax_included === true,
                unit: primaryStock?.unit || product.unit || 'piece',
                isWholesale: false,
            };

            dispatch(addItemRedux(itemToAdd));
            showMessage('Item added successfully!');

            // Reset filters and search after adding product
            setSearchTerm('');
            setSelectedCategory(null);
            setSelectedBrand(null);
            setCurrentPage(1);
        },
        [reduxItems, dispatch]
    );

    // Handle variant selection from modal
    const handleVariantSelect = useCallback(
        (variant: any, quantity: number, useWholesale: boolean) => {
            if (!variantProduct) return;

            const regularPrice = parseFloat(variant.price);
            const wholesalePrice = parseFloat(variant.wholesale_price);
            const price = useWholesale ? wholesalePrice : regularPrice;

            // Check stock limit for this specific variant
            const currentQuantityInCart = reduxItems.filter((item) => item.productId === variantProduct.id && item.stockId === variant.id).reduce((sum, item) => sum + item.quantity, 0);

            if (currentQuantityInCart + quantity > parseFloat(variant.quantity)) {
                showMessage('Cannot add more, stock limit reached for this variant!', 'error');
                return;
            }

            if (beepRef.current) {
                beepRef.current.currentTime = 0;
                beepRef.current.play().catch(() => {});
            }

            const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
            const itemToAdd = {
                id: uniqueId,
                productId: variantProduct.id,
                stockId: variant.id,
                title: variantProduct.product_name,
                description: variantProduct.description,
                variantName: variant.variant_name,
                variantData: variant.variant_data,
                rate: price,
                regularPrice: regularPrice,
                wholesalePrice: wholesalePrice,
                quantity: quantity,
                amount: price * quantity,
                PlaceholderQuantity: parseFloat(variant.quantity),
                tax_rate: variant.tax_rate ? parseFloat(variant.tax_rate) : 0,
                tax_included: variant.tax_included === true,
                unit: variant.unit || 'piece',
                isWholesale: useWholesale,
            };

            dispatch(addItemRedux(itemToAdd));
            showMessage(`${variant.variant_name} added successfully!`);

            // Reset filters and search
            setSearchTerm('');
            setSelectedCategory(null);
            setSelectedBrand(null);
            setCurrentPage(1);
        },
        [variantProduct, reduxItems, dispatch]
    );

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchTerm(value);
            setCurrentPage(1);

            // 🔑 Auto-add when SKU format detected
            if (value.toLowerCase().startsWith('sku-') && value.length > 10) {
                const foundProduct = (productsData?.data || []).find((p: any) => p.sku?.toLowerCase() === value.toLowerCase());
                if (foundProduct) {
                    addToCart(foundProduct);
                    setSearchTerm(''); // clear after adding
                }
            }
        },
        [productsData, addToCart]
    );

    // Barcode scan handler (for both keyboard scanner and camera scanner)
    const handleBarcodeScan = useCallback(
        (data: string) => {
            console.log('📥 handleBarcodeScan called with:', data);
            try {
                if (data) {
                    // Use handleSearchChange to trigger auto-add for SKU format
                    handleSearchChange(data);
                    // Note: Camera scanner closure is handled in the scanner callback

                    // Play beep sound
                    if (beepRef.current) {
                        beepRef.current.currentTime = 0;
                        beepRef.current.play().catch(() => {});
                    }
                    console.log('✅ handleBarcodeScan completed successfully');
                }
            } catch (err: any) {
                console.error('❌ Error in handleBarcodeScan:', err);
                console.error('Error stack:', err.stack);
                alert(`Scan Handler Error: ${err.message}\n\nPlease refresh the page`);
            }
        },
        [handleSearchChange]
    );

    const handleBarcodeError = (err: any) => {
        console.error('Barcode scan error:', err);
    };

    // Toggle camera scanner
    const toggleCameraScanner = () => {
        setShowCameraScanner(!showCameraScanner);
        if (!showCameraScanner) {
            setBarcodeEnabled(false); // Disable keyboard scanner when camera is active
        }
    };

    // Toggle barcode scanner
    const toggleBarcodeScanner = () => {
        setBarcodeEnabled(!barcodeEnabled);
        if (showCameraScanner) setShowCameraScanner(false);
    };

    // Initialize html5-qrcode scanner
    useEffect(() => {
        let html5QrCode: Html5Qrcode | null = null;

        if (showCameraScanner) {
            console.log('🎥 Initializing camera scanner...');
            // Small delay to ensure DOM element is ready
            const timer = setTimeout(async () => {
                const element = document.getElementById('qr-reader');
                if (!element) {
                    console.error('❌ QR reader element not found!');
                    return;
                }

                console.log('✅ QR reader element found, creating scanner...');

                try {
                    html5QrCode = new Html5Qrcode('qr-reader');
                    console.log('Scanner instance created:', html5QrCode);

                    const config = {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    };

                    console.log('Starting camera...');
                    await html5QrCode.start(
                        { facingMode: 'environment' },
                        config,
                        (decodedText: string, decodedResult: any) => {
                            console.log(`✅ CODE SCANNED: "${decodedText}"`);
                            handleBarcodeScan(decodedText);

                            // Auto-close scanner after successful scan
                            setTimeout(() => {
                                setShowCameraScanner(false);
                            }, 500);
                        },
                        (errorMessage: string) => {
                            // Silent error logging (scanner constantly tries to read)
                        }
                    );

                    console.log('✅ Camera started successfully');
                } catch (err: any) {
                    console.error('❌ Camera start FAILED:', err);
                    console.error('Error name:', err.name);
                    console.error('Error message:', err.message);
                    console.error('Full error:', err);

                    let userMessage = 'Failed to start camera scanner.';

                    if (err.name === 'NotAllowedError' || err.message?.includes('permission')) {
                        userMessage = 'Camera permission denied. Please allow camera access in browser settings.';
                    } else if (err.name === 'NotFoundError' || err.message?.includes('not found')) {
                        userMessage = 'No camera found on this device.';
                    } else if (err.name === 'NotReadableError' || err.message?.includes('in use')) {
                        userMessage = 'Camera is in use by another application. Please close other apps using the camera.';
                    } else if (err.message) {
                        userMessage = `Camera error: ${err.message}`;
                    }

                    alert(`📷 ${userMessage}\n\nTry:\n• Allowing camera permission\n• Closing other camera apps\n• Refreshing the page\n• Using USB barcode scanner instead`);

                    setShowCameraScanner(false);
                }
            }, 100);

            return () => {
                clearTimeout(timer);
                if (html5QrCode) {
                    console.log('🧹 Cleaning up camera scanner...');
                    html5QrCode
                        .stop()
                        .then(() => {
                            console.log('✅ Camera stopped');
                            html5QrCode?.clear();
                        })
                        .catch((err: any) => {
                            console.error('⚠️ Error stopping camera:', err);
                        });
                }
            };
        }
    }, [showCameraScanner, handleBarcodeScan]);

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

    const handleImageShow = (product: any) => {
        console.log('Opening image modal for product:', product.product_name);
        console.log('Product images:', product.images);
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
        setSearchTerm('');
        setCurrentPage(1);
    };

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
            {/* Custom styles for html5-qrcode scanner */}
            <style jsx global>{`
                #qr-reader {
                    border: none !important;
                }
                #qr-reader__dashboard_section {
                    display: none !important;
                }
                #qr-reader__camera_selection {
                    margin: 10px auto;
                    text-align: center;
                }
                #qr-reader video {
                    border-radius: 8px;
                }
            `}</style>

            {/* Barcode Reader - Hidden component that listens for scans */}
            {barcodeEnabled && <BarcodeReader onScan={handleBarcodeScan} onError={handleBarcodeError} />}

            {/* Mobile Cart Toggle Button */}
            {isMobileView && <MobileCartButton showMobileCart={showMobileCart} cartItemCount={reduxItems.length} onToggle={() => setShowMobileCart(!showMobileCart)} />}

            <div ref={containerRef} className="relative flex h-screen overflow-hidden" style={{ userSelect: isDragging ? 'none' : 'auto' }}>
                {/* Category Panel */}
                <CategoryPanel
                    isOpen={categoryPanelOpen}
                    categories={categories}
                    isLoading={catLoading}
                    searchTerm={categorySearchTerm}
                    onSearchChange={setCategorySearchTerm}
                    onSelect={handleCategorySelect}
                    onClose={() => setCategoryPanelOpen(false)}
                />

                {/* Brand Panel */}
                <BrandPanel
                    isOpen={brandPanelOpen}
                    brands={brands}
                    isLoading={brandLoading}
                    searchTerm={brandSearchTerm}
                    onSearchChange={setBrandSearchTerm}
                    onSelect={handleBrandSelect}
                    onClose={() => setBrandPanelOpen(false)}
                />

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

                        <FilterButtons
                            selectedCategory={selectedCategory}
                            selectedBrand={selectedBrand}
                            onCategoryClick={() => setCategoryPanelOpen(true)}
                            onBrandClick={() => setBrandPanelOpen(true)}
                            onClearFilters={clearFilters}
                        />

                        <SearchBar
                            searchTerm={searchTerm}
                            barcodeEnabled={barcodeEnabled}
                            showCameraScanner={showCameraScanner}
                            onSearchChange={handleSearchChange}
                            onToggleBarcodeScanner={toggleBarcodeScanner}
                            onToggleCameraScanner={toggleCameraScanner}
                        />

                        <CameraScanner isOpen={showCameraScanner} onClose={() => setShowCameraScanner(false)} />

                        <ProductGrid
                            products={currentProducts}
                            searchTerm={searchTerm}
                            selectedCategory={selectedCategory}
                            selectedBrand={selectedBrand}
                            leftWidth={leftWidth}
                            isMobileView={isMobileView}
                            onAddToCart={addToCart}
                            onImageShow={handleImageShow}
                            onClearFilters={clearFilters}
                        />

                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                </div>

                {/* Resizable Divider - Hide on mobile */}
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

                {/* Modals */}
                <ImageShowModal isOpen={open} onClose={() => setOpen(false)} product={selectedProduct} />
                <VariantSelectionModal
                    isOpen={variantModalOpen}
                    onClose={() => {
                        setVariantModalOpen(false);
                        setVariantProduct(null);
                    }}
                    product={variantProduct}
                    onSelectVariant={handleVariantSelect}
                />
            </div>
        </>
    );
};

export default PosLeftSide;
