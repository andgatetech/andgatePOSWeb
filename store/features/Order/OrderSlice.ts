import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Item {
    id: number; // Local row ID
    productId?: number; // Product ID from backend
    title: string; // Product name
    description?: string;
    rate: number; // Price per unit
    quantity: number;
    amount: number; // rate * quantity
    PlaceholderQuantity?: number; // Available stock quantity
    tax_rate?: number; // Tax rate percentage from backend
    tax_included?: boolean; // Whether tax is included in the price (0=excluded, 1=included)
    unit?: string; // Product unit (piece, kg, etc.)
}

interface InvoiceState {
    items: Item[];
}

const initialState: InvoiceState = {
    items: [],
};

const invoiceSlice = createSlice({
    name: 'invoice',
    initialState,
    reducers: {
        setItemsRedux(state, action: PayloadAction<Item[]>) {
            // Filter out items without productId to avoid empty items
            state.items = action.payload.filter((item) => item.productId !== undefined);
        },
        addItemRedux(state, action: PayloadAction<Item>) {
            if (action.payload.productId !== undefined) {
                // Find existing product by productId (not by id)
                const existingItemIndex = state.items.findIndex((item) => item.productId === action.payload.productId);

                if (existingItemIndex !== -1) {
                    // Product already exists → increase quantity
                    const existingItem = state.items[existingItemIndex];
                    const newQuantity = existingItem.quantity + action.payload.quantity;

                    // Respect available stock limit if PlaceholderQuantity exists
                    if (existingItem.PlaceholderQuantity && newQuantity > existingItem.PlaceholderQuantity) {
                        existingItem.quantity = existingItem.PlaceholderQuantity;
                    } else {
                        existingItem.quantity = newQuantity;
                    }

                    existingItem.amount = existingItem.quantity * existingItem.rate;
                } else {
                    // New product → add normally
                    state.items.push(action.payload);
                }
            }
        },

        updateItemRedux(state, action: PayloadAction<Item>) {
            const index = state.items.findIndex((item) => item.id === action.payload.id);
            if (index !== -1) {
                // Update existing item
                state.items[index] = { ...state.items[index], ...action.payload };
            } else if (action.payload.productId !== undefined) {
                // Add new item if it doesn't exist and has a productId
                state.items.push(action.payload);
            }
        },
        removeItemRedux(state, action: PayloadAction<number>) {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },
        clearItemsRedux(state) {
            state.items = [];
        },
        updateItemQuantityRedux(state, action: PayloadAction<{ id: number; quantity: number }>) {
            const { id, quantity } = action.payload;
            const item = state.items.find((item) => item.id === id);
            if (item && quantity >= 0) {
                item.quantity = quantity;
                item.amount = item.rate * quantity;
            }
        },
        updateItemRateRedux(state, action: PayloadAction<{ id: number; rate: number }>) {
            const { id, rate } = action.payload;
            const item = state.items.find((item) => item.id === id);
            if (item && rate >= 0) {
                item.rate = rate;
                item.amount = item.quantity * rate;
            }
        },
    },
});

export const { setItemsRedux, addItemRedux, updateItemRedux, removeItemRedux, clearItemsRedux, updateItemQuantityRedux, updateItemRateRedux } = invoiceSlice.actions;

export default invoiceSlice.reducer;
