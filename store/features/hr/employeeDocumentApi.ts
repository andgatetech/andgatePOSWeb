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
    }),
});

export const { useGetEmployeeDocumentQuery, useUploadEmployeeDocumentMutation } = employeeDocumentApi;
