import { baseApi } from '@/store/api/baseApi';
import { setUser } from '../auth/authSlice';

const StoreApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ✅ Update store (with optional image)
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

                // ✅ Append units
                if (updateData.units && Array.isArray(updateData.units)) {
                    updateData.units.forEach((unit: any, index: number) => {
                        // Include ID for existing units (for update/delete)
                        if (unit.id !== undefined && unit.id !== null) {
                            formData.append(`units[${index}][id]`, unit.id.toString());
                        }
                        formData.append(`units[${index}][name]`, unit.name);
                        if (unit.is_active !== undefined && unit.is_active !== null) {
                            // Convert to boolean string "true" or "false"
                            const isActiveValue = unit.is_active === true || unit.is_active === 1 || unit.is_active === '1' || unit.is_active === 'true';
                            formData.append(`units[${index}][is_active]`, isActiveValue ? '1' : '0');
                        }
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

        // ✅ Get specific store by ID (calls your getStore backend function)
        getStore: builder.query({
            query: (params?: { store_id?: number }) => ({
                url: '/store',
                method: 'GET',
                params: params,
            }),
            providesTags: (result, error, arg) => (result ? [{ type: 'Stores', id: arg?.store_id || 'default' }] : []),
        }),

        // ✅ Currently logged-in user
        getWhoLogin: builder.query({
            query: () => ({
                url: '/user',
                method: 'GET',
            }),
            providesTags: ['User'],
        }),

        // ✅ Staff members for a store
        getStaffMember: builder.query({
            query: (params = {}) => ({
                url: '/store/members',
                method: 'GET',
                params,
            }),
            providesTags: ['User'],
        }),

        // ✅ Register a new staff member
        staffRegister: builder.mutation({
            query: (newStaff) => ({
                url: '/staff/register',
                method: 'POST',
                body: newStaff,
            }),
            invalidatesTags: ['User'],
        }),
        fullStoreListWithFilter: builder.query({
            query: (params = {}) => ({
                url: '/store/list',
                method: 'GET',
                params,
            }),
            providesTags: ['Stores'],
        }),

        // ✅ Delete store
        deleteStore: builder.mutation({
            query: (storeId: number) => ({
                url: `/stores/${storeId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Stores'],
        }),
        // ✅ All stores
        allStores: builder.query({
            query: () => ({
                url: '/stores',
                method: 'GET',
            }),
            providesTags: ['Stores'],
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
    }),
});

export const {
    useUpdateStoreMutation,
    useGetStoreQuery, // ← New hook for your getStore endpoint
    useGetWhoLoginQuery,
    useGetStaffMemberQuery,
    useStaffRegisterMutation,
    useFullStoreListWithFilterQuery,
    useDeleteStoreMutation,
    useAllStoresQuery,
    useCreateStoreMutation, // ← New hook for store registration
} = StoreApi;
