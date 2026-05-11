import { getTranslation } from '@/i18n';
import type { FilterOptions } from '@/components/common/UniversalFilter';

export const ECOMMERCE_ORDER_STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'] as const;
export type EcommerceOrderStatus = (typeof ECOMMERCE_ORDER_STATUSES)[number];

export const ECOMMERCE_PAYMENT_STATUSES = ['pending', 'partial', 'paid', 'refunded', 'failed'] as const;
export type EcommercePaymentStatus = (typeof ECOMMERCE_PAYMENT_STATUSES)[number];

export const ECOMMERCE_PAYMENT_METHODS = ['cod', 'cash_on_delivery', 'cash', 'card', 'bkash', 'nagad', 'sslcommerz'] as const;

export const ECOMMERCE_ONE_STORE_CHECKOUT_MESSAGE = 'Please checkout products from one store at a time.';

export const ECOMMERCE_ORDER_TIMESTAMPS = [
    { key: 'reserved_at', label: 'Reserved' },
    { key: 'delivered_at', label: 'Stock deducted' },
    { key: 'cancelled_at', label: 'Reservation released' },
    { key: 'returned_at', label: 'Returned/restocked' },
] as const;

export const normalizeEcommerceOrderStatus = (status?: string): EcommerceOrderStatus | null => {
    const value = String(status || '').toLowerCase();
    if (value === 'processing') return 'packed';
    if (ECOMMERCE_ORDER_STATUSES.includes(value as EcommerceOrderStatus)) return value as EcommerceOrderStatus;
    return null;
};

export const getResponseItems = (response: any): any[] => {
    const data = response?.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(response?.items)) return response.items;
    return [];
};

export const getResponsePagination = (response: any) => {
    const data = response?.data;
    return data?.pagination || response?.pagination || response?.meta?.pagination;
};

export const formatApiError = (error: any, fallback = 'Something went wrong. Please try again.') => {
    const { t } = getTranslation();
    const status = error?.status;
    const body = error?.data;
    const messages: string[] = [];

    if (body?.message) messages.push(body.message);

    if (body?.errors && typeof body.errors === 'object') {
        Object.values(body.errors).forEach((value: any) => {
            if (Array.isArray(value)) messages.push(...value.map(String));
            else if (value) messages.push(String(value));
        });
    }

    const joinedMessages = messages.join(' ');
    if (status === 422 && /(multiple|different|more than one|single|one)\s+stores?/i.test(joinedMessages) && /(checkout|cart|order|store)/i.test(joinedMessages)) {
        return ECOMMERCE_ONE_STORE_CHECKOUT_MESSAGE;
    }

    if (messages.length > 0) return messages.join('<br />');

    if (status === 401) return t('ecommerce_error_401');
    if (status === 403) return t('ecommerce_error_403');
    if (status === 404) return t('ecommerce_error_404');
    if (status === 422) return t('ecommerce_error_422');
    if (status === 405) return t('ecommerce_error_405');

    return fallback === 'Something went wrong. Please try again.' ? t('ecommerce_error_generic') : fallback;
};

export const buildEcommerceFilterParams = (filters: FilterOptions, userStores: any[], additionalParams: Record<string, any> = {}) => {
    const params: Record<string, any> = { ...additionalParams };

    if (filters.search) params.search = filters.search.trim();

    if (filters.storeId !== undefined) {
        if (filters.storeId === 'all') {
            const ids = userStores.map((store: any) => store.id).filter(Boolean);
            if (ids.length === 1) params.store_id = ids[0];
            if (ids.length > 1) params.store_ids = ids.join(',');
        } else {
            params.store_id = filters.storeId;
        }
    }

    if (filters.dateRange && filters.dateRange.type !== 'none') {
        if (filters.dateRange.startDate) params.date_from = filters.dateRange.startDate;
        if (filters.dateRange.endDate) params.date_to = filters.dateRange.endDate;
    }

    Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === 'all' || params[key] === undefined || params[key] === null) {
            delete params[key];
        }
    });

    return params;
};

export const getStoreName = (store: any) => store?.store_name || store?.name || getEcommerceFallbackText();

export const getEcommerceFallbackText = () => {
    const { t } = getTranslation();
    return t('ecommerce_not_available');
};

