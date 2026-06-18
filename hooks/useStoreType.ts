import { useCurrentStore } from '@/hooks/useCurrentStore';
import { type StoreType } from '@/lib/storeTypes';

export type { StoreType };

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
        isElectronics: storeType === 'electronics',
        isClothing: storeType === 'clothing',
    };
}
