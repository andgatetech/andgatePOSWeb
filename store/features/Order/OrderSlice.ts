// store/features/invoice/invoiceSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Item {
    product_id?: number;
    quantity: number;
    unit_price: number;
    PerProductSubtotal: number;
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
            state.items = action.payload;
        },
        // add more reducers if needed
    },
});

export const { setItemsRedux } = invoiceSlice.actions;
export default invoiceSlice.reducer;
