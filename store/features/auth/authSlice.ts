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

export interface Store {
    id: number;
    store_name: string;
    logo_path?: string;
    store_contact?: string;
    store_location?: string;
    store_email?: string;
    is_active?: boolean;
    currency?: Currency;
    payment_methods?: PaymentMethod[];
    payment_statuses?: PaymentStatus[];
}

export interface SubscriptionItem {
    id: number;
    subscription_id: number;
    title: string;
    value: string | null;
    status: number;
}

export interface Subscription {
    id: number;
    name: string;
    monthly_price: string;
    yearly_price: string;
    discount: string;
    status: number;
    items: SubscriptionItem[];
}

export interface SubscriptionUser {
    id: number;
    user_id: number;
    subscription_id: number;
    store_id: number;
    billing_cycle: string; // 'trial', 'monthly', 'yearly'
    start_date: string;
    expire_date: string;
    status: string; // 'active', 'pending', 'expired', 'blocked', 'hold'
    subscription: Subscription;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    phone?: string | null;
    address?: string | null;
    created_at?: string;
    updated_at?: string;
    stores: Store[];
    subscription_user: SubscriptionUser;
    permissions?: string[]; // Add permissions array
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
    },
});

export const { login, logout, setUser, setCurrentStore, setCurrentStoreById, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
