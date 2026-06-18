import { useCurrentStore } from '@/hooks/useCurrentStore';

export type StoreType = 'retail' | 'pharmacy' | 'grocery' | 'restaurant' | 'wholesale' | 'service';

export function useStoreType() {
    const { currentStore } = useCurrentStore();
    const storeType: StoreType = (currentStore?.store_type as StoreType) || 'retail';

    return {
        storeType,
        isPharmacy: storeType === 'pharmacy',
        isRetail: storeType === 'retail',
        isGrocery: storeType === 'grocery',
        isRestaurant: storeType === 'restaurant',
        isWholesale: storeType === 'wholesale',
        isService: storeType === 'service',
    };
}
