import { baseApi } from '@/store/api/baseApi';
import authReducer from '@/store/features/auth/authSlice';
import themeConfigSlice from '@/store/themeConfigSlice';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
    key: 'auth',
    storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    auth: persistedAuthReducer,
    [baseApi.reducerPath]: baseApi.reducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
