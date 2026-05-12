import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OfflineOrder {
    localId: string;
    storeId: number;
    payload: any;
    queuedAt: string;
    status: 'pending' | 'syncing' | 'failed' | 'synced';
    retryCount: number;
    error?: string;
    totalAmount?: number;
    itemCount?: number;
}

interface OfflineOrdersState {
    queue: OfflineOrder[];
    lastSyncAt: string | null;
    isSyncing: boolean;
}

const initialState: OfflineOrdersState = {
    queue: [],
    lastSyncAt: null,
    isSyncing: false,
};

const offlineOrdersSlice = createSlice({
    name: 'offlineOrders',
    initialState,
    reducers: {
        queueOfflineOrder(state, action: PayloadAction<OfflineOrder>) {
            state.queue.push(action.payload);
        },

        markOrderSyncing(state, action: PayloadAction<string>) {
            const order = state.queue.find((o) => o.localId === action.payload);
            if (order) {
                order.status = 'syncing';
                order.error = undefined;
            }
        },

        markOrderSynced(state, action: PayloadAction<string>) {
            const order = state.queue.find((o) => o.localId === action.payload);
            if (order) order.status = 'synced';
        },

        markOrderFailed(state, action: PayloadAction<{ localId: string; error: string }>) {
            const order = state.queue.find((o) => o.localId === action.payload.localId);
            if (order) {
                order.status = 'failed';
                order.error = action.payload.error;
                order.retryCount += 1;
            }
        },

        retryFailedOrders(state) {
            state.queue.forEach((o) => {
                if (o.status === 'failed') o.status = 'pending';
            });
        },

        clearSyncedOrders(state) {
            state.queue = state.queue.filter((o) => o.status !== 'synced');
        },

        setIsSyncing(state, action: PayloadAction<boolean>) {
            state.isSyncing = action.payload;
        },

        setLastSyncAt(state, action: PayloadAction<string>) {
            state.lastSyncAt = action.payload;
        },

        removeOfflineOrder(state, action: PayloadAction<string>) {
            state.queue = state.queue.filter((o) => o.localId !== action.payload);
        },
    },
});

export const {
    queueOfflineOrder,
    markOrderSyncing,
    markOrderSynced,
    markOrderFailed,
    retryFailedOrders,
    clearSyncedOrders,
    setIsSyncing,
    setLastSyncAt,
    removeOfflineOrder,
} = offlineOrdersSlice.actions;

export default offlineOrdersSlice.reducer;
