import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PurchaseItem {
    id: number; // Local row ID
    productId?: number; // Product ID from backend (for existing products)
    productStockId?: number; // Stock ID for specific variant
    itemType?: 'existing' | 'new'; // Track if product exists or needs to be created
    title: string; // Product name
    description?: string;
    purchasePrice: number; // Purchase price per unit
    quantity: number; // Quantity ordered
    quantityReceived?: number; // Quantity received (for tracking)
    amount: number; // purchasePrice * quantity
    availableStock?: number; // Current available stock quantity
    unit?: string; // Product unit (piece, kg, etc.)
    variantInfo?: Record<string, string>; // Variant attributes for new products (e.g., {Color: "Red", Size: "XL"})
    variantData?: Record<string, string>; // Existing product variant data
    sku?: string; // SKU for existing products
    supplierId?: number; // Supplier ID for this item
    status?: string; // ordered, partially_received, received
}

interface Supplier {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    contact_person?: string;
}

interface PurchaseOrderData {
    items: PurchaseItem[];
    supplierId?: number;
    supplier?: Supplier | null;
    status: string;
    purchaseType: 'supplier' | 'walk_in' | 'own_purchase';
    draftReference?: string;
    invoiceNumber?: string;
    grandTotal: number;
    estimatedTotal?: number;
    notes?: string;
    paymentStatus?: 'pending' | 'partial' | 'paid';
    amountPaid?: number;
    amountDue?: number;
}

interface PurchaseOrderState {
    ordersByStore: { [storeId: number]: PurchaseOrderData };
}

const createEmptyOrder = (): PurchaseOrderData => ({
    items: [],
    status: 'draft',
    purchaseType: 'supplier',
    grandTotal: 0,
    paymentStatus: 'pending',
    amountPaid: 0,
    amountDue: 0,
});

const initialState: PurchaseOrderState = {
    ordersByStore: {},
};

// Helper to get or create order for store
const getStoreOrder = (state: PurchaseOrderState, storeId: number): PurchaseOrderData => {
    // Ensure ordersByStore exists (handles migration from old state)
    if (!state.ordersByStore) {
        state.ordersByStore = {};
    }
    if (!state.ordersByStore[storeId]) {
        state.ordersByStore[storeId] = createEmptyOrder();
    }
    return state.ordersByStore[storeId];
};

