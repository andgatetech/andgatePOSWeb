
import Link from 'next/link';
import IconClock from '@/components/icon/icon-clock';
import ComponentsUsersProfilePaymentHistory from '@/components/users/profile/components-users-profile-payment-history';
import ProfileApiCallHook from './profileApiCallHook';
import { Metadata } from 'next';


const Profile = () => {
    return (
        <div className="space-y-5">
            {/* Breadcrumb */}
            <ul className="flex space-x-2 text-sm text-gray-500 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Users
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">Profile</li>
            </ul>

            {/* Main Content */}
            <div className="grid gap-5 lg:grid-cols-3">
                {/* User Profile */}
                <div className="col-span-1">
                    <ProfileApiCallHook />
                </div>

                {/* Plan & Payment History */}
                <div className="col-span-2 space-y-5">
                    {/* Pro Plan */}
                    <div className="panel rounded-xl border bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-[#1b2e4b]">
                        <div className="mb-6 flex items-center justify-between">
                            <h5 className="text-xl font-semibold dark:text-white-light">Pro Plan</h5>
                            <button className="btn btn-primary transition-transform hover:scale-105">Renew Now</button>
                        </div>
                        <ul className="mb-5 list-inside list-disc space-y-2 font-semibold text-gray-700 dark:text-gray-300">
                            <li>10,000 Monthly Visitors</li>
                            <li>Unlimited Reports</li>
                            <li>2 Years Data Storage</li>
                        </ul>
                        <div className="mb-4 flex items-center justify-between font-semibold">
                            <p className="flex items-center rounded-full bg-dark px-2 py-1 text-xs font-semibold text-white-light">
                                <IconClock className="h-3 w-3 ltr:mr-1 rtl:ml-1" /> 5 Days Left
                            </p>
                            <p className="text-info">$25 / month</p>
                        </div>
                        <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-dark-light p-0.5 dark:bg-dark-light/10">
                            <div className="relative h-full w-full rounded-full bg-gradient-to-r from-[#f67062] to-[#fc5296]" style={{ width: '65%' }}></div>
                        </div>
                    </div>

                    {/* Payment History */}
                    <ComponentsUsersProfilePaymentHistory />
                </div>
            </div>
        </div>
    );
};

export default Profile;
