'use client';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';

/**
 * Custom hook to get current store information
 * @returns Object containing current store, store ID, and all user stores
 */
export const useCurrentStore = () => {
    const currentStore = useSelector((state: RootState) => state.auth?.currentStore || null);
    const currentStoreId = useSelector((state: RootState) => state.auth?.currentStoreId || null);
    const user = useSelector((state: RootState) => state.auth?.user || null);
    const userStores = user?.stores || [];
    return {
        currentStore,
        currentStoreId,
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
