import { useCurrentStore } from '@/hooks/useCurrentStore';

export type StoreType = 'retail' | 'pharmacy' | 'grocery' | 'restaurant' | 'wholesale' | 'service' | 'electronics' | 'clothing' | 'hardware' | 'stationery' | 'jewelry' | 'cosmetics' | 'furniture' | 'bakery' | 'tailoring';

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
        isHardware: storeType === 'hardware',
        isStationery: storeType === 'stationery',
        isJewelry: storeType === 'jewelry',
        isCosmetics: storeType === 'cosmetics',
        isFurniture: storeType === 'furniture',
        isBakery: storeType === 'bakery',
        isTailoring: storeType === 'tailoring',
    };
}
