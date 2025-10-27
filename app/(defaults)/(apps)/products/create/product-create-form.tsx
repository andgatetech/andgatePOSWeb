'use client';

import SubscriptionError from '@/components/common/SubscriptionError';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import useSubscriptionError from '@/hooks/useSubscriptionError';
import { useGetStoreAttributesQuery } from '@/store/features/attribute/attribute';
import { useGetBrandsQuery } from '@/store/features/brand/brandApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { useCreateProductMutation, useGetUnitsQuery } from '@/store/features/Product/productApi';
import { Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import AttributesTab from './AttributesTab';
import BasicInfoTab from './BasicInfoTab';
import ImagesTab from './ImagesTab';
import MobileTabFAB from './MobileTabFAB';
import PricingTab from './PricingTab';
import ProductCreateTabs from './ProductCreateTabs';
import SerialTab from './SerialTab';
import SKUTab from './SKUTab';
import StockTab from './StockTab';
import TaxTab from './TaxTab';
import WarrantyTab from './WarrantyTab';

const ProductCreateForm = () => {
    const maxNumber = 10;
    const [images, setImages] = useState<any>([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [showBrandDropdown, setShowBrandDropdown] = useState(false);
    const [brandSearchTerm, setBrandSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('basic');
    const router = useRouter();

    const { currentStore } = useCurrentStore();

    // Send store_id for the currently selected store only
    const queryParams = currentStore?.id ? { store_id: currentStore.id } : {};

    const { data: categoriesResponse, isLoading: catLoading } = useGetCategoryQuery(queryParams);
    const categories = categoriesResponse?.data || [];
    const { data: brandsResponse, isLoading: brandLoading } = useGetBrandsQuery(queryParams);
    const brands = brandsResponse?.data || [];
    const [createProduct, { isLoading: createLoading, error: createProductError }] = useCreateProductMutation();
    const { data: unitsResponse, isLoading: unitsLoading } = useGetUnitsQuery(queryParams);
    const units = unitsResponse?.data || [];
    const { data: attributesResponse, isLoading: attributesLoading } = useGetStoreAttributesQuery(queryParams);
    const attributes = attributesResponse?.data || [];

    // Check for subscription errors
    const { hasSubscriptionError, subscriptionError } = useSubscriptionError(createProductError as any);

    // Product Attributes State
    const [productAttributes, setProductAttributes] = useState<Array<{ attribute_id: number; value: string }>>([]);

    // Product Serials State
    const [productSerials, setProductSerials] = useState<Array<{ serial_number: string; notes: string }>>([]);

    // Product Warranties State
    const [productWarranties, setProductWarranties] = useState<Array<{ warranty_type_id: number; duration_months?: number; duration_days?: number }>>([]);

    const [formData, setFormData] = useState({
        category_id: '',
        category_name: '',
        brand_id: '',
        brand_name: '',
        product_name: '',
        description: '',
        price: '',
        wholesale_price: '',
        available: 'yes',
        quantity: '',
        low_stock_quantity: '',
        purchase_price: '',
        sku: '',
        skuOption: 'auto' as 'auto' | 'manual',
        units: '',
        tax_rate: '',
        tax_included: false,
        has_attributes: false,
        has_warranty: false,
        has_serial: false,
    });

    // Tab completion validation functions
    const isBasicInfoComplete = () => {
        return formData.product_name.trim() !== '' && formData.category_id !== '';
    };

    const isPricingComplete = () => {
        return formData.price !== '';
    };

    const isStockComplete = () => {
        return formData.units !== '' && formData.quantity !== '';
    };

    // Tab visibility and unlock logic
    const getVisibleTabs = () => {
        const tabs = ['basic']; // Basic is always visible

        // Pricing unlocks after basic info is complete
        if (isBasicInfoComplete()) {
            tabs.push('pricing');
        }

        // Stock unlocks after price is entered
        if (isBasicInfoComplete() && isPricingComplete()) {
            tabs.push('stock');
        }

        // After stock is complete, ALL tabs unlock
        const stockCompleted = isBasicInfoComplete() && isPricingComplete() && isStockComplete();

        if (stockCompleted) {
            tabs.push('tax', 'sku', 'images');

            // All optional tabs also unlock after stock completion
            if (formData.has_attributes) {
                tabs.push('attributes');
            }
            if (formData.has_warranty) {
                tabs.push('warranty');
            }
            if (formData.has_serial) {
                tabs.push('serial');
            }
        }

        return tabs;
    };

    const isTabUnlocked = (tabId: string) => {
        return getVisibleTabs().includes(tabId);
    };

    // Get recent 5 categories for dropdown and filter based on search
    const recentCategories = categories.slice(0, 5);
    const recentBrands = brands.slice(0, 5);

    // Filter categories based on search term
    const filteredCategories = categorySearchTerm.trim()
        ? categories.filter(
              (cat: any) => cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) || (cat.description && cat.description.toLowerCase().includes(categorySearchTerm.toLowerCase()))
          )
        : recentCategories;

    // Filter brands based on search term
    const filteredBrands = brandSearchTerm.trim()
        ? brands.filter(
              (brand: any) => brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase()) || (brand.description && brand.description.toLowerCase().includes(brandSearchTerm.toLowerCase()))
          )
        : recentBrands;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCategorySelect = (category: any) => {
        setFormData((prev) => ({
            ...prev,
            category_id: category.id.toString(),
            category_name: category.name,
        }));
        setShowCategoryDropdown(false);
        setCategorySearchTerm(''); // Clear search when category is selected
    };

    const handleBrandSelect = (brand: any) => {
        setFormData((prev) => ({
            ...prev,
            brand_id: brand.id.toString(),
            brand_name: brand.name,
        }));
        setShowBrandDropdown(false);
        setBrandSearchTerm(''); // Clear search when brand is selected
    };

    // Tab navigation handlers
    const handleNext = () => {
        const visibleTabs = getVisibleTabs();
        const currentIndex = visibleTabs.indexOf(activeTab);

        // Only navigate to next tab if it exists in visible tabs
        if (currentIndex < visibleTabs.length - 1) {
            setActiveTab(visibleTabs[currentIndex + 1]);
        }
    };

    const handlePrevious = () => {
        const visibleTabs = getVisibleTabs();
        const currentIndex = visibleTabs.indexOf(activeTab);

        // Navigate to previous tab if it exists
        if (currentIndex > 0) {
            setActiveTab(visibleTabs[currentIndex - 1]);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.product_name.trim()) {
            toast.error('Please enter Product Name!');
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            toast.error('Please enter valid Price!');
            return;
        }
        if (!formData.quantity || parseFloat(formData.quantity) < 0) {
            toast.error('Please enter valid Quantity!');
            return;
        }
        if (!formData.purchase_price || parseFloat(formData.purchase_price) <= 0) {
            toast.error('Please enter valid Purchase Price!');
            return;
        }

        // Additional validations
        if (formData.low_stock_quantity && parseFloat(formData.low_stock_quantity) < 0) {
            toast.error('Low stock quantity cannot be negative!');
            return;
        }

        if (formData.tax_rate && (parseFloat(formData.tax_rate) < 0 || parseFloat(formData.tax_rate) > 100)) {
            toast.error('Tax rate must be between 0 and 100!');
            return;
        }

        try {
            const fd = new FormData();

            // Add store_id from current store (required by backend)
            if (currentStore?.id) {
                fd.append('store_id', String(currentStore.id));
            } else {
                toast.error('Please select a store first!');
                return;
            }

            if (formData.category_id) {
                fd.append('category_id', formData.category_id);
            }
            if (formData.brand_id) {
                fd.append('brand_id', formData.brand_id);
            }
            fd.append('product_name', formData.product_name.trim());
            fd.append('description', formData.description.trim());
            fd.append('price', String(formData.price));
            fd.append('quantity', String(formData.quantity));
            fd.append('purchase_price', String(formData.purchase_price));
            fd.append('available', formData.available);
            // store_id already added above, don't duplicate it

            // Add wholesale price if provided
            if (formData.wholesale_price) {
                fd.append('wholesale_price', String(formData.wholesale_price));
            }

            // Add low stock quantity
            if (formData.low_stock_quantity) {
                fd.append('low_stock_quantity', String(formData.low_stock_quantity));
            }

            // Add unit field as units array (backend expects units array)
            if (formData.units) {
                fd.append('units[0][name]', formData.units);
            }

            // Add tax fields
            if (formData.tax_rate) {
                fd.append('tax_rate', String(formData.tax_rate));
            }
            // Send tax_included as string boolean that backend can parse
            fd.append('tax_included', formData.tax_included ? '1' : '0');

            // Add SKU if manual
            if (formData.skuOption === 'manual' && formData.sku.trim()) {
                fd.append('sku', formData.sku.trim());
            }

            // Add product attributes
            if (productAttributes && productAttributes.length > 0) {
                productAttributes.forEach((attr, index) => {
                    if (attr.attribute_id && attr.value.trim()) {
                        fd.append(`attributes[${index}][attribute_id]`, String(attr.attribute_id));
                        fd.append(`attributes[${index}][value]`, attr.value.trim());
                    }
                });
            }

            // Validate and add images
            if (images && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const img = images[i];
                    const validMimes = ['image/jpeg', 'image/png', 'image/jpg'];

                    if (!validMimes.includes(img.file.type)) {
                        toast.error(`Image ${i + 1}: Only JPG and PNG images are allowed!`);
                        return;
                    }

                    if (img.file.size > 2 * 1024 * 1024) {
                        toast.error(`Image ${i + 1}: File size must be less than 2MB!`);
                        return;
                    }

                    fd.append('images[]', img.file as File);
                }
            }

            // Add serial numbers if has_serial is checked and serials are provided
            if (formData.has_serial && productSerials.length > 0) {
                const serialsToSave = productSerials
                    .filter((serial) => serial.serial_number.trim() !== '')
                    .map((serial) => ({
                        serial_number: serial.serial_number.trim(),
                        notes: serial.notes.trim(),
                    }));

                if (serialsToSave.length > 0) {
                    serialsToSave.forEach((serial, index) => {
                        fd.append(`serials[${index}][serial_number]`, serial.serial_number);
                        fd.append(`serials[${index}][notes]`, serial.notes);
                    });
                }
            }

            // Add warranties if has_warranty is checked and warranties are provided
            if (formData.has_warranty && productWarranties.length > 0) {
                const warrantiesToSave = productWarranties.filter((warranty) => warranty.warranty_type_id > 0);

                if (warrantiesToSave.length > 0) {
                    warrantiesToSave.forEach((warranty, index) => {
                        fd.append(`warranties[${index}][warranty_type_id]`, String(warranty.warranty_type_id));
                        if (warranty.duration_months !== undefined && warranty.duration_months > 0) {
                            fd.append(`warranties[${index}][duration_months]`, String(warranty.duration_months));
                        }
                        if (warranty.duration_days !== undefined && warranty.duration_days > 0) {
                            fd.append(`warranties[${index}][duration_days]`, String(warranty.duration_days));
                        }
                    });
                }
            }

            const result = await createProduct(fd).unwrap();

            // Reset form
            setFormData({
                category_id: '',
                category_name: '',
                brand_id: '',
                brand_name: '',
                product_name: '',
                description: '',
                price: '',
                wholesale_price: '',
                available: 'yes',
                quantity: '',
                low_stock_quantity: '',
                purchase_price: '',
                sku: '',
                skuOption: 'auto',
                units: '',
                tax_rate: '',
                tax_included: false,
                has_attributes: false,
                has_warranty: false,
                has_serial: false,
            });
            setImages([]);
            setProductAttributes([]); // Clear attributes
            setProductSerials([]); // Clear serials
            setProductWarranties([]); // Clear warranties

            // Success modal
            await Swal.fire({
                title: 'Success!',
                text: 'Product has been created successfully',
                icon: 'success',
                confirmButtonText: 'Go to Products',
                confirmButtonColor: '#10b981',
                showCancelButton: true,
                cancelButtonText: 'Create Another',
                cancelButtonColor: '#6b7280',
                background: '#ffffff',
                color: '#374151',
                customClass: {
                    popup: 'rounded-xl shadow-2xl',
                    title: 'text-xl font-semibold',
                    confirmButton: 'rounded-lg px-4 py-2 font-medium',
                    cancelButton: 'rounded-lg px-4 py-2 font-medium',
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push('/products');
                }
            });
        } catch (error: any) {
            console.error('Create product failed', error);

            // Don't show Swal for 403 subscription errors - SubscriptionError component will handle it
            if (error?.status !== 403) {
                const errorMessage = error?.data?.message || 'Something went wrong while creating the product';

                await Swal.fire({
                    title: 'Error!',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'Try Again',
                    confirmButtonColor: '#ef4444',
                    background: '#ffffff',
                    color: '#374151',
                    customClass: {
                        popup: 'rounded-xl shadow-2xl',
                        title: 'text-xl font-semibold',
                        confirmButton: 'rounded-lg px-4 py-2 font-medium',
                    },
                });
            }
        }
    };

    // Show subscription error component if subscription middleware error occurs
    if (hasSubscriptionError) {
        return <SubscriptionError errorType={subscriptionError.errorType!} message={subscriptionError.message} details={subscriptionError.details} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                                    <Store className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
                                    <p className="text-sm text-gray-500">{currentStore ? `Add to ${currentStore.store_name}` : 'Add to your inventory'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs - Desktop & Tablet */}
                <ProductCreateTabs activeTab={activeTab} onTabChange={setActiveTab} visibleTabs={getVisibleTabs()} />

                {/* Mobile FAB */}
                <MobileTabFAB activeTab={activeTab} onTabChange={setActiveTab} visibleTabs={getVisibleTabs()} />

                {/* Store Info Section */}
                {currentStore && (
                    <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-lg">
                        <div className="relative p-6">
                            {/* Decorative circles */}
                            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"></div>
                            <div className="absolute -bottom-6 right-20 h-24 w-24 rounded-full bg-white/5"></div>

                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
                                        <Store className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-emerald-50">Adding Product To</p>
                                        <h3 className="text-2xl font-bold text-white drop-shadow-sm">{currentStore.store_name}</h3>
                                        <p className="mt-1 text-xs text-emerald-50">Build your inventory with ease</p>
                                    </div>
                                </div>
                                <div className="hidden items-center space-x-6 md:flex">
                                    <div className="text-right">
                                        <p className="text-xs font-medium text-blue-100">Store ID</p>
                                        <p className="text-lg font-semibold text-white">#{currentStore.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Form Card */}
                <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-xl">
                    <div className="p-6 md:p-8">
                        {/* Tab Content */}
                        {activeTab === 'basic' && (
                            <BasicInfoTab
                                formData={formData}
                                handleChange={handleChange}
                                showCategoryDropdown={showCategoryDropdown}
                                setShowCategoryDropdown={setShowCategoryDropdown}
                                categorySearchTerm={categorySearchTerm}
                                setCategorySearchTerm={setCategorySearchTerm}
                                showBrandDropdown={showBrandDropdown}
                                setShowBrandDropdown={setShowBrandDropdown}
                                brandSearchTerm={brandSearchTerm}
                                setBrandSearchTerm={setBrandSearchTerm}
                                filteredCategories={filteredCategories}
                                filteredBrands={filteredBrands}
                                handleCategorySelect={handleCategorySelect}
                                handleBrandSelect={handleBrandSelect}
                                onNext={handleNext}
                            />
                        )}

                        {activeTab === 'pricing' && (
                            <PricingTab formData={formData} handleChange={handleChange} onPrevious={handlePrevious} onNext={handleNext} onCreateProduct={handleSubmit} isCreating={createLoading} />
                        )}

                        {activeTab === 'stock' && (
                            <StockTab
                                formData={formData}
                                handleChange={handleChange}
                                units={units}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onCreateProduct={handleSubmit}
                                isCreating={createLoading}
                            />
                        )}

                        {activeTab === 'attributes' && (
                            <AttributesTab
                                formData={formData}
                                productAttributes={productAttributes}
                                setProductAttributes={setProductAttributes}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onCreateProduct={handleSubmit}
                                isCreating={createLoading}
                            />
                        )}

                        {activeTab === 'warranty' && (
                            <WarrantyTab
                                formData={formData}
                                productWarranties={productWarranties}
                                setProductWarranties={setProductWarranties}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onCreateProduct={handleSubmit}
                                isCreating={createLoading}
                            />
                        )}

                        {activeTab === 'serial' && (
                            <SerialTab
                                formData={formData}
                                productSerials={productSerials}
                                setProductSerials={setProductSerials}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onCreateProduct={handleSubmit}
                                isCreating={createLoading}
                            />
                        )}

                        {activeTab === 'tax' && (
                            <TaxTab
                                formData={formData}
                                handleChange={handleChange}
                                setFormData={setFormData}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onCreateProduct={handleSubmit}
                                isCreating={createLoading}
                            />
                        )}

                        {activeTab === 'sku' && (
                            <SKUTab
                                formData={formData}
                                handleChange={handleChange}
                                setFormData={setFormData}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onCreateProduct={handleSubmit}
                                isCreating={createLoading}
                            />
                        )}

                        {activeTab === 'images' && (
                            <ImagesTab
                                images={images}
                                setImages={setImages}
                                maxNumber={maxNumber}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onCreateProduct={handleSubmit}
                                isCreating={createLoading}
                            />
                        )}
                    </div>
                </div>

                {/* Tips Card */}
                <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="mb-1 font-medium">Product Creation Guide:</p>
                            <ul className="space-y-1 text-blue-700">
                                <li>
                                    • Complete <strong>Basic Info</strong> (name & category) to unlock Pricing tab
                                </li>
                                <li>
                                    • Enter <strong>Price</strong> to unlock Stock tab
                                </li>
                                <li>
                                    • Complete <strong>Stock</strong> (unit & quantity) to unlock all remaining tabs
                                </li>
                                <li>• Check feature boxes in Basic Info to enable Attributes, Warranty & Serial tabs</li>
                                <li>• Use Save button to keep progress, Create Product when ready</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCreateForm;
