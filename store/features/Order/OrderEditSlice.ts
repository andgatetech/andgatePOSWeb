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

// Per-store session state
interface OrderEditSession {
    items: Item[];
    orderId: number | null;
    originalOrder: any | null; // Store original order data
}

interface OrderEditState {
    sessionsByStore: { [storeId: number]: OrderEditSession };
}

const createEmptySession = (): OrderEditSession => ({
    items: [],
    orderId: null,
    originalOrder: null,
});

const initialState: OrderEditState = {
    sessionsByStore: {},
};

// Helper to get or create session
const getStoreSession = (state: OrderEditState, storeId: number): OrderEditSession => {
    // Ensure sessionsByStore exists (migration)
    if (!state.sessionsByStore) {
        state.sessionsByStore = {};
    }
    if (!state.sessionsByStore[storeId]) {
        state.sessionsByStore[storeId] = createEmptySession();
    }
    return state.sessionsByStore[storeId];
};

const orderEditSlice = createSlice({
    name: 'orderEdit',
    initialState,
    reducers: {
        setOrderData(state, action: PayloadAction<{ storeId: number; orderId: number; order: any }>) {
            const { storeId, orderId, order } = action.payload;
            const session = getStoreSession(state, storeId);
            session.orderId = orderId;
            session.originalOrder = order;
        },
        setItemsRedux(state, action: PayloadAction<{ storeId: number; items: Item[] }>) {
            const { storeId, items } = action.payload;
            const session = getStoreSession(state, storeId);
            // Filter out items without productId to avoid empty items
            session.items = items.filter((item) => item.productId !== undefined);
        },
        addItemRedux(state, action: PayloadAction<{ storeId: number; item: Item }>) {
            const { storeId, item } = action.payload;
            const session = getStoreSession(state, storeId);

            if (item.productId !== undefined) {
                // For serialized products, ALWAYS add as new item (each serial is unique)
                if (item.has_serial && item.serials && item.serials.length > 0) {
                    session.items.push(item);
                    return;
                }

                // For variant products or products with stockId, check both productId AND stockId
                // For products without stockId (e.g., loaded from DB), match by productId only
                let existingItemIndex = -1;

                if (item.stockId) {
                    // New item has stockId - try to find exact match first
                    existingItemIndex = session.items.findIndex((i) => i.productId === item.productId && i.stockId === item.stockId && !i.has_serial);

                    // If no exact match, try to find item with same productId but no stockId (from DB)
                    if (existingItemIndex === -1) {
                        existingItemIndex = session.items.findIndex((i) => i.productId === item.productId && !i.stockId && !i.has_serial);

                        // If found, update the stockId of existing item to match new stockId
                        if (existingItemIndex !== -1) {
                            session.items[existingItemIndex].stockId = item.stockId;
                            // Also update PlaceholderQuantity and other stock-related fields
                            if (item.PlaceholderQuantity) {
                                session.items[existingItemIndex].PlaceholderQuantity = item.PlaceholderQuantity;
                            }
                        }
                    }
                } else {
                    // New item has no stockId - find by productId only
                    existingItemIndex = session.items.findIndex((i) => i.productId === item.productId && !i.stockId && !i.has_serial);
                }

                if (existingItemIndex !== -1) {
                    // Product already exists → increase quantity
                    const existingItem = session.items[existingItemIndex];
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
                    session.items.push(item);
                }
            }
        },

        updateItemRedux(state, action: PayloadAction<{ storeId: number; item: Item }>) {
            const { storeId, item } = action.payload;
            const session = getStoreSession(state, storeId);

            const index = session.items.findIndex((i) => i.id === item.id);
            if (index !== -1) {
                // Update existing item
                session.items[index] = { ...session.items[index], ...item };
            } else if (item.productId !== undefined) {
                // Add new item if it doesn't exist and has a productId
                session.items.push(item);
            }
        },
        removeItemRedux(state, action: PayloadAction<{ storeId: number; id: number }>) {
            const { storeId, id } = action.payload;
            const session = getStoreSession(state, storeId);
            session.items = session.items.filter((item) => item.id !== id);
        },
        clearItemsRedux(state, action: PayloadAction<number>) {
            const storeId = action.payload;
            // Careful: we might want to clear session completely or just reset it
            const session = getStoreSession(state, storeId);
            session.items = [];
            session.orderId = null;
            session.originalOrder = null;
        },
        updateItemQuantityRedux(state, action: PayloadAction<{ storeId: number; id: number; quantity: number }>) {
            const { storeId, id, quantity } = action.payload;
            const session = getStoreSession(state, storeId);
            const item = session.items.find((i) => i.id === id);
            if (item && quantity >= 0) {
                item.quantity = quantity;
                item.amount = item.rate * quantity;
            }
        },
        updateItemRateRedux(state, action: PayloadAction<{ storeId: number; id: number; rate: number }>) {
            const { storeId, id, rate } = action.payload;
            const session = getStoreSession(state, storeId);
            const item = session.items.find((i) => i.id === id);
            if (item && rate >= 0) {
                item.rate = rate;
                item.amount = item.quantity * rate;
            }
        },
    },
});

export const { setOrderData, setItemsRedux, addItemRedux, updateItemRedux, removeItemRedux, clearItemsRedux, updateItemQuantityRedux, updateItemRateRedux } = orderEditSlice.actions;

// Selectors
export const selectOrderEditSession = (storeId: number | null) => (state: { orderEdit: OrderEditState }) =>
    storeId && state.orderEdit.sessionsByStore ? state.orderEdit.sessionsByStore[storeId] || createEmptySession() : createEmptySession();

export const selectOrderEditItems = (storeId: number | null) => (state: { orderEdit: OrderEditState }) => selectOrderEditSession(storeId)(state).items;

export default orderEditSlice.reducer;