export const getEcommerceStatusLabel = (status?: string) => {
    const { t } = getTranslation();
    const value = String(status || '').toLowerCase();

    const statusMap: Record<string, string> = {
        pending: t('ecommerce_status_pending'),
        confirmed: t('ecommerce_status_confirmed'),
        processing: t('ecommerce_status_packed'),
        packed: t('ecommerce_status_packed'),
        shipped: t('ecommerce_status_shipped'),
        delivered: t('ecommerce_status_delivered'),
        cancelled: t('ecommerce_status_cancelled'),
        returned: t('ecommerce_status_returned'),
        partial: t('ecommerce_status_partial'),
        paid: t('ecommerce_status_paid'),
        refunded: t('ecommerce_status_refunded'),
        completed: t('ecommerce_status_completed'),
        failed: t('ecommerce_status_failed'),
        active: t('ecommerce_status_enabled'),
        inactive: t('ecommerce_status_inactive'),
        rejected: t('ecommerce_status_rejected'),
        hidden: t('ecommerce_status_hidden'),
    };

    return statusMap[value] || status || getEcommerceFallbackText();
};

export const getEcommercePaymentMethodLabel = (value?: string) => {
    const { t } = getTranslation();
    const method = String(value || '').toLowerCase();

    const methodMap: Record<string, string> = {
        cod: t('ecommerce_payment_method_cod'),
        cash_on_delivery: t('ecommerce_payment_method_cash_on_delivery'),
        bkash: t('ecommerce_payment_method_bkash'),
        nagad: t('ecommerce_payment_method_nagad'),
        sslcommerz: t('ecommerce_payment_method_sslcommerz'),
        card: t('ecommerce_payment_method_card'),
        cash: t('ecommerce_payment_method_cash'),
    };

    return methodMap[method] || value || getEcommerceFallbackText();
};

export const getEcommerceSourceLabel = (source?: any) => {
    if (!source) return getEcommerceFallbackText();
    if (typeof source === 'string') return source;
    return source.name || source.slug || source.type || getEcommerceFallbackText();
};

export const getEcommerceRequestedStatusLabel = (value?: 'enable' | 'disable') => {
    const { t } = getTranslation();
    return value === 'disable' ? t('ecommerce_request_disable') : t('ecommerce_request_enable');
};

export const getProductName = (row: any) => row?.product_name || row?.name || row?.product?.product_name || row?.product?.name || row?.stock?.product?.product_name || 'N/A';

export const getSku = (row: any) => row?.sku || row?.stock?.sku || row?.product?.sku || row?.stock?.product?.sku || row?.barcode || 'N/A';

export const getCustomerLabel = (row: any) => {
    const customer = row?.customer || row?.ecommerce_customer || row?.parent_order?.customer || row?.parent_order?.ecommerce_customer || row?.order?.customer || row?.order?.ecommerce_customer;
    const name = customer?.name || customer?.customer_name || row?.customer_name || 'N/A';
    const phone = customer?.phone || customer?.mobile || customer?.mobile_number || row?.customer_phone;
    const email = customer?.email || row?.customer_email;

    return { name, phone, email };
};

export const statusBadgeClass = (status?: string) => {
    const value = String(status || '').toLowerCase();
    if (['active', 'visible', 'paid', 'completed', 'delivered'].includes(value)) return 'bg-green-200 text-green-900';
    if (['confirmed'].includes(value)) return 'bg-emerald-200 text-emerald-900';
    if (['pending'].includes(value)) return 'bg-amber-200 text-amber-900';
    if (['processing', 'packed', 'partial'].includes(value)) return 'bg-orange-200 text-orange-900';
    if (['shipped'].includes(value)) return 'bg-blue-200 text-blue-900';
    if (['returned'].includes(value)) return 'bg-violet-200 text-violet-900';
    if (['cancelled', 'rejected', 'failed', 'hidden', 'unpaid', 'due'].includes(value)) return 'bg-red-200 text-red-900';
    return 'bg-slate-200 text-slate-900';
};

export const visibilityLabel = (value?: string) => {
    const { t } = getTranslation();
    if (value === 'active') return t('ecommerce_visibility_visible');
    if (value === 'pending') return t('ecommerce_visibility_hidden');
    if (value === 'rejected') return t('ecommerce_visibility_rejected');
    return value || t('ecommerce_visibility_hidden');
};

export const resolveCurrentStoreGate = (stores: any[], params: Record<string, any>, currentStoreId?: number | null) => {
    const enabledStores = stores.filter((store) => Boolean(store.is_ecommerce_enabled));
    const selectedStoreId = params.store_id || (!params.store_ids ? currentStoreId : undefined);

    if (selectedStoreId) {
        const selectedStore = stores.find((store) => Number(store.id) === Number(selectedStoreId));
        if (selectedStore && !selectedStore.is_ecommerce_enabled) {
            return { blocked: true, store: selectedStore };
        }
    }

    if (params.store_ids && enabledStores.length === 0) {
        return { blocked: true, store: stores[0] };
    }

    if (!selectedStoreId && !params.store_ids && currentStoreId) {
        const currentStore = stores.find((store) => Number(store.id) === Number(currentStoreId));
        if (currentStore && !currentStore.is_ecommerce_enabled) {
            return { blocked: true, store: currentStore };
        }
    }

    return { blocked: false, store: null };
};
