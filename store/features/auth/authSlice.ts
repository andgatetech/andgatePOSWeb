// src/store/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Store {
    id: number;
    store_name: string;
    logo_path?: string;
    store_contact?: string;
    store_location?: string;
    is_active?: boolean;
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
    start_date: string;
    expire_date: string;
    status: number;
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
        login(state, action: PayloadAction<{ user: User; token: string }>) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;

            // 👇 Set default store (first store) on login
            if (action.payload.user.stores?.length > 0) {
                const defaultStore = action.payload.user.stores[0];
                state.currentStore = defaultStore;
                state.currentStoreId = defaultStore.id;
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
