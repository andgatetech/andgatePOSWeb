'use client';
import Link from 'next/link';
import IconCoffee from '@/components/icon/icon-coffee';
import IconCalendar from '@/components/icon/icon-calendar';
import IconMapPin from '@/components/icon/icon-map-pin';
import IconMail from '@/components/icon/icon-mail';
import IconPhone from '@/components/icon/icon-phone';
import IconTwitter from '@/components/icon/icon-twitter';
import IconDribbble from '@/components/icon/icon-dribbble';
import IconGithub from '@/components/icon/icon-github';
import IconPencilPaper from '@/components/icon/icon-pencil-paper';
import { useGetWhoLoginQuery } from '@/store/features/store/storeApi';

const ProfileApiCallHook = () => {
    const { data, isLoading, error } = useGetWhoLoginQuery();

    if (isLoading) return <div className="text-center py-10">Loading user data...</div>;
    if (error || !data?.success) return <div className="text-center py-10 text-red-500">Error loading user data</div>;

    const { user, store } = data.data;

    return (
        <div className="panel rounded-xl border bg-white p-6 shadow-lg dark:bg-[#1b2e4b] dark:border-gray-700">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h5 className="text-xl font-semibold dark:text-white-light">Profile</h5>
                <Link href="/users/user-account-settings" className="btn btn-primary rounded-full p-2 transition-transform hover:scale-105">
                    <IconPencilPaper />
                </Link>
            </div>

            {/* User Info */}
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <img
                        src={user.avatar || '/assets/images/profile-34.jpeg'}
                        alt={user.name}
                        className="h-28 w-28 rounded-full border-4 border-primary object-cover shadow-md"
                    />
                </div>
                <p className="text-2xl font-bold text-primary">{user.name}</p>
                <p className="text-sm text-gray-500">{user.role}</p>
            </div>

            {/* Details */}
            <ul className="mt-6 mx-auto flex max-w-[200px] flex-col gap-3 text-gray-600 dark:text-gray-300 font-medium">
                <li className="flex items-center gap-3">
                    <IconCoffee className="shrink-0 text-primary" /> {user.role}
                </li>
                
                <li className="flex items-center gap-3">
                    <IconMapPin className="shrink-0 text-primary" /> {user.address || 'N/A'}
                </li>
                <li className="flex items-center gap-3">
                    <IconMail className="shrink-0 text-primary" />
                    <span className="truncate">{user.email}</span>
                </li>
                <li className="flex items-center gap-3">
                    <IconPhone className="shrink-0 text-primary" />
                    <span>{user.phone || 'N/A'}</span>
                </li>
            </ul>

            {/* Social Buttons */}
            <div className="mt-6 flex justify-center gap-3">
                <button className="btn btn-info flex h-10 w-10 items-center justify-center rounded-full p-0 hover:scale-110 transition-transform">
                    <IconTwitter className="h-5 w-5" />
                </button>
                <button className="btn btn-danger flex h-10 w-10 items-center justify-center rounded-full p-0 hover:scale-110 transition-transform">
                    <IconDribbble />
                </button>
                <button className="btn btn-dark flex h-10 w-10 items-center justify-center rounded-full p-0 hover:scale-110 transition-transform">
                    <IconGithub />
                </button>
            </div>

            {/* Store Info */}
            <div className="mt-8 text-center border-t pt-4 border-gray-200 dark:border-gray-700">
                <h6 className="font-semibold text-gray-700 dark:text-gray-300">Store Info</h6>
                <p className="text-sm text-gray-500">{store.name}</p>
                <p className="text-sm text-gray-500">{store.role_in_store}</p>
            </div>
        </div>
    );
};

export default ProfileApiCallHook;
