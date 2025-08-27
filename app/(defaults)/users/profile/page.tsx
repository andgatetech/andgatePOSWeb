'use client';

import Link from 'next/link';
import IconClock from '@/components/icon/icon-clock';
import ComponentsUsersProfilePaymentHistory from '@/components/users/profile/components-users-profile-payment-history';
import { User, Mail, Phone, MapPin, Calendar, Edit3 } from 'lucide-react';
import { useGetWhoLoginQuery } from '@/store/features/store/storeApi';


// Admin Profile Component
const AdminProfile = () => {
    const { data, isLoading, error } = useGetWhoLoginQuery();

    if (isLoading) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                <p className="text-sm text-gray-500">Loading profile...</p>
            </div>
        );
    }

    if (error || !data?.data?.user) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                <p className="text-sm text-red-500">Failed to load profile.</p>
            </div>
        );
    }

    const user = data.data.user;

    return (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4">
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                        <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Administrator</h3>
                        <p className="text-sm text-gray-500">Profile information</p>
                    </div>
                </div>
                <Link href="/users/user-account-settings" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                    <Edit3 className="h-4 w-4" />
                    Edit
                </Link>
            </div>

            {/* Body */}
            <div className="p-6">
                {/* Avatar + Name */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                        <User className="h-10 w-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">{user.name}</h4>
                    <p className="text-sm capitalize text-gray-500">{user.role?.replace('_', ' ')}</p>
                </div>

                {/* Details */}
                <div className="space-y-4">
                    <div className="flex items-start space-x-3 rounded-lg bg-gray-50 p-3">
                        <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</p>
                            <p className="break-all text-sm text-gray-900">{user.email}</p>
                        </div>
                    </div>

                    {user.phone && (
                        <div className="flex items-start space-x-3 rounded-lg bg-gray-50 p-3">
                            <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Phone</p>
                                <p className="text-sm text-gray-900">{user.phone}</p>
                            </div>
                        </div>
                    )}

                    {user.address && (
                        <div className="flex items-start space-x-3 rounded-lg bg-gray-50 p-3">
                            <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Address</p>
                                <p className="text-sm text-gray-900">{user.address}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-start space-x-3 rounded-lg bg-gray-50 p-3">
                        <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Member Since</p>
                            <p className="text-sm text-gray-900">
                                {new Date(user.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Profile Page
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
                    <AdminProfile />
                </div>

                {/* Plan & Payment History */}
                <div className="col-span-2 space-y-5">
                    {/* Pro Plan */}
                    <div className="rounded-xl border bg-white p-6 shadow-lg">
                        <div className="mb-6 flex items-center justify-between">
                            <h5 className="text-xl font-semibold">Pro Plan</h5>
                            <button className="btn btn-primary transition-transform hover:scale-105">Renew Now</button>
                        </div>
                        <ul className="mb-5 list-inside list-disc space-y-2 font-semibold text-gray-700">
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
                        <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-dark-light p-0.5">
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
