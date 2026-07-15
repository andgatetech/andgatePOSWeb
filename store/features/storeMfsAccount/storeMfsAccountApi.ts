import { baseApi } from '@/store/api/baseApi';

const StoreMfsAccountApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStoreMfsAccounts: builder.query({
            query: (storeId: number | string) => ({
                url: `/stores/${storeId}/mfs-accounts`,
                method: 'GET',
            }),
            providesTags: (result, error, storeId) => [{ type: 'StoreMfsAccounts', id: storeId }],
        }),
        createStoreMfsAccount: builder.mutation({
            query: ({ storeId, ...data }: { storeId: number | string } & Record<string, any>) => ({
                url: `/stores/${storeId}/mfs-accounts`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'StoreMfsAccounts', id: arg.storeId }, 'Stores'],
        }),
        updateStoreMfsAccount: builder.mutation({
            query: ({ storeId, accountId, ...data }: { storeId: number | string; accountId: number | string } & Record<string, any>) => ({
                url: `/stores/${storeId}/mfs-accounts/${accountId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'StoreMfsAccounts', id: arg.storeId }, 'Stores'],
        }),
        deleteStoreMfsAccount: builder.mutation({
            query: ({ storeId, accountId }: { storeId: number | string; accountId: number | string }) => ({
                url: `/stores/${storeId}/mfs-accounts/${accountId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'StoreMfsAccounts', id: arg.storeId }, 'Stores'],
        }),
    }),
});

export const {
    useGetStoreMfsAccountsQuery,
    useCreateStoreMfsAccountMutation,
    useUpdateStoreMfsAccountMutation,
    useDeleteStoreMfsAccountMutation,
} = StoreMfsAccountApi;
