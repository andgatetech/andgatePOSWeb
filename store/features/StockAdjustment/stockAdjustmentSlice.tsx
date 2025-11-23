import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface StockAdjustmentItem {
    id: number;
    productId: number;
    stockId?: number;
    title: string;
    name?: string;
    sku?: string;
    quantity: number;
    PlaceholderQuantity?: number;
    rate?: number;
    unit?: string;
    variantName?: string;
    variantData?: Record<string, string>;
    has_serial?: boolean;
    has_warranty?: boolean;
    serials?: any[];
    warranty?: any;
    description?: string;
}

interface StockAdjustmentState {
    items: StockAdjustmentItem[];
}

const initialState: StockAdjustmentState = {
    items: [],
};

const stockAdjustmentSlice = createSlice({
    name: 'stockAdjustment',
    initialState,
    reducers: {
        addStockItem: (state, action: PayloadAction<StockAdjustmentItem>) => {
            const existingItem = state.items.find((item) => item.productId === action.payload.productId && item.stockId === action.payload.stockId);

            if (!existingItem) {
                state.items.push({
                    ...action.payload,
                    id: Date.now() + Math.random(), // Unique ID
                });
            }
        },
        removeStockItem: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },
        updateStockItemQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
            const item = state.items.find((item) => item.id === action.payload.id);
            if (item) {
                item.quantity = action.payload.quantity;
            }
        },
        clearStockItems: (state) => {
            state.items = [];
        },
    },
});

export const { addStockItem, removeStockItem, updateStockItemQuantity, clearStockItems } = stockAdjustmentSlice.actions;
export default stockAdjustmentSlice.reducer;
