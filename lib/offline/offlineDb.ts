import type { OfflineOrder } from '@/store/features/offline/offlineOrdersSlice';

export type ProductCacheRecord = {
    storeId: number;
    products: any[];
    total: number;
    cachedAt: string;
};

export type MasterDataRecord = {
    storeId: number;
    items: any[];
    cachedAt: string;
};

const DB_NAME = 'andgate-pos-offline';
const DB_VERSION = 2;

const STORES = {
    OFFLINE_ORDERS: 'offlineOrders',
    PRODUCT_CACHES: 'productCaches',
    CATEGORIES: 'categories',
    BRANDS: 'brands',
    CUSTOMERS: 'customers',
    PAYMENT_METHODS: 'paymentMethods',
    STORE_SETTINGS: 'storeSettings',
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

const canUseIndexedDb = () => typeof window !== 'undefined' && 'indexedDB' in window;

function openOfflineDb(): Promise<IDBDatabase> {
    if (!canUseIndexedDb()) {
        return Promise.reject(new Error('IndexedDB is not available in this environment.'));
    }

    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('Offline database upgrade is blocked by another tab.'));

        request.onupgradeneeded = (event) => {
            const db = request.result;
            const oldVersion = event.oldVersion;

            // Version 1 stores
            if (oldVersion < 1) {
                if (!db.objectStoreNames.contains(STORES.OFFLINE_ORDERS)) {
                    const ordersStore = db.createObjectStore(STORES.OFFLINE_ORDERS, { keyPath: 'localId' });
                    ordersStore.createIndex('status', 'status', { unique: false });
                    ordersStore.createIndex('storeId', 'storeId', { unique: false });
                    ordersStore.createIndex('queuedAt', 'queuedAt', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.PRODUCT_CACHES)) {
                    db.createObjectStore(STORES.PRODUCT_CACHES, { keyPath: 'storeId' });
                }
            }

            // Version 2 stores — master data
            if (oldVersion < 2) {
                if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
                    db.createObjectStore(STORES.CATEGORIES, { keyPath: 'storeId' });
                }
                if (!db.objectStoreNames.contains(STORES.BRANDS)) {
                    db.createObjectStore(STORES.BRANDS, { keyPath: 'storeId' });
                }
                if (!db.objectStoreNames.contains(STORES.CUSTOMERS)) {
                    db.createObjectStore(STORES.CUSTOMERS, { keyPath: 'storeId' });
                }
                if (!db.objectStoreNames.contains(STORES.PAYMENT_METHODS)) {
                    db.createObjectStore(STORES.PAYMENT_METHODS, { keyPath: 'storeId' });
                }
                if (!db.objectStoreNames.contains(STORES.STORE_SETTINGS)) {
                    db.createObjectStore(STORES.STORE_SETTINGS, { keyPath: 'storeId' });
                }
            }
        };

        request.onsuccess = () => resolve(request.result);
    });

    return dbPromise;
}

function runTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | undefined> {
    return openOfflineDb().then(
        (db) =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, mode);
                const store = transaction.objectStore(storeName);
                let request: IDBRequest<T> | void;

                transaction.onerror = () => reject(transaction.error);
                transaction.onabort = () => reject(transaction.error);
                transaction.oncomplete = () => resolve(request?.result);

                try {
                    request = callback(store);
                    if (request) {
                        request.onerror = () => reject(request?.error);
                    }
                } catch (error) {
                    transaction.abort();
                    reject(error);
                }
            })
    );
}

function getAllFromStore<T>(storeName: string): Promise<T[]> {
    return openOfflineDb().then(
        (db) =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readonly');
                const request = transaction.objectStore(storeName).getAll();

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve((request.result || []) as T[]);
            })
    );
}

// ─── Offline Orders ──────────────────────────────────────────────────────────

export async function saveOfflineOrder(order: OfflineOrder) {
    await runTransaction(STORES.OFFLINE_ORDERS, 'readwrite', (store) => store.put(order));
}

export async function saveOfflineOrders(orders: OfflineOrder[]) {
    const db = await openOfflineDb();
    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORES.OFFLINE_ORDERS, 'readwrite');
        const store = transaction.objectStore(STORES.OFFLINE_ORDERS);

        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
        transaction.oncomplete = () => resolve();

        orders.forEach((order) => store.put(order));
    });
}

export function getOfflineOrders() {
    return getAllFromStore<OfflineOrder>(STORES.OFFLINE_ORDERS);
}

