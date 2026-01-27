import { baseApi } from '@/store/api/baseApi';
import { setUser } from '../auth/authSlice';

const StoreApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Update store (with optional image)
        updateStore: builder.mutation({
            query: ({ updateData, storeId }: { updateData: any; storeId?: number }) => {
                const formData = new FormData();

                if (updateData.store_name) formData.append('store_name', updateData.store_name);
                if (updateData.store_location) formData.append('store_location', updateData.store_location);
                if (updateData.store_contact) formData.append('store_contact', updateData.store_contact);
                if (updateData.max_discount) formData.append('max_discount', updateData.max_discount);
                if (updateData.opening_time) formData.append('opening_time', updateData.opening_time);
                if (updateData.closing_time) formData.append('closing_time', updateData.closing_time);
                if (updateData.loyalty_points_enabled !== undefined) formData.append('loyalty_points_enabled', updateData.loyalty_points_enabled);
                if (updateData.loyalty_points_rate) formData.append('loyalty_points_rate', updateData.loyalty_points_rate);
                if (updateData.is_active !== undefined) formData.append('is_active', updateData.is_active);
                if (updateData.logo) formData.append('logo', updateData.logo);

                //Append pos_units (backend expects pos_units, not units)
                if (updateData.pos_units && Array.isArray(updateData.pos_units)) {
                    updateData.pos_units.forEach((unit: any, index: number) => {
                        // Include ID for existing units (for update/delete)
                        if (unit.id !== undefined && unit.id !== null) {
                            formData.append(`pos_units[${index}][id]`, unit.id.toString());
                        }
                        formData.append(`pos_units[${index}][name]`, unit.name);
                        // Always include is_active (default to 1 if not specified)
                        const isActiveValue = unit.is_active === true || unit.is_active === 1 || unit.is_active === '1' || unit.is_active === 'true';
                        formData.append(`pos_units[${index}][is_active]`, isActiveValue ? '1' : '0');
                    });
                }

                // Include store ID if provided
                if (storeId) {
                    formData.append('store_id', storeId.toString());
                }

                formData.append('_method', 'PUT'); // Laravel PUT via POST

                return {
                    url: `/store`,
                    method: 'POST', // POST + _method=PUT
                    body: formData,
                };
            },
            invalidatesTags: ['Stores'],
        }),

        //  Get specific store by ID (calls your getStore backend function)
        getStore: builder.query({
            query: (params?: { store_id?: number }) => ({
                url: '/store',
                method: 'GET',
                params: params,
            }),
            providesTags: (result, error, arg) => (result ? [{ type: 'Stores', id: arg?.store_id || 'default' }] : []),
        }),

        //  Currently logged-in user
        getWhoLogin: builder.query({
            query: () => ({
                url: '/user',
                method: 'GET',
            }),
            providesTags: ['User'],
        }),

        //Staff members for a store
        getStaffMember: builder.query({
            query: (params = {}) => ({
                url: '/store/members',
                method: 'GET',
                params,
            }),
            providesTags: ['User'],
        }),

        //  Store payment methods
        getPaymentMethods: builder.query({
            query: (params: { store_id: number }) => ({
                url: '/store/payment-methods',
                method: 'GET',
                params,
            }),
            providesTags: (result, error, arg) => [{ type: 'PaymentMethods', id: arg.store_id }],
        }),
        createPaymentMethod: builder.mutation({
            query: (data: any) => ({
                url: '/store/payment-methods',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'PaymentMethods', id: arg.store_id }],
        }),
        updatePaymentMethod: builder.mutation({
            query: ({ id, data }: { id: number; data: any }) => ({
                url: `/store/payment-methods/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'PaymentMethods', id: arg.data?.store_id }],
        }),
        deletePaymentMethod: builder.mutation({
            query: ({ id, store_id }: { id: number; store_id: number }) => ({
                url: `/store/payment-methods/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'PaymentMethods', id: arg.store_id }],
        }),

        //  Register a new staff member
        staffRegister: builder.mutation({
            query: (newStaff) => ({
                url: '/staff/register',
                method: 'POST',
                body: newStaff,
            }),
            invalidatesTags: ['User'],
        }),

        //  Delete store
        deleteStore: builder.mutation({
            query: (storeId: number) => ({
                url: `/store/${storeId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Stores', 'User'],
        }),

        createStore: builder.mutation({
            query: (storeData) => ({
                url: '/store/create',
                method: 'POST',
                body: storeData,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const response = await queryFulfilled;

                    // For store creation, the response structure is { success, message, data: { user: {...}, token } }
                    if (response.data?.data?.user) {
                        dispatch(setUser({ user: response.data.data.user }));
                    }
                } catch (error) {
                    console.error('Store creation failed:', error);
                }
            },
        }),

        // Product Adjustment Reasons Management
        createAdjustmentReason: builder.mutation({
            query: (data: any) => ({
                url: '/product-adjustment-reasons',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Stores'],
        }),
        updateAdjustmentReason: builder.mutation({
            query: ({ id, data }: { id: number; data: any }) => ({
                url: `/product-adjustment-reasons/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Stores'],
        }),
        deleteAdjustmentReason: builder.mutation({
            query: (id: number) => ({
                url: `/product-adjustment-reasons/${id}`,
                method: 'DELETE',
            }),

            invalidatesTags: ['Stores'],
        }),

        // Order Return Reasons Management
        createOrderReturnReason: builder.mutation({
            query: (data: any) => ({
                url: '/order-return-reasons',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Stores'],
        }),
        updateOrderReturnReason: builder.mutation({
            query: ({ id, data }: { id: number; data: any }) => ({
                url: `/order-return-reasons/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Stores'],
        }),
        deleteOrderReturnReason: builder.mutation({
            query: (id: number) => ({
                url: `/order-return-reasons/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Stores'],
        }),

        // Currency Management
        createCurrency: builder.mutation({
            query: (data: any) => ({
                url: '/store/currencies',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Stores'],
        }),
        updateCurrency: builder.mutation({
            query: ({ id, data }: { id: number; data: any }) => ({
                url: `/store/currencies/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Stores'],
        }),
        deleteCurrency: builder.mutation({
            query: (id: number) => ({
                url: `/store/currencies/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Stores'],
        }),

        //  Payment Status Management
        createPaymentStatus: builder.mutation({
            query: (data: any) => ({
                url: '/store/payment-statuses',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Stores'],
        }),
        updatePaymentStatus: builder.mutation({
            query: ({ id, data }: { id: number; data: any }) => ({
                url: `/store/payment-statuses/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Stores'],
        }),
        deletePaymentStatus: builder.mutation({
            query: (id: number) => ({
                url: `/store/payment-statuses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Stores'],
        }),
    }),
});

export const {
    useUpdateStoreMutation,
    useGetStoreQuery, // ← New hook for your getStore endpoint
    useLazyGetStoreQuery, // ← Lazy query hook for on-demand store fetching
    useGetWhoLoginQuery,
    useGetStaffMemberQuery,
    useStaffRegisterMutation,
    useDeleteStoreMutation,

    useCreateStoreMutation, // ← New hook for store registration
    useGetPaymentMethodsQuery,
    useCreatePaymentMethodMutation,
    useUpdatePaymentMethodMutation,
    useDeletePaymentMethodMutation,
    useCreateAdjustmentReasonMutation,
    useUpdateAdjustmentReasonMutation,
    useDeleteAdjustmentReasonMutation,
    useCreateOrderReturnReasonMutation,
    useUpdateOrderReturnReasonMutation,
    useDeleteOrderReturnReasonMutation,
    useCreateCurrencyMutation,
    useUpdateCurrencyMutation,
    useDeleteCurrencyMutation,
    useCreatePaymentStatusMutation,
    useUpdatePaymentStatusMutation,
    useDeletePaymentStatusMutation,
} = StoreApi;
