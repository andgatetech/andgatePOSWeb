import { baseApi } from '@/store/api/baseApi';

const WarrantyTypeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all warranty types for the store
        getWarrantyTypes: builder.query({
            query: (params: any = {}) => ({
                url: `/warranty-types`,
                method: 'GET',
                params, // Can include { store_id: 1, search: 'year' }
            }),
            providesTags: ['WarrantyTypes'],
        }),

        // Get single warranty type
        getWarrantyType: builder.query({
            query: (id: number) => ({
                url: `/warranty-types/${id}`,
                method: 'GET',
            }),
            providesTags: ['WarrantyTypes'],
        }),

        // Create warranty type
        createWarrantyType: builder.mutation({
            query: ({
                name,
                duration_months,
                duration_days,
                store_id,
                description,
            }: {
                name: string;
                duration_months?: number | null;
                duration_days?: number | null;
                store_id: number;
                description?: string;
            }) => {
                const body: any = { name, store_id };

                // Only add duration fields if they have values
                if (duration_months !== undefined && duration_months !== null && duration_months > 0) {
                    body.duration_months = duration_months;
                }
                if (duration_days !== undefined && duration_days !== null && duration_days > 0) {
                    body.duration_days = duration_days;
                }

                // Add description if provided
                if (description !== undefined && description !== null && description.trim()) {
                    body.description = description.trim();
                }

                return {
                    url: '/warranty-types',
                    method: 'POST',
                    body,
                };
            },
            invalidatesTags: ['WarrantyTypes', 'Stores'],
        }),

        // Update warranty type
        updateWarrantyType: builder.mutation({
            query: ({
                id,
                name,
                duration_months,
                duration_days,
                description,
                is_active,
            }: {
                id: number;
                name: string;
                duration_months?: number | null;
                duration_days?: number | null;
                description?: string;
                is_active?: number | boolean;
            }) => {
                const body: any = { name };

                // Only add duration fields if they have values
                if (duration_months !== undefined && duration_months !== null) {
                    body.duration_months = duration_months;
                }
                if (duration_days !== undefined && duration_days !== null) {
                    body.duration_days = duration_days;
                }

                // Add description if provided
                if (description !== undefined) {
                    body.description = description;
                }

                // Add is_active if provided
                if (is_active !== undefined) {
                    body.is_active = is_active;
                }

                return {
                    url: `/warranty-types/${id}`,
                    method: 'PUT',
                    body,
                };
            },
            invalidatesTags: ['WarrantyTypes', 'Stores'],
        }),

        // Delete warranty type
        deleteWarrantyType: builder.mutation({
            query: (id: number) => ({
                url: `/warranty-types/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['WarrantyTypes', 'Stores'],
        }),
    }),
});

export const { useGetWarrantyTypesQuery, useGetWarrantyTypeQuery, useCreateWarrantyTypeMutation, useUpdateWarrantyTypeMutation, useDeleteWarrantyTypeMutation } = WarrantyTypeApi;
