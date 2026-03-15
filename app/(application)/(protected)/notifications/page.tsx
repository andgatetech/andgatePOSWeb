'use client';

import NotificationList from '@/app/(application)/(protected)/notifications/components/NotificationList';
import SendAnnouncementModal from '@/app/(application)/(protected)/notifications/components/SendAnnouncementModal';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const NotificationsPage = () => {
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <div>
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Notifications</h5>
                {user?.role === 'store_admin' && (
                    <button
                        type="button"
                        className="btn btn-primary flex items-center gap-2"
                        onClick={() => setIsSendModalOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Send Announcement
                    </button>
                )}
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
