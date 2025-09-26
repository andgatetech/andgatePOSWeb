import { baseApi } from '@/store/api/baseApi';

const feedbackApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createFeedback: builder.mutation({
            query: (feedback: any) => ({
                url: '/feedbacks',
                method: 'POST',
                body: feedback,
            }),
            providesTags: ['Feedback'],
        }),
        getAllFeedbacks: builder.query({
            query: (params) => ({
                url: '/feedbacks',
                method: 'GET',
                params,
            }),
            providesTags: ['Feedback'],
        }),
        updateFeedback: builder.mutation({
            query: ({ id, ...feedback }) => ({
                url: `/feedbacks/${id}`,
                method: 'PUT',
                body: feedback,
            }),
            invalidatesTags: ['Feedback'],
        }),
        deleteFeedback: builder.mutation({
            query: (id) => ({
                url: `/feedbacks/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Feedback'],
        }),
    }),
});

export const { useCreateFeedbackMutation, useGetAllFeedbacksQuery, useUpdateFeedbackMutation, useDeleteFeedbackMutation } = feedbackApi;
