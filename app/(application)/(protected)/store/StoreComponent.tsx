'use client';
import SubscriptionError from '@/components/common/SubscriptionError';
import StoreFilter from '@/components/filters/StoreFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import useSubscriptionError from '@/hooks/useSubscriptionError';
import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useCreateTaxProfileMutation, useDeleteStoreMutation, useGetStoreQuery, useGetTaxProfilesQuery, useUpdateTaxProfileMutation } from '@/store/features/store/storeApi';
import { removeStore } from '@/store/features/auth/authSlice';
import { Plus, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import StoresTable from './components/StoresTable';

const StoreComponent = () => {
    const { t } = getTranslation();
    const dispatch = useDispatch();
    const router = useRouter();
    // Get current store from Redux
    const { currentStoreId, userStores } = useCurrentStore();

    // Fetch detailed store data from API for the current store only
    const {
        data: storeData,
        isLoading: isLoadingStore,
        error,
        refetch,
    } = useGetStoreQuery(currentStoreId ? { store_id: currentStoreId } : undefined, {
        refetchOnMountOrArgChange: 30,
        skip: !currentStoreId,
    });

    // Check for subscription errors
    const { hasSubscriptionError, subscriptionError } = useSubscriptionError(error);

    // Force refetch when store ID changes
    useEffect(() => {
        if (currentStoreId && refetch) {
            refetch();
        }
    }, [currentStoreId, refetch]);

    // Table State & Logic
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [deleteStore] = useDeleteStoreMutation();
    const { data: taxProfileData, refetch: refetchTaxProfiles } = useGetTaxProfilesQuery(currentStoreId ? { store_id: currentStoreId, only_active: true } : (undefined as any), { skip: !currentStoreId });
    const [createTaxProfile, { isLoading: isCreatingTaxProfile }] = useCreateTaxProfileMutation();
    const [updateTaxProfile, { isLoading: isUpdatingTaxProfile }] = useUpdateTaxProfileMutation();
    const activeTaxProfile = taxProfileData?.data?.[0] || null;
    const [vatForm, setVatForm] = useState({
        vat_status: 'not_registered',
        vat_invoice_type: 'regular_receipt',
        tax_label: 'VAT',
        registration_number: '',
        rate: '0',
        prices_include_tax: true,
        vat_commissionerate: '',
        vat_circle: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleFilterChange = useCallback((newApiParams: Record<string, any>) => {
        setApiParams(newApiParams);
    }, []);

    useEffect(() => {
        if (!activeTaxProfile) return;
        setVatForm({
            vat_status: activeTaxProfile.vat_status || 'not_registered',
            vat_invoice_type: activeTaxProfile.vat_invoice_type || 'regular_receipt',
            tax_label: activeTaxProfile.tax_label || 'VAT',
            registration_number: activeTaxProfile.registration_number || '',
            rate: String(activeTaxProfile.rate ?? '0'),
            prices_include_tax: Boolean(activeTaxProfile.prices_include_tax),
            vat_commissionerate: activeTaxProfile.vat_commissionerate || '',
            vat_circle: activeTaxProfile.vat_circle || '',
        });
    }, [activeTaxProfile]);

    const saveVatProfile = async () => {
        if (!currentStoreId) return;
        const payload = {
            store_id: currentStoreId,
            profile_name: 'Bangladesh VAT',
            tax_type: 'vat',
            tax_label: vatForm.tax_label,
            registration_number: vatForm.registration_number || null,
            rate: Number(vatForm.rate || 0),
            prices_include_tax: vatForm.prices_include_tax,
            is_active: true,
            vat_status: vatForm.vat_status,
            vat_invoice_type: vatForm.vat_invoice_type,
            vat_commissionerate: vatForm.vat_commissionerate || null,
            vat_circle: vatForm.vat_circle || null,
        };
        try {
            if (activeTaxProfile?.id) await updateTaxProfile({ id: activeTaxProfile.id, data: payload }).unwrap();
            else await createTaxProfile(payload).unwrap();
            showSuccessDialog('Saved', 'Bangladesh VAT profile saved.');
            refetchTaxProfiles?.();
        } catch (error: any) {
            showErrorDialog('Error', error?.data?.message || 'Failed to save VAT profile.');
        }
    };

    const handleDeleteStore = async (store: any) => {
        const confirmed = await showConfirmDialog(t('msg_are_you_sure'), `${t('msg_delete_store_confirm')} "${store.store_name}"? ${t('msg_cannot_be_undone')}`);

        if (confirmed) {
            try {
                await deleteStore(store.id).unwrap();
                dispatch(removeStore(store.id));
                showSuccessDialog(t('msg_deleted'), t('msg_store_deleted'));
            } catch (error) {
                showErrorDialog(t('msg_error'), t('msg_failed_delete_store'));
            }
        }
    };

    // Merge detailed API data for current store with Redux stores
    const allStores = useMemo(() => {
        const stores = [...userStores];

        // Replace current store with detailed API data if available
        if (storeData?.data?.store) {
            const apiStore = storeData.data.store;
            const index = stores.findIndex((s) => s.id === currentStoreId);
            if (index !== -1) {
                stores[index] = apiStore;
            }
        }

        return stores;
    }, [userStores, storeData, currentStoreId]);

    const filteredStores = useMemo(() => {
        let result = [...allStores];

        if (apiParams.status && apiParams.status !== 'all') {
            const statusFilter = apiParams.status;
            result = result.filter((store) => {
                const isActive = (store.is_active === true || store.is_active === 1 || store.is_active === '1') && !store.store_disabled;
                if (statusFilter === 'active') return isActive;
                if (statusFilter === 'inactive') return !isActive;
                return true;
            });
        }

        if (apiParams.search) {
            const searchLower = apiParams.search.toLowerCase();
            result = result.filter(
                (store) => (store.store_name && store.store_name.toLowerCase().includes(searchLower)) || (store.store_location && store.store_location.toLowerCase().includes(searchLower))
            );
        }

        if (sortField) {
            result.sort((a, b) => {
                const aValue = a[sortField];
                const bValue = b[sortField];
                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [allStores, apiParams, sortField, sortDirection]);

    const totalItems = filteredStores.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedStores = filteredStores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Show subscription error component if subscription middleware error occurs
    if (hasSubscriptionError) {
        return <SubscriptionError errorType={subscriptionError.errorType!} message={subscriptionError.message} details={subscriptionError.details} />;
    }

    if (isLoadingStore) {
        return <Loader message={t('msg_loading_stores')} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <Store className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('store_management_title')}</h1>
                        <p className="text-sm text-gray-500">{t('store_management_subtitle')}</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push('/store/create')}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-105"
                >
                    <Plus className="h-4 w-4" />
                    {t('store_create_new')}
                </button>
            </div>

            <div className="rounded-xl border border-sky-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Bangladesh VAT / BIN Setup</h2>
                        <p className="text-sm text-gray-500">Controls Mushak invoice mode, BIN snapshot, and default VAT calculation.</p>
                    </div>
                    <button onClick={saveVatProfile} disabled={isCreatingTaxProfile || isUpdatingTaxProfile} className="rounded-lg bg-[#046ca9] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                        {isCreatingTaxProfile || isUpdatingTaxProfile ? 'Saving...' : 'Save VAT Profile'}
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <select className="form-select" value={vatForm.vat_status} onChange={(e) => setVatForm((p) => ({ ...p, vat_status: e.target.value }))}>
                        <option value="not_registered">Not registered</option>
                        <option value="pending">Pending registration</option>
                        <option value="turnover_tax">Turnover tax</option>
                        <option value="vat_registered">VAT registered</option>
                        <option value="exempt">Exempt</option>
                    </select>
                    <select className="form-select" value={vatForm.vat_invoice_type} onChange={(e) => setVatForm((p) => ({ ...p, vat_invoice_type: e.target.value }))}>
                        <option value="regular_receipt">Regular receipt</option>
                        <option value="mushak_6_3">Mushak 6.3</option>
                        <option value="turnover_tax_invoice">Turnover tax invoice</option>
                        <option value="vat_exempt_invoice">VAT exempt invoice</option>
                    </select>
                    <input className="form-input" placeholder="BIN / VAT Reg No" value={vatForm.registration_number} onChange={(e) => setVatForm((p) => ({ ...p, registration_number: e.target.value }))} />
                    <input className="form-input" type="number" min="0" max="100" step="any" placeholder="Default VAT rate" value={vatForm.rate} onChange={(e) => setVatForm((p) => ({ ...p, rate: e.target.value }))} />
                    <input className="form-input" placeholder="Tax label" value={vatForm.tax_label} onChange={(e) => setVatForm((p) => ({ ...p, tax_label: e.target.value }))} />
                    <input className="form-input" placeholder="Commissionerate" value={vatForm.vat_commissionerate} onChange={(e) => setVatForm((p) => ({ ...p, vat_commissionerate: e.target.value }))} />
                    <input className="form-input" placeholder="VAT circle" value={vatForm.vat_circle} onChange={(e) => setVatForm((p) => ({ ...p, vat_circle: e.target.value }))} />
                    <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
                        <input type="checkbox" className="form-checkbox" checked={vatForm.prices_include_tax} onChange={(e) => setVatForm((p) => ({ ...p, prices_include_tax: e.target.checked }))} />
                        Prices include VAT
                    </label>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <StoreFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Table */}
            <StoresTable
                stores={paginatedStores}
                isLoading={isLoadingStore}
                onDelete={handleDeleteStore}
                pagination={{
                    currentPage,
                    totalPages,
                    itemsPerPage,
                    totalItems,
                    onPageChange: setCurrentPage,
                    onItemsPerPageChange: setItemsPerPage,
                }}
                sorting={{
                    field: sortField,
                    direction: sortDirection,
                    onSort: (field) => {
                        if (field === sortField) {
                            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                            setSortField(field);
                            setSortDirection('asc');
                        }
                    },
                }}
            />

        </div>
    );
};

export default StoreComponent;
