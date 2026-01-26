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

// Item being returned from original order
export interface ReturnItem {
    id: number; // Local row ID
    orderItemId: number; // Original order_item ID from backend
    productId: number;
    stockId?: number;
    title: string;
    sku?: string;
    variantName?: string;
    rate: number; // Unit price
    originalQuantity: number; // Original quantity from order
    returnQuantity: number; // Quantity being returned
    amount: number; // rate * returnQuantity
    tax_rate?: number;
    tax_included?: boolean;
    unit?: string;
    serials?: Serial[];
    warranty?: Warranty | null;
    has_serial?: boolean;
    has_warranty?: boolean;
}

// New item for exchange
export interface ExchangeItem {
    id: number; // Local row ID
    productId?: number;
    stockId?: number;
    title: string;
    description?: string;
    sku?: string;
    variantName?: string;
    variantData?: { [key: string]: string };
    rate: number;
    regularPrice?: number;
    wholesalePrice?: number;
    quantity: number;
    amount: number;
    PlaceholderQuantity?: number;
    tax_rate?: number;
    tax_included?: boolean;
    unit?: string;
    isWholesale?: boolean;
    serials?: Serial[];
    warranty?: Warranty | null;
    has_serial?: boolean;
    has_warranty?: boolean;
}

// Per-store return session state
interface OrderReturnSession {
    orderId: number | null;
    originalOrder: any | null;
    returnItems: ReturnItem[]; // Items being returned
    exchangeItems: ExchangeItem[]; // New items for exchange
    returnReasonId: number | null;
    returnNotes: string;
}

interface OrderReturnState {
    sessionsByStore: { [storeId: number]: OrderReturnSession };
}

const createEmptySession = (): OrderReturnSession => ({
    orderId: null,
    originalOrder: null,
    returnItems: [],
    exchangeItems: [],
    returnReasonId: null,
    returnNotes: '',
});

const initialState: OrderReturnState = {
    sessionsByStore: {},
};

// Helper to get or create session
const getStoreSession = (state: OrderReturnState, storeId: number): OrderReturnSession => {
    if (!state.sessionsByStore) {
        state.sessionsByStore = {};
    }
    if (!state.sessionsByStore[storeId]) {
        state.sessionsByStore[storeId] = createEmptySession();
    }
    return state.sessionsByStore[storeId];
};

