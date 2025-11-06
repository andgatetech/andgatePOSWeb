export interface Product {
    id: number;
    product_name: string;
    sku: string;
    description: string;
    price: number;
    available: boolean;
    unit?: string;
    images?: any[];
    stocks?: Stock[];
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
    images?: any[];
}

export interface Category {
    id: number;
    name?: string;
    category_name?: string;
    image?: string;
}

export interface Brand {
    id: number;
    name?: string;
    brand_name?: string;
    image?: string;
}

export interface FilterQueryParams {
    available?: string;
    store_id?: number;
    category_id?: number;
    brand_id?: number;
}
