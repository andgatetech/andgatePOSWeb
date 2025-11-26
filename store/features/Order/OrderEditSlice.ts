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

interface Item {
    id: number; // Local row ID (negative for existing items, positive for new)
    orderItemId?: number; // Original order_item ID from backend (for update/delete actions)
    productId?: number; // Product ID from backend
    stockId?: number; // Stock ID for variants
    title: string; // Product name
    description?: string;
    sku?: string; // Product SKU
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
    discount?: number; // Item-level discount
    unit?: string; // Product unit (piece, kg, etc.)
    isWholesale?: boolean; // Whether wholesale price is used
    isOriginalItem?: boolean; // Track if item is from original order (for action determination)

    // Serial & Warranty Support
    serials?: Serial[]; // Selected serial numbers for this item
    warranty?: Warranty | null; // Warranty info if product has warranty
    has_serial?: boolean; // Flag from backend
    has_warranty?: boolean; // Flag from backend
}

interface OrderEditState {
    items: Item[];
    orderId: number | null;
    originalOrder: any | null; // Store original order data
}

const initialState: OrderEditState = {
    items: [],
    orderId: null,
    originalOrder: null,
};

const orderEditSlice = createSlice({
    name: 'orderEdit',
    initialState,
    reducers: {
        setOrderData(state, action: PayloadAction<{ orderId: number; order: any }>) {
            state.orderId = action.payload.orderId;
            state.originalOrder = action.payload.order;
        },
        setItemsRedux(state, action: PayloadAction<Item[]>) {
            // Filter out items without productId to avoid empty items
            state.items = action.payload.filter((item) => item.productId !== undefined);
        },
        addItemRedux(state, action: PayloadAction<Item>) {
            if (action.payload.productId !== undefined) {
                // For serialized products, ALWAYS add as new item (each serial is unique)
                if (action.payload.has_serial && action.payload.serials && action.payload.serials.length > 0) {
                    state.items.push(action.payload);
                    return;
                }

                // For variant products or products with stockId, check both productId AND stockId
                // For products without stockId (e.g., loaded from DB), match by productId only
                let existingItemIndex = -1;

                if (action.payload.stockId) {
                    // New item has stockId - try to find exact match first
                    existingItemIndex = state.items.findIndex((item) => item.productId === action.payload.productId && item.stockId === action.payload.stockId && !item.has_serial);

                    // If no exact match, try to find item with same productId but no stockId (from DB)
                    if (existingItemIndex === -1) {
                        existingItemIndex = state.items.findIndex((item) => item.productId === action.payload.productId && !item.stockId && !item.has_serial);

                        // If found, update the stockId of existing item to match new stockId
                        if (existingItemIndex !== -1) {
                            state.items[existingItemIndex].stockId = action.payload.stockId;
                            // Also update PlaceholderQuantity and other stock-related fields
                            if (action.payload.PlaceholderQuantity) {
                                state.items[existingItemIndex].PlaceholderQuantity = action.payload.PlaceholderQuantity;
                            }
                        }
                    }
                } else {
                    // New item has no stockId - find by productId only
                    existingItemIndex = state.items.findIndex((item) => item.productId === action.payload.productId && !item.stockId && !item.has_serial);
                }

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
                    // New product/variant → add normally
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
            state.orderId = null;
            state.originalOrder = null;
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

export const { setOrderData, setItemsRedux, addItemRedux, updateItemRedux, removeItemRedux, clearItemsRedux, updateItemQuantityRedux, updateItemRateRedux } = orderEditSlice.actions;

export default orderEditSlice.reducer;
