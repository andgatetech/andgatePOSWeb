// src/store/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Currency {
    currency_code: string;
    currency_name: string;
    currency_symbol: string;
    currency_position: 'before' | 'after';
    decimal_places: number;
    thousand_separator: string;
    decimal_separator: string;
}

export interface PaymentMethod {
    id: number;
    payment_method_name: string;
    payment_details_number?: string;
    description?: string;
    notes?: string;
    is_active: boolean | number;
}

export interface PaymentStatus {
    id: number;
    status_name: string;
    status_color?: string;
    description?: string;
    is_default?: boolean;
    is_active: boolean | number;
}

export interface ReturnReason {
    id: number;
    name: string;
    description?: string | null;
    return_to_stock: number;
    is_active: number;
}

export interface Store {
    id: number;
    store_name: string;
    logo_path?: string | null;
    store_contact?: string;
    store_location?: string;
    store_email?: string;
    is_active?: boolean | number;
    store_disabled?: boolean | number;
    currency?: Currency;
    payment_methods?: PaymentMethod[];
    payment_statuses?: PaymentStatus[];
    return_reasons?: ReturnReason[];
}

export interface SubscriptionItem {
    title_en: string;
    title_bn: string | null;
    value: string | null;
    used: number;
    remaining: number | null;
}

export interface SubscriptionUser {
    id: number;
    plan_id: number;
    plan_name_en: string;
    plan_name_bn: string | null;
    plan_price: string;
    billing_cycle: string; // 'trial', 'monthly', 'yearly'
    status: string; // 'active', 'pending', 'expired', 'blocked', 'hold'
    start_date: string;
    expire_date: string;
    items: SubscriptionItem[];
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    role: string;
    status: string;
    member_since?: string;
    stores: Store[];
    subscription_user: SubscriptionUser;
    permissions?: string[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    currentStore: Store | null;
    currentStoreId: number | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    currentStore: null,
    currentStoreId: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<{ user: User; token: string; permissions?: string[] }>) {
            // Validate that user object exists (ignore persist rehydration calls)
            if (!action.payload?.user) {
                // Silently ignore - this happens during Redux persist rehydration
                return;
            }

            // Get permissions from either the separate permissions field or from user object
            const permissions = action.payload.permissions || action.payload.user?.permissions || [];

            // Merge permissions into user object
            state.user = {
                ...action.payload.user,
                permissions: permissions,
            };
            state.token = action.payload.token;
            state.isAuthenticated = true;

            console.log('✅ Login successful - User:', state.user?.name);
            console.log('✅ Role:', state.user?.role);
            console.log('✅ Permissions loaded:', permissions.length, 'permissions');

            // 👇 Set default store (first store) on login
            if (action.payload.user?.stores?.length > 0) {
                const defaultStore = action.payload.user.stores[0];
                state.currentStore = defaultStore;
                state.currentStoreId = defaultStore.id;
                console.log('🏪 Default store set:', defaultStore.store_name);
            } else {
                state.currentStore = null;
                state.currentStoreId = null;
            }
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.currentStore = null;
            state.currentStoreId = null;
        },
        setUser(state, action: PayloadAction<{ user: User }>) {
            state.user = action.payload.user;
            if (action.payload.user.stores?.length > 0) {
                const defaultStore = action.payload.user.stores[0];
                state.currentStore = defaultStore;
                state.currentStoreId = defaultStore.id;
            } else {
                state.currentStore = null;
                state.currentStoreId = null;
            }
        },
        setCurrentStore(state, action: PayloadAction<Store>) {
            state.currentStore = action.payload;
            state.currentStoreId = action.payload.id;
        },
        setCurrentStoreById(state, action: PayloadAction<number>) {
            const storeId = action.payload;
            if (state.user?.stores) {
                const foundStore = state.user.stores.find((store) => store.id === storeId);
                if (foundStore) {
                    state.currentStore = foundStore;
                    state.currentStoreId = foundStore.id;
                }
            }
        },
        updateUserProfile(state, action: PayloadAction<{ name?: string; phone?: string; address?: string }>) {
            if (state.user) {
                state.user = {
                    ...state.user,
                    ...action.payload,
                };
            }
        },
        updateCurrentStoreData(state, action: PayloadAction<Partial<Store>>) {
            // Update current store with new data (e.g., payment methods, payment statuses)
            if (state.currentStore) {
                state.currentStore = {
                    ...state.currentStore,
                    ...action.payload,
                };
            }

            // Also update the store in user.stores array
            if (state.user?.stores && state.currentStoreId) {
                const storeIndex = state.user.stores.findIndex((s) => s.id === state.currentStoreId);
                if (storeIndex !== -1) {
                    state.user.stores[storeIndex] = {
                        ...state.user.stores[storeIndex],
                        ...action.payload,
                    };
                }
            }
        },
    },
});

export const { login, logout, setUser, setCurrentStore, setCurrentStoreById, updateUserProfile, updateCurrentStoreData } = authSlice.actions;
export default authSlice.reducer;
