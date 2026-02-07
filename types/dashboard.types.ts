// Dashboard API Response Types

export interface DashboardProduct {
    product_id: number;
    product_name: string;
    product_image: string | null;
    sku: string;
    total_sales?: number;
    total_revenue?: number;
    trend?: 'positive' | 'negative';
    percentage_change?: number;
    stock_quantity?: number;
    stock_status?: 'critical' | 'low' | 'instock';
}

export interface TopSellingProducts {
    pos_products: DashboardProduct[];
}

export interface LowStockProducts {
    pos_products: DashboardProduct[];
}

export interface PrimaryProduct {
    name: string;
    image: string | null;
}

export interface RecentSale {
    order_id: number;
    customer_name: string;
    total_amount: number;
    status: string;
    order_date_formatted: string;
    primary_product: PrimaryProduct;
}

export interface RecentSales {
    sales: RecentSale[];
}

export interface DashboardSectionsData {
    top_selling_products: TopSellingProducts;
    low_stock_products: LowStockProducts;
    recent_sales: RecentSales;
}

export interface DashboardSectionsResponse {
    success: boolean;
    data: DashboardSectionsData;
    message?: string;
}
