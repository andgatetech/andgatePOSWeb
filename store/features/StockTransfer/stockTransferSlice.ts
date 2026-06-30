import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface StockTransferItem {
    id: number;
    productId: number;
    stockId?: number;
    title: string;
    name?: string;
    sku?: string;
    quantity: number;
    PlaceholderQuantity?: number;
    unit?: string;
    variantName?: string;
    variantData?: Record<string, string>;
    has_serial?: boolean;
    description?: string;
}

interface StockTransferState {
    itemsByStore: { [storeId: number]: StockTransferItem[] };
}

const initialState: StockTransferState = {
    itemsByStore: {},
};

const stockTransferSlice = createSlice({
    name: 'stockTransfer',
    initialState,
    reducers: {
        addTransferItem: (state, action: PayloadAction<{ storeId: number; item: StockTransferItem }>) => {
            const { storeId, item } = action.payload;
            if (!state.itemsByStore) state.itemsByStore = {};
            if (!state.itemsByStore[storeId]) state.itemsByStore[storeId] = [];

            const existingItem = state.itemsByStore[storeId].find((i) => i.productId === item.productId && i.stockId === item.stockId);
            if (!existingItem) {
                state.itemsByStore[storeId].push({ ...item, id: Date.now() + Math.random() });
            }
        },
        removeTransferItem: (state, action: PayloadAction<{ storeId: number; id: number }>) => {
            const { storeId, id } = action.payload;
            if (!state.itemsByStore) state.itemsByStore = {};
            if (state.itemsByStore[storeId]) {
                state.itemsByStore[storeId] = state.itemsByStore[storeId].filter((item) => item.id !== id);
            }
        },
        updateTransferItemQuantity: (state, action: PayloadAction<{ storeId: number; id: number; quantity: number }>) => {
            const { storeId, id, quantity } = action.payload;
            if (!state.itemsByStore) state.itemsByStore = {};
            if (state.itemsByStore[storeId]) {
                const item = state.itemsByStore[storeId].find((i) => i.id === id);
                if (item) item.quantity = quantity;
            }
        },
        clearTransferItems: (state, action: PayloadAction<number>) => {
            const storeId = action.payload;
            if (!state.itemsByStore) state.itemsByStore = {};
            state.itemsByStore[storeId] = [];
        },
        clearAllTransferItems: (state) => {
            state.itemsByStore = {};
        },
    },
});

export const {
    addTransferItem,
    removeTransferItem,
    updateTransferItemQuantity,
    clearTransferItems,
    clearAllTransferItems,
} = stockTransferSlice.actions;

export const selectTransferItemsForStore = (storeId: number | null) => (state: { stockTransfer: StockTransferState }) =>
    storeId && state.stockTransfer.itemsByStore ? state.stockTransfer.itemsByStore[storeId] || [] : [];

export default stockTransferSlice.reducer;
