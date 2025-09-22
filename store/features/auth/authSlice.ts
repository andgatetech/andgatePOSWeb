// src/store/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

export interface Store {
    id: number;
    store_name: string;
    store_location?: string | null;
    store_contact?: string | null;
    logo_path?: string | null;
    is_active: number;
    created_at: string;
    updated_at: string;
    // add more fields if needed
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
    store: Store;
    subscription_user: SubscriptionUser;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<{ user: User; token: string }>) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
        setUser(state, action: PayloadAction<{ user: User }>) {
            state.user = action.payload.user;
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

export const { login, logout, setUser, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
