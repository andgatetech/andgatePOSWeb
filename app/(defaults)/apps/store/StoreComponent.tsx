'use client';
import { useState } from 'react';
import { useGetWhoLoginQuery } from '@/store/features/store/storeApi';
import {
    Store,
    MapPin,
    Users,
    Calendar,
    Settings,
    Building2,
    Activity,
    Edit3,
    ArrowRight,
    ExternalLink,
    Megaphone,
    Tag,
    FileText,
    ShieldCheck,
    Clock,
    Lock,
} from 'lucide-react';

const StoreComponent = () => {
    const { data: user, isLoading, error } = useGetWhoLoginQuery();
    const [selectedStore, setSelectedStore] = useState(0);

    const storeData = user?.data || {};
    const stores = storeData.stores || [];
    const currentStore = stores[selectedStore] || storeData.store || {};
    const userData = storeData.user || {};

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800 border-green-200',
            maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            closed: 'bg-red-100 text-red-800 border-red-200',
            default: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[status] || colors.default;
    };

    const totalStores = stores.length || 1;
    const totalStaff = stores.length
        ? stores.reduce((sum, s) => sum + (s.staff_count || 0), 0)
        : currentStore.staff_count || 15;

    const calculateDaysActive = () => {
        if (!userData?.created_at) return 0;
        return Math.floor((new Date() - new Date(userData.created_at)) / (1000 * 60 * 60 * 24));
    };

    if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    if (error || !storeData) return <div className="flex min-h-screen items-center justify-center">Error loading data</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                            <Store className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{totalStores > 1 ? 'Multi-Store Management' : 'Store Management'}</h1>
                            <p className="text-sm text-gray-500">{totalStores > 1 ? `Managing ${totalStores} store locations` : 'Manage your store operations and settings'}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Quick Overview */}
                <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="flex items-center rounded-xl bg-white p-5 shadow">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <Store className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Total Stores</p>
                                <p className="text-lg font-semibold text-gray-900">{totalStores}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center rounded-xl bg-white p-5 shadow">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                                <Activity className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">{currentStore?.name ? `${currentStore.name} Status` : 'Store Status'}</p>
                                <p
                                    className={`text-lg font-semibold capitalize ${
                                        currentStore?.status === 'active' ? 'text-green-600' : currentStore?.status === 'maintenance' ? 'text-yellow-600' : 'text-gray-600'
                                    }`}
                                >
                                    {currentStore?.status || 'Active'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center rounded-xl bg-white p-5 shadow">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Store Active Days</p>
                                <p className="text-lg font-semibold text-gray-900">{calculateDaysActive()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center rounded-xl bg-white p-5 shadow">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                                <Tag className="h-5 w-5 text-pink-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Active Campaigns</p>
                                <p className="text-lg font-semibold text-gray-900">{currentStore?.campaigns || 0}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Current Store Details */}
                <section className="grid grid-cols-1 gap-6">
                    <div className="space-y-6">
                        {/* Store Info - Modern */}
                        <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-md">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{currentStore?.name || 'Store Info'}</h3>
                                        <p className="text-sm text-gray-500">Store details and configuration</p>
                                    </div>
                                </div>
                                <button className="flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700">
                                    <Edit3 className="mr-2 h-5 w-5" /> Edit
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Store Name */}
                                <div className="flex items-center space-x-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Store Name</p>
                                        <p className="text-lg font-semibold text-gray-900">{currentStore?.name || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Store ID */}
                                <div className="flex items-center space-x-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Store ID</p>
                                        <p className="font-mono text-lg text-gray-900">#{currentStore?.id?.toString().padStart(6, '0') || '000000'}</p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-center space-x-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="text-lg text-gray-900">{currentStore?.location || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center space-x-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${getStatusColor(currentStore?.status)}`}>
                                            {currentStore?.status || 'active'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Management Tools */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Staff Management */}
                            <a
                                href="/apps/Staff"
                                className="group relative rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-blue-400 transition-transform group-hover:translate-x-1" />
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Staff Management</h4>
                                    <p className="mt-1 text-sm text-gray-600">Manage employees, schedules, and roles</p>
                                    <div className="mt-3 flex items-center text-sm text-gray-600">
                                        <Users className="mr-1 h-4 w-4 text-blue-500" />
                                        <span>{currentStore?.staff_count || totalStaff} active staff</span>
                                    </div>
                                </div>
                            </a>

                            {/* Store Settings */}
                            <div className="relative rounded-xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
                                        <Settings className="h-6 w-6" />
                                    </div>
                                    <button className="text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Store Settings</h4>
                                    <p className="mt-1 text-sm text-gray-600">Update preferences, working hours, and policies</p>
                                    <div className="mt-3 flex items-center text-sm text-gray-600">
                                        <Clock className="mr-1 h-4 w-4 text-indigo-500" />
                                        <span>{currentStore?.working_hours || '9 AM – 9 PM'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Compliance & Legal */}
                            <div className="relative rounded-xl border border-gray-200 bg-gradient-to-br from-red-50 to-red-100 p-6 transition hover:-translate-y-1 hover:border-red-300 hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <button className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                                        <ExternalLink className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Compliance & Legal</h4>
                                    <p className="mt-1 text-sm text-gray-600">Manage licenses, tax documents, and business compliance</p>
                                    <div className="mt-3 flex items-center text-sm text-gray-600">
                                        <ShieldCheck className="mr-1 h-4 w-4 text-red-500" />
                                        <span>{currentStore?.documents || 5} active documents</span>
                                    </div>
                                </div>
                            </div>
                            {/* Promotions & Marketing */}
                            <div className="relative rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-green-100 p-6 transition hover:-translate-y-1 hover:border-green-300 hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white shadow-lg">
                                        <Megaphone className="h-6 w-6" />
                                    </div>
                                    <button className="text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Promotions & Marketing</h4>
                                    <p className="mt-1 text-sm text-gray-600">Create and manage promotions, discounts, and campaigns</p>
                                    <div className="mt-3 flex items-center text-sm text-gray-600">
                                        <Tag className="mr-1 h-4 w-4 text-green-500" />
                                        <span>{currentStore?.promotions || 0} active promotions</span>
                                    </div>
                                </div>
                            </div>
                            {/* Security Settings */}
                            <div className="relative rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                                        <Lock className="h-6 w-6" />
                                    </div>
                                    <button className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                        <ExternalLink className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Security Settings</h4>
                                    <p className="mt-1 text-sm text-gray-600">Manage user roles, permissions, and security policies</p>
                                    <div className="mt-3 flex items-center text-sm text-gray-600">
                                        <ShieldCheck className="mr-1 h-4 w-4 text-blue-500" />
                                        <span>{currentStore?.security || 3} active security policies</span>
                                    </div>
                                </div>
                            </div>
                            {/* Store Tasks & Notes */}
                            <div className="relative rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-100 p-6 transition hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-600 text-white shadow-lg">
                                        <Edit3 className="h-6 w-6" />
                                    </div>
                                    <button className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                                        <ExternalLink className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Store Tasks & Notes</h4>
                                    <p className="mt-1 text-sm text-gray-600">Keep track of daily operational tasks and notes for quick reference.</p>
                                    <div className="mt-3 flex items-center text-sm text-gray-600">
                                        <Clock className="mr-1 h-4 w-4 text-gray-500" />
                                        <span>{currentStore?.tasks_count || 0} pending tasks</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default StoreComponent;
