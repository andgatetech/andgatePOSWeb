import { LucideIcon } from 'lucide-react';

export interface CartItem {
    stock_id: number;
    product_id: number;
    product_name: string;
    sku: string;
    price: number;
    originalPrice: number;
    quantity: number;
    unit?: string;
    image?: string | null;
    availableStock?: number;
    variantName?: string;
    variantData?: Record<string, any>;
    weight?: number;
}

export interface DeliveryPreset {
    id: string;
    label: string;
    labelBn: string;
    fee: number;
    icon: LucideIcon;
    badge: string;
}

export interface ProductStock {
    id: number;
    product_id?: number;
    sku?: string;
    price?: number | string;
    cost_price?: number | string;
    wholesale_price?: number | string;
    quantity?: number | string;
    unit?: string;
    is_variant?: boolean;
    variant_name?: string;
    variant_attributes?: Record<string, any>;
    images?: any[];
    available_units?: { unit: string; factor?: number }[];
    availableUnits?: { unit: string; factor?: number }[];
}

export interface EcommerceProduct {
    id: number;
    store_id?: number;
    product_name: string;
    name?: string;
    sku?: string;
    barcode?: string;
    price?: number | string;
    selling_price?: number | string;
    cost_price?: number | string;
    quantity?: number | string;
    unit?: string;
    category_id?: number | string;
    category?: { id: number; name?: string; category_name?: string };
    brand_id?: number | string;
    brand?: { id: number; name?: string; brand_name?: string };
    image?: string;
    image_url?: string;
    product_image?: string;
    images?: any[];
    description?: string;
    available?: boolean;
    is_ecommerce?: boolean | number;
    ecommerce_visible?: string | boolean;
    visible?: boolean;
    ecommerce_status?: string;
    stocks?: ProductStock[];
    primary_stock?: ProductStock;
}
