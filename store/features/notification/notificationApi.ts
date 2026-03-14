import { baseApi } from '@/store/api/baseApi';
import type { GetNotificationsParams, NotificationListResponse, SendAnnouncementPayload, UnreadCountResponse } from './notificationTypes';

const notificationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // 1. Get all notifications (paginated, filterable)
        getNotifications: builder.query<NotificationListResponse, GetNotificationsParams>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append('page', String(params.page));
                if (params?.per_page) queryParams.append('per_page', String(params.per_page));
                if (params?.is_read !== undefined) queryParams.append('is_read', String(params.is_read));

                const queryString = queryParams.toString();
                return {
                    url: `/notifications${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            providesTags: ['Notifications'],
        }),

        // 2. Unread count + recent + critical (for header dropdown & banner)
        getUnreadCount: builder.query<UnreadCountResponse, void>({
            query: () => ({
                url: '/notifications/unread-count',
                method: 'GET',
            }),
            providesTags: ['Notifications'],
        }),

        // 3. Mark single notification as read
        markAsRead: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notifications'],
        }),

        // 4. Mark all notifications as read
        markAllRead: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: '/notifications/read-all',
                method: 'PATCH',
            }),
            invalidatesTags: ['Notifications'],
        }),

        // 5. Archive / dismiss a notification
        archiveNotification: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/notifications/${id}/archive`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notifications'],
        }),

        // 6. Send store announcement (Store Admin only)
        sendAnnouncement: builder.mutation<{ success: boolean; message: string }, SendAnnouncementPayload>({
            query: (payload) => ({
                url: '/notifications/send',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Notifications'],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkAsReadMutation,
    useMarkAllReadMutation,
    useArchiveNotificationMutation,
    useSendAnnouncementMutation,
} = notificationApi;
