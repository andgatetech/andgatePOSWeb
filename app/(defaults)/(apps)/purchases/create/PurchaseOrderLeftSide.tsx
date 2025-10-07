'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import type { RootState } from '@/store';
// ✅ Changed to use Purchase Order Redux instead of Order/Invoice
import { useGetAllProductsQuery } from '@/store/features/Product/productApi';
import { addItemRedux } from '@/store/features/PurchaseOrder/PurchaseOrderSlice';

import ImageShowModal from '@/app/(defaults)/components/Image Modal/ImageModal2';
import { Html5Qrcode } from 'html5-qrcode';
import { Award, Camera, Eye, Package, Plus, Search, ShoppingCart, Tag, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BarcodeReader from 'react-barcode-reader';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { useGetBrandsQuery } from '@/store/features/brand/brandApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';

interface PurchaseOrderLeftSideProps {
    isMobileView?: boolean;
    showMobileCart?: boolean;
    setShowMobileCart?: (show: boolean) => void;
}

const PurchaseOrderLeftSide: React.FC<PurchaseOrderLeftSideProps> = ({ isMobileView: propIsMobileView, showMobileCart: propShowMobileCart, setShowMobileCart: propSetShowMobileCart }) => {
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

    // Mobile view states
    const [localShowMobileCart, setLocalShowMobileCart] = useState(false);
    const [localIsMobileView, setLocalIsMobileView] = useState(false);
    const [barcodeEnabled, setBarcodeEnabled] = useState(false);
    const [showCameraScanner, setShowCameraScanner] = useState(false);

    // Use props if provided, otherwise use local state
    const showMobileCart = propShowMobileCart !== undefined ? propShowMobileCart : localShowMobileCart;
    const isMobileView = propIsMobileView !== undefined ? propIsMobileView : localIsMobileView;
    const setShowMobileCart = propSetShowMobileCart || setLocalShowMobileCart;

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

    // Mobile view detection (only if not using props)
    useEffect(() => {
        if (propIsMobileView === undefined) {
            const checkMobileView = () => {
                setLocalIsMobileView(window.innerWidth < 1024); // lg breakpoint
            };

            checkMobileView();
            window.addEventListener('resize', checkMobileView);

            return () => window.removeEventListener('resize', checkMobileView);
        }
    }, [propIsMobileView]);

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

    const addToCart = useCallback(
        (product: any) => {
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
        },
        [dispatch]
    );

    const handleSearchChange = useCallback(
        (value: string) => {
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
        },
        [products, addToCart]
    );

    // Barcode scan handler (for both keyboard scanner and camera scanner)
    const handleBarcodeScan = useCallback(
        (data: string) => {
            console.log('📥 handleBarcodeScan called with:', data);
            try {
                if (data) {
                    // Auto-add when SKU format detected
                    if (data.toLowerCase().startsWith('sku-') && data.length > 10) {
                        const foundProduct = products.find((p: any) => p.sku?.toLowerCase() === data.toLowerCase());
                        if (foundProduct) {
                            addToCart(foundProduct);
                            setSearchTerm('');
                        }
                    } else {
                        // Otherwise just set search term
                        setSearchTerm(data);
                        setCurrentPage(1);
                    }

                    // Play beep sound
                    if (beepRef.current) {
                        beepRef.current.currentTime = 0;
                        beepRef.current.play().catch((err) => {
                            console.warn('Beep sound failed:', err);
                        });
                    }
                    console.log('✅ handleBarcodeScan completed successfully');
                }
            } catch (err: any) {
                console.error('❌ Error in handleBarcodeScan:', err);
                console.error('Error stack:', err.stack);
                alert(`Scan Handler Error: ${err.message}\\n\\nPlease refresh the page`);
            }
        },
        [products, addToCart]
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

    // Initialize html5-qrcode scanner
    useEffect(() => {
        let html5QrCode: Html5Qrcode | null = null;

        if (showCameraScanner) {
            console.log('🎥 Initializing camera scanner...');
            const timer = setTimeout(async () => {
                const element = document.getElementById('qr-reader-purchase');
                if (!element) {
                    console.error('❌ QR reader element not found!');
                    return;
                }

                console.log('✅ QR reader element found, creating scanner...');

                try {
                    console.log('📷 Requesting camera permission via getUserMedia...');
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'environment' },
                    });
                    console.log('✅ Camera permission granted! Stream:', stream);
                    stream.getTracks().forEach((track) => track.stop());

                    html5QrCode = new Html5Qrcode('qr-reader-purchase');

                    const devices = await Html5Qrcode.getCameras();
                    console.log('📹 Available cameras:', devices);

                    if (devices && devices.length > 0) {
                        const cameraId = devices[devices.length - 1].id;
                        console.log('🎯 Using camera:', devices[devices.length - 1].label || cameraId);

                        await html5QrCode.start(
                            cameraId,
                            {
                                fps: 10,
                                qrbox: { width: 250, height: 250 },
                            },
                            async (decodedText) => {
                                console.log('📸 Barcode scanned:', decodedText);

                                try {
                                    if (html5QrCode && html5QrCode.isScanning) {
                                        console.log('⏸️ Stopping scanner...');
                                        await html5QrCode.stop();
                                        console.log('✅ Scanner stopped successfully');
                                    }
                                } catch (stopErr: any) {
                                    console.error('❌ Error stopping scanner:', stopErr);
                                }

                                setTimeout(() => {
                                    try {
                                        console.log('🔄 Processing barcode:', decodedText);
                                        handleBarcodeScan(decodedText);
                                        console.log('✅ Barcode processed');

                                        console.log('🚪 Closing camera scanner...');
                                        setShowCameraScanner(false);
                                        console.log('✅ Camera scanner closed');
                                    } catch (handleErr: any) {
                                        console.error('❌ Error in barcode handling:', handleErr);
                                        alert(`❌ Barcode Processing Error!\n\nError: ${handleErr.message}\n\nPlease refresh the page`);
                                        try {
                                            setShowCameraScanner(false);
                                        } catch (closeErr) {
                                            console.error('Failed to close scanner:', closeErr);
                                        }
                                    }
                                }, 100);
                            },
                            (errorMessage) => {
                                // Error callback (can be ignored for continuous scanning)
                            }
                        );
                        console.log('✅ Camera started successfully!');
                    } else {
                        throw new Error('No cameras found on this device');
                    }
                } catch (err: any) {
                    console.error('❌ Failed to start camera:', err);
                    const errorName = err.name || '';
                    const errorMessage = err.message || 'Failed to access camera';

                    let userMessage = 'Camera Error: ' + errorMessage;

                    if (errorName === 'NotAllowedError' || errorMessage.includes('Permission denied')) {
                        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                        const isHTTPS = window.location.protocol === 'https:';
                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                        if (isLocalhost && !isHTTPS) {
                            userMessage = `🚫 Camera Blocked on Mobile!\n\nMobile browsers require HTTPS for camera access.\n\n✅ SOLUTION:\n• This will work on your live site\n• For local testing, use your laptop/desktop\n• Or use ngrok for HTTPS tunnel\n\nNote: USB barcode scanner still works!`;
                        } else {
                            if (isMobile) {
                                userMessage = `🚫 Camera Permission Needed!\n\n📱 MOBILE STEPS:\n\n1. Refresh this page (pull down)\n2. Look for camera permission popup\n3. Tap "Allow" or "While using"\n\nIf popup doesn't appear:\n• Open browser Settings\n• Find "Site Settings" or "Permissions"\n• Find this website\n• Enable Camera\n• Refresh page\n\nTIP: Close other camera apps first!`;
                            } else {
                                userMessage = `🚫 Camera Permission Needed!\n\n💻 DESKTOP STEPS:\n\n1. Look for camera icon in address bar\n2. Click it and select "Allow"\n3. Refresh the page\n\nOR:\n1. Click the 🔒 lock icon\n2. Click "Site settings"\n3. Find "Camera"\n4. Select "Allow"\n5. Refresh page (F5)\n\nMake sure no other app is using camera!`;
                            }
                        }
                    } else if (errorName === 'NotFoundError' || errorMessage.includes('not found')) {
                        userMessage = `📷 No Camera Found!\n\nPlease check:\n1. Your device has a camera\n2. Camera is not being used by another app\n3. Try closing and reopening browser`;
                    } else if (errorName === 'NotReadableError') {
                        userMessage = `⚠️ Camera In Use!\n\nPlease:\n1. Close other apps using the camera\n2. Restart your browser\n3. Try again`;
                    } else if (errorName === 'NotSupportedError' || errorMessage.includes('Only secure')) {
                        userMessage = `🔒 HTTPS Required!\n\nCamera only works on HTTPS.\n\n✅ Your live site will work!\n\nFor localhost testing:\n• Use desktop/laptop browser\n• Or use ngrok for HTTPS tunnel`;
                    }

                    alert(userMessage);
                    setShowCameraScanner(false);
                }
            }, 100);

            return () => {
                clearTimeout(timer);
                if (html5QrCode) {
                    console.log('🛑 Cleaning up scanner...');
                    if (html5QrCode.isScanning) {
                        html5QrCode
                            .stop()
                            .then(() => {
                                console.log('✅ Scanner cleaned up successfully');
                            })
                            .catch((error) => {
                                console.warn('Scanner cleanup warning:', error.message);
                            });
                    } else {
                        console.log('ℹ️ Scanner already stopped, no cleanup needed');
                    }
                }
            };
        }
    }, [showCameraScanner, handleBarcodeScan]);

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
            {/* Custom styles for html5-qrcode scanner */}
            <style jsx global>{`
                #qr-reader-purchase {
                    border: none !important;
                }
                #qr-reader-purchase__dashboard_section {
                    display: none !important;
                }
                #qr-reader-purchase__camera_selection {
                    margin: 10px auto;
                    text-align: center;
                }
                #qr-reader-purchase video {
                    border-radius: 8px;
                }
            `}</style>

            {/* Barcode Reader - Hidden component that listens for scans */}
            {barcodeEnabled && <BarcodeReader onScan={handleBarcodeScan} onError={handleBarcodeError} />}

            <div className="relative flex overflow-hidden">
                {/* Mobile Cart Toggle Button */}
                {isMobileView && (
                    <button
                        onClick={() => setShowMobileCart(!showMobileCart)}
                        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90"
                    >
                        {showMobileCart ? <Package className="h-6 w-6" /> : <ShoppingCart className="h-6 w-6" />}
                        {reduxItems.length > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{reduxItems.length}</span>
                        )}
                    </button>
                )}

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
                <div className={`flex w-full flex-col ${isMobileView && showMobileCart ? 'hidden' : ''}`}>
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

                                <div className="relative bg-gray-900">
                                    {/* Html5-qrcode scanner will be rendered here */}
                                    <div id="qr-reader-purchase" style={{ border: 'none' }}></div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 text-sm text-gray-700">
                                    <p className="text-center font-medium">Point camera at barcode or QR code</p>
                                    <p className="mt-1 text-center text-xs text-gray-500">Scanner will automatically detect and add product to cart</p>

                                    <div className="mt-3 border-t border-gray-200 pt-3">
                                        <p className="mb-2 text-xs font-semibold text-gray-600">📷 Camera not showing?</p>
                                        <ul className="space-y-1 text-xs text-gray-600">
                                            <li>• Allow camera permission when prompted</li>
                                            <li>• Check browser settings (🔒 icon in address bar)</li>
                                            <li>• Close other apps using camera</li>
                                            <li>• Refresh page after allowing permission</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Products Grid - Responsive: 2 columns */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {currentProducts.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12 sm:py-16">
                                    <Package className="mb-4 h-12 w-12 text-gray-400 sm:h-16 sm:w-16" />
                                    <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">No Products Found</h3>
                                    <p className="mb-4 max-w-md text-center text-sm text-gray-600 sm:text-base">
                                        {selectedCategory || selectedBrand ? (
                                            <>
                                                No products match your selected filters.
                                                <br />
                                                Try selecting different filters or clear them to see all products.
                                            </>
                                        ) : searchTerm ? (
                                            <>
                                                No products match your search &quot;{searchTerm}&quot;.
                                                <br />
                                                Try different keywords or check the spelling.
                                            </>
                                        ) : (
                                            <>
                                                No products available in this store.
                                                <br />
                                                Please add products to get started.
                                            </>
                                        )}
                                    </p>
                                    {(selectedCategory || selectedBrand || searchTerm) && (
                                        <button
                                            onClick={() => {
                                                clearFilters();
                                                setSearchTerm('');
                                            }}
                                            className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                                        >
                                            <X className="h-4 w-4" />
                                            <span>Clear All Filters</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                currentProducts.map((product: any) => {
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
                                                    <Image
                                                        src={
                                                            typeof product.images[0] === 'string'
                                                                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage${product.images[0]}`
                                                                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage${product.images[0].image_path || product.images[0]}`
                                                        }
                                                        alt={product.product_name}
                                                        fill
                                                        className="object-cover"
                                                    />
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
                                })
                            )}
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
        </>
    );
};

export default PurchaseOrderLeftSide;
