'use client';

import NotificationList from '@/app/(application)/(protected)/notifications/components/NotificationList';
import { RootState } from '@/store';
import { Plus } from 'lucide-react';
import { getTranslation } from '@/i18n';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

const NotificationsPage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <div>
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">Notifications</h5>
                {user?.role === 'store_admin' && (
                    <button type="button" className="btn btn-primary flex items-center gap-2" onClick={() => router.push('/notifications/send')}>
                        <Plus className="h-4 w-4" />
                        Send Announcement
                    </button>
                )}
            </div>

            <NotificationList />
        </div>
    );
};

export default NotificationsPage;
