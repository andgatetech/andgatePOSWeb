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
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import BrandPanel from './pos-left-side/BrandPanel';
import CameraScanner from './pos-left-side/CameraScanner';
import CategoryPanel from './pos-left-side/CategoryPanel';
import FilterButtons from './pos-left-side/FilterButtons';
import MobileCartButton from './pos-left-side/MobileCartButton';
import Pagination from './pos-left-side/Pagination';
import ProductGrid from './pos-left-side/ProductGrid';
import SearchBar from './pos-left-side/SearchBar';
import SerialSelectionModal from './SerialSelectionModal';
import VariantSelectionModal from './VariantSelectionModal';

interface PosLeftSideProps {
    children?: React.ReactNode;
    disableSerialSelection?: boolean; // For stock adjustment, we don't need serial selection
}

const PosLeftSide: React.FC<PosLeftSideProps> = ({ children, disableSerialSelection = false }) => {
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Variant selection modal
    const [variantModalOpen, setVariantModalOpen] = useState(false);
    const [variantProduct, setVariantProduct] = useState<any>(null);

    // Serial selection modal
    const [serialModalOpen, setSerialModalOpen] = useState(false);
    const [serialProduct, setSerialProduct] = useState<any>(null);
    const [serialStock, setSerialStock] = useState<any>(null);

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
    const [itemsPerPage, setItemsPerPage] = useState(12); // Items per page for POS

    // Get current store from hook
    const { currentStoreId, currentStore } = useCurrentStore();

    // Build query parameters for current store only - with pagination and sorting support
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            available: 'yes', // Only show available products in POS
            page: currentPage,
            per_page: itemsPerPage,
            sort_field: 'product_name',
            sort_direction: 'asc',
        };

        // Always use current store from sidebar for POS
        if (currentStoreId) {
            params.store_id = currentStoreId;
        }

        // Add search filter - send to API
        if (searchTerm && searchTerm.trim() !== '') {
            params.search = searchTerm.trim();
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
    }, [currentStoreId, selectedCategory, selectedBrand, searchTerm, currentPage, itemsPerPage]);

    // Category and Brand query params for current store
    const filterQueryParams = useMemo(() => {
        return currentStoreId ? { store_id: currentStoreId } : {};
    }, [currentStoreId]);

    // Fetch products for current store only
    const { data: productsData, isLoading, isError, error } = useGetAllProductsQuery(queryParams);

    // Handle both success and 404 "not found" responses - NEW API FORMAT
    const products = useMemo(() => {
        // NEW API FORMAT: Check if productsData.data is an object with items array
        if (productsData?.data && typeof productsData.data === 'object' && !Array.isArray(productsData.data)) {
            const dataObj = productsData.data as Record<string, any>;
            if (Array.isArray(dataObj.items)) {
                return dataObj.items;
            }
        }

        // Legacy: If API returns data array directly, use it
        if (productsData?.data && Array.isArray(productsData.data)) {
            return productsData.data;
        }

        // If 404 or no products found, return empty array (don't show error)
        return [];
    }, [productsData]);

    // Extract pagination metadata
    const paginationMeta = useMemo(() => {
        if (productsData?.data && typeof productsData.data === 'object' && !Array.isArray(productsData.data)) {
            const dataObj = productsData.data as Record<string, any>;
            if (dataObj.pagination) {
                return dataObj.pagination;
            }
        }
        return null;
    }, [productsData]);

    // Calculate total pages from API or fallback to client-side calculation
    const totalRecords = paginationMeta?.total ?? products.length;
    const totalPages = paginationMeta?.last_page ?? Math.max(1, Math.ceil(totalRecords / itemsPerPage));

    // Fetch categories and brands for current store
    const { data: categoriesResponse, isLoading: catLoading } = useGetCategoryQuery(filterQueryParams);
    const categories = categoriesResponse?.data || [];

    const { data: brandsResponse, isLoading: brandLoading } = useGetBrandsQuery(filterQueryParams);
    const brands = brandsResponse?.data || [];

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

    const showMessage = (msg = '', type = 'success') => {
        if (type === 'success') {
            toast.success(msg, {
                duration: 2000,
                position: 'top-center',
                style: {
                    background: '#10b981',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#10b981',
                },
            });
        } else {
            toast.error(msg, {
                duration: 3000,
                position: 'top-center',
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
        }
    };

    const addToCart = useCallback(
        (product: any) => {
            console.log('🛒 addToCart called for product:', product.product_name);
            console.log('Has serial:', product.has_serial);
            console.log('Has warranty:', product.has_warranty);
            console.log('Available serials:', product.serials);

            // Check if product has variants
            const hasVariants = product.stocks && product.stocks.length > 0 && product.stocks.some((s: any) => s.is_variant);

            if (hasVariants) {
                // Open variant selection modal
                setVariantProduct(product);
                setVariantModalOpen(true);
                return;
            }

            // Check if product has serial numbers (for simple products)
            if (!disableSerialSelection && product.has_serial && product.serials && product.serials.length > 0) {
                // Open serial selection modal
                console.log('🔢 Opening serial selection modal');
                setSerialProduct(product);
                setSerialStock(product.stocks && product.stocks.length > 0 ? product.stocks[0] : null);
                setSerialModalOpen(true);
                return;
            }

            // Simple product (no variants, no serials) - original logic
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
                sku: product.sku || primaryStock?.sku || '',
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
                // Serial & Warranty support
                has_serial: product.has_serial || false,
                has_warranty: product.has_warranty,
                warranty: product.has_warranty && product.warranties && product.warranties.length > 0 ? product.warranties[0] : null,
            };

            dispatch(addItemRedux(itemToAdd));
            showMessage('Item added successfully!');

            // Reset filters and search after adding product
            setSearchTerm('');
            setSelectedCategory(null);
            setSelectedBrand(null);
            setCurrentPage(1);
        },
        [reduxItems, dispatch, disableSerialSelection]
    );

    // Handle variant selection from modal
    const handleVariantSelect = useCallback(
        (variant: any, quantity: number, useWholesale: boolean) => {
            if (!variantProduct) return;

            console.log('🎯 Variant selected:', variant);
            console.log('Product has serial:', variantProduct.has_serial);

            // If variant product has serial numbers and serial selection is enabled, open serial selection modal
            if (!disableSerialSelection && variantProduct.has_serial && variantProduct.serials && variantProduct.serials.length > 0) {
                console.log('🔢 Variant has serials, opening serial modal');
                setSerialProduct(variantProduct);
                setSerialStock(variant);
                setSerialModalOpen(true);
                setVariantModalOpen(false); // Close variant modal
                return;
            }

            // No serials - proceed with normal variant add
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

            // Find warranty for this specific variant
            let variantWarranty = null;
            if (variantProduct.has_warranty && variantProduct.warranties && variantProduct.warranties.length > 0) {
                variantWarranty = variantProduct.warranties.find((w: any) => w.product_stock_id === variant.id);
            }

            const itemToAdd = {
                id: uniqueId,
                productId: variantProduct.id,
                stockId: variant.id,
                title: variantProduct.product_name,
                description: variantProduct.description,
                sku: variant.sku || variantProduct.sku || '',
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
                // Serial & Warranty support - use variant-specific warranty
                has_serial: variantProduct.has_serial || false,
                has_warranty: variantProduct.has_warranty,
                warranty: variantWarranty,
            };

            dispatch(addItemRedux(itemToAdd));
            showMessage(`${variant.variant_name} added successfully!`);

            // Reset filters and search
            setSearchTerm('');
            setSelectedCategory(null);
            setSelectedBrand(null);
            setCurrentPage(1);
        },
        [variantProduct, reduxItems, dispatch, disableSerialSelection]
    );

    // Handle serial selection from modal
    const handleSerialSelect = useCallback(
        (selectedSerials: any[], warranty: any) => {
            if (!serialProduct || !serialStock) return;

            console.log('🔢 Serials selected:', selectedSerials);
            console.log('🛡️ Warranty:', warranty);

            // Each serial number creates a separate cart item (quantity = 1 per serial)
            const baseTimestamp = Date.now();
            selectedSerials.forEach((serial, index) => {
                const regularPrice = parseFloat(serialStock.price);
                const wholesalePrice = parseFloat(serialStock.wholesale_price || regularPrice);

                // Ensure unique ID by adding index offset to prevent collisions
                const uniqueId = baseTimestamp + index;
                const itemToAdd = {
                    id: uniqueId,
                    productId: serialProduct.id,
                    stockId: serialStock.id,
                    title: serialProduct.product_name,
                    description: serialProduct.description,
                    sku: serialStock.sku || serialProduct.sku || '',
                    variantName: serialStock.variant_name,
                    variantData: serialStock.variant_data,
                    rate: regularPrice,
                    regularPrice: regularPrice,
                    wholesalePrice: wholesalePrice,
                    quantity: 1, // Always 1 for serialized items
                    amount: regularPrice,
                    PlaceholderQuantity: 1, // Each serial is unique
                    tax_rate: serialStock.tax_rate ? parseFloat(serialStock.tax_rate) : 0,
                    tax_included: serialStock.tax_included === true,
                    unit: serialStock.unit || 'piece',
                    isWholesale: false,
                    // Serial & Warranty data
                    has_serial: true,
                    serials: [serial], // Single serial per item
                    has_warranty: serialProduct.has_warranty,
                    warranty: warranty,
                };

                console.log(`📦 Adding item #${index + 1} with serial: ${serial.serial_number}, ID: ${uniqueId}`);
                dispatch(addItemRedux(itemToAdd));
            });

            if (beepRef.current) {
                beepRef.current.currentTime = 0;
                beepRef.current.play().catch(() => {});
            }

            showMessage(`${selectedSerials.length} item(s) with serial numbers added!`);

            // Reset filters and search
            setSearchTerm('');
            setSelectedCategory(null);
            setSelectedBrand(null);
            setCurrentPage(1);

            // Close modal and reset state
            setSerialModalOpen(false);
            setSerialProduct(null);
            setSerialStock(null);
        },
        [serialProduct, serialStock, dispatch]
    );

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchTerm(value);
            setCurrentPage(1); // Reset to first page on search

            // 🔑 Auto-add when SKU format detected
            if (value.toLowerCase().startsWith('sku-') && value.length > 10) {
                const foundProduct = products.find((p: any) => p.sku?.toLowerCase() === value.toLowerCase());
                if (foundProduct) {
                    addToCart(foundProduct);
                    setSearchTerm(''); // clear after adding
                }
            }
        },
        [products, addToCart]
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
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="text-center">
                    {/* Modern Spinner */}
                    <div className="relative mx-auto mb-8 h-20 w-20">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary"></div>
                    </div>

                    {/* Loading Text */}
                    <h3 className="text-lg font-semibold text-gray-700">Loading ...</h3>
                </div>
            </div>
        );
    }

    // Use products directly from API (already filtered and paginated server-side)
    const currentProducts = products;

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

                        <ProductGrid products={currentProducts} leftWidth={leftWidth} isMobileView={isMobileView} onAddToCart={addToCart} onImageShow={handleImageShow} />

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
                    <div className="flex-1 overflow-auto">{children}</div>
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
                <SerialSelectionModal
                    isOpen={serialModalOpen}
                    onClose={() => {
                        setSerialModalOpen(false);
                        setSerialProduct(null);
                        setSerialStock(null);
                    }}
                    product={serialProduct}
                    selectedStock={serialStock}
                    onConfirm={handleSerialSelect}
                />
            </div>
        </>
    );
};

export default PosLeftSide;
