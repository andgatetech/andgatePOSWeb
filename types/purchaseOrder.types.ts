/**
 * Purchase Order TypeScript Definitions
 * Matches the backend API structure for type safety
 */

// ==================== DRAFT TYPES ====================

export interface PurchaseDraftItem {
    // For existing products
    product_id?: number;
    purchase_price?: number;
    quantity_ordered: number;

    // For new products
    product_name?: string;
    product_description?: string;
    unit?: string;
}

export interface CreatePurchaseDraftRequest {
    store_id: number;
    supplier_id: number | null;
    purchase_type: 'supplier' | 'walk_in' | 'own_purchase';
    notes?: string;
    items: PurchaseDraftItem[];
}

export interface PurchaseDraftItemResponse {
    id: number;
    item_type: 'existing' | 'new';
    product_id: number | null;
    product_name: string;
    product_description?: string;
    unit?: string;
    purchase_price: number;
    quantity_ordered: number;
    estimated_subtotal: number;
}

export interface PurchaseDraftResponse {
    id: number;
    user_id: number;
    store_id: number;
    supplier_id: number;
    draft_reference: string;
    purchase_type: string;
    status: 'preparing' | 'cancelled';
    estimated_total: number;
    notes?: string;
    items: PurchaseDraftItemResponse[];
    created_at: string;
    updated_at: string;
}

export interface PurchaseDraftListItem {
    id: number;
    draft_reference: string;
    purchase_type: string;
    status: string;
    estimated_total: number;
    supplier: {
        id: number;
        name: string;
        contact_person?: string;
    };
    items_count: number;
    existing_products: number;
    new_products: number;
    created_at: string;
}

// ==================== PURCHASE ORDER TYPES ====================

export interface ConvertDraftToPORequest {
    notes?: string;
}

export interface PurchaseOrderItem {
    id: number;
    product_id: number | null;
    product_name_snapshot?: string; // For existing products
    product_name_temp?: string; // For new products
    product_description_temp?: string;
    unit_temp?: string;
    quantity_ordered: number;
    quantity_received: number;
    purchase_price: number;
    subtotal: number;
    status: 'ordered' | 'partially_received' | 'received';
    stock_updated?: boolean;
    product_created?: boolean;
}

export interface PurchaseOrderResponse {
    purchase_order_id: number;
    invoice_number: string;
    draft_reference?: string;
    status: 'ordered' | 'partially_received' | 'received';
    grand_total: number;
    payment_status: 'pending' | 'partial' | 'paid';
    amount_paid: number;
    amount_due: number;
    items: PurchaseOrderItem[];
    supplier: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at?: string;
}

// ==================== RECEIVING TYPES ====================

export interface ReceiveItemData {
    id: number; // purchase_order_item_id
    quantity_received: number;
    purchase_price: number;
}

export interface UpdatePurchaseOrderRequest {
    status: 'ordered' | 'partially_received' | 'received';
    items: ReceiveItemData[];
    payment_amount?: number;
}

export interface NewProductCreated {
    product_id: number;
    name: string;
    sku: string;
    initial_stock: number;
}

export interface UpdatePurchaseOrderResponse {
    id: number;
    invoice_number: string;
    status: string;
    grand_total: number;
    payment_status: string;
    amount_paid: number;
    amount_due: number;
    items: PurchaseOrderItem[];
    new_products_created?: NewProductCreated[];
    updated_at: string;
}

// ==================== API RESPONSE WRAPPERS ====================

export interface ApiSuccessResponse<T> {
    success: true;
    message: string;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    success: true;
    message: string;
    data: T[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

// ==================== QUERY PARAMETERS ====================

export interface GetPurchaseDraftsParams {
    store_id?: number;
    store_ids?: string; // comma-separated
    status?: 'preparing' | 'cancelled';
    search?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
}

export interface GetPurchaseOrdersParams {
    store_id?: number;
    store_ids?: string;
    status?: 'ordered' | 'partially_received' | 'received';
    payment_status?: 'pending' | 'partial' | 'paid';
    search?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
}

// ==================== SUPPLIER TYPES ====================

export interface Supplier {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    contact_person?: string;
    company_name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    tax_number?: string;
    payment_terms?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ==================== UTILITY TYPES ====================

export type PurchaseType = 'supplier' | 'walk_in' | 'own_purchase';
export type PurchaseStatus = 'ordered' | 'partially_received' | 'received';
export type PaymentStatus = 'pending' | 'partial' | 'paid';
export type DraftStatus = 'preparing' | 'cancelled';
export type ItemType = 'existing' | 'new';
