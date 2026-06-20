'use client';
import { RootState } from '@/store';
import type { Store } from '@/store/features/auth/authSlice';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Custom hook to get current store information
 * @returns Object containing current store, store ID, and all user stores
 */
export const useCurrentStore = () => {
    const rawCurrentStore = useSelector((state: RootState) => state.auth?.currentStore || null);
    const currentStoreId = useSelector((state: RootState) => state.auth?.currentStoreId || null);
    const user = useSelector((state: RootState) => state.auth?.user || null);

    const userStores = useMemo(
        () => (user?.stores || []).filter(
            (store: Store, idx: number, stores: Store[]) =>
                stores.findIndex((candidate: Store) => Number(candidate.id) === Number(store.id)) === idx
        ),
        [user?.stores]
    );

    const currentStore = useMemo(
        () =>
            currentStoreId
                ? userStores.find((store: Store) => Number(store.id) === Number(currentStoreId))
                    || (rawCurrentStore && Number(rawCurrentStore.id) === Number(currentStoreId) ? rawCurrentStore : null)
                    || null
                : userStores[0] || rawCurrentStore || null,
        [currentStoreId, rawCurrentStore, userStores]
    );

    return {
        currentStore,
        currentStoreId: currentStore?.id || currentStoreId,
        userStores,
        hasMultipleStores: userStores.length > 1,
        hasStores: userStores.length > 0,
    };
};

/**
 * Helper function to get just the current store ID
 * @returns Current store ID or null
 */
export const getCurrentStoreId = (state: RootState): number | null => {
    return state.auth.currentStoreId;
};
