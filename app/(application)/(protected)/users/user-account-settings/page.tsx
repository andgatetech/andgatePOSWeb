import ComponentsUsersAccountSettingsTabs from '@/app/(application)/(protected)/users/account-settings/components-users-account-settings-tabs';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';
import { getTranslation } from '@/i18n';

export const metadata: Metadata = {
    title: 'Account Setting',
};

const UserAccountSettings = () => {
    const { t } = getTranslation();
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Users
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Account Settings</span>
                </li>
            </ul>
            <ComponentsUsersAccountSettingsTabs />
        </div>
    );
};

export default UserAccountSettings;
