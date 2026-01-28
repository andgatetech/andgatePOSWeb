export interface Product {
    id: number;
    product_name: string;
    sku: string;
    description: string;
    price: number;
    available: boolean;
    unit?: string;
    stocks?: Stock[];
    category_id?: number;
    category_name?: string;
    brand_id?: number;
    brand_name?: string;
    has_serial?: boolean;
    has_warranty?: boolean;
    has_attribute?: boolean;
    created_at?: string;
    serials?: any[];
    available_serial_count?: number;
    warranties?: any[];
    warranty_count?: number;
    available_warranty_count?: number;
    attributes?: any;
}

export interface Stock {
    id: number;
    quantity: string | number;
    price: string | number;
    wholesale_price: string | number;
    unit?: string;
    tax_rate?: string | number;
    tax_included?: boolean;
    is_variant?: boolean;
    variant_name?: string;
    variant_data?: any;
    sku?: string;
    barcode?: string;
    low_stock_quantity?: number;
    available?: string;
    images?: ProductImage[];
}

export interface ProductImage {
    id: number;
    url: string;
    path: string;
}

export interface Category {
    id: number;
    name?: string;
    category_name?: string;
    image_url?: string;
    description?: string;
    store_id?: number;
    store_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Brand {
    id: number;
    name?: string;
    brand_name?: string;
    image_url?: string;
    description?: string;
    store_id?: number;
    store_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface FilterQueryParams {
    available?: string;
    store_id?: number;
    category_id?: number;
    brand_id?: number;
}
