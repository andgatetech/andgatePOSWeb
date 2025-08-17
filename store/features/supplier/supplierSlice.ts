import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: Supplier | null;
    token: string | null;
    isAuthenticated: boolean;
}

export interface Supplier {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    phone: any;
    address: any;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
};

const supplierSlice = createSlice({
    name: 'supplier',
    initialState,
    reducers: {
        supplierLogin(state, action: PayloadAction<{ user: Supplier; token: string }>) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        supplierLogout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
        setUser(state, action: PayloadAction<{ user: Supplier }>) {
            state.user = action.payload.user;
        },
    },
});

export const { supplierLogin, supplierLogout, setUser } = supplierSlice.actions;
export default supplierSlice.reducer;
