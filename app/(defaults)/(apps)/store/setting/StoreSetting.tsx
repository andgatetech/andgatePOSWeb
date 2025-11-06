'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useCreateProductAttributeMutation, useDeleteProductAttributeMutation, useUpdateProductAttributeMutation } from '@/store/features/attribute/attribute';
import { useCreatePaymentMethodMutation, useDeletePaymentMethodMutation, useGetStoreQuery, useUpdatePaymentMethodMutation, useUpdateStoreMutation } from '@/store/features/store/storeApi';
import { AlertCircle, CheckCircle, Loader2, Save, Settings, Store, X } from 'lucide-react';

// Import Tab Components
import MobileStoreSettingFAB from './MobileStoreSettingFAB';
import StoreSettingTabs from './StoreSettingTabs';
import AttributesTab from './tabs/AttributesTab';
import BasicInfoTab from './tabs/BasicInfoTab';
import BrandingTab from './tabs/BrandingTab';
import LoyaltyProgramTab from './tabs/LoyaltyProgramTab';
import OperatingHoursTab from './tabs/OperatingHoursTab';
import PaymentMethodsTab, { PaymentMethodForm } from './tabs/PaymentMethodsTab';
import StoreStatusTab from './tabs/StoreStatusTab';

import UnitsTab from './tabs/UnitsTab';
import WarrantyTypesTab from './tabs/WarrantyTypesTab';

const createEmptyPaymentMethodForm = (): PaymentMethodForm => ({
    payment_method_name: '',
    payment_details_number: '',
    description: '',
    notes: '',
    is_active: true,
});

const VALID_SETTING_TABS = ['basic', 'hours', 'units', 'attributes', 'payment', 'warranty', 'loyalty', 'branding', 'status'] as const;

