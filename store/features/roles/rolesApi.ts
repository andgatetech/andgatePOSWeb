import { baseApi } from '@/store/api/baseApi';

const rolesApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getRoles: builder.query({
            query: (params: Record<string, any> = {}) => ({
                url: '/roles',
                method: 'GET',
                params,
            }),
            providesTags: ['Roles'],
        }),
        getRole: builder.query({
            query: (id: number) => ({
                url: `/roles/${id}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'Roles', id }],
        }),
        getAllPermissions: builder.query({
            query: () => ({
                url: '/roles/permissions',
                method: 'GET',
            }),
            providesTags: ['Permissions'],
        }),
        getRoleTemplates: builder.query({
            query: () => ({
                url: '/roles/templates',
                method: 'GET',
            }),
            providesTags: ['Permissions'],
        }),
        getRoleUsers: builder.query({
            query: (id: number) => ({
                url: `/roles/${id}/users`,
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'Roles', id: `users-${id}` }],
        }),
        createRole: builder.mutation({
            query: (data: { store_id?: number | null; name: string; description?: string; permission_ids?: number[] }) => ({
                url: '/roles',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Roles'],
        }),
        updateRole: builder.mutation({
            query: ({ id, ...data }: { id: number; store_id?: number | null; name?: string; description?: string; permission_ids?: number[] }) => ({
                url: `/roles/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Roles'],
        }),
        deleteRole: builder.mutation({
            query: (id: number) => ({
                url: `/roles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Roles'],
        }),
        assignRole: builder.mutation({
            query: ({ roleId, user_id }: { roleId: number; user_id: number }) => ({
                url: `/roles/${roleId}/assign`,
                method: 'POST',
                body: { user_id },
            }),
            invalidatesTags: ['Roles', 'User'],
        }),
        unassignRole: builder.mutation({
            query: ({ roleId, user_id }: { roleId: number; user_id: number }) => ({
                url: `/roles/${roleId}/assign`,
                method: 'DELETE',
                body: { user_id },
            }),
            invalidatesTags: ['Roles', 'User'],
        }),
    }),
});

export const {
    useGetRolesQuery,
    useGetRoleQuery,
    useGetAllPermissionsQuery,
    useGetRoleTemplatesQuery,
    useGetRoleUsersQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useAssignRoleMutation,
    useUnassignRoleMutation,
} = rolesApi;