const purchaseOrderSlice = createSlice({
    name: 'purchaseOrder',
    initialState,
    reducers: {
        setItemsRedux(state, action: PayloadAction<{ storeId: number; items: PurchaseItem[] }>) {
            const { storeId, items } = action.payload;
            const order = getStoreOrder(state, storeId);
            order.items = items.filter((item) => item.productId !== undefined);
            order.grandTotal = order.items.reduce((total, item) => total + item.amount, 0);
        },

        addItemRedux(state, action: PayloadAction<{ storeId: number; item: PurchaseItem }>) {
            const { storeId, item } = action.payload;
            const order = getStoreOrder(state, storeId);

            if (item.productId !== undefined) {
                const existingItemIndex = order.items.findIndex((i) => i.productId === item.productId && i.productStockId === item.productStockId);

                if (existingItemIndex !== -1) {
                    const existingItem = order.items[existingItemIndex];
                    const newQuantity = existingItem.quantity + item.quantity;
                    existingItem.quantity = newQuantity;
                    existingItem.amount = existingItem.quantity * existingItem.purchasePrice;
                } else {
                    order.items.push(item);
                }
            } else {
                order.items.push(item);
            }

            order.grandTotal = order.items.reduce((total, i) => total + i.amount, 0);
        },

        updateItemRedux(state, action: PayloadAction<{ storeId: number; item: PurchaseItem }>) {
            const { storeId, item } = action.payload;
            const order = getStoreOrder(state, storeId);

            const index = order.items.findIndex((i) => i.id === item.id);
            if (index !== -1) {
                order.items[index] = { ...order.items[index], ...item };
                order.items[index].amount = order.items[index].quantity * order.items[index].purchasePrice;
            } else if (item.productId !== undefined) {
                order.items.push(item);
            }

            order.grandTotal = order.items.reduce((total, i) => total + i.amount, 0);
        },

        removeItemRedux(state, action: PayloadAction<{ storeId: number; id: number }>) {
            const { storeId, id } = action.payload;
            const order = getStoreOrder(state, storeId);
            order.items = order.items.filter((item) => item.id !== id);
            order.grandTotal = order.items.reduce((total, item) => total + item.amount, 0);
        },

        clearItemsRedux(state, action: PayloadAction<number>) {
            const storeId = action.payload;
            const order = getStoreOrder(state, storeId);
            order.items = [];
            order.grandTotal = 0;
        },

        updateItemQuantityRedux(state, action: PayloadAction<{ storeId: number; id: number; quantity: number }>) {
            const { storeId, id, quantity } = action.payload;
            const order = getStoreOrder(state, storeId);
            const item = order.items.find((i) => i.id === id);
            if (item && quantity >= 0) {
                item.quantity = quantity;
                item.amount = item.purchasePrice * quantity;
                order.grandTotal = order.items.reduce((total, i) => total + i.amount, 0);
            }
        },

        updateItemPurchasePriceRedux(state, action: PayloadAction<{ storeId: number; id: number; purchasePrice: number }>) {
            const { storeId, id, purchasePrice } = action.payload;
            const order = getStoreOrder(state, storeId);
            const item = order.items.find((i) => i.id === id);
            if (item && purchasePrice >= 0) {
                item.purchasePrice = purchasePrice;
                item.amount = item.quantity * purchasePrice;
                order.grandTotal = order.items.reduce((total, i) => total + i.amount, 0);
            }
        },

        updateItemReceivedQuantityRedux(state, action: PayloadAction<{ storeId: number; id: number; quantityReceived: number }>) {
            const { storeId, id, quantityReceived } = action.payload;
            const order = getStoreOrder(state, storeId);
            const item = order.items.find((i) => i.id === id);
            if (item && quantityReceived >= 0) {
                item.quantityReceived = quantityReceived;
                if (quantityReceived >= item.quantity) {
                    item.status = 'received';
                } else if (quantityReceived > 0) {
                    item.status = 'partially_received';
                } else {
                    item.status = 'ordered';
                }
            }
        },

        setSupplierRedux(state, action: PayloadAction<{ storeId: number; supplierId: number }>) {
            const { storeId, supplierId } = action.payload;
            const order = getStoreOrder(state, storeId);
            order.supplierId = supplierId;
        },

        setSupplierDetailsRedux(state, action: PayloadAction<{ storeId: number; supplier: Supplier }>) {
            const { storeId, supplier } = action.payload;
            const order = getStoreOrder(state, storeId);
            order.supplier = supplier;
            order.supplierId = supplier.id;
        },

        setPurchaseTypeRedux(state, action: PayloadAction<{ storeId: number; purchaseType: 'supplier' | 'walk_in' | 'own_purchase' }>) {
            const { storeId, purchaseType } = action.payload;
            const order = getStoreOrder(state, storeId);
            order.purchaseType = purchaseType;
        },

        setDraftReferenceRedux(state, action: PayloadAction<{ storeId: number; draftReference: string }>) {
            const { storeId, draftReference } = action.payload;
            const order = getStoreOrder(state, storeId);
            order.draftReference = draftReference;
        },

        setPaymentStatusRedux(state, action: PayloadAction<{ storeId: number; paymentStatus: 'pending' | 'partial' | 'paid' }>) {
            const { storeId, paymentStatus } = action.payload;
            const order = getStoreOrder(state, storeId);
            order.paymentStatus = paymentStatus;
        },

        updatePaymentRedux(state, action: PayloadAction<{ storeId: number; amountPaid: number }>) {
            const { storeId, amountPaid } = action.payload;
            const order = getStoreOrder(state, storeId);
            order.amountPaid = (order.amountPaid || 0) + amountPaid;
            order.amountDue = order.grandTotal - order.amountPaid;

            if (order.amountPaid >= order.grandTotal) {
                order.paymentStatus = 'paid';
            } else if (order.amountPaid > 0) {
                order.paymentStatus = 'partial';
            } else {
                order.paymentStatus = 'pending';
            }
        },

        setStatusRedux(state, action: PayloadAction<{ storeId: number; status: string }>) {
            const { storeId, status } = action.payload;
            const order = getStoreOrder(state, storeId);
            order.status = status;
        },

        setInvoiceNumberRedux(state, action: PayloadAction<{ storeId: number; invoiceNumber: string }>) {
            const { storeId, invoiceNumber } = action.payload;
            const order = getStoreOrder(state, storeId);
            order.invoiceNumber = invoiceNumber;
        },

        setNotesRedux(state, action: PayloadAction<{ storeId: number; notes: string }>) {
            const { storeId, notes } = action.payload;
            const order = getStoreOrder(state, storeId);
            order.notes = notes;
        },

        resetPurchaseOrderRedux(state, action: PayloadAction<number>) {
            const storeId = action.payload;
            state.ordersByStore[storeId] = createEmptyOrder();
        },

        resetAllPurchaseOrdersRedux(state) {
            state.ordersByStore = {};
        },

        loadPurchaseOrderRedux(state, action: PayloadAction<{ storeId: number; order: PurchaseOrderData }>) {
            const { storeId, order } = action.payload;
            state.ordersByStore[storeId] = order;
        },
    },
});

export const {
    setItemsRedux,
    addItemRedux,
    updateItemRedux,
    removeItemRedux,
    clearItemsRedux,
    updateItemQuantityRedux,
    updateItemPurchasePriceRedux,
    updateItemReceivedQuantityRedux,
    setSupplierRedux,
    setSupplierDetailsRedux,
    setPurchaseTypeRedux,
    setDraftReferenceRedux,
    setPaymentStatusRedux,
    updatePaymentRedux,
    setStatusRedux,
    setInvoiceNumberRedux,
    setNotesRedux,
    resetPurchaseOrderRedux,
    resetAllPurchaseOrdersRedux,
    loadPurchaseOrderRedux,
} = purchaseOrderSlice.actions;

// Selectors
export const selectPurchaseOrderForStore = (storeId: number | null) => (state: { purchaseOrder: PurchaseOrderState }) =>
    storeId ? state.purchaseOrder.ordersByStore[storeId] || createEmptyOrder() : createEmptyOrder();

export const selectPurchaseItemsForStore = (storeId: number | null) => (state: { purchaseOrder: PurchaseOrderState }) => storeId ? state.purchaseOrder.ordersByStore[storeId]?.items || [] : [];

export default purchaseOrderSlice.reducer;
