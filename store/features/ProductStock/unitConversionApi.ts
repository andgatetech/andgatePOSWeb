import { baseApi } from '../../api/baseApi';

const UnitConversionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUnitConversions: builder.query({
            query: (stockId: number) => ({
                url: `/product-stocks/${stockId}/unit-conversions`,
                method: 'GET',
            }),
            providesTags: (result, error, stockId) => [{ type: 'ProductStock', id: stockId }],
        }),

        createUnitConversion: builder.mutation({
            query: ({ stockId, unit_name, factor }: { stockId: number; unit_name: string; factor: number }) => ({
                url: `/product-stocks/${stockId}/unit-conversions`,
                method: 'POST',
                body: { unit_name, factor },
            }),
            invalidatesTags: (result, error, { stockId }) => [{ type: 'ProductStock', id: stockId }],
        }),

        deleteUnitConversion: builder.mutation({
            query: ({ stockId, conversionId }: { stockId: number; conversionId: number }) => ({
                url: `/product-stocks/${stockId}/unit-conversions/${conversionId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { stockId }) => [{ type: 'ProductStock', id: stockId }],
        }),
    }),
});

export const {
    useGetUnitConversionsQuery,
    useCreateUnitConversionMutation,
    useDeleteUnitConversionMutation,
} = UnitConversionApi;

export default UnitConversionApi;