const StoreSetting = () => {
    const searchParams = useSearchParams();
    const { currentStore } = useCurrentStore();
    const storeId = currentStore?.id;
    const tabQuery = searchParams?.get('tab');

    // Get store ID from URL search params or fall back to current store
    const {
        data: storeData,
        isLoading,
        isFetching,
        error,
        refetch: refetchStore,
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
    const [paymentMethodForm, setPaymentMethodForm] = useState<PaymentMethodForm>(createEmptyPaymentMethodForm());
    const [editingPaymentMethodId, setEditingPaymentMethodId] = useState<number | null>(null);
    const [editingPaymentMethodForm, setEditingPaymentMethodForm] = useState<PaymentMethodForm>(createEmptyPaymentMethodForm());

    useEffect(() => {
        if (tabQuery && (VALID_SETTING_TABS as readonly string[]).includes(tabQuery)) {
            setActiveTab(tabQuery);
        }
    }, [tabQuery]);

    // Use store data directly instead of separate API calls
    const attributesData = storeData?.data?.product_attributes || [];
    const warrantyTypesData = storeData?.data?.warranty_types || [];

    const paymentMethods = useMemo(() => {
        const payload = storeData?.data?.payment_methods;
        return Array.isArray(payload) ? payload : [];
    }, [storeData]);

    // Keep mutation APIs for CRUD operations
    const [createAttribute] = useCreateProductAttributeMutation();
    const [updateAttribute] = useUpdateProductAttributeMutation();
    const [deleteAttribute] = useDeleteProductAttributeMutation();
    const [createPaymentMethod] = useCreatePaymentMethodMutation();
    const [updatePaymentMethodMutation] = useUpdatePaymentMethodMutation();
    const [deletePaymentMethodMutation] = useDeletePaymentMethodMutation();

    const [attributeName, setAttributeName] = useState('');
    const [editingAttributeId, setEditingAttributeId] = useState<number | null>(null);
    const [editingAttributeName, setEditingAttributeName] = useState('');

    const parseIsActive = (value: any) => value === true || value === 1 || value === '1' || value === 'true';

    const setNewPaymentMethodField = (field: keyof PaymentMethodForm, value: string | boolean) => {
        setPaymentMethodForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const setEditingPaymentMethodField = (field: keyof PaymentMethodForm, value: string | boolean) => {
        setEditingPaymentMethodForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const resetNewPaymentMethodForm = () => {
        setPaymentMethodForm(createEmptyPaymentMethodForm());
    };

    const startEditingPaymentMethod = (method: any) => {
        setEditingPaymentMethodId(method.id);
        setEditingPaymentMethodForm({
            payment_method_name: method.payment_method_name || '',
            payment_details_number: method.payment_details_number || '',
            description: method.description || '',
            notes: method.notes || '',
            is_active: parseIsActive(method.is_active),
        });
    };

    const cancelEditingPaymentMethod = () => {
        setEditingPaymentMethodId(null);
        setEditingPaymentMethodForm(createEmptyPaymentMethodForm());
    };

    // Clear messages after 5 seconds
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message.text]);

    useEffect(() => {
        setPaymentMethodForm(createEmptyPaymentMethodForm());
        setEditingPaymentMethodId(null);
        setEditingPaymentMethodForm(createEmptyPaymentMethodForm());
    }, [storeId]);

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
            showErrorDialog('Error', 'Please enter unit name');
            return;
        }
        if (!storeId || typeof storeId !== 'number') {
            showErrorDialog('Error', 'No valid store selected. Cannot create unit.');
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
            showSuccessDialog('Success!', 'Unit created successfully!');
        } catch (error: any) {
            console.error('Create unit error:', error);
            const errorMessage = error?.data?.message || 'Failed to create unit';
            showErrorDialog('Create Failed!', errorMessage);
        }
    };

    const handleUpdateUnit = async (id: number, name: string) => {
        if (!name.trim()) {
            showErrorDialog('Error', 'Unit name cannot be empty');
            return;
        }
        if (!storeId || typeof storeId !== 'number') {
            showErrorDialog('Error', 'No valid store selected.');
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

            showSuccessDialog('Updated!', 'Unit updated successfully!');
        } catch (error: any) {
            console.error('Update unit error:', error);
            const errorMessage = error?.data?.message || 'Failed to update unit';
            showErrorDialog('Update Failed!', errorMessage);
        }
    };

    const handleDeleteUnit = async (id: number, name: string) => {
        const confirmed = await showConfirmDialog('Delete Unit?', `Are you sure you want to delete "${name}"? This cannot be undone.`, 'Yes, delete it!', 'Cancel');

        if (!confirmed) return;

        if (!storeId || typeof storeId !== 'number') {
            showErrorDialog('Error', 'No valid store selected.');
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

            showSuccessDialog('Deleted!', 'Unit deleted successfully!');
        } catch (error: any) {
            console.error('Delete unit error:', error);
            const errorMessage = error?.data?.message || 'Failed to delete unit. It may be in use by products.';
            showErrorDialog('Delete Failed!', errorMessage);
        }
    };

    const handleToggleUnitActive = async (id: number, isActive: boolean) => {
        if (!storeId || typeof storeId !== 'number') {
            showErrorDialog('Error', 'No valid store selected.');
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

            showSuccessDialog('Updated!', 'Unit status updated successfully!');
        } catch (error: any) {
            console.error('Toggle unit error:', error);
            const errorMessage = error?.data?.message || 'Failed to update unit status';
            showErrorDialog('Update Failed!', errorMessage);
        }
    };

    // Product Attributes Management Functions
    const handleCreateAttribute = async () => {
        if (!attributeName.trim()) {
            showErrorDialog('Error', 'Please enter attribute name');
            return;
        }
        if (!storeId || typeof storeId !== 'number') {
            showErrorDialog('Error', 'No valid store selected. Cannot create attribute.');
            return;
        }
        const payload = { name: attributeName.trim(), store_id: storeId };
        try {
            await createAttribute(payload).unwrap();
            setAttributeName('');
            showSuccessDialog('Success!', 'Attribute created successfully!');
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to create attribute';
            showErrorDialog('Create Failed!', errorMessage);
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
            showErrorDialog('Error', 'Please enter attribute name');
            return;
        }

        try {
            await updateAttribute({ id, name: editingAttributeName.trim() }).unwrap();
            setEditingAttributeId(null);
            setEditingAttributeName('');
            showSuccessDialog('Updated!', 'Attribute updated successfully!');
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to update attribute';
            showErrorDialog('Update Failed!', errorMessage);
        }
    };

    const handleDeleteAttribute = async (id: number, name: string) => {
        const confirmed = await showConfirmDialog('Delete Attribute?', `Are you sure you want to delete "${name}"? This cannot be undone.`, 'Yes, delete it!', 'Cancel');

        if (!confirmed) return;

        try {
            await deleteAttribute(id).unwrap();
            showSuccessDialog('Deleted!', 'Attribute deleted successfully!');
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to delete attribute. It may be in use by products.';
            showErrorDialog('Delete Failed!', errorMessage);
        }
    };

    const handleToggleAttributeActive = async (id: number, isActive: boolean) => {
        try {
            // Get current attribute
            const currentAttribute = attributesData.find((attr: any) => attr.id === id);
            if (!currentAttribute) {
                showErrorDialog('Error', 'Attribute not found');
                return;
            }

            await updateAttribute({
                id,
                name: currentAttribute.name,
                store_id: storeId,
                is_active: isActive ? 1 : 0, // Convert boolean to number
            }).unwrap();
            showSuccessDialog('Updated!', 'Attribute status updated successfully!');
        } catch (error: any) {
            console.error('Toggle attribute error:', error);
            const errorMessage = error?.data?.message || 'Failed to update attribute status';
            showErrorDialog('Update Failed!', errorMessage);
        }
    };

    // Payment Methods Management Functions
    const handleCreatePaymentMethod = async () => {
        if (!paymentMethodForm.payment_method_name.trim()) {
            showErrorDialog('Error', 'Payment method name is required');
            return;
        }

        if (!storeId || typeof storeId !== 'number') {
            showErrorDialog('Error', 'No valid store selected. Cannot create payment method.');
            return;
        }

        try {
            const payload: any = {
                store_id: storeId,
                payment_method_name: paymentMethodForm.payment_method_name.trim(),
                description: paymentMethodForm.description?.trim() || null,
                notes: paymentMethodForm.notes?.trim() || null,
            };

            const trimmedReference = paymentMethodForm.payment_details_number.trim();
            if (trimmedReference) {
                payload.payment_details_number = trimmedReference;
            }

            await createPaymentMethod(payload).unwrap();

            showSuccessDialog('Success!', 'Payment method added successfully!');
            resetNewPaymentMethodForm();
            await refetchStore();
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to create payment method';
            showErrorDialog('Create Failed!', errorMessage);
        }
    };

    const handleUpdatePaymentMethod = async (id: number) => {
        if (!editingPaymentMethodForm.payment_method_name.trim()) {
            showErrorDialog('Error', 'Payment method name is required');
            return;
        }

        if (!storeId || typeof storeId !== 'number') {
            showErrorDialog('Error', 'No valid store selected. Cannot update payment method.');
            return;
        }

        try {
            const trimmedReference = editingPaymentMethodForm.payment_details_number.trim();

            await updatePaymentMethodMutation({
                id,
                data: {
                    store_id: storeId,
                    payment_method_name: editingPaymentMethodForm.payment_method_name.trim(),
                    payment_details_number: trimmedReference.length ? trimmedReference : null,
                    description: editingPaymentMethodForm.description?.trim() || null,
                    notes: editingPaymentMethodForm.notes?.trim() || null,
                    is_active: editingPaymentMethodForm.is_active ? 1 : 0,
                },
            }).unwrap();

            showSuccessDialog('Updated!', 'Payment method updated successfully!');
            cancelEditingPaymentMethod();
            await refetchStore();
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to update payment method';
            showErrorDialog('Update Failed!', errorMessage);
        }
    };

    const handleDeletePaymentMethod = async (id: number, name: string) => {
        if (!storeId || typeof storeId !== 'number') {
            showErrorDialog('Error', 'No valid store selected. Cannot delete payment method.');
            return;
        }

        const confirmed = await showConfirmDialog('Delete Payment Method?', `Are you sure you want to delete "${name}"? This cannot be undone.`, 'Yes, delete it!', 'Cancel');

        if (!confirmed) return;

        try {
            await deletePaymentMethodMutation({ id, store_id: storeId }).unwrap();
            showSuccessDialog('Deleted!', 'Payment method deleted successfully!');
            if (editingPaymentMethodId === id) {
                cancelEditingPaymentMethod();
            }
            await refetchStore();
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to delete payment method';
            showErrorDialog('Delete Failed!', errorMessage);
        }
    };

    const handleTogglePaymentMethodActive = async (id: number, isActive: boolean) => {
        if (!storeId || typeof storeId !== 'number') {
            showErrorDialog('Error', 'No valid store selected. Cannot update payment method status.');
            return;
        }

        const method = paymentMethods.find((pm: any) => pm.id === id);
        if (!method) {
            showErrorDialog('Error', 'Payment method not found');
            return;
        }

        try {
            await updatePaymentMethodMutation({
                id,
                data: {
                    store_id: storeId,
                    payment_method_name: method.payment_method_name,
                    payment_details_number: typeof method.payment_details_number === 'string' && method.payment_details_number.trim().length ? method.payment_details_number.trim() : null,
                    description: typeof method.description === 'string' && method.description.trim().length ? method.description.trim() : null,
                    notes: typeof method.notes === 'string' && method.notes.trim().length ? method.notes.trim() : null,
                    is_active: isActive ? 1 : 0,
                },
            }).unwrap();

            showSuccessDialog('Updated!', `Payment method ${isActive ? 'enabled' : 'disabled'} successfully!`);
            await refetchStore();
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to update payment method status';
            showErrorDialog('Update Failed!', errorMessage);
        }
    };

    const handleLogoChange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showErrorDialog('Error', 'Please select a valid image file');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                showErrorDialog('Error', 'Image size must be less than 2MB');
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
            showErrorDialog('Error', 'Store name is required');
            return;
        }

        // Time validation
        if (formData.opening_time && formData.closing_time) {
            const openTime = new Date(`1970-01-01T${formData.opening_time}`);
            const closeTime = new Date(`1970-01-01T${formData.closing_time}`);

            if (openTime >= closeTime) {
                showErrorDialog('Error', 'Opening time must be before closing time');
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
            showSuccessDialog('Success!', response.message || 'Store updated successfully!');

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

                showErrorDialog('Update Failed!', errorMessages.join('. '));
            } else {
                const errorMessage = err?.data?.error || err?.data?.message || 'Failed to update store';
                showErrorDialog('Update Failed!', errorMessage);
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
            case 'payment':
                return (
                    <PaymentMethodsTab
                        paymentMethods={paymentMethods}
                        isLoading={isLoading || isFetching}
                        newPaymentMethod={paymentMethodForm}
                        setNewPaymentMethodField={setNewPaymentMethodField}
                        handleCreatePaymentMethod={handleCreatePaymentMethod}
                        editingPaymentMethodId={editingPaymentMethodId}
                        editingPaymentMethod={editingPaymentMethodForm}
                        setEditingPaymentMethodField={setEditingPaymentMethodField}
                        startEditingPaymentMethod={startEditingPaymentMethod}
                        cancelEditingPaymentMethod={cancelEditingPaymentMethod}
                        handleUpdatePaymentMethod={handleUpdatePaymentMethod}
                        handleDeletePaymentMethod={handleDeletePaymentMethod}
                        handleTogglePaymentMethodActive={handleTogglePaymentMethodActive}
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
