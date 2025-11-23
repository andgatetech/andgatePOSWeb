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

interface LabelState {
    items: LabelItem[];
}

const initialState: LabelState = {
    items: [],
};

const labelSlice = createSlice({
    name: 'label',
    initialState,
    reducers: {
        addLabelItem: (state, action: PayloadAction<LabelItem>) => {
            const existingItem = state.items.find((item) => item.productId === action.payload.productId && item.stockId === action.payload.stockId);

            if (!existingItem) {
                state.items.push({
                    ...action.payload,
                    id: Date.now() + Math.random(), // Unique ID
                });
            }
        },
        removeLabelItem: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },
        updateLabelItemQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
            const item = state.items.find((item) => item.id === action.payload.id);
            if (item) {
                item.quantity = action.payload.quantity;
            }
        },
        clearLabelItems: (state) => {
            state.items = [];
        },
    },
});

export const { addLabelItem, removeLabelItem, updateLabelItemQuantity, clearLabelItems } = labelSlice.actions;
export default labelSlice.reducer;
