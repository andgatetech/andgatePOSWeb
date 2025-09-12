'use client';
import React, { useState, useEffect } from 'react';

import { Store, MapPin, Phone, Clock, Percent, Gift, Camera, Save, AlertCircle, CheckCircle, Loader2, Upload, X, Plus, Trash2, Package, Edit3, Check } from 'lucide-react';
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
        units: [],
    });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editingUnitIndex, setEditingUnitIndex] = useState(-1);

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
            const response = await updateStore({ updateData }).unwrap();
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                {/* Enhanced Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-100 p-4">
                        <Store className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900">Store Settings</h1>
                    <p className="mt-3 text-lg text-gray-600">Configure your store information and preferences</p>
                </div>

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
                    {/* Store Information Card - Enhanced */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                        <div className="mb-8 flex items-center space-x-3">
                            <div className="rounded-xl bg-blue-100 p-3">
                                <Store className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Store Information</h2>
                                <p className="text-gray-600">Basic details about your store</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                    <span>Store Name</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="store_name"
                                    value={formData.store_name}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    placeholder="Enter your store name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                    <MapPin className="h-4 w-4" />
                                    <span>Store Location</span>
                                </label>
                                <input
                                    type="text"
                                    name="store_location"
                                    value={formData.store_location}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    placeholder="Enter complete address"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                    <Phone className="h-4 w-4" />
                                    <span>Contact Number</span>
                                </label>
                                <input
                                    type="tel"
                                    name="store_contact"
                                    value={formData.store_contact}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                    <Percent className="h-4 w-4" />
                                    <span>Maximum Discount (%)</span>
                                </label>
                                <input
                                    type="number"
                                    name="max_discount"
                                    value={formData.max_discount}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    placeholder="Maximum allowed discount"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Store Hours Card - Enhanced */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                        <div className="mb-8 flex items-center space-x-3">
                            <div className="rounded-xl bg-purple-100 p-3">
                                <Clock className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Operating Hours</h2>
                                <p className="text-gray-600">Set your store's operating schedule</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Opening Time</label>
                                <input
                                    type="time"
                                    name="opening_time"
                                    value={formData.opening_time}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Closing Time</label>
                                <input
                                    type="time"
                                    name="closing_time"
                                    value={formData.closing_time}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                                />
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

                    {/* Enhanced Units Management Card */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="rounded-xl bg-green-100 p-3">
                                    <Package className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Units Management</h2>
                                    <p className="text-gray-600">Manage measurement units for products</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addUnit}
                                className="flex items-center space-x-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition-all hover:bg-green-700 focus:ring-4 focus:ring-green-200"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Add Unit</span>
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

                    {/* Loyalty Program Card - Enhanced */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                        <div className="mb-8 flex items-center space-x-3">
                            <div className="rounded-xl bg-yellow-100 p-3">
                                <Gift className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Loyalty Program</h2>
                                <p className="text-gray-600">Reward your customers with points</p>
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

                    {/* Store Logo Card - Enhanced */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                        <div className="mb-8 flex items-center space-x-3">
                            <div className="rounded-xl bg-pink-100 p-3">
                                <Camera className="h-6 w-6 text-pink-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Store Logo</h2>
                                <p className="text-gray-600">Upload your store's logo</p>
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
                                            <img src={logoPreview} alt="Logo preview" className="mx-auto h-40 w-40 rounded-xl border border-gray-300 bg-white object-contain" />
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

                    {/* Store Status Card - Enhanced */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                        <div className="mb-6 flex items-center space-x-3">
                            <div className={`rounded-xl p-3 ${formData.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
                                <Store className={`h-6 w-6 ${formData.is_active ? 'text-green-600' : 'text-red-600'}`} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Store Status</h2>
                                <p className="text-gray-600">Control your store's availability</p>
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

                    {/* Submit Button - Enhanced */}
                    <div className="flex justify-center pt-8">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-4 text-lg font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
                            <div className="relative flex items-center space-x-3">
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        <span>Updating Store...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-6 w-6" />
                                        <span>Save All Changes</span>
                                    </>
                                )}
                            </div>
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
            </div>
        </div>
    );
};

export default StoreSetting;
