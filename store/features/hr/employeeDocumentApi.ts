import { baseApi } from '@/store/api/baseApi';

export const employeeDocumentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getEmployeeDocument: builder.query({
            query: ({ userId, ...params }: { userId: number; store_id: number }) => ({
                url: `/employee-documents/${userId}`,
                method: 'GET',
                params,
            }),
            providesTags: ['EmployeeDocument'],
        }),
        uploadEmployeeDocument: builder.mutation({
            query: ({ userId, formData }: { userId: number; formData: FormData }) => ({
                url: `/employee-documents/${userId}`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['EmployeeDocument'],
        }),
        deleteEmployeeDocument: builder.mutation({
            query: ({ userId, store_id }: { userId: number; store_id: number }) => ({
                url: `/employee-documents/${userId}`,
                method: 'DELETE',
                params: { store_id },
            }),
            invalidatesTags: ['EmployeeDocument'],
        }),
    }),
});

export const { useGetEmployeeDocumentQuery, useUploadEmployeeDocumentMutation, useDeleteEmployeeDocumentMutation } = employeeDocumentApi;
