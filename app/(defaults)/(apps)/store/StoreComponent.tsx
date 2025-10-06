'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { RootState } from '@/store';

import { useCreateStoreMutation, useGetStoreQuery } from '@/store/features/store/storeApi';
import { Activity, Building2, Calendar, MapPin, Plus, Store, Tag, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import AllStoreComponent from './AllStoreComponent';


const StoreComponent = () => {
    // Get current store from Redux
    const { currentStore: reduxStore, currentStoreId, userStores } = useCurrentStore();
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        store_name: '',
        address: '',
        store_phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [createStore] = useCreateStoreMutation();

    // Use the correct API query that calls your getStore endpoint
    const {
        data: storeResponse,
        isLoading,
        error,
        refetch,
    } = useGetStoreQuery(currentStoreId ? { store_id: currentStoreId } : undefined, {
        // Force refetch when store_id changes
        refetchOnMountOrArgChange: true,
        // Skip the query if no store_id is available
        skip: !currentStoreId,
    });

    // Extract store data from API response - data is directly in storeResponse.data
    const apiStore = storeResponse?.data || null;

    // Use store data from API, fallback to Redux store if needed
    const currentStore = apiStore || reduxStore || {};
    const stores = userStores.length > 0 ? userStores : [currentStore].filter(Boolean);

    // Force refetch when store ID changes
    useEffect(() => {
        if (currentStoreId && refetch) {
            refetch();
        }
    }, [currentStoreId, refetch]);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-800 border-green-200',
            maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            closed: 'bg-red-100 text-red-800 border-red-200',
            default: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[status] || colors.default;
    };

    const totalStores = stores.length || 1;
    const totalStaff = stores.length ? stores.reduce((sum, s) => sum + (s.staff_count || 0), 0) : currentStore.staff_count || 15;

    const calculateDaysActive = () => {
        if (!currentStore?.created_at) return 0;
        return Math.floor((new Date().getTime() - new Date(currentStore.created_at).getTime()) / (1000 * 60 * 60 * 24));
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 2000,
            customClass: { container: 'toast' },
        });
        toast.fire({ icon: type, title: msg, padding: '8px 16px' });
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleCreateStore = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.store_name.trim() || !formData.address.trim()) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const storeData = {
                user_id: user?.id,
                store_name: formData.store_name.trim(),
                address: formData.address.trim(),
                ...(formData.store_phone.trim() && { store_phone: formData.store_phone.trim() }),
            };

            const response = await createStore(storeData).unwrap();

            // The createStore mutation already handles Redux state update via onQueryStarted

            // Reset form and close modal on success
            setFormData({ store_name: '', address: '', store_phone: '' });
            setIsCreateModalOpen(false);

            // Refetch current store data if available
            if (currentStoreId && refetch) refetch();

            showMessage('Store created successfully!', 'success');
        } catch (error) {
            console.error('Error creating store:', error);
            showMessage('Failed to create store. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Close modal handler
    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setFormData({ store_name: '', address: '', store_phone: '' });
        setIsSubmitting(false);
    };

    if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading store data...</div>;
    if (error) return <div className="flex min-h-screen items-center justify-center">Error loading data</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Title Section - No duplicate header needed since layout has one */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                            <Store className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
                            <p className="text-sm text-gray-500">Manage your store operations and settings</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="group relative inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Plus className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                            Create New Store
                            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                    </div>
                </div>
            </div>

            <main className="min-h-screen  py-8  ">
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
                                <p className="text-sm font-medium text-gray-700">{currentStore?.store_name ? `${currentStore.store_name} Status` : 'Store Status'}</p>
                                <p
                                    className={`text-lg font-semibold capitalize ${
                                        currentStore?.is_active === 1 ? 'text-green-600' : currentStore?.is_active === 0 ? 'text-red-600' : 'text-gray-600'
                                    }`}
                                >
                                    {currentStore?.is_active === 1 ? 'Active' : currentStore?.is_active === 0 ? 'Inactive' : 'Unknown'}
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
                                <p className="text-sm font-medium text-gray-700">Total Products</p>
                                <p className="text-lg font-semibold text-gray-900">TODO</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Current Store Details */}
                <section className="grid grid-cols-1 gap-6">
                    <div className="space-y-6">
                        {/* Store Info - Modern */}
                        <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-shadow duration-300 hover:shadow-sm">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-sm">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{currentStore?.store_name || 'Store Info'}</h3>
                                        <p className="text-sm text-gray-500">Store details and configuration</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ">
                                {/* Store Name */}
                                <div className="flex items-center space-x-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Store Name</p>
                                        <p className="text-lg font-semibold text-gray-900">{currentStore?.store_name || 'N/A'}</p>
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
                                        <p className="text-lg text-gray-900">{currentStore?.store_location || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center space-x-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <span
                                            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${getStatusColor(
                                                currentStore?.is_active === 1 ? 'active' : 'inactive'
                                            )}`}
                                        >
                                            {currentStore?.is_active === 1 ? 'Active' : currentStore?.is_active === 0 ? 'Inactive' : 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <AllStoreComponent />
                </section>
            </main>

            {/* Create Store Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        {/* Backdrop */}
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={handleCloseModal} />

                        {/* Modal Panel */}
                        <div className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-sm transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700">
                                        <Store className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Create New Store</h3>
                                        <p className="text-sm text-gray-500">Add a new store to your business</p>
                                    </div>
                                </div>
                                <button onClick={handleCloseModal} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleCreateStore} className="mt-6 space-y-6">
                                {/* Store Name */}
                                <div>
                                    <label htmlFor="store_name" className="mb-2 block text-sm font-medium text-gray-700">
                                        Store Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            id="store_name"
                                            name="store_name"
                                            value={formData.store_name}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Downtown Coffee Branch 1"
                                            required
                                            className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700">
                                        Store Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 456 Oak Avenue, Uptown Mall, City 67890"
                                            required
                                            rows={3}
                                            className="block w-full resize-none rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Store Phone (Optional) */}
                                <div>
                                    <label htmlFor="store_phone" className="mb-2 block text-sm font-medium text-gray-700">
                                        Store Phone <span className="text-xs text-gray-400">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                        <input
                                            type="tel"
                                            id="store_phone"
                                            name="store_phone"
                                            value={formData.store_phone}
                                            onChange={handleInputChange}
                                            placeholder="e.g., +1 (555) 123-4567"
                                            className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        disabled={isSubmitting}
                                        className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !formData.store_name.trim() || !formData.address.trim()}
                                        className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    />
                                                </svg>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Store className="mr-2 h-4 w-4" />
                                                Create Store
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreComponent;
