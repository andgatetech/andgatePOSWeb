import { baseApi } from '@/store/api/baseApi';

// ============================================
// Type Definitions for Report Responses
// ============================================

export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
    has_more_pages: boolean;
    sort_field?: string;
    sort_direction?: string;
}

export interface ReportFilters {
    store_id?: number;
    store_ids?: number[];
    start_date?: string;
    end_date?: string;
    per_page?: number;
    page?: number;
    sort_field?: string;
    sort_direction?: 'asc' | 'desc';
    [key: string]: any;
}

// ============================================
// Report API Endpoints
// ============================================

const ReportApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ========== SALES & REVENUE REPORTS ==========

        // 1. Sales Report
        getSalesReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/sales',
                method: 'POST',
                body: data,
            }),
        }),

        // 2. Transaction Report
        getTransactionReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/transaction',
                method: 'POST',
                body: data,
            }),
        }),

        // 3. Invoice Report
        getInvoiceReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/invoice',
                method: 'POST',
                body: data,
            }),
        }),

        // 4. Sales Items Report
        getSalesItemsReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/sales-items',
                method: 'POST',
                body: data,
            }),
        }),

        // 5. Order Returns Report
        getOrderReturnsReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/order-returns',
                method: 'POST',
                body: data,
            }),
        }),

        // ========== CUSTOMER REPORTS ==========

        // 6. Customer Report
        getCustomerReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/customer',
                method: 'POST',
                body: data,
            }),
        }),

        // 7. Customer Due Report
        getCustomerDueReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/customer-due',
                method: 'POST',
                body: data,
            }),
        }),

        // ========== PURCHASE & SUPPLIER REPORTS ==========

        // 8. Purchase Report
        getPurchaseReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/purchase',
                method: 'POST',
                body: data,
            }),
        }),

        // 9. Purchase Items Report
        getPurchaseItemsReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/purchase-items',
                method: 'POST',
                body: data,
            }),
        }),

        // 10. Purchase Transaction Report
        getPurchaseTransactionReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/purchase-transaction',
                method: 'POST',
                body: data,
            }),
        }),

        // 11. Supplier Report
        getSupplierReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/supplier',
                method: 'POST',
                body: data,
            }),
        }),

        // 12. Supplier Due Report
        getSupplierDueReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/supplier-due',
                method: 'POST',
                body: data,
            }),
        }),

        // ========== INVENTORY REPORTS ==========

        // 13. Stock Report
        getStockReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/stock',
                method: 'POST',
                body: data,
            }),
        }),

        // 14. Low Stock Report
        getLowStockReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/low-stock',
                method: 'POST',
                body: data,
            }),
        }),

        // 15. Idle Product Report
        getIdleProductReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/idle-product',
                method: 'POST',
                body: data,
            }),
        }),

        // 16. Stock Adjustment Report
        getStockAdjustmentReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/adjustment',
                method: 'POST',
                body: data,
            }),
        }),

        // 17. Product Report
        getProductReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/product',
                method: 'POST',
                body: data,
            }),
        }),

        // ========== FINANCIAL REPORTS ==========

        // 18. Profit & Loss Report
        getProfitLossReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/profit-loss',
                method: 'POST',
                body: data,
            }),
        }),

        // 19. Expense Report
        getExpenseReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/expense',
                method: 'POST',
                body: data,
            }),
        }),

        // 20. Tax Report
        getTaxReport: builder.mutation({
            query: (data: ReportFilters) => ({
                url: '/reports/tax',
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        }),
    }),
});

export const {
    // Sales & Revenue
    useGetSalesReportMutation,
    useGetTransactionReportMutation,
    useGetInvoiceReportMutation,
    useGetSalesItemsReportMutation,
    useGetOrderReturnsReportMutation,
    // Customer
    useGetCustomerReportMutation,
    useGetCustomerDueReportMutation,
    // Purchase & Supplier
    useGetPurchaseReportMutation,
    useGetPurchaseItemsReportMutation,
    useGetPurchaseTransactionReportMutation,
    useGetSupplierReportMutation,
    useGetSupplierDueReportMutation,
    // Inventory
    useGetStockReportMutation,
    useGetLowStockReportMutation,
    useGetIdleProductReportMutation,
    useGetStockAdjustmentReportMutation,
    useGetProductReportMutation,
    // Financial
    useGetProfitLossReportMutation,
    useGetExpenseReportMutation,
    useGetTaxReportMutation,
} = ReportApi;
