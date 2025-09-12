import { baseApi } from '@/store/api/baseApi';

const StoreApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ✅ Get store details
        getStore: builder.query({
            query: () => ({
                url: `/store`,
                method: 'GET',
            }),
            providesTags: ['Stores'],
        }),

        // ✅ Update store (with optional image)
        updateStore: builder.mutation({
            query: ({ updateData }: { updateData: any }) => {
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
                        formData.append(`units[${index}][name]`, unit.name);
                    });
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

        // ✅ All stores
        allStores: builder.query({
            query: () => ({
                url: '/stores',
                method: 'GET',
            }),
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
            query: () => ({
                url: '/store/members',
                method: 'GET',
            }),
        }),

        // ✅ Register a new staff member
        staffRegister: builder.mutation({
            query: (newStaff) => ({
                url: '/staff/register',
                method: 'POST',
                body: newStaff,
            }),
        }),
    }),
});

export const { useUpdateStoreMutation, useGetStoreQuery, useAllStoresQuery, useGetWhoLoginQuery, useGetStaffMemberQuery, useStaffRegisterMutation } = StoreApi;
