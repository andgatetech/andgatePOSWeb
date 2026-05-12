import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProductCacheEntry {
    products: any[];
    cachedAt: string;
    total: number;
}

interface CachedProductsState {
    byStoreId: Record<number, ProductCacheEntry>;
}

const initialState: CachedProductsState = {
    byStoreId: {},
};

const cachedProductsSlice = createSlice({
    name: 'cachedProducts',
    initialState,
    reducers: {
        // Merge incoming products into the store's cache (accumulates across pages)
        cacheProductPage(
            state,
            action: PayloadAction<{ storeId: number; products: any[]; total: number }>
        ) {
            const { storeId, products, total } = action.payload;
            if (!state.byStoreId[storeId]) {
                state.byStoreId[storeId] = { products: [], cachedAt: '', total: 0 };
            }
            const existing = state.byStoreId[storeId];
            const existingIds = new Set(existing.products.map((p: any) => p.id));
            const fresh = products.filter((p: any) => !existingIds.has(p.id));
            existing.products.push(...fresh);
            existing.cachedAt = new Date().toISOString();
            existing.total = total;
        },

        clearProductCache(state, action: PayloadAction<number>) {
            delete state.byStoreId[action.payload];
        },

        // Full replace — used by background prefetch to keep cache up to date
        setProductCache(
            state,
            action: PayloadAction<{ storeId: number; products: any[]; total: number }>
        ) {
            const { storeId, products, total } = action.payload;
            state.byStoreId[storeId] = {
                products,
                cachedAt: new Date().toISOString(),
                total,
            };
        },

        clearAllProductCaches(state) {
            state.byStoreId = {};
        },
    },
});

export const { cacheProductPage, setProductCache, clearProductCache, clearAllProductCaches } =
    cachedProductsSlice.actions;

export default cachedProductsSlice.reducer;