export async function updateOfflineOrderStatus(
    localId: string,
    status: OfflineOrder['status'],
    error?: string
) {
    const db = await openOfflineDb();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.OFFLINE_ORDERS, 'readwrite');
        const store = tx.objectStore(STORES.OFFLINE_ORDERS);

        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
        tx.oncomplete = () => resolve();

        const getReq = store.get(localId);
        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const order = getReq.result as OfflineOrder | undefined;
            if (!order) return; // already deleted
            order.status = status;
            order.error = error;
            if (status === 'failed') order.retryCount = (order.retryCount ?? 0) + 1;
            store.put(order);
        };
    });
}

export async function deleteSyncedOfflineOrders() {
    const db = await openOfflineDb();
    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORES.OFFLINE_ORDERS, 'readwrite');
        const store = transaction.objectStore(STORES.OFFLINE_ORDERS);
        const request = store.openCursor();

        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
        transaction.oncomplete = () => resolve();

        request.onsuccess = () => {
            const cursor = request.result;
            if (!cursor) return;
            const order = cursor.value as OfflineOrder;
            if (order.status === 'synced') {
                cursor.delete();
            }
            cursor.continue();
        };
    });
}

// ─── Product Cache ────────────────────────────────────────────────────────────

export async function saveProductCache(record: ProductCacheRecord) {
    await runTransaction(STORES.PRODUCT_CACHES, 'readwrite', (store) => store.put(record));
}

export async function getProductCache(storeId: number) {
    return runTransaction<ProductCacheRecord>(STORES.PRODUCT_CACHES, 'readonly', (store) =>
        store.get(storeId)
    );
}

export function getProductCaches() {
    return getAllFromStore<ProductCacheRecord>(STORES.PRODUCT_CACHES);
}

// ─── Master Data (generic helper) ────────────────────────────────────────────

async function saveMasterData(storeName: string, storeId: number, items: any[]) {
    const record: MasterDataRecord = { storeId, items, cachedAt: new Date().toISOString() };
    await runTransaction(storeName, 'readwrite', (store) => store.put(record));
}

async function getMasterData(storeName: string, storeId: number): Promise<any[]> {
    const record = await runTransaction<MasterDataRecord>(storeName, 'readonly', (store) =>
        store.get(storeId)
    );
    return record?.items ?? [];
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const saveCategoriesCache = (storeId: number, items: any[]) =>
    saveMasterData(STORES.CATEGORIES, storeId, items);

export const getCategoriesCache = (storeId: number) =>
    getMasterData(STORES.CATEGORIES, storeId);

// ─── Brands ───────────────────────────────────────────────────────────────────

export const saveBrandsCache = (storeId: number, items: any[]) =>
    saveMasterData(STORES.BRANDS, storeId, items);

export const getBrandsCache = (storeId: number) =>
    getMasterData(STORES.BRANDS, storeId);

// ─── Customers ────────────────────────────────────────────────────────────────

export const saveCustomersCache = (storeId: number, items: any[]) =>
    saveMasterData(STORES.CUSTOMERS, storeId, items);

export const getCustomersCache = (storeId: number) =>
    getMasterData(STORES.CUSTOMERS, storeId);

// ─── Payment Methods ──────────────────────────────────────────────────────────

export const savePaymentMethodsCache = (storeId: number, items: any[]) =>
    saveMasterData(STORES.PAYMENT_METHODS, storeId, items);

export const getPaymentMethodsCache = (storeId: number) =>
    getMasterData(STORES.PAYMENT_METHODS, storeId);

// ─── Store Settings ───────────────────────────────────────────────────────────

export const saveStoreSettingsCache = (storeId: number, settings: any) =>
    saveMasterData(STORES.STORE_SETTINGS, storeId, [settings]);

export const getStoreSettingsCache = async (storeId: number): Promise<any | null> => {
    const items = await getMasterData(STORES.STORE_SETTINGS, storeId);
    return items[0] ?? null;
};

// ─── Storage Health ───────────────────────────────────────────────────────────

export async function getStorageEstimate(): Promise<{ usedMB: number; quotaMB: number; percent: number } | null> {
    if (!navigator.storage?.estimate) return null;
    try {
        const { usage = 0, quota = 1 } = await navigator.storage.estimate();
        const usedMB = Math.round(usage / 1024 / 1024 * 10) / 10;
        const quotaMB = Math.round(quota / 1024 / 1024 * 10) / 10;
        const percent = Math.round((usage / quota) * 100);
        return { usedMB, quotaMB, percent };
    } catch {
        return null;
    }
}
