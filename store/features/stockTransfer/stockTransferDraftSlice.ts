import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface StockTransferDraftItem {
    id: number;
    productId: number;
    stockId?: number;
    title: string;
    name?: string;
    sku?: string;
    quantity: number;
    PlaceholderQuantity?: number;
    unit?: string;
    unitFactor?: number;
    availableUnits?: { unit: string; factor?: number }[];
    variantName?: string;
    variantData?: Record<string, string>;
}

interface StockTransferDraftState {
    itemsByStore: { [storeId: number]: StockTransferDraftItem[] };
}

const initialState: StockTransferDraftState = {
    itemsByStore: {},
};

const stockTransferDraftSlice = createSlice({
    name: 'stockTransferDraft',
    initialState,
    reducers: {
        addTransferItem: (state, action: PayloadAction<{ storeId: number; item: StockTransferDraftItem }>) => {
            const { storeId, item } = action.payload;
            if (!state.itemsByStore[storeId]) state.itemsByStore[storeId] = [];

            const existing = state.itemsByStore[storeId].find((i) => i.productId === item.productId && i.stockId === item.stockId);
            if (!existing) {
                state.itemsByStore[storeId].push({ ...item, id: Date.now() + Math.random() });
            }
        },
        removeTransferItem: (state, action: PayloadAction<{ storeId: number; id: number }>) => {
            const { storeId, id } = action.payload;
            state.itemsByStore[storeId] = (state.itemsByStore[storeId] || []).filter((item) => item.id !== id);
        },
        updateTransferItemQuantity: (state, action: PayloadAction<{ storeId: number; id: number; quantity: number }>) => {
            const { storeId, id, quantity } = action.payload;
            const item = state.itemsByStore[storeId]?.find((i) => i.id === id);
            if (item) item.quantity = quantity;
        },
        updateTransferItemUnit: (state, action: PayloadAction<{ storeId: number; id: number; unit: string; factor: number }>) => {
            const { storeId, id, unit, factor } = action.payload;
            const item = state.itemsByStore[storeId]?.find((i) => i.id === id);
            if (item) {
                item.unit = unit;
                item.unitFactor = factor;
            }
        },
        clearTransferItems: (state, action: PayloadAction<number>) => {
            state.itemsByStore[action.payload] = [];
        },
    },
});

export const {
    addTransferItem,
    removeTransferItem,
    updateTransferItemQuantity,
    updateTransferItemUnit,
    clearTransferItems,
} = stockTransferDraftSlice.actions;

export default stockTransferDraftSlice.reducer;
