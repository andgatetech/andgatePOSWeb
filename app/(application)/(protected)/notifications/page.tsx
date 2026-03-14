'use client';

import NotificationList from '@/app/(application)/(protected)/notifications/components/NotificationList';
import SendAnnouncementModal from '@/app/(application)/(protected)/notifications/components/SendAnnouncementModal';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const NotificationsPage = () => {
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);

    return (
        <div>
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Notifications</h5>
                <button
                    type="button"
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => setIsSendModalOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Send Announcement
                </button>
            </div>
            
            <NotificationList />
            
            <SendAnnouncementModal
                isOpen={isSendModalOpen}
                onClose={() => setIsSendModalOpen(false)}
            />
        </div>
    );
};

export default NotificationsPage;
