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
    itemsByStore: { [storeId: number]: StockAdjustmentItem[] };
}

const initialState: StockAdjustmentState = {
    itemsByStore: {},
};

const stockAdjustmentSlice = createSlice({
    name: 'stockAdjustment',
    initialState,
    reducers: {
        addStockItem: (state, action: PayloadAction<{ storeId: number; item: StockAdjustmentItem }>) => {
            const { storeId, item } = action.payload;
            // Ensure itemsByStore exists (handles migration from old state)
            if (!state.itemsByStore) {
                state.itemsByStore = {};
            }
            if (!state.itemsByStore[storeId]) {
                state.itemsByStore[storeId] = [];
            }

            const existingItem = state.itemsByStore[storeId].find((i) => i.productId === item.productId && i.stockId === item.stockId);

            if (!existingItem) {
                state.itemsByStore[storeId].push({
                    ...item,
                    id: Date.now() + Math.random(), // Unique ID
                });
            }
        },
        removeStockItem: (state, action: PayloadAction<{ storeId: number; id: number }>) => {
            const { storeId, id } = action.payload;
            if (!state.itemsByStore) {
                state.itemsByStore = {};
            }
            if (state.itemsByStore[storeId]) {
                state.itemsByStore[storeId] = state.itemsByStore[storeId].filter((item) => item.id !== id);
            }
        },
        updateStockItemQuantity: (state, action: PayloadAction<{ storeId: number; id: number; quantity: number }>) => {
            const { storeId, id, quantity } = action.payload;
            if (!state.itemsByStore) {
                state.itemsByStore = {};
            }
            if (state.itemsByStore[storeId]) {
                const item = state.itemsByStore[storeId].find((i) => i.id === id);
                if (item) {
                    item.quantity = quantity;
                }
            }
        },
        clearStockItems: (state, action: PayloadAction<number>) => {
            const storeId = action.payload;
            if (!state.itemsByStore) {
                state.itemsByStore = {};
            }
            state.itemsByStore[storeId] = [];
        },
        clearAllStockItems: (state) => {
            state.itemsByStore = {};
        },
    },
});

export const { addStockItem, removeStockItem, updateStockItemQuantity, clearStockItems, clearAllStockItems } = stockAdjustmentSlice.actions;

// Selector for getting items for a specific store
export const selectStockItemsForStore = (storeId: number | null) => (state: { stockAdjustment: StockAdjustmentState }) =>
    storeId && state.stockAdjustment.itemsByStore ? state.stockAdjustment.itemsByStore[storeId] || [] : [];

export default stockAdjustmentSlice.reducer;
