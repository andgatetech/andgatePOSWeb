'use client';

import SubscriptionError from '@/components/common/SubscriptionError';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import useSubscriptionError from '@/hooks/useSubscriptionError';
import Loader from '@/lib/Loader';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useGetSingleProductQuery, useGetUnitsQuery, useUpdateProductMutation } from '@/store/features/Product/productApi';
import { useGetStoreAttributesQuery } from '@/store/features/attribute/attribute';
import { useGetBrandsQuery } from '@/store/features/brand/brandApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { Store } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import AttributesTab, { ProductAttribute } from '../../create/AttributesTab';
import BasicInfoTab from '../../create/BasicInfoTab';
import ImagesTab from '../../create/ImagesTab';
import MobileTabFAB from '../../create/MobileTabFAB';
import PricingTab from '../../create/PricingTab';
import ProductCreateTabs from '../../create/ProductCreateTabs';
import SKUTab from '../../create/SKUTab';
import SerialTab from '../../create/SerialTab';
import StockTab from '../../create/StockTab';
import TaxTab from '../../create/TaxTab';
import VariantsTab, { ProductStock } from '../../create/VariantsTab';
import WarrantyTab from '../../create/WarrantyTab';

const ProductEditForm = () => {
    const params = useParams();
    const productId = params.id as string;
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

    const { data: categoriesResponse, isLoading: catLoading } = useGetCategoryQuery(queryParams, { refetchOnMountOrArgChange: true });
    const categories = React.useMemo(() => {
        if (categoriesResponse?.data?.items && Array.isArray(categoriesResponse.data.items)) {
            return categoriesResponse.data.items;
        }
        return categoriesResponse?.data || [];
    }, [categoriesResponse]);
    const { data: brandsResponse, isLoading: brandLoading } = useGetBrandsQuery(queryParams, { refetchOnMountOrArgChange: true });
    const brands = React.useMemo(() => {
        if (brandsResponse?.data?.items && Array.isArray(brandsResponse.data.items)) {
            return brandsResponse.data.items;
        }
        return brandsResponse?.data || [];
    }, [brandsResponse]);
    const [updateProduct, { isLoading: updateLoading, error: updateProductError }] = useUpdateProductMutation();
    const { data: unitsResponse, isLoading: unitsLoading } = useGetUnitsQuery(queryParams, { refetchOnMountOrArgChange: true });
    const units = unitsResponse?.data || [];
    const { data: attributesResponse, isLoading: attributesLoading } = useGetStoreAttributesQuery(queryParams, { refetchOnMountOrArgChange: true });
    const attributes = attributesResponse?.data || [];

    // Fetch the product data
    const { data: productResponse, isLoading: productLoading, error: productError } = useGetSingleProductQuery(productId);
    const product = productResponse?.data;

    // Check for subscription errors
    const { hasSubscriptionError, subscriptionError } = useSubscriptionError(updateProductError as any);

    // Product Attributes State
    const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>([]);

    // Product Stocks/Variants State
    const [productStocks, setProductStocks] = useState<ProductStock[]>([]);

    // Product Serials State
    const [productSerials, setProductSerials] = useState<Array<{ serial_number: string; notes: string; stock_index?: number }>>([]);

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
        available: 'yes' as 'yes' | 'no',
        quantity: '',
        low_stock_quantity: '',
        purchase_price: '',
        sku: '',
        skuOption: 'auto' as 'auto' | 'manual',
        barcode: '',
        units: '',
        tax_rate: '',
        tax_included: false,
        has_attributes: false,
        has_warranty: false,
        has_serial: false,
    });

    // Populate form data when product is loaded
    useEffect(() => {
        if (product) {
            // Get first stock data (for non-variant products)
            const firstStock = product.stocks && product.stocks.length > 0 ? product.stocks[0] : null;

            // Match unit from API with unit options (case-insensitive)
            const matchUnit = (apiUnit: string | null | undefined) => {
                if (!apiUnit) return '';

                // Check if it matches "Piece" (case-insensitive)
                if (apiUnit.toLowerCase() === 'piece') {
                    return 'Piece'; // Return with capital P to match dropdown
                }

                // Check if it matches any unit in the units list
                const matchedUnit = units.find((u: any) => u.name.toLowerCase() === apiUnit.toLowerCase());
                if (matchedUnit) {
                    return matchedUnit.name; // Return the exact name from database
                }

                // If no match, return as is
                return apiUnit;
            };

            setFormData({
                category_id: product.category_id?.toString() || '',
                category_name: product.category_name || product.category?.name || '',
                brand_id: product.brand_id?.toString() || '',
                brand_name: product.brand_name || product.brand?.name || '',
                product_name: product.product_name || '',
                description: product.description || '',
                price: firstStock?.price?.toString() || '',
                wholesale_price: firstStock?.wholesale_price?.toString() || '',
                available: (firstStock?.available === 'no' ? 'no' : 'yes') as 'yes' | 'no',
                quantity: firstStock?.quantity?.toString() || '',
                low_stock_quantity: firstStock?.low_stock_quantity?.toString() || '',
                purchase_price: firstStock?.purchase_price?.toString() || '',
                sku: firstStock?.sku || '',
                skuOption: firstStock?.sku ? 'manual' : 'auto',
                barcode: firstStock?.barcode || '',
                units: matchUnit(firstStock?.unit),
                tax_rate: firstStock?.tax_rate?.toString() || '',
                tax_included: firstStock?.tax_included || false,
                has_attributes: product.has_attributes || product.has_attribute || false,
                has_warranty: product.has_warranty || false,
                has_serial: product.has_serial || false,
            });

            // Set images - Now images are in stocks, get from first stock for simple products
            // For variant products, images are handled in VariantsTab
            if (!product.has_attributes && firstStock?.images && firstStock.images.length > 0) {
                const loadedImages = firstStock.images.map((img: any) => ({
                    dataURL: img.url ? `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/storage/${img.url.startsWith('/') ? img.url.substring(1) : img.url}` : '',
                    id: img.id, // Preserve the image ID for existing images
                }));
                setImages(loadedImages);
            }

            // Set attributes - Handle new format (object) and old format (array)
            if (product.attributes) {
                console.log('🔵 Product attributes:', product.attributes);
                console.log('🔵 Is array?', Array.isArray(product.attributes));
                console.log('🔵 Keys:', Object.keys(product.attributes));

                if (Array.isArray(product.attributes) && product.attributes.length > 0) {
                    // Old format: [{attribute_id: 1, attribute_name: "Color", value: ""}]
                    console.log('✅ Using old format (array)');
                    setProductAttributes(product.attributes);
                } else if (typeof product.attributes === 'object' && Object.keys(product.attributes).length > 0) {
                    // New format: {Color: ["Red", "Blue"], Size: ["M", "L"]}
                    // Convert to format expected by AttributesTab: treat as custom attributes
                    const formattedAttributes = Object.keys(product.attributes).map((attributeName) => ({
                        attribute_id: 0, // Use 0 to indicate custom attribute
                        attribute_name: attributeName,
                        value: '', // Not used
                    }));
                    console.log('✅ Using new format (object), formatted:', formattedAttributes);
                    setProductAttributes(formattedAttributes as any);
                }
            } else {
                console.log('❌ No attributes found in product');
            }

            // Set stocks/variants - Transform images to data_url format for ImageUploading component
            if (product.stocks && product.stocks.length > 0) {
                const transformedStocks = product.stocks.map((stock: any) => {
                    // Transform stock images to ImageUploading format
                    const transformedImages =
                        stock.images?.map((img: any) => ({
                            data_url: img.url ? `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/storage/${img.url.startsWith('/') ? img.url.substring(1) : img.url}` : '',
                            id: img.id, // Preserve image ID
                        })) || [];

                    // Match unit from API with unit options (case-insensitive)
                    const matchUnit = (apiUnit: string | null | undefined) => {
                        if (!apiUnit) return '';

                        // Check if it matches "Piece" (case-insensitive)
                        if (apiUnit.toLowerCase() === 'piece') {
                            return 'Piece'; // Return with capital P to match dropdown
                        }

                        // Check if it matches any unit in the units list
                        const matchedUnit = units.find((u: any) => u.name.toLowerCase() === apiUnit.toLowerCase());
                        if (matchedUnit) {
                            return matchedUnit.name; // Return the exact name from database
                        }

                        // If no match, return as is
                        return apiUnit;
                    };

                    return {
                        ...stock,
                        unit: matchUnit(stock.unit), // Normalize unit name
                        images: transformedImages,
                    };
                });
                setProductStocks(transformedStocks);
            }

            // Set serials
            if (product.serials && product.serials.length > 0) {
                setProductSerials(product.serials);
            }

            // Set warranties
            if (product.warranties && product.warranties.length > 0) {
                setProductWarranties(product.warranties);
            }
        }
    }, [product]);

    // Clean up variant_data when attributes are removed
    useEffect(() => {
        if (productStocks.length > 0 && productAttributes.length > 0) {
            const currentAttributeNames = productAttributes.map((attr) => attr.attribute_name || '').filter((name) => name.trim() !== '');

            // Update stocks to remove attributes that are no longer in the list
            const updatedStocks = productStocks.map((stock) => {
                const cleanedVariantData: { [key: string]: string } = {};

                // Only keep variant_data keys that are still in current attributes
                Object.keys(stock.variant_data || {}).forEach((key) => {
                    if (currentAttributeNames.includes(key)) {
                        cleanedVariantData[key] = stock.variant_data[key];
                    }
                });

                return {
                    ...stock,
                    variant_data: cleanedVariantData,
                };
            });

            // Only update if there's an actual change
            const hasChanges = productStocks.some((stock, index) => {
                const oldKeys = Object.keys(stock.variant_data || {})
                    .sort()
                    .join(',');
                const newKeys = Object.keys(updatedStocks[index].variant_data).sort().join(',');
                return oldKeys !== newKeys;
            });

            if (hasChanges) {
                setProductStocks(updatedStocks);
            }
        }
    }, [productAttributes, productStocks]);

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

    // Handle category selection
    const handleCategorySelect = (category: any) => {
        setFormData((prev) => ({
            ...prev,
            category_id: category.id.toString(),
            category_name: category.name,
        }));
        setShowCategoryDropdown(false);
        setCategorySearchTerm('');
    };

    // Handle brand selection
    const handleBrandSelect = (brand: any) => {
        setFormData((prev) => ({
            ...prev,
            brand_id: brand.id.toString(),
            brand_name: brand.name,
        }));
        setShowBrandDropdown(false);
        setBrandSearchTerm('');
    };

    // Tab completion validation functions
    const isBasicInfoComplete = () => {
        return formData.product_name.trim() !== '' && formData.category_id !== '';
    };

    const isPricingComplete = () => {
        return formData.price !== '';
    };

    const isStockComplete = () => {
        return formData.quantity !== '' || productStocks.length > 0;
    };

    const isTaxComplete = () => {
        return true;
    };

    const isSKUComplete = () => {
        return formData.skuOption === 'auto' || (formData.skuOption === 'manual' && formData.sku.trim() !== '');
    };

    const isAttributesComplete = () => {
        if (!formData.has_attributes) return true;
        return productAttributes.length > 0 && productAttributes.every((attr) => attr.value.trim() !== '');
    };

    const isVariantsComplete = () => {
        if (!formData.has_attributes) return true;
        return productStocks.length > 0;
    };

    const isWarrantyComplete = () => {
        if (!formData.has_warranty) return true;
        return productWarranties.length > 0;
    };

    const isSerialComplete = () => {
        if (!formData.has_serial) return true;
        const totalUnits = productStocks.length > 0 ? productStocks.reduce((sum, stock) => sum + (parseInt(stock.quantity) || 0), 0) : parseInt(formData.quantity) || 0;
        return productSerials.length >= totalUnits;
    };

    const isImagesComplete = () => {
        return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleNext = () => {
        const tabs = ['basic', 'pricing', 'stock', 'tax', 'sku', 'images', 'attributes', 'variants', 'warranty', 'serial'];
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1]);
        }
    };

    const handlePrevious = () => {
        const tabs = ['basic', 'pricing', 'stock', 'tax', 'sku', 'images', 'attributes', 'variants', 'warranty', 'serial'];
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1]);
        }
    };

    const handleSubmit = async () => {
        if (!currentStore?.id) {
            showErrorDialog('Store Required', 'Please select a store first!');
            return;
        }

        try {
            const fd = new FormData();

            // Add store_id from current store (required by backend)
            if (currentStore?.id) {
                fd.append('store_id', String(currentStore.id));
            }

            if (formData.category_id) {
                fd.append('category_id', formData.category_id);
            }
            if (formData.brand_id) {
                fd.append('brand_id', formData.brand_id);
            }
            fd.append('product_name', formData.product_name.trim());
            fd.append('description', formData.description.trim());

            // Add SKU if manual - ONLY for simple products (not variants)
            // For variant products, SKU is at stock level
            if (formData.skuOption === 'manual' && formData.sku.trim() && productStocks.length === 0) {
                fd.append('sku', formData.sku.trim());
            }

            // Add unit field as pos_units array (backend expects pos_units array)
            if (formData.units) {
                fd.append('pos_units[0][name]', formData.units);
                fd.append('pos_units[0][is_active]', '1');
            }

            // Add flags
            fd.append('has_serial', formData.has_serial ? '1' : '0');
            fd.append('has_warranty', formData.has_warranty ? '1' : '0');
            fd.append('has_attributes', formData.has_attributes ? '1' : '0');
            fd.append('available', formData.available);

            // Determine stocks array
            let stocks = [];

            if (formData.has_attributes && productStocks.length > 0) {
                stocks = productStocks;
            } else {
                const singleStock = {
                    price: formData.price,
                    purchase_price: formData.purchase_price,
                    wholesale_price: formData.wholesale_price || '0',
                    quantity: formData.quantity,
                    low_stock_quantity: formData.low_stock_quantity || '0',
                    tax_rate: formData.tax_rate || '0',
                    tax_included: formData.tax_included,
                    available: formData.available,
                    unit: formData.units || 'pcs',
                    batch_no: '',
                    purchase_date: '',
                    variant_data: {},
                    images: [],
                };
                stocks = [singleStock];
            }

            // Add attributes array - ONLY for non-variant products
            // For products with variants, attributes are in stocks[].variant_data
            if (formData.has_attributes && productAttributes.length > 0 && productStocks.length === 0) {
                productAttributes.forEach((attr, index) => {
                    if (attr.attribute_id && attr.attribute_id > 0) {
                        fd.append(`attributes[${index}][attribute_id]`, String(attr.attribute_id));
                    }
                    if (attr.attribute_name) {
                        fd.append(`attributes[${index}][attribute_name]`, attr.attribute_name);
                    }
                    // Value can be empty for attribute definitions
                    fd.append(`attributes[${index}][value]`, attr.value ? attr.value.trim() : '');
                });
            }
            // Note: If productStocks exists (variants), attributes are in stocks[].variant_data

            // Add stocks/variants array
            stocks.forEach((stock, index) => {
                // Include stock ID for existing stocks (for update)
                if (stock.id) {
                    fd.append(`stocks[${index}][id]`, String(stock.id));
                }

                // Add SKU and barcode at stock level (each variant can have its own)
                if (stock.sku) {
                    fd.append(`stocks[${index}][sku]`, stock.sku);
                }
                if (stock.barcode) {
                    fd.append(`stocks[${index}][barcode]`, stock.barcode);
                }

                fd.append(`stocks[${index}][price]`, String(stock.price));
                fd.append(`stocks[${index}][purchase_price]`, String(stock.purchase_price));
                fd.append(`stocks[${index}][wholesale_price]`, stock.wholesale_price || '0');
                fd.append(`stocks[${index}][quantity]`, String(stock.quantity));
                fd.append(`stocks[${index}][low_stock_quantity]`, stock.low_stock_quantity || '0');
                fd.append(`stocks[${index}][tax_rate]`, stock.tax_rate || '0');
                fd.append(`stocks[${index}][tax_included]`, stock.tax_included ? '1' : '0');
                fd.append(`stocks[${index}][available]`, stock.available);
                fd.append(`stocks[${index}][unit]`, stock.unit || formData.units || 'pcs');

                if (stock.batch_no) {
                    fd.append(`stocks[${index}][batch_no]`, stock.batch_no);
                }
                if (stock.purchase_date) {
                    fd.append(`stocks[${index}][purchase_date]`, stock.purchase_date);
                }

                // Add variant_data as array
                if (stock.variant_data && Object.keys(stock.variant_data).length > 0) {
                    Object.entries(stock.variant_data).forEach(([key, value]) => {
                        fd.append(`stocks[${index}][variant_data][${key}]`, value);
                    });
                }

                // Add variant-specific images
                if (stock.images && stock.images.length > 0) {
                    stock.images.forEach((img, imgIndex) => {
                        if (img.file) {
                            const validMimes = ['image/jpeg', 'image/png', 'image/jpg'];

                            if (!validMimes.includes(img.file.type)) {
                                showErrorDialog('Invalid Image', `Variant ${index + 1}, Image ${imgIndex + 1}: Only JPG and PNG images are allowed!`);
                                throw new Error('Invalid image type');
                            }

                            if (img.file.size > 2 * 1024 * 1024) {
                                showErrorDialog('File Too Large', `Variant ${index + 1}, Image ${imgIndex + 1}: File size must be less than 2MB!`);
                                throw new Error('Image too large');
                            }

                            fd.append(`stocks[${index}][images][]`, img.file as File);
                        }
                    });
                }
            });

            // Add general product images
            // Separate existing images (with ID) from new images (with file)
            const existingImageIds: number[] = [];
            const newImageFiles: File[] = [];

            if (images && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const img = images[i];

                    // If image has an ID, it's an existing image - preserve it
                    if (img.id) {
                        existingImageIds.push(img.id);
                    }
                    // If image has a file, it's a new upload
                    else if (img.file) {
                        const validMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

                        if (!validMimes.includes(img.file.type)) {
                            showErrorDialog('Invalid Image', `Image ${i + 1}: Only JPG, PNG, and WebP images are allowed!`);
                            return;
                        }

                        if (img.file.size > 2 * 1024 * 1024) {
                            showErrorDialog('File Too Large', `Image ${i + 1}: File size must be less than 2MB!`);
                            return;
                        }

                        newImageFiles.push(img.file as File);
                    }
                }
            }

            // Send existing image IDs to preserve them
            if (existingImageIds.length > 0) {
                existingImageIds.forEach((imageId, index) => {
                    fd.append(`existing_images[${index}]`, String(imageId));
                });
            }

            // Send new image files
            if (newImageFiles.length > 0) {
                newImageFiles.forEach((file) => {
                    fd.append('images[]', file);
                });
            }

            // Add serial numbers if has_serial is checked and serials are provided
            if (formData.has_serial && productSerials.length > 0) {
                const serialsToSave = productSerials
                    .filter((serial) => serial.serial_number && serial.serial_number.trim() !== '')
                    .map((serial) => ({
                        serial_number: serial.serial_number.trim(),
                        notes: (serial.notes || '').trim(),
                        stock_index: serial.stock_index !== undefined ? serial.stock_index : 0,
                    }));

                if (serialsToSave.length > 0) {
                    serialsToSave.forEach((serial, index) => {
                        fd.append(`serials[${index}][serial_number]`, serial.serial_number);
                        fd.append(`serials[${index}][notes]`, serial.notes);
                        fd.append(`serials[${index}][stock_index]`, String(serial.stock_index));
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

            const result = await updateProduct({ id: productId, formData: fd }).unwrap();

            showSuccessDialog('Success!', 'Product has been updated successfully');

            setTimeout(() => {
                router.push('/products');
            }, 1500);
        } catch (error: any) {
            console.error('Update product failed', error);

            if (error?.status !== 403) {
                const errorMessage = error?.data?.message || 'Something went wrong while updating the product';
                showErrorDialog('Error!', errorMessage);
            }
        }
    };

    // Show subscription error component if subscription middleware error occurs
    if (hasSubscriptionError) {
        return <SubscriptionError {...({ error: subscriptionError } as any)} />;
    }

    if (productLoading) {
        return <Loader message="Loading Product..." />;
    }

    if (productError) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-red-600">Error loading product</h3>
                    <button onClick={() => router.push('/products')} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                            <p className="mt-1 text-sm text-gray-600">Update product information and inventory</p>
                        </div>
                        {currentStore && (
                            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2">
                                <Store className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">{currentStore.store_name}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <ProductCreateTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    visibleTabs={[
                        'basic',
                        'pricing',
                        'stock',
                        'tax',
                        'sku',
                        'images',
                        ...(formData.has_attributes ? ['attributes', 'variants'] : []),
                        ...(formData.has_warranty ? ['warranty'] : []),
                        ...(formData.has_serial ? ['serial'] : []),
                    ]}
                />

                {/* Tab Content */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            // Prevent form submission - we handle it manually with handleSubmit
                        }}
                    >
                        {activeTab === 'basic' && (
                            <BasicInfoTab
                                formData={formData}
                                handleChange={handleChange}
                                setFormData={setFormData}
                                categories={categories}
                                brands={brands}
                                catLoading={catLoading}
                                brandLoading={brandLoading}
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
                                onCreateProduct={handleSubmit}
                                isCreating={updateLoading}
                                isEditMode={true}
                            />
                        )}

                        {activeTab === 'pricing' && (
                            <PricingTab
                                formData={formData}
                                handleChange={handleChange}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onCreateProduct={handleSubmit}
                                isCreating={updateLoading}
                                isEditMode={true}
                            />
                        )}

                        {activeTab === 'stock' && (
                            <StockTab
                                formData={formData}
                                handleChange={handleChange}
                                units={units}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onCreateProduct={handleSubmit}
                                isCreating={updateLoading}
                                isEditMode={true}
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
                                isCreating={updateLoading}
                                isEditMode={true}
                            />
                        )}

                        {activeTab === 'variants' && (
                            <VariantsTab
                                productAttributes={productAttributes}
                                productStocks={productStocks}
                                setProductStocks={setProductStocks}
                                units={units}
                                defaultUnit={formData.units}
                                formData={formData}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onCreateProduct={handleSubmit}
                                isCreating={updateLoading}
                                isEditMode={true}
                            />
                        )}

                        {activeTab === 'warranty' && (
                            <WarrantyTab
                                formData={formData}
                                productWarranties={productWarranties}
                                setProductWarranties={setProductWarranties}
                                productStocks={productStocks}
                                productAttributes={productAttributes}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onCreateProduct={handleSubmit}
                                isCreating={updateLoading}
                                isEditMode={true}
                            />
                        )}

                        {activeTab === 'serial' && (
                            <SerialTab
                                formData={formData}
                                productSerials={productSerials}
                                setProductSerials={setProductSerials}
                                productStocks={productStocks}
                                productAttributes={productAttributes}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onCreateProduct={handleSubmit}
                                isCreating={updateLoading}
                                isEditMode={true}
                            />
                        )}

                        {activeTab === 'tax' && (
                            <TaxTab
                                formData={formData}
                                handleChange={handleChange}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                setFormData={setFormData}
                                onCreateProduct={handleSubmit}
                                isCreating={updateLoading}
                                isEditMode={true}
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
                                isCreating={updateLoading}
                                isEditMode={true}
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
                                isCreating={updateLoading}
                                isEditMode={true}
                            />
                        )}
                    </form>
                </div>

                {/* Mobile FAB */}
                <MobileTabFAB
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    visibleTabs={[
                        'basic',
                        'pricing',
                        'stock',
                        'tax',
                        'sku',
                        'images',
                        ...(formData.has_attributes ? ['attributes', 'variants'] : []),
                        ...(formData.has_warranty ? ['warranty'] : []),
                        ...(formData.has_serial ? ['serial'] : []),
                    ]}
                />
            </div>
        </div>
    );
};

export default ProductEditForm;
