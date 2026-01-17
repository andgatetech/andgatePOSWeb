import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LabelItem {
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
    description?: string;
}

export interface GeneratedLabel {
    product_name: string;
    variant_name?: string;
    sku: string;
    barcode: string; // Base64 image data
}

interface LabelState {
    itemsByStore: { [storeId: number]: LabelItem[] };
    generatedLabelsByStore: { [storeId: number]: GeneratedLabel[] };
}

const initialState: LabelState = {
    itemsByStore: {},
    generatedLabelsByStore: {},
};

const labelSlice = createSlice({
    name: 'label',
    initialState,
    reducers: {
        addLabelItem: (state, action: PayloadAction<{ storeId: number; item: LabelItem }>) => {
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
        removeLabelItem: (state, action: PayloadAction<{ storeId: number; id: number }>) => {
            const { storeId, id } = action.payload;
            if (state.itemsByStore && state.itemsByStore[storeId]) {
                state.itemsByStore[storeId] = state.itemsByStore[storeId].filter((item) => item.id !== id);
            }
        },
        updateLabelItemQuantity: (state, action: PayloadAction<{ storeId: number; id: number; quantity: number }>) => {
            const { storeId, id, quantity } = action.payload;
            if (state.itemsByStore && state.itemsByStore[storeId]) {
                const item = state.itemsByStore[storeId].find((i) => i.id === id);
                if (item) {
                    item.quantity = quantity;
                }
            }
        },
        clearLabelItems: (state, action: PayloadAction<number>) => {
            const storeId = action.payload;
            if (!state.itemsByStore) {
                state.itemsByStore = {};
            }
            state.itemsByStore[storeId] = [];
        },
        clearAllLabelItems: (state) => {
            state.itemsByStore = {};
            state.generatedLabelsByStore = {};
        },
        setGeneratedLabels: (state, action: PayloadAction<{ storeId: number; labels: GeneratedLabel[] }>) => {
            const { storeId, labels } = action.payload;
            if (!state.generatedLabelsByStore) {
                state.generatedLabelsByStore = {};
            }
            state.generatedLabelsByStore[storeId] = labels;
        },
        clearGeneratedLabels: (state, action: PayloadAction<number>) => {
            const storeId = action.payload;
            if (!state.generatedLabelsByStore) {
                state.generatedLabelsByStore = {};
            }
            state.generatedLabelsByStore[storeId] = [];
        },
    },
});

export const { addLabelItem, removeLabelItem, updateLabelItemQuantity, clearLabelItems, clearAllLabelItems, setGeneratedLabels, clearGeneratedLabels } = labelSlice.actions;

// Selectors
export const selectLabelItemsForStore = (storeId: number | null) => (state: { label: LabelState }) => storeId ? state.label.itemsByStore[storeId] || [] : [];

export const selectGeneratedLabelsForStore = (storeId: number | null) => (state: { label: LabelState }) => storeId ? state.label.generatedLabelsByStore[storeId] || [] : [];

export default labelSlice.reducer;
