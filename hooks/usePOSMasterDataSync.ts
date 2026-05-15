'use client';

/**
 * Syncs POS master data (categories, brands, customers, payment methods, store settings)
 * to IndexedDB when online, and serves from IndexedDB when offline.
 *
 * Returns ready-to-use lists that components can consume directly.
 */

import {
    getBrandsCache,
    getCategoriesCache,
    getCustomersCache,
    getPaymentMethodsCache,
    getStoreSettingsCache,
    saveBrandsCache,
    saveCategoriesCache,
    saveCustomersCache,
    savePaymentMethodsCache,
    saveStoreSettingsCache,
} from '@/lib/offline/offlineDb';
import { useGetBrandsQuery } from '@/store/features/brand/brandApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { useGetStoreCustomersQuery } from '@/store/features/customer/customer';
import { useGetStoreQuery } from '@/store/features/store/storeApi';
import { useEffect, useState } from 'react';

const CACHE_STALE_MS = 6 * 60 * 60 * 1000; // 6 hours

interface POSMasterData {
    categories: any[];
    brands: any[];
    customers: any[];
    paymentMethods: any[];
    storeSettings: any | null;
    isReady: boolean;
    lastSyncedAt: string | null;
}

export function usePOSMasterDataSync(storeId: number | undefined, isOnline: boolean): POSMasterData {
    const [offlineCategories, setOfflineCategories] = useState<any[]>([]);
    const [offlineBrands, setOfflineBrands] = useState<any[]>([]);
    const [offlineCustomers, setOfflineCustomers] = useState<any[]>([]);
    const [offlinePaymentMethods, setOfflinePaymentMethods] = useState<any[]>([]);
    const [offlineStoreSettings, setOfflineStoreSettings] = useState<any | null>(null);
    const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

    const skip = !storeId;
    const filterParams = storeId ? { store_id: storeId } : {};
    const shouldFetch = !skip && isOnline;

    // Online API queries — only run when online and storeId is set
    const { data: categoriesResponse } = useGetCategoryQuery(filterParams, { skip: !shouldFetch });
    const { data: brandsResponse } = useGetBrandsQuery(filterParams, { skip: !shouldFetch });
    const { data: customersResponse } = useGetStoreCustomersQuery(
        { store_id: storeId!, per_page: 1000, page: 1 } as any,
        { skip: !shouldFetch }
    );
    const { data: storeResponse } = useGetStoreQuery(storeId!, { skip: !shouldFetch });

    // Hydrate from IndexedDB on mount / store switch; flag stale caches
    useEffect(() => {
        if (!storeId) return;
        let cancelled = false;

        Promise.all([
            getCategoriesCache(storeId),
            getBrandsCache(storeId),
            getCustomersCache(storeId),
            getPaymentMethodsCache(storeId),
            getStoreSettingsCache(storeId),
        ]).then(([cats, brands, customers, payments, settings]) => {
            if (cancelled) return;
            if (cats.length) setOfflineCategories(cats);
            if (brands.length) setOfflineBrands(brands);
            if (customers.length) setOfflineCustomers(customers);
            if (payments.length) setOfflinePaymentMethods(payments);
            if (settings) setOfflineStoreSettings(settings);
        }).catch(() => {});

        return () => { cancelled = true; };
    }, [storeId]);

    // Persist categories when fetched online
    useEffect(() => {
        if (!storeId || !categoriesResponse) return;
        const items = extractItems(categoriesResponse);
        if (!items.length) return;
        setOfflineCategories(items);
        setLastSyncedAt(new Date().toISOString());
        saveCategoriesCache(storeId, items).catch(() => {});
    }, [storeId, categoriesResponse]);

    // Persist brands when fetched online
    useEffect(() => {
        if (!storeId || !brandsResponse) return;
        const items = extractItems(brandsResponse);
        if (!items.length) return;
        setOfflineBrands(items);
        setLastSyncedAt(new Date().toISOString());
        saveBrandsCache(storeId, items).catch(() => {});
    }, [storeId, brandsResponse]);

    // Persist customers when fetched online — response.data is the array
    useEffect(() => {
        if (!storeId || !customersResponse) return;
        const items: any[] = Array.isArray(customersResponse?.data)
            ? customersResponse.data
            : extractItems(customersResponse);
        if (!items.length) return;
        setOfflineCustomers(items);
        setLastSyncedAt(new Date().toISOString());
        saveCustomersCache(storeId, items).catch(() => {});
    }, [storeId, customersResponse]);

    // Persist payment methods + store settings — response.data.store is the store object
    useEffect(() => {
        if (!storeId || !storeResponse?.data) return;
        const store = storeResponse.data?.store ?? storeResponse.data;
        if (!store) return;
        const payments = Array.isArray(store.payment_methods) ? store.payment_methods : [];

        if (payments.length) {
            setOfflinePaymentMethods(payments);
            savePaymentMethodsCache(storeId, payments).catch(() => {});
        }

        setOfflineStoreSettings(store);
        saveStoreSettingsCache(storeId, store).catch(() => {});
        setLastSyncedAt(new Date().toISOString());
    }, [storeId, storeResponse]);

    const isReady =
        offlineCategories.length > 0 &&
        offlineBrands.length > 0 &&
        offlinePaymentMethods.length > 0;

    return {
        categories: offlineCategories,
        brands: offlineBrands,
        customers: offlineCustomers,
        paymentMethods: offlinePaymentMethods,
        storeSettings: offlineStoreSettings,
        isReady,
        lastSyncedAt,
    };
}

function extractItems(response: any): any[] {
    if (!response) return [];
    if (Array.isArray(response?.data?.items)) return response.data.items;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    return [];
}
