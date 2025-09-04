'use client';
import React, { useState, useEffect } from 'react';

import { Store, MapPin, Phone, Clock, Percent, Gift, Camera, Save, AlertCircle, CheckCircle, Loader2, Upload, X } from 'lucide-react';
import { useGetStoreQuery, useUpdateStoreMutation } from '@/store/features/store/storeApi';
import Image from 'next/image';

const StoreSetting = () => {
    const { data: storeData, isLoading, error } = useGetStoreQuery();
    const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();

    const [formData, setFormData] = useState({
        store_name: '',
        store_location: '',
        store_contact: '',
        max_discount: '',
        opening_time: '',
        closing_time: '',
        loyalty_points_enabled: false,
        loyalty_points_rate: '',
        is_active: true,
    });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Clear messages after 5 seconds
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message.text]);

    // Populate form with existing data
    useEffect(() => {
        if (storeData?.data) {
            const store = storeData.data;
            setFormData({
                store_name: store.store_name || '',
                store_location: store.store_location || '',
                store_contact: store.store_contact || '',
                max_discount: store.max_discount || '',
                // Ensure time format is correct for HTML time input (HH:MM)
                opening_time: store.opening_time ? store.opening_time.slice(0, 5) : '',
                closing_time: store.closing_time ? store.closing_time.slice(0, 5) : '',
                loyalty_points_enabled: store.loyalty_points_enabled === 1,
                loyalty_points_rate: store.loyalty_points_rate || '',
                is_active: store.is_active === 1,
            });
        }
    }, [storeData]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type and size
            if (!file.type.startsWith('image/')) {
                setMessage({ type: 'error', text: 'Please select a valid image file' });
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                // 2MB
                setMessage({ type: 'error', text: 'Image size must be less than 2MB' });
                return;
            }

            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        const fileInput = document.getElementById('logo-upload');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // Helper function to format time to H:i format
    const formatTimeToHi = (timeString) => {
        if (!timeString) return '';
        // If it's already in H:i format, return as is
        if (timeString.length === 5 && timeString.includes(':')) {
            return timeString;
        }
        // Handle any other format and convert to H:i
        const time = new Date(`1970-01-01T${timeString}`);
        if (isNaN(time.getTime())) return timeString; // Return original if invalid
        return time.toTimeString().slice(0, 5); // Returns HH:mm format
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Basic validation
        if (!formData.store_name.trim()) {
            setMessage({ type: 'error', text: 'Store name is required' });
            return;
        }

        // Time validation
        if (formData.opening_time && formData.closing_time) {
            const openTime = new Date(`1970-01-01T${formData.opening_time}`);
            const closeTime = new Date(`1970-01-01T${formData.closing_time}`);

            if (openTime >= closeTime) {
                setMessage({ type: 'error', text: 'Opening time must be before closing time' });
                return;
            }
        }

        // Prepare update data with proper time formatting
        const updateData = { ...formData };

        // Format time fields to H:i format (e.g., "09:00")
        if (updateData.opening_time) {
            updateData.opening_time = formatTimeToHi(updateData.opening_time);
        }
        if (updateData.closing_time) {
            updateData.closing_time = formatTimeToHi(updateData.closing_time);
        }

        // Only include fields that have values (to avoid sending empty strings)
        Object.keys(updateData).forEach((key) => {
            if (updateData[key] === '' || updateData[key] === null) {
                delete updateData[key];
            }
        });

        if (logoFile) {
            updateData.logo = logoFile;
        }

        console.log('Sending update data:', updateData); // For debugging

        try {
            const response = await updateStore({ updateData }).unwrap();
            setMessage({ type: 'success', text: response.message || 'Store updated successfully!' });

            // Clear logo file after successful update
            if (logoFile) {
                setLogoFile(null);
                setLogoPreview(null);
                const fileInput = document.getElementById('logo-upload');
                if (fileInput) {
                    fileInput.value = '';
                }
            }
        } catch (err) {
            console.error('Update error:', err);

            // Handle validation errors
            if (err?.data?.errors) {
                const errors = err.data.errors;
                const errorMessages = [];

                Object.keys(errors).forEach((field) => {
                    if (Array.isArray(errors[field])) {
                        errorMessages.push(...errors[field]);
                    } else {
                        errorMessages.push(errors[field]);
                    }
                });

                setMessage({ type: 'error', text: errorMessages.join('. ') });
            } else {
                const errorMessage = err?.data?.error || err?.data?.message || 'Failed to update store';
                setMessage({ type: 'error', text: errorMessage });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-4">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800">Failed to load store data</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="flex items-center space-x-3 text-3xl font-bold text-gray-900">
                        <Store className="h-8 w-8 text-blue-600" />
                        <span>Store Settings</span>
                    </h1>
                    <p className="mt-2 text-gray-600">Manage your store information and preferences</p>
                </div>

                {/* Alert Messages */}
                {message.text && (
                    <div
                        className={`mb-6 flex items-center space-x-2 rounded-lg border p-4 ${
                            message.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                    >
                        {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        <span>{message.text}</span>
                        <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Main Form Container */}
                <div className="space-y-8">
                    {/* Store Information Card */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 flex items-center space-x-2 text-xl font-semibold text-gray-900">
                            <Store className="h-5 w-5 text-blue-600" />
                            <span>Store Information</span>
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Store Name *</label>
                                <input
                                    type="text"
                                    name="store_name"
                                    value={formData.store_name}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter store name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    <MapPin className="mr-1 inline h-4 w-4" />
                                    Store Location
                                </label>
                                <input
                                    type="text"
                                    name="store_location"
                                    value={formData.store_location}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter store address"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    <Phone className="mr-1 inline h-4 w-4" />
                                    Contact Number
                                </label>
                                <input
                                    type="tel"
                                    name="store_contact"
                                    value={formData.store_contact}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter contact number"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    <Percent className="mr-1 inline h-4 w-4" />
                                    Max Discount (%)
                                </label>
                                <input
                                    type="number"
                                    name="max_discount"
                                    value={formData.max_discount}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Store Hours Card */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 flex items-center space-x-2 text-xl font-semibold text-gray-900">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <span>Store Hours</span>
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Opening Time</label>
                                <input
                                    type="time"
                                    name="opening_time"
                                    value={formData.opening_time}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Closing Time</label>
                                <input
                                    type="time"
                                    name="closing_time"
                                    value={formData.closing_time}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Loyalty Program Card */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 flex items-center space-x-2 text-xl font-semibold text-gray-900">
                            <Gift className="h-5 w-5 text-blue-600" />
                            <span>Loyalty Program</span>
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="loyalty_points_enabled"
                                    name="loyalty_points_enabled"
                                    checked={formData.loyalty_points_enabled}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="loyalty_points_enabled" className="text-sm font-medium text-gray-700">
                                    Enable Loyalty Points Program
                                </label>
                            </div>

                            {formData.loyalty_points_enabled && (
                                <div className="mt-4">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Points Rate (%)</label>
                                    <input
                                        type="number"
                                        name="loyalty_points_rate"
                                        value={formData.loyalty_points_rate}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.1"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-transparent focus:ring-2 focus:ring-blue-500 md:w-64"
                                        placeholder="5.0"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Percentage of purchase amount converted to points</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Store Logo Card */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 flex items-center space-x-2 text-xl font-semibold text-gray-900">
                            <Camera className="h-5 w-5 text-blue-600" />
                            <span>Store Logo</span>
                        </h2>

                        <div className="space-y-4">
                            {/* Current Logo */}
                            {storeData?.data?.logo_path && !logoPreview && (
                                <div>
                                    <p className="mb-2 text-sm font-medium text-gray-700">Current Logo</p>
                                    <Image
                                        src={storeData.data.logo_path} // full URL is already returned from API
                                        alt="Current store logo"
                                        width={128} // required
                                        height={128} // required
                                        className="h-32 w-32 rounded-lg border border-gray-300 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Logo Preview */}
                            {logoPreview && (
                                <div>
                                    <p className="mb-2 text-sm font-medium text-gray-700">New Logo Preview</p>
                                    <div className="relative inline-block">
                                        <img src={logoPreview} alt="Logo preview" className="h-32 w-32 rounded-lg border border-gray-300 object-contain" />
                                        <button type="button" onClick={clearLogo} className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Upload Section */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Upload New Logo</label>
                                <div className="flex items-center space-x-4">
                                    <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} className="hidden" />
                                    <label htmlFor="logo-upload" className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Choose Image
                                    </label>
                                    <span className="text-sm text-gray-500">JPG, PNG, WEBP up to 2MB</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Store Status Card */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-xl font-semibold text-gray-900">Store Status</h2>

                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleInputChange}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                Store is Active
                            </label>
                        </div>
                        <p className="ml-7 mt-1 text-xs text-gray-500">Inactive stores will not be available for transactions</p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-6">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isUpdating}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreSetting;
