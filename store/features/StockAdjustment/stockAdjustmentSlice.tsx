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

export interface AdjustmentConfig {
    adjustmentType: 'increase' | 'decrease';
    adjustmentQuantity: number;
    reason: string;
    notes: string;
    serialAdjustments?: any[];
}

export interface GlobalAdjustmentConfig {
    reason: string;
    notes: string;
}

interface StockAdjustmentState {
    itemsByStore: { [storeId: number]: StockAdjustmentItem[] };
    configsByStore: { [storeId: number]: { [itemId: number]: AdjustmentConfig } };
    globalByStore: { [storeId: number]: GlobalAdjustmentConfig };
}

const initialState: StockAdjustmentState = {
    itemsByStore: {},
    configsByStore: {},
    globalByStore: {},
};

const stockAdjustmentSlice = createSlice({
    name: 'stockAdjustment',
    initialState,
    reducers: {
        addStockItem: (state, action: PayloadAction<{ storeId: number; item: StockAdjustmentItem }>) => {
            const { storeId, item } = action.payload;
            if (!state.itemsByStore) state.itemsByStore = {};
            if (!state.itemsByStore[storeId]) state.itemsByStore[storeId] = [];

            const existingItem = state.itemsByStore[storeId].find((i) => i.productId === item.productId && i.stockId === item.stockId);
            if (!existingItem) {
                state.itemsByStore[storeId].push({ ...item, id: Date.now() + Math.random() });
            }
        },
        removeStockItem: (state, action: PayloadAction<{ storeId: number; id: number }>) => {
            const { storeId, id } = action.payload;
            if (!state.itemsByStore) state.itemsByStore = {};
            if (state.itemsByStore[storeId]) {
                state.itemsByStore[storeId] = state.itemsByStore[storeId].filter((item) => item.id !== id);
            }
            if (state.configsByStore?.[storeId]) {
                delete state.configsByStore[storeId][id];
            }
        },
        updateStockItemQuantity: (state, action: PayloadAction<{ storeId: number; id: number; quantity: number }>) => {
            const { storeId, id, quantity } = action.payload;
            if (!state.itemsByStore) state.itemsByStore = {};
            if (state.itemsByStore[storeId]) {
                const item = state.itemsByStore[storeId].find((i) => i.id === id);
                if (item) item.quantity = quantity;
            }
        },
        clearStockItems: (state, action: PayloadAction<number>) => {
            const storeId = action.payload;
            if (!state.itemsByStore) state.itemsByStore = {};
            state.itemsByStore[storeId] = [];
            if (state.configsByStore) state.configsByStore[storeId] = {};
            if (state.globalByStore) state.globalByStore[storeId] = { reason: '', notes: '' };
        },
        clearAllStockItems: (state) => {
            state.itemsByStore = {};
            state.configsByStore = {};
            state.globalByStore = {};
        },
        setAdjustmentConfig: (state, action: PayloadAction<{ storeId: number; itemId: number; field: string; value: any }>) => {
            const { storeId, itemId, field, value } = action.payload;
            if (!state.configsByStore) state.configsByStore = {};
            if (!state.configsByStore[storeId]) state.configsByStore[storeId] = {};
            if (!state.configsByStore[storeId][itemId]) {
                state.configsByStore[storeId][itemId] = {
                    adjustmentType: 'increase',
                    adjustmentQuantity: 0,
                    reason: '',
                    notes: '',
                };
            }
            (state.configsByStore[storeId][itemId] as any)[field] = value;
        },
        setGlobalConfig: (state, action: PayloadAction<{ storeId: number; field: 'reason' | 'notes'; value: string }>) => {
            const { storeId, field, value } = action.payload;
            if (!state.globalByStore) state.globalByStore = {};
            if (!state.globalByStore[storeId]) state.globalByStore[storeId] = { reason: '', notes: '' };
            state.globalByStore[storeId][field] = value;
        },
    },
});

export const {
    addStockItem,
    removeStockItem,
    updateStockItemQuantity,
    clearStockItems,
    clearAllStockItems,
    setAdjustmentConfig,
    setGlobalConfig,
} = stockAdjustmentSlice.actions;

export const selectStockItemsForStore = (storeId: number | null) => (state: { stockAdjustment: StockAdjustmentState }) =>
    storeId && state.stockAdjustment.itemsByStore ? state.stockAdjustment.itemsByStore[storeId] || [] : [];

export const selectConfigsForStore = (storeId: number | null) => (state: { stockAdjustment: StockAdjustmentState }) =>
    storeId && state.stockAdjustment.configsByStore ? state.stockAdjustment.configsByStore[storeId] || {} : {};

export const selectGlobalConfigForStore = (storeId: number | null) => (state: { stockAdjustment: StockAdjustmentState }) =>
    storeId && state.stockAdjustment.globalByStore ? state.stockAdjustment.globalByStore[storeId] || { reason: '', notes: '' } : { reason: '', notes: '' };

export default stockAdjustmentSlice.reducer;