const orderReturnSlice = createSlice({
    name: 'orderReturn',
    initialState,
    reducers: {
        // Start return process by setting Order ID (called from OrdersTable)
        setReturnOrderId(state, action: PayloadAction<{ storeId: number; orderId: number }>) {
            const { storeId, orderId } = action.payload;
            const session = getStoreSession(state, storeId);
            session.orderId = orderId;
            // Clear previous session data
            session.originalOrder = null;
            session.returnItems = [];
            session.exchangeItems = [];
            session.returnReasonId = null;
        },

        // Initialize return session with order data
        initReturnSession(state, action: PayloadAction<{ storeId: number; orderId: number; order: any }>) {
            const { storeId, orderId, order } = action.payload;
            const session = getStoreSession(state, storeId);
            session.orderId = orderId;
            session.originalOrder = order;
            session.returnReasonId = null;
            session.returnNotes = '';

            // Transform order items to return items (initially all with 0 return quantity)
            session.returnItems =
                order.items?.map((item: any, index: number) => {
                    const productId = item.product?.id || item.product_id;
                    return {
                        id: -(index + 1),
                        orderItemId: item.id,
                        productId: productId,
                        stockId: item.product_stock_id || undefined,
                        title: item.product?.name || item.product_name,
                        sku: item.sku || '',
                        variantName: item.variant_name || null,
                        rate: parseFloat(item.unit_price),
                        originalQuantity: item.quantity,
                        returnQuantity: 0, // Start with 0 return quantity
                        amount: 0,
                        unit: item.unit || 'Piece',
                        tax_rate: parseFloat(item.tax || 0),
                        tax_included: item.tax_included || false,
                        has_serial: false,
                        serials: [],
                        has_warranty: false,
                        warranty: null,
                    };
                }) || [];

            session.exchangeItems = [];
        },

        // Update return quantity for an item
        updateReturnQuantity(state, action: PayloadAction<{ storeId: number; itemId: number; quantity: number }>) {
            const { storeId, itemId, quantity } = action.payload;
            const session = getStoreSession(state, storeId);
            const item = session.returnItems.find((i) => i.id === itemId);
            if (item) {
                // Clamp quantity between 0 and original quantity
                item.returnQuantity = Math.max(0, Math.min(quantity, item.originalQuantity));
                item.amount = item.rate * item.returnQuantity;
            }
        },

        // Set return reason (one for entire return)
        setReturnReason(state, action: PayloadAction<{ storeId: number; reasonId: number | null; notes?: string }>) {
            const { storeId, reasonId, notes } = action.payload;
            const session = getStoreSession(state, storeId);
            session.returnReasonId = reasonId;
            if (notes !== undefined) {
                session.returnNotes = notes;
            }
        },

        // Add exchange item (from PosLeftSide)
        addExchangeItem(state, action: PayloadAction<{ storeId: number; item: ExchangeItem }>) {
            const { storeId, item } = action.payload;
            const session = getStoreSession(state, storeId);

            if (item.productId !== undefined) {
                // For serialized products, ALWAYS add as new item
                if (item.has_serial && item.serials && item.serials.length > 0) {
                    session.exchangeItems.push(item);
                    return;
                }

                // Check if product/variant already exists
                const existingIndex = item.stockId
                    ? session.exchangeItems.findIndex((i) => i.productId === item.productId && i.stockId === item.stockId && !i.has_serial)
                    : session.exchangeItems.findIndex((i) => i.productId === item.productId && !i.stockId && !i.has_serial);

                if (existingIndex !== -1) {
                    // Increase quantity
                    const existing = session.exchangeItems[existingIndex];
                    const newQty = existing.quantity + item.quantity;

                    if (existing.PlaceholderQuantity && newQty > existing.PlaceholderQuantity) {
                        existing.quantity = existing.PlaceholderQuantity;
                    } else {
                        existing.quantity = newQty;
                    }
                    existing.amount = existing.quantity * existing.rate;
                } else {
                    // Add new item
                    session.exchangeItems.push(item);
                }
            }
        },

        // Update exchange item
        updateExchangeItem(state, action: PayloadAction<{ storeId: number; item: ExchangeItem }>) {
            const { storeId, item } = action.payload;
            const session = getStoreSession(state, storeId);

            const index = session.exchangeItems.findIndex((i) => i.id === item.id);
            if (index !== -1) {
                session.exchangeItems[index] = { ...session.exchangeItems[index], ...item };
            }
        },

        // Remove exchange item
        removeExchangeItem(state, action: PayloadAction<{ storeId: number; id: number }>) {
            const { storeId, id } = action.payload;
            const session = getStoreSession(state, storeId);
            session.exchangeItems = session.exchangeItems.filter((item) => item.id !== id);
        },

        // Clear entire return session
        clearReturnSession(state, action: PayloadAction<number>) {
            const storeId = action.payload;
            if (state.sessionsByStore) {
                state.sessionsByStore[storeId] = createEmptySession();
            }
        },

        // For compatibility with PosLeftSide - maps to addExchangeItem
        addItemRedux(state, action: PayloadAction<{ storeId: number; item: ExchangeItem }>) {
            const { storeId, item } = action.payload;
            const session = getStoreSession(state, storeId);

            if (item.productId !== undefined) {
                if (item.has_serial && item.serials && item.serials.length > 0) {
                    session.exchangeItems.push(item);
                    return;
                }

                const existingIndex = item.stockId
                    ? session.exchangeItems.findIndex((i) => i.productId === item.productId && i.stockId === item.stockId && !i.has_serial)
                    : session.exchangeItems.findIndex((i) => i.productId === item.productId && !i.stockId && !i.has_serial);

                if (existingIndex !== -1) {
                    const existing = session.exchangeItems[existingIndex];
                    const newQty = existing.quantity + item.quantity;
                    if (existing.PlaceholderQuantity && newQty > existing.PlaceholderQuantity) {
                        existing.quantity = existing.PlaceholderQuantity;
                    } else {
                        existing.quantity = newQty;
                    }
                    existing.amount = existing.quantity * existing.rate;
                } else {
                    session.exchangeItems.push(item);
                }
            }
        },
    },
});

export const { setReturnOrderId, initReturnSession, updateReturnQuantity, setReturnReason, addExchangeItem, updateExchangeItem, removeExchangeItem, clearReturnSession, addItemRedux } =
    orderReturnSlice.actions;

// Selectors
export const selectOrderReturnSession = (storeId: number | null) => (state: { orderReturn: OrderReturnState }) =>
    storeId && state.orderReturn?.sessionsByStore ? state.orderReturn.sessionsByStore[storeId] || createEmptySession() : createEmptySession();

export const selectReturnItems = (storeId: number | null) => (state: { orderReturn: OrderReturnState }) => selectOrderReturnSession(storeId)(state).returnItems;

export const selectExchangeItems = (storeId: number | null) => (state: { orderReturn: OrderReturnState }) => selectOrderReturnSession(storeId)(state).exchangeItems;

export const selectReturnReason = (storeId: number | null) => (state: { orderReturn: OrderReturnState }) => ({
    reasonId: selectOrderReturnSession(storeId)(state).returnReasonId,
    notes: selectOrderReturnSession(storeId)(state).returnNotes,
});

export default orderReturnSlice.reducer;
