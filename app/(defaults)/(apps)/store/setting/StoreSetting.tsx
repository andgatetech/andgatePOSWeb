'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCreateProductAttributeMutation, useDeleteProductAttributeMutation, useUpdateProductAttributeMutation } from '@/store/features/attribute/attribute';
import { useGetStoreQuery, useUpdateStoreMutation } from '@/store/features/store/storeApi';
import { AlertCircle, CheckCircle, Loader2, Save, Settings, Store, X } from 'lucide-react';
import Swal from 'sweetalert2';

// Import Tab Components
import MobileStoreSettingFAB from './MobileStoreSettingFAB';
import StoreSettingTabs from './StoreSettingTabs';
import AttributesTab from './tabs/AttributesTab';
import BasicInfoTab from './tabs/BasicInfoTab';
import BrandingTab from './tabs/BrandingTab';
import LoyaltyProgramTab from './tabs/LoyaltyProgramTab';
import OperatingHoursTab from './tabs/OperatingHoursTab';
import StoreStatusTab from './tabs/StoreStatusTab';

import UnitsTab from './tabs/UnitsTab';
import WarrantyTypesTab from './tabs/WarrantyTypesTab';

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
        skip: !storeId,
    });
    const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();

    const [activeTab, setActiveTab] = useState('basic');
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
        units: [] as { name: string; is_active?: number | boolean }[],
    });

    const [logoFile, setLogoFile] = useState<any>(null);
    const [logoPreview, setLogoPreview] = useState<any>(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [unitName, setUnitName] = useState('');

    // Use store data directly instead of separate API calls
    const attributesData = storeData?.data?.product_attributes || [];
    const warrantyTypesData = storeData?.data?.warranty_types || [];

    // Keep mutation APIs for CRUD operations
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
                units: Array.isArray(store.units)
                    ? store.units.map((unit: any) => (typeof unit === 'string' ? { name: unit, is_active: 1 } : { name: unit.name || unit, is_active: unit.is_active ?? 1 }))
                    : [],
            });
        }
    }, [storeData]);

    const handleInputChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Units management functions
    const handleCreateUnit = async () => {
        if (!unitName.trim()) {
            setMessage({ type: 'error', text: 'Please enter unit name' });
            return;
        }
        if (!storeId || typeof storeId !== 'number') {
            setMessage({ type: 'error', text: 'No valid store selected. Cannot create unit.' });
            return;
        }

        try {
            // Get current units from store data
            const currentUnits = storeData?.data?.units || [];
            const unitsToSend = [
                ...currentUnits.map((u: any) => ({ id: u.id, name: u.name, is_active: u.is_active })),
                { name: unitName.trim(), is_active: true }, // New unit without ID
            ];

            await updateStore({
                updateData: { units: unitsToSend },
                storeId: storeId,
            }).unwrap();

            setUnitName('');
            setMessage({ type: 'success', text: 'Unit created successfully!' });
        } catch (error: any) {
            console.error('Create unit error:', error);
            const errorMessage = error?.data?.message || 'Failed to create unit';
            setMessage({ type: 'error', text: errorMessage });
        }
    };

    const handleUpdateUnit = async (id: number, name: string) => {
        if (!name.trim()) {
            setMessage({ type: 'error', text: 'Unit name cannot be empty' });
            return;
        }
        if (!storeId || typeof storeId !== 'number') {
            setMessage({ type: 'error', text: 'No valid store selected.' });
            return;
        }

        try {
            // Get current units and update the specific one
            const currentUnits = storeData?.data?.units || [];
            const unitsToSend = currentUnits.map((u: any) => ({
                id: u.id,
                name: u.id === id ? name.trim() : u.name,
                is_active: u.is_active,
            }));

            await updateStore({
                updateData: { units: unitsToSend },
                storeId: storeId,
            }).unwrap();

            setMessage({ type: 'success', text: 'Unit updated successfully!' });
        } catch (error: any) {
            console.error('Update unit error:', error);
            const errorMessage = error?.data?.message || 'Failed to update unit';
            setMessage({ type: 'error', text: errorMessage });
        }
    };

    const handleDeleteUnit = async (id: number, name: string) => {
        const result = await Swal.fire({
            title: 'Delete Unit?',
            text: `Are you sure you want to delete "${name}"? This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        if (!storeId || typeof storeId !== 'number') {
            setMessage({ type: 'error', text: 'No valid store selected.' });
            return;
        }

        try {
            // Get current units and filter out the deleted one
            const currentUnits = storeData?.data?.units || [];
            const unitsToSend = currentUnits.filter((u: any) => u.id !== id).map((u: any) => ({ id: u.id, name: u.name, is_active: u.is_active }));

            await updateStore({
                updateData: { units: unitsToSend },
                storeId: storeId,
            }).unwrap();

            setMessage({ type: 'success', text: 'Unit deleted successfully!' });
        } catch (error: any) {
            console.error('Delete unit error:', error);
            const errorMessage = error?.data?.message || 'Failed to delete unit. It may be in use by products.';
            setMessage({ type: 'error', text: errorMessage });
        }
    };

    const handleToggleUnitActive = async (id: number, isActive: boolean) => {
        if (!storeId || typeof storeId !== 'number') {
            setMessage({ type: 'error', text: 'No valid store selected.' });
            return;
        }

        try {
            // Get current units and update the is_active status
            const currentUnits = storeData?.data?.units || [];
            const unitsToSend = currentUnits.map((u: any) => ({
                id: u.id,
                name: u.name,
                is_active: u.id === id ? isActive : u.is_active,
            }));

            await updateStore({
                updateData: { units: unitsToSend },
                storeId: storeId,
            }).unwrap();

            setMessage({ type: 'success', text: 'Unit status updated successfully!' });
        } catch (error: any) {
            console.error('Toggle unit error:', error);
            const errorMessage = error?.data?.message || 'Failed to update unit status';
            setMessage({ type: 'error', text: errorMessage });
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

    const handleToggleAttributeActive = async (id: number, isActive: boolean) => {
        try {
            // Get current attribute
            const currentAttribute = attributesData.find((attr: any) => attr.id === id);
            if (!currentAttribute) {
                setMessage({ type: 'error', text: 'Attribute not found' });
                return;
            }

            await updateAttribute({
                id,
                name: currentAttribute.name,
                store_id: storeId,
                is_active: isActive ? 1 : 0, // Convert boolean to number
            }).unwrap();
            setMessage({ type: 'success', text: 'Attribute status updated successfully!' });
        } catch (error: any) {
            console.error('Toggle attribute error:', error);
            const errorMessage = error?.data?.message || 'Failed to update attribute status';
            setMessage({ type: 'error', text: errorMessage });
        }
    };

    const handleLogoChange = (e: any) => {
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
        const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const formatTimeToHi = (timeString: string) => {
        if (!timeString) return '';
        if (timeString.length === 5 && timeString.includes(':')) {
            return timeString;
        }
        const time = new Date(`1970-01-01T${timeString}`);
        if (isNaN(time.getTime())) return timeString;
        return time.toTimeString().slice(0, 5);
    };

    const handleSubmit = async (e: any) => {
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
        const updateData: any = { ...formData };
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
                storeId: storeId || undefined,
            }).unwrap();
            setMessage({ type: 'success', text: response.message || 'Store updated successfully!' });

            if (logoFile) {
                setLogoFile(null);
                setLogoPreview(null);
                const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = '';
                }
            }
        } catch (err: any) {
            console.error('Update error:', err);

            if (err?.data?.errors) {
                const errors = err.data.errors;
                const errorMessages: string[] = [];

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
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-600" />
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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'basic':
                return <BasicInfoTab formData={formData} handleInputChange={handleInputChange} />;
            case 'hours':
                return <OperatingHoursTab formData={formData} handleInputChange={handleInputChange} />;
            case 'units':
                return (
                    <UnitsTab
                        storeId={storeId}
                        unitsData={storeData?.data?.units || []}
                        unitName={unitName}
                        setUnitName={setUnitName}
                        handleCreateUnit={handleCreateUnit}
                        handleUpdateUnit={handleUpdateUnit}
                        handleDeleteUnit={handleDeleteUnit}
                        handleToggleUnitActive={handleToggleUnitActive}
                        setMessage={setMessage}
                    />
                );
            case 'attributes':
                return (
                    <AttributesTab
                        storeId={storeId}
                        attributesData={attributesData}
                        attributesLoading={isLoading}
                        attributeName={attributeName}
                        setAttributeName={setAttributeName}
                        handleCreateAttribute={handleCreateAttribute}
                        editingAttributeId={editingAttributeId}
                        editingAttributeName={editingAttributeName}
                        setEditingAttributeName={setEditingAttributeName}
                        startEditingAttribute={startEditingAttribute}
                        cancelEditingAttribute={cancelEditingAttribute}
                        handleUpdateAttribute={handleUpdateAttribute}
                        handleDeleteAttribute={handleDeleteAttribute}
                        handleToggleActive={handleToggleAttributeActive}
                    />
                );
            case 'warranty':
                return <WarrantyTypesTab storeId={storeId} warrantyTypesData={warrantyTypesData} warrantyTypesLoading={isLoading} setMessage={setMessage} />;
            case 'loyalty':
                return <LoyaltyProgramTab formData={formData} handleInputChange={handleInputChange} />;
            case 'branding':
                return <BrandingTab storeData={storeData} logoFile={logoFile} logoPreview={logoPreview} handleLogoChange={handleLogoChange} clearLogo={clearLogo} />;
            case 'status':
                return <StoreStatusTab formData={formData} handleInputChange={handleInputChange} />;
            default:
                return <BasicInfoTab formData={formData} handleInputChange={handleInputChange} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Section */}
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg">
                            <Settings className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{storeData?.data?.store_name || 'Store'} Settings</h1>
                            <p className="text-sm text-gray-500">Manage your store configuration and preferences</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert Messages */}
            {message.text && (
                <div
                    className={`mb-6 flex items-center space-x-3 rounded-xl border p-4 shadow-sm ${
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

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tabs Navigation */}
                <StoreSettingTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Tab Content */}
                <div className="min-h-[400px]">{renderTabContent()}</div>

                {/* Save Button */}
                <div className="flex justify-center pt-4">
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="group relative inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Mobile FAB */}
            <MobileStoreSettingFAB activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};

export default StoreSetting;
