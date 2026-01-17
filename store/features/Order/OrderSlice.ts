import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Serial {
    id: number;
    serial_number: string;
    status: string;
    notes?: string;
}

interface Warranty {
    id: number;
    warranty_type_id: number;
    warranty_type_name: string;
    duration_months: number | null;
    duration_days: number | null;
    start_date: string | null;
    end_date: string | null;
    status: string;
    remaining_days: number | null;
}

export interface Item {
    id: number; // Local row ID
    productId?: number; // Product ID from backend
    stockId?: number; // Stock ID for variants
    title: string; // Product name
    description?: string;
    variantName?: string; // Variant name (e.g., "Red - M - cotton")
    variantData?: { [key: string]: string }; // Variant attributes
    rate: number; // Current price per unit (changes based on wholesale toggle)
    regularPrice?: number; // Regular selling price (stored for switching)
    wholesalePrice?: number; // Wholesale price (stored for switching)
    quantity: number;
    amount: number; // rate * quantity
    PlaceholderQuantity?: number; // Available stock quantity
    tax_rate?: number; // Tax rate percentage from backend
    tax_included?: boolean; // Whether tax is included in the price (0=excluded, 1=included)
    unit?: string; // Product unit (piece, kg, etc.)
    isWholesale?: boolean; // Whether wholesale price is used

    // Serial & Warranty Support
    serials?: Serial[]; // Selected serial numbers for this item
    warranty?: Warranty | null; // Warranty info if product has warranty
    has_serial?: boolean; // Flag from backend
    has_warranty?: boolean; // Flag from backend
}

interface InvoiceState {
    itemsByStore: { [storeId: number]: Item[] };
}

const initialState: InvoiceState = {
    itemsByStore: {},
};

const invoiceSlice = createSlice({
    name: 'invoice',
    initialState,
    reducers: {
        setItemsRedux(state, action: PayloadAction<{ storeId: number; items: Item[] }>) {
            const { storeId, items } = action.payload;
            // Ensure itemsByStore exists (handles migration from old state)
            if (!state.itemsByStore) {
                state.itemsByStore = {};
            }
            // Filter out items without productId to avoid empty items
            state.itemsByStore[storeId] = items.filter((item) => item.productId !== undefined);
        },
        addItemRedux(state, action: PayloadAction<{ storeId: number; item: Item }>) {
            const { storeId, item } = action.payload;

            // Ensure itemsByStore exists (handles migration from old state)
            if (!state.itemsByStore) {
                state.itemsByStore = {};
            }

            // Initialize store items array if not exists
            if (!state.itemsByStore[storeId]) {
                state.itemsByStore[storeId] = [];
            }

            if (item.productId !== undefined) {
                // For serialized products, ALWAYS add as new item (each serial is unique)
                if (item.has_serial && item.serials && item.serials.length > 0) {
                    state.itemsByStore[storeId].push(item);
                    return;
                }

                // For variant products, check both productId AND stockId
                const storeItems = state.itemsByStore[storeId];
                const existingItemIndex = item.stockId
                    ? storeItems.findIndex((i) => i.productId === item.productId && i.stockId === item.stockId && !i.has_serial)
                    : storeItems.findIndex((i) => i.productId === item.productId && !i.stockId && !i.has_serial);

                if (existingItemIndex !== -1) {
                    // Product already exists → increase quantity
                    const existingItem = storeItems[existingItemIndex];
                    const newQuantity = existingItem.quantity + item.quantity;

                    // Respect available stock limit if PlaceholderQuantity exists
                    if (existingItem.PlaceholderQuantity && newQuantity > existingItem.PlaceholderQuantity) {
                        existingItem.quantity = existingItem.PlaceholderQuantity;
                    } else {
                        existingItem.quantity = newQuantity;
                    }

                    existingItem.amount = existingItem.quantity * existingItem.rate;
                } else {
                    // New product/variant → add normally
                    state.itemsByStore[storeId].push(item);
                }
            }
        },

        updateItemRedux(state, action: PayloadAction<{ storeId: number; item: Item }>) {
            const { storeId, item } = action.payload;

            // Ensure itemsByStore exists (handles migration from old state)
            if (!state.itemsByStore) {
                state.itemsByStore = {};
            }

            if (!state.itemsByStore[storeId]) {
                state.itemsByStore[storeId] = [];
            }

            const storeItems = state.itemsByStore[storeId];
            const index = storeItems.findIndex((i) => i.id === item.id);
            if (index !== -1) {
                // Update existing item
                storeItems[index] = { ...storeItems[index], ...item };
            } else if (item.productId !== undefined) {
                // Add new item if it doesn't exist and has a productId
                state.itemsByStore[storeId].push(item);
            }
        },
        removeItemRedux(state, action: PayloadAction<{ storeId: number; id: number }>) {
            const { storeId, id } = action.payload;
            if (state.itemsByStore && state.itemsByStore[storeId]) {
                state.itemsByStore[storeId] = state.itemsByStore[storeId].filter((item) => item.id !== id);
            }
        },
        clearItemsRedux(state, action: PayloadAction<number>) {
            const storeId = action.payload;
            if (!state.itemsByStore) {
                state.itemsByStore = {};
            }
            state.itemsByStore[storeId] = [];
        },
        clearAllItemsRedux(state) {
            state.itemsByStore = {};
        },
        updateItemQuantityRedux(state, action: PayloadAction<{ storeId: number; id: number; quantity: number }>) {
            const { storeId, id, quantity } = action.payload;
            if (state.itemsByStore && state.itemsByStore[storeId]) {
                const item = state.itemsByStore[storeId].find((i) => i.id === id);
                if (item && quantity >= 0) {
                    item.quantity = quantity;
                    item.amount = item.rate * quantity;
                }
            }
        },
        updateItemRateRedux(state, action: PayloadAction<{ storeId: number; id: number; rate: number }>) {
            const { storeId, id, rate } = action.payload;
            if (state.itemsByStore && state.itemsByStore[storeId]) {
                const item = state.itemsByStore[storeId].find((i) => i.id === id);
                if (item && rate >= 0) {
                    item.rate = rate;
                    item.amount = item.quantity * rate;
                }
            }
        },
    },
});

export const { setItemsRedux, addItemRedux, updateItemRedux, removeItemRedux, clearItemsRedux, clearAllItemsRedux, updateItemQuantityRedux, updateItemRateRedux } = invoiceSlice.actions;

// Selector to get items for a specific store
export const selectItemsForStore = (storeId: number | null) => (state: { invoice: InvoiceState }) => storeId ? state.invoice.itemsByStore[storeId] || [] : [];

export default invoiceSlice.reducer;
