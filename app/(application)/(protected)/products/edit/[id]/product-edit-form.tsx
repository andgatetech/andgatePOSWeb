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

type ProductSerialState = {
    id?: number;
    serial_number: string;
    notes: string;
    stock_index?: number;
};

type ProductWarrantyState = {
    id?: number;
    warranty_type_id: number;
    duration_months?: number;
    duration_days?: number;
    stock_index?: number;
};

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
    const [skuError, setSkuError] = useState<string | null>(null);
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
    const units = React.useMemo(() => unitsResponse?.data || [], [unitsResponse]);
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
    const [productSerials, setProductSerials] = useState<ProductSerialState[]>([]);

    // Product Warranties State
    const [productWarranties, setProductWarranties] = useState<ProductWarrantyState[]>([]);
    const [originalSnapshot, setOriginalSnapshot] = useState<any>(null);

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
            let normalizedAttributes: ProductAttribute[] = [];
            if (product.attributes) {
                console.log('🔵 Product attributes:', product.attributes);
                console.log('🔵 Is array?', Array.isArray(product.attributes));
                console.log('🔵 Keys:', Object.keys(product.attributes));

                if (Array.isArray(product.attributes) && product.attributes.length > 0) {
                    // Old format: [{attribute_id: 1, attribute_name: "Color", value: ""}]
                    console.log('✅ Using old format (array)');
                    normalizedAttributes = product.attributes;
                    setProductAttributes(normalizedAttributes);
                } else if (typeof product.attributes === 'object' && Object.keys(product.attributes).length > 0) {
                    // New format: {Color: ["Red", "Blue"], Size: ["M", "L"]}
                    // Convert to format expected by AttributesTab: treat as custom attributes
                    const formattedAttributes = Object.keys(product.attributes).map((attributeName) => ({
                        id: undefined,
                        attribute_id: 0, // Use 0 to indicate custom attribute
                        attribute_name: attributeName,
                        value: '', // Not used
                    }));
                    console.log('✅ Using new format (object), formatted:', formattedAttributes);
                    normalizedAttributes = formattedAttributes as any;
                    setProductAttributes(normalizedAttributes);
                }
            } else {
                console.log('❌ No attributes found in product');
            }

            // Set stocks/variants - Transform images to data_url format for ImageUploading component
            let transformedStocks: ProductStock[] = [];
            if (product.stocks && product.stocks.length > 0) {
                transformedStocks = product.stocks.map((stock: any) => {
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
            let normalizedSerials: ProductSerialState[] = [];
            if (product.serials && product.serials.length > 0) {
                normalizedSerials = product.serials.map((serial: any) => ({
                    ...serial,
                    stock_index:
                        typeof serial.stock_index === 'number'
                            ? serial.stock_index
                            : Math.max(
                                  transformedStocks.findIndex((stock: any) => stock.id === serial.product_stock_id),
                                  0
                              ),
                }));
                setProductSerials(normalizedSerials);
            }

            // Set warranties
            let normalizedWarranties: ProductWarrantyState[] = [];
            if (product.warranties && product.warranties.length > 0) {
                normalizedWarranties = product.warranties.map((warranty: any) => ({
                    ...warranty,
                    stock_index:
                        typeof warranty.stock_index === 'number'
                            ? warranty.stock_index
                            : Math.max(
                                  transformedStocks.findIndex((stock: any) => stock.id === warranty.product_stock_id),
                                  0
                              ),
                }));
                setProductWarranties(normalizedWarranties);
            }

            setOriginalSnapshot({
                formData: {
                    category_id: product.category_id?.toString() || '',
                    brand_id: product.brand_id?.toString() || '',
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
                    tax_included: !!firstStock?.tax_included,
                    has_attributes: product.has_attributes || product.has_attribute || false,
                    has_warranty: product.has_warranty || false,
                    has_serial: product.has_serial || false,
                },
                attributes: normalizedAttributes,
                stocks: transformedStocks,
                serials: normalizedSerials,
                warranties: normalizedWarranties,
                imageIds: !product.has_attributes && firstStock?.images ? firstStock.images.map((img: any) => Number(img.id)).filter(Boolean) : [],
            });
        }
    }, [product, units]);

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

    const normalizeValue = (value: any) => (value === undefined || value === null ? '' : String(value).trim());

    const normalizeAttributeForCompare = (attr: ProductAttribute) => ({
        id: attr.id ?? null,
        attribute_id: attr.attribute_id || 0,
        attribute_name: normalizeValue(attr.attribute_name),
        value: normalizeValue(attr.value),
    });

    const normalizeStockForCompare = (stock: ProductStock) => {
        const existingImageIds = (stock.images || [])
            .map((img: any) => (img?.id ? Number(img.id) : null))
            .filter((id: number | null): id is number => Number.isFinite(id as number))
            .sort((a, b) => a - b);

        const hasNewFiles = (stock.images || []).some((img: any) => !!img?.file);

        return {
            id: stock.id ?? null,
            sku: normalizeValue(stock.sku),
            barcode: normalizeValue(stock.barcode),
            price: normalizeValue(stock.price),
            purchase_price: normalizeValue(stock.purchase_price),
            wholesale_price: normalizeValue(stock.wholesale_price),
            quantity: normalizeValue(stock.quantity),
            low_stock_quantity: normalizeValue(stock.low_stock_quantity),
            tax_rate: normalizeValue(stock.tax_rate),
            tax_included: !!stock.tax_included,
            available: stock.available || 'yes',
            batch_no: normalizeValue(stock.batch_no),
            purchase_date: normalizeValue(stock.purchase_date),
            unit: normalizeValue(stock.unit),
            variant_data: Object.fromEntries(
                Object.entries(stock.variant_data || {})
                    .map(([key, value]) => [key, normalizeValue(value)])
                    .sort(([a], [b]) => a.localeCompare(b))
            ),
            existingImageIds,
            hasNewFiles,
        };
    };

    const normalizeSerialForCompare = (serial: ProductSerialState) => ({
        id: serial.id ?? null,
        serial_number: normalizeValue(serial.serial_number),
        notes: normalizeValue(serial.notes),
        stock_index: serial.stock_index ?? 0,
    });

    const normalizeWarrantyForCompare = (warranty: ProductWarrantyState) => ({
        id: warranty.id ?? null,
        warranty_type_id: Number(warranty.warranty_type_id || 0),
        duration_months: warranty.duration_months ?? null,
        duration_days: warranty.duration_days ?? null,
        stock_index: warranty.stock_index ?? 0,
    });

    const arraysEqual = (left: any[], right: any[]) => JSON.stringify(left) === JSON.stringify(right);

    const simpleStockFromForm = (): ProductStock => ({
        id: originalSnapshot?.stocks?.[0]?.id,
        sku: formData.skuOption === 'manual' ? formData.sku.trim() : '',
        barcode: formData.barcode,
        price: formData.price,
        purchase_price: formData.purchase_price,
        wholesale_price: formData.wholesale_price || '0',
        quantity: formData.quantity,
        low_stock_quantity: formData.low_stock_quantity || '0',
        tax_rate: formData.tax_rate || '0',
        tax_included: formData.tax_included,
        available: formData.available,
        batch_no: '',
        purchase_date: '',
        unit: formData.units || 'pcs',
        variant_data: {},
        images: images || [],
    });

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
            fd.append('store_id', String(currentStore.id));

            const original = originalSnapshot || {
                formData: {},
                attributes: [],
                stocks: [],
                serials: [],
                warranties: [],
                imageIds: [],
            };

            const appendIfChanged = (key: string, current: any, previous: any) => {
                const normalizedCurrent = current === undefined || current === null ? '' : String(current);
                const normalizedPrevious = previous === undefined || previous === null ? '' : String(previous);
                if (normalizedCurrent !== normalizedPrevious) {
                    fd.append(key, normalizedCurrent);
                }
            };

            appendIfChanged('category_id', formData.category_id, original.formData.category_id);
            appendIfChanged('brand_id', formData.brand_id, original.formData.brand_id);
            appendIfChanged('product_name', formData.product_name.trim(), original.formData.product_name);
            appendIfChanged('description', formData.description.trim(), original.formData.description);
            appendIfChanged('has_serial', formData.has_serial ? '1' : '0', original.formData.has_serial ? '1' : '0');
            appendIfChanged('has_warranty', formData.has_warranty ? '1' : '0', original.formData.has_warranty ? '1' : '0');
            appendIfChanged('has_attributes', formData.has_attributes ? '1' : '0', original.formData.has_attributes ? '1' : '0');
            appendIfChanged('available', formData.available, original.formData.available);

            if (normalizeValue(formData.units) !== normalizeValue(original.formData.units)) {
                fd.append('pos_units[0][name]', formData.units);
                fd.append('pos_units[0][is_active]', '1');
            }

            const normalizedCurrentAttributes = productAttributes.map(normalizeAttributeForCompare);
            const normalizedOriginalAttributes = (original.attributes || []).map(normalizeAttributeForCompare);
            const attributesChanged = !arraysEqual(normalizedCurrentAttributes, normalizedOriginalAttributes);

            if (attributesChanged || formData.has_attributes !== original.formData.has_attributes) {
                fd.append('replace_attributes', 'true');
                productAttributes.forEach((attr, index) => {
                    if (attr.id) {
                        fd.append(`attributes[${index}][id]`, String(attr.id));
                    }
                    if (attr.attribute_id && attr.attribute_id > 0) {
                        fd.append(`attributes[${index}][attribute_id]`, String(attr.attribute_id));
                    }
                    if (attr.attribute_name) {
                        fd.append(`attributes[${index}][attribute_name]`, attr.attribute_name);
                    }
                    fd.append(`attributes[${index}][value]`, normalizeValue(attr.value));
                });
            }

            const currentStocks: ProductStock[] = formData.has_attributes && productStocks.length > 0 ? productStocks : [simpleStockFromForm()];
            const originalStocksById = new Map<number, ProductStock>(
                (original.stocks || [])
                    .filter((stock: ProductStock) => !!stock.id)
                    .map((stock: ProductStock) => [Number(stock.id), stock])
            );
            const currentStockIds = new Set(currentStocks.map((stock) => Number(stock.id)).filter(Boolean));
            const deletedStockIds = (original.stocks || [])
                .map((stock: ProductStock) => Number(stock.id))
                .filter(Boolean)
                .filter((id: number) => !currentStockIds.has(id));

            deletedStockIds.forEach((id: number, index: number) => fd.append(`deleted_stock_ids[${index}]`, String(id)));

            const stocksToSave = currentStocks.filter((stock) => {
                if (!stock.id) {
                    return true;
                }
                const originalStock = originalStocksById.get(Number(stock.id));
                if (!originalStock) {
                    return true;
                }
                return JSON.stringify(normalizeStockForCompare(stock)) !== JSON.stringify(normalizeStockForCompare(originalStock));
            });

            stocksToSave.forEach((stock, index) => {
                const originalStock = stock.id ? originalStocksById.get(Number(stock.id)) : undefined;

                if (stock.id) {
                    fd.append(`stocks[${index}][id]`, String(stock.id));
                }
                if (!stock.id || normalizeValue(stock.sku) !== normalizeValue(originalStock?.sku)) {
                    if (normalizeValue(stock.sku)) {
                        fd.append(`stocks[${index}][sku]`, normalizeValue(stock.sku));
                    }
                }
                if (normalizeValue(stock.barcode)) {
                    fd.append(`stocks[${index}][barcode]`, normalizeValue(stock.barcode));
                }
                fd.append(`stocks[${index}][price]`, normalizeValue(stock.price));
                fd.append(`stocks[${index}][purchase_price]`, normalizeValue(stock.purchase_price));
                fd.append(`stocks[${index}][wholesale_price]`, normalizeValue(stock.wholesale_price || '0'));
                fd.append(`stocks[${index}][quantity]`, normalizeValue(stock.quantity));
                fd.append(`stocks[${index}][low_stock_quantity]`, normalizeValue(stock.low_stock_quantity || '0'));
                fd.append(`stocks[${index}][tax_rate]`, normalizeValue(stock.tax_rate || '0'));
                fd.append(`stocks[${index}][tax_included]`, stock.tax_included ? '1' : '0');
                fd.append(`stocks[${index}][available]`, stock.available);
                fd.append(`stocks[${index}][unit]`, normalizeValue(stock.unit || formData.units || 'pcs'));

                if (normalizeValue(stock.batch_no)) {
                    fd.append(`stocks[${index}][batch_no]`, normalizeValue(stock.batch_no));
                }
                if (normalizeValue(stock.purchase_date)) {
                    fd.append(`stocks[${index}][purchase_date]`, normalizeValue(stock.purchase_date));
                }

                Object.entries(stock.variant_data || {}).forEach(([key, value]) => {
                    if (normalizeValue(value)) {
                        fd.append(`stocks[${index}][variant_data][${key}]`, normalizeValue(value));
                    }
                });

                (stock.images || []).forEach((img: any, imgIndex: number) => {
                    if (!img?.file) {
                        return;
                    }
                    const validMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

                    if (!validMimes.includes(img.file.type)) {
                        showErrorDialog('Invalid Image', `Variant ${index + 1}, Image ${imgIndex + 1}: Only JPG, PNG, and WebP images are allowed!`);
                        throw new Error('Invalid image type');
                    }
                    if (img.file.size > 2 * 1024 * 1024) {
                        showErrorDialog('File Too Large', `Variant ${index + 1}, Image ${imgIndex + 1}: File size must be less than 2MB!`);
                        throw new Error('Image too large');
                    }

                    fd.append(`stocks[${index}][images][]`, img.file as File);
                });
            });

            const existingImageIds: number[] = [];
            const newImageFiles: File[] = [];
            if (!formData.has_attributes && images && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const img = images[i];
                    if (img.id) {
                        existingImageIds.push(Number(img.id));
                    } else if (img.file) {
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

            const imageIdsChanged = !arraysEqual(
                [...existingImageIds].sort((a, b) => a - b),
                [...(original.imageIds || [])].sort((a: number, b: number) => a - b)
            );

            if (imageIdsChanged || newImageFiles.length > 0) {
                existingImageIds.forEach((imageId, index) => fd.append(`existing_images[${index}]`, String(imageId)));
                newImageFiles.forEach((file) => fd.append('images[]', file));
            }

            const normalizedOriginalSerials = (original.serials || []).map(normalizeSerialForCompare);
            const originalSerialsById = new Map<number, ProductSerialState>(
                (original.serials || [])
                    .filter((serial: ProductSerialState) => !!serial.id)
                    .map((serial: ProductSerialState) => [Number(serial.id), serial])
            );

            if (!formData.has_serial) {
                normalizedOriginalSerials
                    .map((serial: any) => serial.id)
                    .filter(Boolean)
                    .forEach((id: number, index: number) => fd.append(`deleted_serial_ids[${index}]`, String(id)));
            } else {
                const currentSerials = productSerials.filter((serial) => normalizeValue(serial.serial_number));
                const currentSerialIds = new Set(currentSerials.map((serial) => Number(serial.id)).filter(Boolean));
                normalizedOriginalSerials
                    .map((serial: any) => serial.id)
                    .filter(Boolean)
                    .filter((id: number) => !currentSerialIds.has(id))
                    .forEach((id: number, index: number) => fd.append(`deleted_serial_ids[${index}]`, String(id)));

                currentSerials
                    .filter((serial) => {
                        if (!serial.id) {
                            return true;
                        }
                        const originalSerial = originalSerialsById.get(Number(serial.id));
                        if (!originalSerial) {
                            return true;
                        }
                        return JSON.stringify(normalizeSerialForCompare(serial)) !== JSON.stringify(normalizeSerialForCompare(originalSerial));
                    })
                    .forEach((serial, index) => {
                        if (serial.id) {
                            fd.append(`serials[${index}][id]`, String(serial.id));
                        }
                        fd.append(`serials[${index}][serial_number]`, normalizeValue(serial.serial_number));
                        fd.append(`serials[${index}][notes]`, normalizeValue(serial.notes));
                        if (!serial.id) {
                            fd.append(`serials[${index}][stock_index]`, String(serial.stock_index ?? 0));
                        }
                    });
            }

            const normalizedOriginalWarranties = (original.warranties || []).map(normalizeWarrantyForCompare);
            const originalWarrantiesById = new Map<number, ProductWarrantyState>(
                (original.warranties || [])
                    .filter((warranty: ProductWarrantyState) => !!warranty.id)
                    .map((warranty: ProductWarrantyState) => [Number(warranty.id), warranty])
            );

            if (!formData.has_warranty) {
                normalizedOriginalWarranties
                    .map((warranty: any) => warranty.id)
                    .filter(Boolean)
                    .forEach((id: number, index: number) => fd.append(`deleted_warranty_ids[${index}]`, String(id)));
            } else {
                const currentWarranties = productWarranties.filter((warranty) => Number(warranty.warranty_type_id) > 0 || Number(warranty.duration_days || 0) > 0);
                const currentWarrantyIds = new Set(currentWarranties.map((warranty) => Number(warranty.id)).filter(Boolean));
                normalizedOriginalWarranties
                    .map((warranty: any) => warranty.id)
                    .filter(Boolean)
                    .filter((id: number) => !currentWarrantyIds.has(id))
                    .forEach((id: number, index: number) => fd.append(`deleted_warranty_ids[${index}]`, String(id)));

                currentWarranties
                    .filter((warranty) => {
                        if (!warranty.id) {
                            return true;
                        }
                        const originalWarranty = originalWarrantiesById.get(Number(warranty.id));
                        if (!originalWarranty) {
                            return true;
                        }
                        return JSON.stringify(normalizeWarrantyForCompare(warranty)) !== JSON.stringify(normalizeWarrantyForCompare(originalWarranty));
                    })
                    .forEach((warranty, index) => {
                        if (warranty.id) {
                            fd.append(`warranties[${index}][id]`, String(warranty.id));
                        }
                        fd.append(`warranties[${index}][warranty_type_id]`, String(warranty.warranty_type_id));
                        if (warranty.duration_months !== undefined && warranty.duration_months > 0) {
                            fd.append(`warranties[${index}][duration_months]`, String(warranty.duration_months));
                        }
                        if (warranty.duration_days !== undefined && warranty.duration_days > 0) {
                            fd.append(`warranties[${index}][duration_days]`, String(warranty.duration_days));
                        }
                        if (!warranty.id && warranty.stock_index !== undefined) {
                            fd.append(`warranties[${index}][stock_index]`, String(warranty.stock_index));
                        }
                    });
            }

            if (Array.from(fd.keys()).length === 1) {
                showSuccessDialog('No Changes', 'Nothing to update');
                return;
            }

            const result = await updateProduct({ id: productId, formData: fd }).unwrap();

            showSuccessDialog('Success!', 'Product has been updated successfully');

            setTimeout(() => {
                router.push('/products');
            }, 1500);
        } catch (error: any) {
            console.error('Update product failed', error);

            // Check for SKU validation errors from backend
            // Backend may return errors in error.data.data or error.data.errors
            const errorData = error?.data?.data || error?.data?.errors;
            if (errorData) {
                // Look for SKU-related validation keys like 'stocks.0.sku', 'stocks.1.sku', 'sku', etc.
                const skuErrorKey = Object.keys(errorData).find((key) => key.toLowerCase().includes('sku'));
                if (skuErrorKey) {
                    const skuMsg = typeof errorData[skuErrorKey] === 'string' ? errorData[skuErrorKey] : Array.isArray(errorData[skuErrorKey]) ? errorData[skuErrorKey][0] : 'SKU validation failed';
                    showErrorDialog('SKU Error', skuMsg);
                    setSkuError(skuMsg);
                    setActiveTab('sku');
                    return;
                }
            }

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
                                handleChange={(e) => {
                                    handleChange(e);
                                    if (e.target.name === 'sku') {
                                        setSkuError(null);
                                    }
                                }}
                                setFormData={(val) => {
                                    setFormData(val);
                                    setSkuError(null);
                                }}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onCreateProduct={handleSubmit}
                                isCreating={updateLoading}
                                isEditMode={true}
                                skuError={skuError}
                                productStocks={productStocks}
                                setProductStocks={setProductStocks}
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
