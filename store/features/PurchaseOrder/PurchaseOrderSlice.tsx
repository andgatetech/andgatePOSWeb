import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PurchaseItem {
    id: number; // Local row ID
    productId?: number; // Product ID from backend
    title: string; // Product name
    description?: string;
    purchasePrice: number; // Purchase price per unit
    quantity: number; // Quantity ordered
    quantityReceived?: number; // Quantity received (for tracking)
    amount: number; // purchasePrice * quantity
    availableStock?: number; // Current available stock quantity
    unit?: string; // Product unit (piece, kg, etc.)
    supplierId?: number; // Supplier ID for this item
    status?: string; // ordered, partially_received, received
}

interface PurchaseOrderState {
    items: PurchaseItem[];
    supplierId?: number; // Selected supplier for the entire PO
    storeId?: number; // Store for the purchase order
    status: string; // draft, approved, ordered, etc.
    invoiceNumber?: string; // Generated invoice number
    grandTotal: number;
    notes?: string;
}

const initialState: PurchaseOrderState = {
    items: [],
    status: 'draft',
    grandTotal: 0,
};

const purchaseOrderSlice = createSlice({
    name: 'purchaseOrder',
    initialState,
    reducers: {
        setItemsRedux(state, action: PayloadAction<PurchaseItem[]>) {
            // Filter out items without productId to avoid empty items
            state.items = action.payload.filter((item) => item.productId !== undefined);
            state.grandTotal = state.items.reduce((total, item) => total + item.amount, 0);
        },

        addItemRedux(state, action: PayloadAction<PurchaseItem>) {
            if (action.payload.productId !== undefined) {
                // Find existing product by productId (not by id)
                const existingItemIndex = state.items.findIndex((item) => item.productId === action.payload.productId);

                if (existingItemIndex !== -1) {
                    // Product already exists → increase quantity
                    const existingItem = state.items[existingItemIndex];
                    const newQuantity = existingItem.quantity + action.payload.quantity;

                    existingItem.quantity = newQuantity;
                    existingItem.amount = existingItem.quantity * existingItem.purchasePrice;
                } else {
                    // New product → add normally
                    state.items.push(action.payload);
                }

                // Recalculate grand total
                state.grandTotal = state.items.reduce((total, item) => total + item.amount, 0);
            }
        },

        updateItemRedux(state, action: PayloadAction<PurchaseItem>) {
            const index = state.items.findIndex((item) => item.id === action.payload.id);
            if (index !== -1) {
                // Update existing item
                state.items[index] = { ...state.items[index], ...action.payload };
                // Recalculate amount for updated item
                state.items[index].amount = state.items[index].quantity * state.items[index].purchasePrice;
            } else if (action.payload.productId !== undefined) {
                // Add new item if it doesn't exist and has a productId
                state.items.push(action.payload);
            }

            // Recalculate grand total
            state.grandTotal = state.items.reduce((total, item) => total + item.amount, 0);
        },

        removeItemRedux(state, action: PayloadAction<number>) {
            state.items = state.items.filter((item) => item.id !== action.payload);
            state.grandTotal = state.items.reduce((total, item) => total + item.amount, 0);
        },

        clearItemsRedux(state) {
            state.items = [];
            state.grandTotal = 0;
        },

        updateItemQuantityRedux(state, action: PayloadAction<{ id: number; quantity: number }>) {
            const { id, quantity } = action.payload;
            const item = state.items.find((item) => item.id === id);
            if (item && quantity >= 0) {
                item.quantity = quantity;
                item.amount = item.purchasePrice * quantity;

                // Recalculate grand total
                state.grandTotal = state.items.reduce((total, item) => total + item.amount, 0);
            }
        },

        updateItemPurchasePriceRedux(state, action: PayloadAction<{ id: number; purchasePrice: number }>) {
            const { id, purchasePrice } = action.payload;
            const item = state.items.find((item) => item.id === id);
            if (item && purchasePrice >= 0) {
                item.purchasePrice = purchasePrice;
                item.amount = item.quantity * purchasePrice;

                // Recalculate grand total
                state.grandTotal = state.items.reduce((total, item) => total + item.amount, 0);
            }
        },

        updateItemReceivedQuantityRedux(state, action: PayloadAction<{ id: number; quantityReceived: number }>) {
            const { id, quantityReceived } = action.payload;
            const item = state.items.find((item) => item.id === id);
            if (item && quantityReceived >= 0) {
                item.quantityReceived = quantityReceived;

                // Update item status based on received quantity
                if (quantityReceived >= item.quantity) {
                    item.status = 'received';
                } else if (quantityReceived > 0) {
                    item.status = 'partially_received';
                } else {
                    item.status = 'ordered';
                }
            }
        },

        setSupplierRedux(state, action: PayloadAction<number>) {
            state.supplierId = action.payload;
        },

        setStoreRedux(state, action: PayloadAction<number>) {
            state.storeId = action.payload;
        },

        setStatusRedux(state, action: PayloadAction<string>) {
            state.status = action.payload;
        },

        setInvoiceNumberRedux(state, action: PayloadAction<string>) {
            state.invoiceNumber = action.payload;
        },

        setNotesRedux(state, action: PayloadAction<string>) {
            state.notes = action.payload;
        },

        resetPurchaseOrderRedux(state) {
            return initialState;
        },

        loadPurchaseOrderRedux(state, action: PayloadAction<PurchaseOrderState>) {
            return { ...action.payload };
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
    setStoreRedux,
    setStatusRedux,
    setInvoiceNumberRedux,
    setNotesRedux,
    resetPurchaseOrderRedux,
    loadPurchaseOrderRedux,
} = purchaseOrderSlice.actions;

export default purchaseOrderSlice.reducer;
