'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCreateProductAttributeMutation, useDeleteProductAttributeMutation, useGetStoreAttributesQuery, useUpdateProductAttributeMutation } from '@/store/features/attribute/attribute';
import { useGetStoreQuery, useUpdateStoreMutation } from '@/store/features/store/storeApi';
import { AlertCircle, Building2, Camera, Check, CheckCircle, Clock, Edit3, Gift, Loader2, MapPin, Package, Percent, Phone, Plus, Save, Settings, Store, Tag, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import Swal from 'sweetalert2';

const StoreSetting = () => {
    const searchParams = useSearchParams();
    const { currentStore } = useCurrentStore();
    const storeId = currentStore?.id;

    // Get store ID from URL search params or fall back to current store
    const {
        data: storeData,
        isLoading,
        error,
    } = useGetStoreQuery(storeId ? { store_id: storeId } : undefined, {
        skip: !storeId, // Skip query if no store ID available
    });
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
        units: [] as { name: string }[],
    });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editingUnitIndex, setEditingUnitIndex] = useState(-1);

    // Store Attributes State & API
    const { data: attributesData, isLoading: attributesLoading } = useGetStoreAttributesQuery(storeId ? { store_id: storeId } : {}, {
        skip: !storeId, // Skip query if no store ID available
    });
    const [createAttribute] = useCreateProductAttributeMutation();
    const [updateAttribute] = useUpdateProductAttributeMutation();
    const [deleteAttribute] = useDeleteProductAttributeMutation();

    const [attributeName, setAttributeName] = useState('');
    const [editingAttributeId, setEditingAttributeId] = useState<number | null>(null);
    const [editingAttributeName, setEditingAttributeName] = useState('');

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
                opening_time: store.opening_time ? store.opening_time.slice(0, 5) : '',
                closing_time: store.closing_time ? store.closing_time.slice(0, 5) : '',
                loyalty_points_enabled: store.loyalty_points_enabled === 1,
                loyalty_points_rate: store.loyalty_points_rate || '',
                is_active: store.is_active === 1,
                // Fix units handling - convert string units to objects if needed
                units: Array.isArray(store.units) ? store.units.map((unit) => (typeof unit === 'string' ? { name: unit } : { name: unit.name || unit })) : [],
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

    // Enhanced Units management functions
    const addUnit = () => {
        setFormData((prev) => ({
            ...prev,
            units: [...prev.units, { name: '' }],
        }));
        // Auto-focus on the new unit input
        setTimeout(() => {
            setEditingUnitIndex(formData.units.length);
        }, 100);
    };

    const updateUnit = (index, name) => {
        setFormData((prev) => ({
            ...prev,
            units: prev.units.map((unit, i) => (i === index ? { ...unit, name } : unit)),
        }));
    };

    const removeUnit = (index) => {
        setFormData((prev) => ({
            ...prev,
            units: prev.units.filter((_, i) => i !== index),
        }));
        setEditingUnitIndex(-1);
    };

    const startEditingUnit = (index) => {
        setEditingUnitIndex(index);
    };

    const stopEditingUnit = () => {
        setEditingUnitIndex(-1);
    };

    const handleUnitKeyPress = (e, index) => {
        if (e.key === 'Enter') {
            stopEditingUnit();
        }
    };

    // Product Attributes Management Functions
    const handleCreateAttribute = async () => {
        if (!attributeName.trim()) {
            setMessage({ type: 'error', text: 'Please enter attribute name' });
            return;
        }
        if (!storeId || typeof storeId !== 'number') {
            setMessage({ type: 'error', text: 'No valid store selected. Cannot create attribute.' });
            return;
        }
        const payload = { name: attributeName.trim(), store_id: storeId };
        console.log('Creating attribute with payload:', payload);
        try {
            await createAttribute(payload).unwrap();
            setAttributeName('');
            setMessage({ type: 'success', text: 'Attribute created successfully!' });
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to create attribute';
            setMessage({ type: 'error', text: errorMessage });
        }
    };

    const startEditingAttribute = (id: number, name: string) => {
        setEditingAttributeId(id);
        setEditingAttributeName(name);
    };

    const cancelEditingAttribute = () => {
        setEditingAttributeId(null);
        setEditingAttributeName('');
    };

    const handleUpdateAttribute = async (id: number) => {
        if (!editingAttributeName.trim()) {
            setMessage({ type: 'error', text: 'Please enter attribute name' });
            return;
        }

        try {
            await updateAttribute({ id, name: editingAttributeName.trim() }).unwrap();
            setEditingAttributeId(null);
            setEditingAttributeName('');
            setMessage({ type: 'success', text: 'Attribute updated successfully!' });
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to update attribute';
            setMessage({ type: 'error', text: errorMessage });
        }
    };

    const handleDeleteAttribute = async (id: number, name: string) => {
        const result = await Swal.fire({
            title: 'Delete Attribute?',
            text: `Are you sure you want to delete "${name}"? This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                await deleteAttribute(id).unwrap();
                setMessage({ type: 'success', text: 'Attribute deleted successfully!' });
            } catch (error: any) {
                const errorMessage = error?.data?.message || 'Failed to delete attribute. It may be in use by products.';
                setMessage({ type: 'error', text: errorMessage });
            }
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setMessage({ type: 'error', text: 'Please select a valid image file' });
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
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

    const formatTimeToHi = (timeString) => {
        if (!timeString) return '';
        if (timeString.length === 5 && timeString.includes(':')) {
            return timeString;
        }
        const time = new Date(`1970-01-01T${timeString}`);
        if (isNaN(time.getTime())) return timeString;
        return time.toTimeString().slice(0, 5);
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

        // Units validation - filter out empty units
        const validUnits = formData.units.filter((unit) => unit.name && unit.name.trim()).map((unit) => ({ name: unit.name.trim() }));

        // Prepare update data
        const updateData = { ...formData };
        updateData.units = validUnits;

        if (updateData.opening_time) {
            updateData.opening_time = formatTimeToHi(updateData.opening_time);
        }
        if (updateData.closing_time) {
            updateData.closing_time = formatTimeToHi(updateData.closing_time);
        }

        // Clean empty fields
        Object.keys(updateData).forEach((key) => {
            if (key !== 'units' && (updateData[key] === '' || updateData[key] === null)) {
                delete updateData[key];
            }
        });

        if (logoFile) {
            updateData.logo = logoFile;
        }

        try {
            const response = await updateStore({
                updateData,
                storeId: storeId || undefined, // Include store ID in the update mutation
            }).unwrap();
            setMessage({ type: 'success', text: response.message || 'Store updated successfully!' });

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
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
                    <p className="mt-4 text-gray-600">Loading store settings...</p>
                </div>
            </div>
        );
    }

    if (!storeId) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
                    <Store className="mx-auto h-12 w-12 text-yellow-600" />
                    <h3 className="mt-4 text-lg font-semibold text-yellow-800">No Store Selected</h3>
                    <p className="mt-2 text-yellow-600">Please select a store to manage its settings</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
                    <h3 className="mt-4 text-lg font-semibold text-red-800">Failed to load store data</h3>
                    <p className="mt-2 text-red-600">Please try refreshing the page</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Title Section */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                            <Settings className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{storeData?.data?.store_name ? `${storeData.data.store_name} - Settings` : 'Store Settings'}</h1>
                            <p className="text-sm text-gray-500">{storeId ? `Configure settings for Store ID: ${storeId}` : 'Configure your store preferences and options'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="min-h-screen py-8">
                {/* Enhanced Alert Messages */}
                {message.text && (
                    <div
                        className={`mb-8 flex items-center space-x-3 rounded-xl border p-4 shadow-sm ${
                            message.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                    >
                        <div className={`rounded-full p-1 ${message.type === 'success' ? 'bg-green-200' : 'bg-red-200'}`}>
                            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        </div>
                        <span className="flex-1 font-medium">{message.text}</span>
                        <button onClick={() => setMessage({ type: '', text: '' })} className="rounded-full p-1 transition-colors hover:bg-gray-200/50">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Main Form Container */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Store Information Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-shadow duration-300 hover:shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-sm">
                                    <Store className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Store Information</h2>
                                    <p className="text-sm text-gray-500">Basic details about your store</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center space-x-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm text-gray-500">Store Name *</label>
                                    <input
                                        type="text"
                                        name="store_name"
                                        value={formData.store_name}
                                        onChange={handleInputChange}
                                        className="w-full border-0 bg-transparent p-0 text-lg font-semibold text-gray-900 focus:ring-0"
                                        placeholder="Enter store name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm text-gray-500">Store Location</label>
                                    <input
                                        type="text"
                                        name="store_location"
                                        value={formData.store_location}
                                        onChange={handleInputChange}
                                        className="w-full border-0 bg-transparent p-0 text-lg font-semibold text-gray-900 focus:ring-0"
                                        placeholder="Enter complete address"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm text-gray-500">Contact Number</label>
                                    <input
                                        type="tel"
                                        name="store_contact"
                                        value={formData.store_contact}
                                        onChange={handleInputChange}
                                        className="w-full border-0 bg-transparent p-0 text-lg font-semibold text-gray-900 focus:ring-0"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
                                    <Percent className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm text-gray-500">Max Discount (%)</label>
                                    <input
                                        type="number"
                                        name="max_discount"
                                        value={formData.max_discount}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        className="w-full border-0 bg-transparent p-0 text-lg font-semibold text-gray-900 focus:ring-0"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Store Hours Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-shadow duration-300 hover:shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 shadow-sm">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Operating Hours</h2>
                                    <p className="text-sm text-gray-500">Set your store operating schedule</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex items-center space-x-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm text-gray-500">Opening Time</label>
                                    <input
                                        type="time"
                                        name="opening_time"
                                        value={formData.opening_time}
                                        onChange={handleInputChange}
                                        className="w-full border-0 bg-transparent p-0 text-lg font-semibold text-gray-900 focus:ring-0"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm text-gray-500">Closing Time</label>
                                    <input
                                        type="time"
                                        name="closing_time"
                                        value={formData.closing_time}
                                        onChange={handleInputChange}
                                        className="w-full border-0 bg-transparent p-0 text-lg font-semibold text-gray-900 focus:ring-0"
                                    />
                                </div>
                            </div>
                        </div>

                        {formData.opening_time && formData.closing_time && (
                            <div className="mt-6 rounded-xl bg-purple-50 p-4">
                                <p className="text-center text-purple-800">
                                    <Clock className="mr-2 inline h-4 w-4" />
                                    Store Hours: {formData.opening_time} - {formData.closing_time}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Units Management Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-shadow duration-300 hover:shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 shadow-sm">
                                    <Package className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Units Management</h2>
                                    <p className="text-sm text-gray-500">Manage measurement units for products</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addUnit}
                                className="xs:w-auto group relative inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-green-700 hover:to-green-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:rounded-xl sm:px-6 sm:py-3 sm:text-base"
                            >
                                <Plus className="mr-1.5 h-4 w-4 transition-transform group-hover:scale-110 sm:mr-2 sm:h-5 sm:w-5" />
                                <span>Add Unit</span>
                                <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 transition-opacity group-hover:opacity-100 sm:rounded-xl" />
                            </button>
                        </div>

                        {/* Units Display */}
                        <div className="space-y-4">
                            {formData.units && formData.units.length > 0 ? (
                                <div className="space-y-3">
                                    {formData.units.map((unit, index) => (
                                        <div key={index} className="group rounded-xl border-2 border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-300 hover:bg-green-50">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 font-semibold text-green-600">{index + 1}</div>

                                                <div className="flex-1">
                                                    {editingUnitIndex === index ? (
                                                        <input
                                                            type="text"
                                                            value={unit.name || ''}
                                                            onChange={(e) => updateUnit(index, e.target.value)}
                                                            onBlur={stopEditingUnit}
                                                            onKeyPress={(e) => handleUnitKeyPress(e, index)}
                                                            className="w-full rounded-lg border border-green-300 bg-white px-3 py-2 text-lg font-medium transition-all focus:border-green-500 focus:ring-4 focus:ring-green-100"
                                                            placeholder="Enter unit name (e.g., kg, ltr, pcs)"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <div
                                                            onClick={() => startEditingUnit(index)}
                                                            className="cursor-pointer rounded-lg bg-white px-3 py-2 text-lg font-medium text-gray-800 transition-colors hover:bg-gray-100"
                                                        >
                                                            {unit.name || 'Click to edit...'}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {editingUnitIndex === index ? (
                                                        <button
                                                            type="button"
                                                            onClick={stopEditingUnit}
                                                            className="rounded-lg bg-green-500 p-2 text-white transition-colors hover:bg-green-600"
                                                            title="Save unit"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => startEditingUnit(index)}
                                                            className="rounded-lg bg-blue-500 p-2 text-white opacity-0 transition-all hover:bg-blue-600 group-hover:opacity-100"
                                                            title="Edit unit"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => removeUnit(index)}
                                                        className="rounded-lg bg-red-500 p-2 text-white opacity-0 transition-all hover:bg-red-600 group-hover:opacity-100"
                                                        title="Remove unit"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                                    <Package className="mx-auto h-16 w-16 text-gray-400" />
                                    <h3 className="mt-4 text-lg font-semibold text-gray-600">No Units Added</h3>
                                    <p className="mt-2 text-gray-500">Start by adding measurement units for your products</p>
                                    <button type="button" onClick={addUnit} className="mt-4 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition-all hover:bg-green-700">
                                        Add Your First Unit
                                    </button>
                                </div>
                            )}

                            {/* Units Info */}
                            {formData.units && formData.units.length > 0 && (
                                <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                        <div className="text-green-800">
                                            <h4 className="font-semibold">Units Usage Tips</h4>
                                            <ul className="mt-2 space-y-1 text-sm">
                                                <li>• These units will be available when adding products</li>
                                                <li>• Common examples: kg, gm, ltr, ml, pcs, dozen, box</li>
                                                <li>• Click on any unit to edit it</li>
                                                <li>• Keep unit names short and clear</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Attributes Management Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-shadow duration-300 hover:shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 shadow-md">
                                    <Tag className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Product Attributes</h2>
                                    <p className="text-sm text-gray-500">Manage product attributes like Color, Size, Material, etc.</p>
                                </div>
                            </div>
                        </div>

                        {/* Add New Attribute */}
                        <div className="mb-6 rounded-xl bg-purple-50 p-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700">Add New Attribute</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={attributeName}
                                    onChange={(e) => setAttributeName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleCreateAttribute()}
                                    placeholder="e.g., Color, Size, Material"
                                    className="flex-1 rounded-lg border border-purple-300 bg-white px-4 py-2.5 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                />
                                <button
                                    type="button"
                                    onClick={handleCreateAttribute}
                                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-2.5 font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Attributes List */}
                        <div className="space-y-3">
                            {attributesLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                                </div>
                            ) : attributesData?.data && attributesData.data.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {attributesData.data.map((attribute: any) => (
                                        <div
                                            key={attribute.id}
                                            className="group flex items-center justify-between rounded-xl border border-purple-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                                        >
                                            {editingAttributeId === attribute.id ? (
                                                <div className="flex flex-1 items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editingAttributeName}
                                                        onChange={(e) => setEditingAttributeName(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleUpdateAttribute(attribute.id)}
                                                        className="flex-1 rounded-lg border border-purple-300 px-3 py-1.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateAttribute(attribute.id)}
                                                        className="rounded-lg bg-green-600 p-2 text-white transition-colors hover:bg-green-700"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" onClick={cancelEditingAttribute} className="rounded-lg bg-gray-600 p-2 text-white transition-colors hover:bg-gray-700">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="rounded-lg bg-purple-100 p-2">
                                                            <Tag className="h-4 w-4 text-purple-600" />
                                                        </div>
                                                        <span className="font-medium text-gray-800">{attribute.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEditingAttribute(attribute.id, attribute.name)}
                                                            className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
                                                            title="Edit"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteAttribute(attribute.id, attribute.name)}
                                                            className="rounded-lg bg-red-600 p-2 text-white transition-colors hover:bg-red-700"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border-2 border-dashed border-purple-200 bg-purple-50 p-12 text-center">
                                    <Tag className="mx-auto h-12 w-12 text-purple-400" />
                                    <h3 className="mt-4 text-lg font-semibold text-purple-900">No Attributes Yet</h3>
                                    <p className="mt-2 text-purple-600">Add your first product attribute above</p>
                                </div>
                            )}
                        </div>

                        {/* Attributes Info */}
                        {attributesData?.data && attributesData.data.length > 0 && (
                            <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50 p-4">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                                    <div className="text-purple-800">
                                        <h4 className="font-semibold">Attributes Usage Tips</h4>
                                        <ul className="mt-2 space-y-1 text-sm">
                                            <li>• Use attributes to describe product variants (e.g., Color: Red, Blue)</li>
                                            <li>• Common attributes: Color, Size, Material, Weight, Flavor</li>
                                            <li>• You can assign multiple attributes to each product</li>
                                            <li>• Cannot delete attributes that are in use by products</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loyalty Program Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-shadow duration-300 hover:shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600 shadow-sm">
                                    <Gift className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Loyalty Program</h2>
                                    <p className="text-sm text-gray-500">Reward your customers with points</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 rounded-xl bg-gray-50 p-4">
                                <input
                                    type="checkbox"
                                    id="loyalty_points_enabled"
                                    name="loyalty_points_enabled"
                                    checked={formData.loyalty_points_enabled}
                                    onChange={handleInputChange}
                                    className="h-5 w-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                                />
                                <label htmlFor="loyalty_points_enabled" className="cursor-pointer text-lg font-semibold text-gray-700">
                                    Enable Loyalty Points Program
                                </label>
                            </div>

                            {formData.loyalty_points_enabled && (
                                <div className="animate-fade-in rounded-xl border border-yellow-200 bg-yellow-50 p-6">
                                    <label className="mb-3 block text-sm font-semibold text-gray-700">Points Rate (% of purchase amount)</label>
                                    <input
                                        type="number"
                                        name="loyalty_points_rate"
                                        value={formData.loyalty_points_rate}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.1"
                                        className="w-full max-w-md rounded-xl border border-yellow-300 px-4 py-3 text-lg transition-all focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100"
                                        placeholder="e.g., 5.0"
                                    />
                                    <p className="mt-2 text-sm text-yellow-700">For every 100 BDT spent, customer will earn BDT{formData.loyalty_points_rate || '0'} in points</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Store Logo Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-shadow duration-300 hover:shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-pink-600 shadow-sm">
                                    <Camera className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Store Logo</h2>
                                    <p className="text-sm text-gray-500">Upload your store logo</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            {/* Current/Preview Logo */}
                            <div className="space-y-4">
                                {storeData?.data?.logo_path && !logoPreview && (
                                    <div>
                                        <p className="mb-3 text-sm font-semibold text-gray-700">Current Logo</p>
                                        <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-6">
                                            <Image
                                                src={storeData.data.logo_path}
                                                alt="Current store logo"
                                                width={200}
                                                height={200}
                                                className="mx-auto h-40 w-40 rounded-xl border border-gray-300 bg-white object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {logoPreview && (
                                    <div>
                                        <p className="mb-3 text-sm font-semibold text-gray-700">New Logo Preview</p>
                                        <div className="relative rounded-2xl border-2 border-pink-200 bg-pink-50 p-6">
                                            <Image
                                                src={logoPreview}
                                                alt="Logo preview"
                                                width={160}
                                                height={160}
                                                className="mx-auto h-40 w-40 rounded-xl border border-gray-300 bg-white object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={clearLogo}
                                                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition-colors hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Upload Section */}
                            <div className="space-y-4">
                                <p className="text-sm font-semibold text-gray-700">Upload New Logo</p>

                                <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-all hover:border-pink-300 hover:bg-pink-50">
                                    <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} className="hidden" />
                                    <label htmlFor="logo-upload" className="cursor-pointer">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-4 text-lg font-semibold text-gray-600">Click to upload logo</p>
                                        <p className="mt-2 text-sm text-gray-500">JPG, PNG, WEBP up to 2MB</p>
                                        <div className="mt-4 inline-flex items-center rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-pink-700">
                                            <Upload className="mr-2 h-5 w-5" />
                                            Choose Image
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Store Status Card */}
                    <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-shadow duration-300 hover:shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${formData.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    <Store className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Store Status</h2>
                                    <p className="text-sm text-gray-500">Control your store availability</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-gray-50 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                        className="h-6 w-6 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <div>
                                        <label htmlFor="is_active" className="cursor-pointer text-lg font-semibold text-gray-700">
                                            Store is Active
                                        </label>
                                        <p className="text-sm text-gray-600">
                                            {formData.is_active
                                                ? 'Your store is currently active and available for transactions'
                                                : 'Your store is currently inactive and not available for transactions'}
                                        </p>
                                    </div>
                                </div>
                                <div className={`rounded-full px-4 py-2 text-sm font-semibold ${formData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {formData.is_active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-8">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="group relative inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                    Updating Store...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-3 h-6 w-6 transition-transform group-hover:scale-110" />
                                    Save All Changes
                                </>
                            )}
                            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                    </div>
                </form>

                {/* Footer Info */}
                <div className="mt-12 rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center">
                    <div className="flex items-center justify-center space-x-2 text-blue-800">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">Changes will be automatically saved and applied to your store immediately.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StoreSetting;
