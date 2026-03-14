// Notification system TypeScript interfaces

export interface Notification {
    id: number;
    notification_id: number;
    title: string;
    type_label: string;
    type: string;
    message: string;
    severity: 'info' | 'success' | 'warning' | 'critical';
    is_read: boolean;
    created_at_human: string;
    read_at_human: string | null;
    action_url: string | null;
    data: any | null;
}

export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    has_more_pages: boolean;
}

export interface NotificationListResponse {
    success: boolean;
    data: {
        items: Notification[];
        pagination: PaginationMeta;
    };
    message: string;
}

export interface UnreadCountResponse {
    success: boolean;
    count: number;
    recent: Notification[];
    critical: Notification[];
    info?: Notification[];
}

export interface GetNotificationsParams {
    page?: number;
    per_page?: number;
    is_read?: 0 | 1;
}

export interface SendAnnouncementPayload {
    title: string;
    message: string;
    severity?: 'info' | 'warning' | 'critical' | 'success';
}
