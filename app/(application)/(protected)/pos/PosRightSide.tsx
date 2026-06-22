'use client';

import IconEye from '@/components/icon/icon-eye';
import IconPrinter from '@/components/icon/icon-printer';
import IconSave from '@/components/icon/icon-save';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { getTranslation } from '@/i18n';
import { saveOfflineOrder } from '@/lib/offline/offlineDb';
import { generateLocalInvoiceNumber, getDeviceId } from '@/lib/offline/offlineHelpers';
import { DEFAULT_PAYMENT_METHOD, getAllowedStatusesForMethod } from '@/lib/paymentConstants';
import { showConfirmDialog } from '@/lib/toast';
import type { RootState } from '@/store';
import { useCreateOrderMutation, useCreateOrderReturnMutation, useQuoteOrderMutation } from '@/store/features/Order/Order';
import { useQuoteOrderReturnMutation } from '@/store/features/Order/orderApi';
import type { QuoteOrderReturnResult } from '@/store/features/Order/orderApi';
import { queueOfflineOrder } from '@/store/features/offline/offlineOrdersSlice';
import {
    clearReturnSession,
    removeExchangeItem,
    selectExchangeItems,
    selectReturnItems,
    selectReturnReason,
    setReturnReason,
    updateExchangeItem,
    updateReturnQuantity,
} from '@/store/features/Order/OrderReturnSlice';
import { clearItemsRedux, removeItemRedux, updateItemRedux } from '@/store/features/Order/OrderSlice';
import type { Item } from '@/store/features/Order/OrderSlice';
import type { ExchangeItem, ReturnItem } from '@/store/features/Order/OrderReturnSlice';
import { useCreateCustomerMutation, useGetStoreCustomersListQuery } from '@/store/features/customer/customer';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import CashPaymentSection from './pos-right-side/CashPaymentSection';
import CustomerSection from './pos-right-side/CustomerSection';
import LoadingOverlay from './pos-right-side/LoadingOverlay';
import OrderDetailsSection from './pos-right-side/OrderDetailsSection';
import PaymentSummarySection from './pos-right-side/PaymentSummarySection';
import PreviewModal from './pos-right-side/PreviewModal';
import CouponInput from './pos-right-side/CouponInput';
import SplitPaymentModal from './pos-right-side/SplitPaymentModal';
import type { Customer, CustomerApiResponse, PosFormData, SplitPayment } from './pos-right-side/types';
import { MEMBERSHIP_DISCOUNTS } from './pos-right-side/types';
import ReturnQuotePreviewModal from '@/components/pos/ReturnQuotePreviewModal';


export interface PosRightSideProps {
    mode?: 'pos' | 'return';
    reduxSlice?: 'pos' | 'orderReturn';
    orderId?: number;
    originalOrder?: any;
}

const EMPTY_ARRAY: Item[] = [];
type InvoiceLineItem = Item | ExchangeItem | (ReturnItem & { quantity: number; isReturnItem: true });

const canonicalPaymentMethodName = (name?: string) => {
    const normalized = String(name || '').trim().toLowerCase();
    if (normalized === 'mfc' || normalized === 'mfs' || normalized === 'mobile financial service') return 'Nagad';
    if (normalized === 'bkash') return 'bKash';
    if (normalized === 'nagad') return 'Nagad';
    if (normalized === 'rocket') return 'Rocket';
    if (normalized === 'upay') return 'Upay';
    if (normalized === 'bank_transfer' || normalized === 'bank transfer') return 'Bank Transfer';
    if (normalized === 'cash') return 'Cash';
    if (normalized === 'card') return 'Card';
    return String(name || '').trim();
};

const paymentMethodKey = (name?: string) => canonicalPaymentMethodName(name).toLowerCase();

const PosRightSide: React.FC<PosRightSideProps> = ({ mode = 'pos', reduxSlice = 'pos', orderId, originalOrder }) => {
    const { t } = getTranslation();
    const { formatNumber, formatCurrency } = useCurrency();
    const dispatch = useDispatch();
    const router = useRouter();
    const { currentStoreId, currentStore } = useCurrentStore();
    const isOnline = useOnlineStatus();

    const isReturnMode = mode === 'return';

    // Select items based on reduxSlice
    // Select raw data from Redux
    const returnItemsData = useSelector((state: RootState) => selectReturnItems(currentStoreId)(state));
    const exchangeItemsData = useSelector((state: RootState) => selectExchangeItems(currentStoreId)(state));
    const returnReasonData = useSelector((state: RootState) => selectReturnReason(currentStoreId)(state));
    const posItemsData = useSelector((state: RootState) => (currentStoreId && state.invoice.itemsByStore ? state.invoice.itemsByStore[currentStoreId] || EMPTY_ARRAY : EMPTY_ARRAY));

    // Memoize invoice items to prevent new references on every render
    const invoiceItems = useMemo((): InvoiceLineItem[] => {
        if (reduxSlice === 'orderReturn') {
            // In return mode, combine original order items (returnItems) with new exchange items
            // Map return items to match Item interface
            const mappedReturns = returnItemsData.map((item) => ({
                ...item,
                // In return mode, quantity means "how many units to return".
                quantity: item.returnQuantity,
                amount: item.rate * item.returnQuantity,
                isReturnItem: true,
            }));

            // Return items come first, then exchange items
            return [...mappedReturns, ...exchangeItemsData];
        }
        return posItemsData;
    }, [reduxSlice, returnItemsData, exchangeItemsData, posItemsData]);

    const totalQty = useMemo(() => invoiceItems.reduce((sum, item) => sum + (item.quantity || 0), 0), [invoiceItems]);

    // Return items from original order (for return mode)
    const returnItems = useMemo(() => {
        if (isReturnMode) {
            return returnItemsData;
        }
        return [];
    }, [isReturnMode, returnItemsData]);

    const searchInputRef = useRef<HTMLDivElement | null>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const quoteRequestSeqRef = useRef(0);

    const [customerSearch, setCustomerSearch] = useState('');
    const [searchParams, setSearchParams] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [orderResponse, setOrderResponse] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [autoPrint, setAutoPrint] = useState<'invoice' | 'receipt' | null>(null);
    const postActionRef = useRef<'invoice' | 'receipt'>('invoice');
    const [returnPreviewSnapshot, setReturnPreviewSnapshot] = useState<any>(null);
    const [quotePreview, setQuotePreview] = useState<any>(null);

    const [formData, setFormData] = useState<PosFormData>({
        customerId: null,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        discount: 0,
        membershipDiscount: 0,
        paymentMethod: '',
        paymentStatus: '',
        usePoints: false,
        useBalance: false,
        pointsToUse: 0,
        balanceToUse: 0,
        useWholesale: false,
        amountPaid: 0,
        changeAmount: 0,
        partialPaymentAmount: 0,
        dueAmount: 0,
        isSplitPayment: false,
        splitPayments: [],
        couponCode: '',
        couponDiscount: 0,
        couponId: null,
    });
    const [showSplitModal, setShowSplitModal] = useState(false);

    const [isManualCustomerEntry, setIsManualCustomerEntry] = useState(false);
    const showManualCustomerForm = isManualCustomerEntry || !!selectedCustomer;

    const [createOrder] = useCreateOrderMutation();
    const [quoteOrder] = useQuoteOrderMutation();
    const [createOrderReturn] = useCreateOrderReturnMutation();
    const [quoteOrderReturn] = useQuoteOrderReturnMutation();
    const [createCustomer] = useCreateCustomerMutation();
    const [loading, setLoading] = useState(false);
    const [returnQuotePreview, setReturnQuotePreview] = useState<QuoteOrderReturnResult | null>(null);
    const [pendingReturnData, setPendingReturnData] = useState<any>(null);
    const [showReturnQuoteModal, setShowReturnQuoteModal] = useState(false);

    // Return reasons from store settings (for return mode)
    const returnReasons = useMemo(() => {
        const store = currentStore as any;
        // Check both possible keys
        const storeReasons = store?.return_reasons || store?.order_return_reasons;

        if (storeReasons && Array.isArray(storeReasons) && storeReasons.length > 0) {
            return storeReasons;
        }
        // No defaults - must be configured in settings
        return [];
    }, [currentStore]);

    // Calculate return totals (for return mode)
    // Value of items being returned
    const returnTotal = useMemo(() => {
        if (!isReturnMode) return 0;
        return returnItems.reduce((sum: number, item: any) => sum + item.rate * item.returnQuantity, 0);
    }, [isReturnMode, returnItems]);

    // Value of NEW exchange items only (not kept items from original order)
    const newItemsTotal = useMemo(() => {
        if (!isReturnMode) return 0;
        return exchangeItemsData.reduce((sum: number, item: any) => sum + item.amount, 0);
    }, [isReturnMode, exchangeItemsData]);

    // Net transaction for this return:
    // Positive = Customer pays extra (exchange with more expensive items)
    // Negative = Store refunds customer (pure return or exchange with cheaper items)
    const returnNetAmount = useMemo(() => {
        return newItemsTotal - returnTotal;
    }, [newItemsTotal, returnTotal]);

    // Initialize customer from original order in return mode
    // Initialize customer from original order in return mode
    useEffect(() => {
        // Using formData.customerId as initialization check to prevent loop
        if (isReturnMode && originalOrder && !formData.customerId) {
            if (originalOrder.customer) {
                setSelectedCustomer(originalOrder.customer);
            }

            setFormData((prev) => {
                const newState = { ...prev };

                if (originalOrder.customer) {
                    newState.customerId = originalOrder.customer.id;
                    newState.customerName = originalOrder.customer.name || '';
                    newState.customerEmail = originalOrder.customer.email || '';
                    newState.customerPhone = originalOrder.customer.phone || '';
                } else if (originalOrder.is_walk_in) {
                    newState.customerId = 'walk-in';
                }

                // Default payment settings
                const incomingMethod = originalOrder.payment?.payment_method;

                if (incomingMethod) {
                    const lowerMethod = incomingMethod.toLowerCase();
                    if (lowerMethod === 'cash') {
                        newState.paymentMethod = 'cash';
                    } else {
                        // Try to find matching store method to get correct casing
                        const storeMethods = Array.isArray(currentStore?.payment_methods) ? currentStore.payment_methods : [];
                        const matched = storeMethods.find((m: any) => m.payment_method_name?.toLowerCase() === lowerMethod);
                        newState.paymentMethod = matched ? matched.payment_method_name : incomingMethod;
                    }
                } else if (!newState.paymentMethod) {
                    newState.paymentMethod = 'cash'; // Default to Cash
                }

                if (!newState.paymentStatus) newState.paymentStatus = 'paid';

                return newState;
            });
        }
    }, [isReturnMode, originalOrder, formData.customerId, currentStore]);

    // Handle return quantity change
    const handleReturnQuantityChange = (itemId: number, newQuantity: number) => {
        if (!currentStoreId) return;
        dispatch(updateReturnQuantity({ storeId: currentStoreId, itemId, quantity: newQuantity }));
    };

    const showMessage = (msg = '', type: 'success' | 'error' = 'success') => {
        if (type === 'success') {
            toast.success(msg, {
                duration: 3000,
                position: 'top-center',
                style: {
                    background: '#10b981',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#10b981',
                },
            });
        } else {
            toast.error(msg, {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
        }
    };

    const getMembershipBadgeClass = (membership?: string) => {
        switch ((membership || 'normal').toLowerCase()) {
            case 'platinum':
                return 'bg-purple-100 text-purple-800';
            case 'gold':
                return 'bg-yellow-100 text-yellow-800';
            case 'silver':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-green-100 text-green-800';
        }
    };

    const getMembershipDiscount = (membership?: string) => {
        const key = (membership || 'normal').toLowerCase() as keyof typeof MEMBERSHIP_DISCOUNTS;
        return MEMBERSHIP_DISCOUNTS[key] ?? 0;
    };

    const getDisplayUnit = (unit?: string) => (unit && unit.toLowerCase() !== 'piece' ? unit : t('lbl_piece'));

    // Use payment methods from Redux (loaded during login) - no API call needed
    const paymentMethodOptions = useMemo<any[]>(() => {
        const methods = Array.isArray(currentStore?.payment_methods) ? currentStore.payment_methods : [];
        const activeMethods = methods.filter((method: any) => {
            if (!method) return false;
            const status = method.is_active;
            if (status === undefined || status === null) return true;
            if (typeof status === 'boolean') return status;
            if (typeof status === 'number') return status === 1;
            if (typeof status === 'string') {
                const normalized = status.toLowerCase();
                return normalized === '1' || normalized === 'true';
            }
            return true;
        }).map((method: any) => ({
            ...method,
            payment_method_name: canonicalPaymentMethodName(method.payment_method_name),
        }));

        if (activeMethods.length === 0) {
            return [DEFAULT_PAYMENT_METHOD];
        }

        const uniqueMethods = activeMethods.filter((method: any, index: number, list: any[]) => (
            list.findIndex((item: any) => paymentMethodKey(item.payment_method_name) === paymentMethodKey(method.payment_method_name)) === index
        ));

        // Cash must always be available regardless of store configuration.
        const hasCash = uniqueMethods.some((m: any) => paymentMethodKey(m.payment_method_name) === 'cash');
        return hasCash ? uniqueMethods : [{ ...DEFAULT_PAYMENT_METHOD, payment_method_name: 'Cash' }, ...uniqueMethods];
    }, [currentStore?.payment_methods]);

    // When going offline, lock payment method to Cash + status to paid
    useEffect(() => {
        if (!isOnline) {
            const cashMethod = paymentMethodOptions.find(
                (m: any) => m.payment_method_name?.toLowerCase() === 'cash'
            );
            const cashName = cashMethod?.payment_method_name || DEFAULT_PAYMENT_METHOD.payment_method_name;
            setFormData((prev) => ({
                ...prev,
                paymentMethod: cashName,
                paymentStatus: 'paid',
            }));
        }
    }, [isOnline, paymentMethodOptions]);

    // Payment statuses from Redux (can be used for payment status dropdown)
    const paymentStatusOptions = useMemo(() => {
        const statuses = Array.isArray(currentStore?.payment_statuses) ? currentStore.payment_statuses : [];
        return statuses.filter((status: any) => {
            if (!status) return false;
            const active = status.is_active;
            if (active === undefined || active === null) return true;
            if (typeof active === 'boolean') return active;
            if (typeof active === 'number') return active === 1;
            return true;
        });
    }, [currentStore?.payment_statuses]);

    const {
        data: customersResponse,
        isLoading: isSearching,
        error,
        refetch,
    } = useGetStoreCustomersListQuery(
        {
            store_id: currentStoreId || undefined,
            search: searchParams || '',
        },
        {
            skip: !currentStoreId,
        }
    );

    const customers: Customer[] = useMemo(() => {
        const response = customersResponse as CustomerApiResponse;
        // Handle both legacy (data: Customer[]) and new (data: { items: Customer[] }) formats
        if (response?.data) {
            if (Array.isArray(response.data)) {
                return response.data;
            }
            if ('items' in response.data && Array.isArray(response.data.items)) {
                return response.data.items;
            }
        }
        return [];
    }, [customersResponse]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setCustomerSearch(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (query.trim()) {
                setSearchParams(query.trim());
                setShowSearchResults(true);
            } else {
                setSearchParams('');
                setShowSearchResults(false);
            }
        }, 300);
    };

    useEffect(() => {
        if (searchParams) {
            setShowSearchResults(true);
        }
    }, [customers, searchParams]);

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsManualCustomerEntry(false);
        setCustomerSearch(customer.name);
        setShowSearchResults(false);
        setSearchParams('');

        setFormData((prev) => ({
            ...prev,
            customerId: customer.id,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            membershipDiscount: getMembershipDiscount(customer.membership),
            usePoints: false,
            useBalance: false,
            pointsToUse: 0,
            balanceToUse: 0,
        }));
    };

    const clearCustomerSelection = () => {
        setSelectedCustomer(null);
        setIsManualCustomerEntry(false);
        setCustomerSearch('');
        setShowSearchResults(false);
        setSearchParams('');
        setFormData((prev) => ({
            ...prev,
            customerId: null,
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            membershipDiscount: 0,
            usePoints: false,
            useBalance: false,
            pointsToUse: 0,
            balanceToUse: 0,
        }));
    };

    const handleWalkInCustomerSelect = () => {
        clearCustomerSelection();
        setFormData((prev) => ({
            ...prev,
            customerId: 'walk-in',
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            paymentStatus: 'paid', // Auto-set to paid for walk-in
        }));
    };

    const handleClearWalkInCustomer = () => {
        setFormData((prev) => ({
            ...prev,
            customerId: null,
        }));
    };

    const handleNewCustomerClick = () => {
        setIsManualCustomerEntry((prev) => {
            const next = !prev;

            if (next) {
                setSelectedCustomer(null);
                setCustomerSearch('');
                setShowSearchResults(false);
                setSearchParams('');
            }

            setFormData((prevForm) => ({
                ...prevForm,
                customerId: null,
                customerName: '',
                customerEmail: '',
                customerPhone: '',
                membershipDiscount: 0,
                usePoints: false,
                useBalance: false,
                pointsToUse: 0,
                balanceToUse: 0,
            }));

            return next;
        });
    };

    const handleCustomerSearchFocus = () => {
        if (customers.length > 0) {
            setShowSearchResults(true);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const checkReturnReasons = async () => {
        if (returnReasons.length === 0) {
            const result = await Swal.fire({
                title: t('pos_no_return_reasons_title'),
                text: t('pos_no_return_reasons_text'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: t('pos_go_to_settings'),
                cancelButtonText: t('btn_cancel'),
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#d1d5db',
            });

            if (result.isConfirmed) {
                router.push('/store/setting?tab=returnreasons');
            }
            return false;
        }
        return true;
    };

    const handleRemoveItem = async (itemId: number) => {
        if (!currentStoreId) return;

        if (reduxSlice === 'orderReturn') {
            const item = invoiceItems.find((i: any) => i.id === itemId);
            // Check if this is an original order item (has isReturnItem flag) or exchange item
            if (item && (item as any).isReturnItem) {
                dispatch(updateReturnQuantity({ storeId: currentStoreId, itemId, quantity: 0 }));
            } else {
                // This is an exchange item - remove normally
                dispatch(removeExchangeItem({ storeId: currentStoreId, id: itemId }));
            }
        } else {
            dispatch(removeItemRedux({ storeId: currentStoreId, id: itemId }));
        }
    };

    const handleItemWholesaleToggle = (itemId: number) => {
        const item = invoiceItems.find((line) => line.id === itemId);
        if (!item) return;

        const newIsWholesale = !item.isWholesale;
        const newRate = newIsWholesale ? item.wholesalePrice || item.regularPrice || item.rate : item.regularPrice || item.rate;

        if (!currentStoreId) return;
        if (reduxSlice === 'orderReturn') {
            dispatch(
                updateExchangeItem({
                    storeId: currentStoreId,
                    item: {
                        ...item,
                        isWholesale: newIsWholesale,
                        rate: newRate,
                        amount: item.quantity * newRate,
                    },
                })
            );
        } else {
            dispatch(
                updateItemRedux({
                    storeId: currentStoreId,
                    item: {
                        ...item,
                        isWholesale: newIsWholesale,
                        rate: newRate,
                        amount: item.quantity * newRate,
                    },
                })
            );
        }
    };

    const handleQuantityChange = async (itemId: number, value: string) => {
        const item = invoiceItems.find((line) => line.id === itemId);
        if (!item) return;

        if (value === '') {
            if (!currentStoreId) return;
            if (reduxSlice === 'orderReturn') {
                // Check if original order item
                if ('orderItemId' in item) {
                    dispatch(updateReturnQuantity({ storeId: currentStoreId, itemId, quantity: 0 }));
                } else {
                    dispatch(updateExchangeItem({ storeId: currentStoreId, item: { ...item, quantity: 0, amount: 0 } }));
                }
            } else {
                dispatch(updateItemRedux({ storeId: currentStoreId, item: { ...item, quantity: 0, amount: 0 } }));
            }
            return;
        }

        const newQuantity = Number(value);

        if (Number.isNaN(newQuantity) || newQuantity < 0) return;

        if (item.PlaceholderQuantity && newQuantity > item.PlaceholderQuantity) {
            showMessage(`${t('msg_max_qty')} ${formatNumber(item.PlaceholderQuantity)}`, 'error');
            return;
        }

        if (!currentStoreId) return;
        if (reduxSlice === 'orderReturn') {
            // Check if this is an original order item
            if ((item as any).isReturnItem) {
                const originalQty = (item as any).originalQuantity || 0;
                dispatch(updateReturnQuantity({ storeId: currentStoreId, itemId, quantity: Math.max(0, Math.min(newQuantity, originalQty)) }));
            } else {
                // Exchange item - normal behavior
                dispatch(
                    updateExchangeItem({
                        storeId: currentStoreId,
                        item: {
                            ...item,
                            quantity: newQuantity,
                            amount: item.rate * newQuantity,
                        },
                    })
                );
            }
        } else {
            dispatch(
                updateItemRedux({
                    storeId: currentStoreId,
                    item: {
                        ...item,
                        quantity: newQuantity,
                        amount: item.rate * newQuantity,
                    },
                })
            );
        }
    };

    const handleQuantityBlur = (itemId: number) => {
        const item = invoiceItems.find((line) => line.id === itemId);
        if (!item) return;

        if (item.quantity === 0) {
            if (!currentStoreId) return;
            if (reduxSlice === 'orderReturn') {
                // Check if this is an original order item
                if ((item as any).isReturnItem) {
                    // Original order items with quantity 0 are fully returned - don't reset them
                    // The quantity 0 means all items are marked for return, which is valid
                    return;
                }
                // Only reset exchange items to 1 when they have 0 quantity
                dispatch(
                    updateExchangeItem({
                        storeId: currentStoreId,
                        item: {
                            ...item,
                            quantity: 1,
                            amount: item.rate * 1,
                        },
                    })
                );
            } else {
                dispatch(
                    updateItemRedux({
                        storeId: currentStoreId,
                        item: {
                            ...item,
                            quantity: 1,
                            amount: item.rate * 1,
                        },
                    })
                );
            }
        }
    };

    const handleUnitPriceChange = (itemId: number, value: string) => {
        const item = invoiceItems.find((line) => line.id === itemId);
        if (!item) return;

        if (value === '') {
            if (!currentStoreId) return;
            if (reduxSlice === 'orderReturn') {
                dispatch(updateExchangeItem({ storeId: currentStoreId, item: { ...item, rate: 0, amount: 0 } }));
            } else {
                dispatch(updateItemRedux({ storeId: currentStoreId, item: { ...item, rate: 0, amount: 0 } }));
            }
            return;
        }

        const newRate = Number(value);
        if (Number.isNaN(newRate) || newRate < 0) return;

        if (!currentStoreId) return;
        if (reduxSlice === 'orderReturn') {
            dispatch(
                updateExchangeItem({
                    storeId: currentStoreId,
                    item: {
                        ...item,
                        rate: newRate,
                        amount: item.quantity * newRate,
                    },
                })
            );
        } else {
            dispatch(
                updateItemRedux({
                    storeId: currentStoreId,
                    item: {
                        ...item,
                        rate: newRate,
                        amount: item.quantity * newRate,
                    },
                })
            );
        }
    };

    const handleUnitPriceBlur = (itemId: number) => {
        const item = invoiceItems.find((line) => line.id === itemId);
        if (!item) return;

        if (item.quantity === 0) {
            if (!currentStoreId) return;
            dispatch(
                updateItemRedux({
                    storeId: currentStoreId,
                    item: {
                        ...item,
                        quantity: 1,
                        amount: item.rate * 1,
                    },
                })
            );
        }
    };

    const calculateItemTax = (item: any) => {
        if (!item.tax_rate) return 0;

        const itemTotal = item.rate * item.quantity;
        const taxRate = item.tax_rate / 100;

        if (item.tax_included) {
            return itemTotal - itemTotal / (1 + taxRate);
        }

        return itemTotal * taxRate;
    };

    const calculateTax = () => {
        return invoiceItems.reduce((total, item) => {
            return total + calculateItemTax(item);
        }, 0);
    };

    const calculateSubtotalWithoutTax = () => {
        return invoiceItems.reduce((total, item) => {
            const itemTotal = item.rate * item.quantity;
            if (item.tax_included && item.tax_rate) {
                const taxRate = item.tax_rate / 100;
                return total + itemTotal / (1 + taxRate);
            }
            return total + itemTotal;
        }, 0);
    };

    const calculateDiscount = () => (calculateSubtotalWithoutTax() * formData.discount) / 100;

    const calculateMembershipDiscount = () => (calculateSubtotalWithoutTax() * formData.membershipDiscount) / 100;

    const calculateBaseTotal = () => calculateSubtotalWithoutTax() + calculateTax() - calculateDiscount() - calculateMembershipDiscount();

    const calculatePointsDiscount = () => {
        return 0;
    };

    const calculateBalanceDiscount = () => {
        return 0;
    };

    const calculateTotal = () => {
        return Math.max(0, calculateBaseTotal());
    };

    const quotePayload = useMemo(() => {
        if (isReturnMode || !currentStoreId || invoiceItems.length === 0 || (!formData.paymentMethod && !formData.isSplitPayment) || !formData.paymentStatus) {
            return null;
        }

        // Don't fire a quote with an invalid partial amount — backend would reject it.
        // This happens transiently when switching payment method resets partialPaymentAmount to 0.
        if (formData.paymentStatus === 'partial' && !(formData.partialPaymentAmount > 0)) {
            return null;
        }

        const isCash = formData.paymentMethod.toLowerCase() === 'cash';
        const amountPaid =
            formData.paymentStatus === 'paid'
                ? isCash ? formData.amountPaid : calculateTotal()
                : formData.paymentStatus === 'partial'
                  ? formData.partialPaymentAmount
                  : 0;

        return {
            store_id: currentStoreId,
            customer_id: typeof formData.customerId === 'number' ? formData.customerId : undefined,
            payment_method: formData.isSplitPayment ? 'Split' : formData.paymentMethod,
            payment_status: formData.paymentStatus,
            discount: calculateDiscount() + calculateMembershipDiscount(),
            points_to_redeem: selectedCustomer && formData.usePoints ? formData.pointsToUse : 0,
            balance_to_redeem: selectedCustomer && formData.useBalance ? formData.balanceToUse : 0,
            amount_paid: amountPaid,
            items: invoiceItems.map((item) => ({
                product_id: item.productId,
                stock_id: item.stockId,
                quantity: item.quantity,
                unit_price: item.rate,
                unit: item.unit || 'piece',
                discount: 0,
                serial_ids: item.has_serial && item.serials?.length ? item.serials.map((serial: any) => serial.id) : undefined,
            })),
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentStoreId,
        formData.amountPaid,
        formData.balanceToUse,
        formData.customerId,
        formData.discount,
        formData.membershipDiscount,
        formData.partialPaymentAmount,
        formData.paymentMethod,
        formData.paymentStatus,
        formData.pointsToUse,
        formData.useBalance,
        formData.usePoints,
        invoiceItems,
        isReturnMode,
        selectedCustomer,
    ]);

    const quoteTotals = !isReturnMode && quotePreview?.totals ? quotePreview.totals : null;
    const backendSubtotal = Number(quoteTotals?.total ?? calculateSubtotalWithoutTax());
    const backendTax = Number(quoteTotals?.tax ?? calculateTax());
    const backendDiscount = Number(quoteTotals?.discount ?? calculateDiscount() + calculateMembershipDiscount());
    const backendGrandTotal = Number(quoteTotals?.grand_total ?? calculateTotal());
    const backendPointsDiscount = Number(quoteTotals?.loyalty_points_value ?? (formData.usePoints ? formData.pointsToUse : 0));
    const backendBalanceDiscount = Number(quoteTotals?.account_balance_redeemed ?? (formData.useBalance ? formData.balanceToUse : 0));
    const membershipDiscountAmount = calculateMembershipDiscount();
    const displayedMembershipDiscount = selectedCustomer && formData.membershipDiscount > 0 ? Math.min(membershipDiscountAmount, backendDiscount) : 0;
    const displayedOrderDiscount = Math.max(0, backendDiscount - displayedMembershipDiscount);

    useEffect(() => {
        if (!quotePayload) {
            setQuotePreview(null);
            return;
        }

        const requestSeq = quoteRequestSeqRef.current + 1;
        quoteRequestSeqRef.current = requestSeq;

        const timeout = setTimeout(async () => {
            try {
                const response = await quoteOrder(quotePayload).unwrap();
                if (quoteRequestSeqRef.current === requestSeq) {
                    setQuotePreview(response.data || response);
                }
            } catch {
                if (quoteRequestSeqRef.current === requestSeq) {
                    setQuotePreview(null);
                }
            }
        }, 350);

        return () => clearTimeout(timeout);
    }, [quoteOrder, quotePayload]);

    useEffect(() => {
        // Update due amount based on payment status and partial payment
        if (formData.paymentStatus === 'due') {
            setFormData((prev) => ({
                ...prev,
                dueAmount: backendGrandTotal,
                partialPaymentAmount: 0,
            }));
        } else if (formData.paymentStatus === 'partial') {
            const total = backendGrandTotal;
            const paid = formData.partialPaymentAmount || 0;
            setFormData((prev) => ({
                ...prev,
                dueAmount: Math.max(0, total - paid),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                dueAmount: 0,
            }));
        }
    }, [backendGrandTotal, formData.paymentStatus, formData.partialPaymentAmount, invoiceItems, formData.discount, formData.usePoints, formData.pointsToUse, formData.useBalance, formData.balanceToUse]);

    useEffect(() => {
        const total = backendGrandTotal;
        const change = formData.amountPaid - total;
        setFormData((prev) => ({
            ...prev,
            changeAmount: change > 0 ? change : 0,
        }));
    }, [backendGrandTotal, formData.amountPaid, invoiceItems, formData.discount, formData.usePoints, formData.pointsToUse, formData.useBalance, formData.balanceToUse]);

    const handleWholesaleToggle = (checked: boolean) => {
        // Global wholesale toggle removed - now using per-item control
        // This function kept for compatibility but does nothing
    };

    const clearAllItems = async () => {
        const isConfirmed = await showConfirmDialog(t('msg_confirm_delete_title'), t('pos_clear_items_confirm'), t('pos_yes_clear'), t('btn_cancel'));

        if (isConfirmed && currentStoreId) {
            if (reduxSlice === 'orderReturn') {
                dispatch(clearReturnSession(currentStoreId));
            } else {
                dispatch(clearItemsRedux(currentStoreId));
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData((prev) => ({
                ...prev,
                [name]: checked,
                ...(name === 'usePoints' && !checked ? { pointsToUse: 0 } : {}),
                ...(name === 'useBalance' && !checked ? { balanceToUse: 0 } : {}),
            }));
        } else {
            let processedValue: any = value;

            if (name === 'discount') {
                processedValue = Number(value);
            } else if (name === 'pointsToUse') {
                const maxPoints = Number(selectedCustomer?.points) || 0;
                processedValue = Math.min(Number(value), maxPoints);
            } else if (name === 'balanceToUse') {
                const maxBalance = parseFloat(String(selectedCustomer?.balance ?? '0'));
                processedValue = Math.min(Number(value), maxBalance);
            } else if (name === 'amountPaid') {
                processedValue = Number(value) || 0;
            } else if (name === 'partialPaymentAmount') {
                processedValue = Number(value) || 0;
            } else if (name === 'paymentMethod') {
                // When method changes, auto-reset status and clear any active split
                const allowedStatuses = getAllowedStatusesForMethod(value);
                setFormData((prev) => ({
                    ...prev,
                    paymentMethod: value,
                    paymentStatus: allowedStatuses.includes(prev.paymentStatus) ? prev.paymentStatus : allowedStatuses[0] ?? '',
                    partialPaymentAmount: 0,
                    dueAmount: 0,
                    isSplitPayment: false,
                    splitPayments: [],
                }));
                return;
            } else if (name === 'paymentStatus') {
                // Reset partial payment amount when changing status
                setFormData((prev) => ({
                    ...prev,
                    paymentStatus: value,
                    partialPaymentAmount: 0,
                    dueAmount: value === 'due' ? backendGrandTotal : 0,
                }));
                return;
            }

            setFormData((prev) => ({
                ...prev,
                [name]: processedValue,
            }));
        }
    };

    const handleSubmit = async () => {
        // Validation: Customer Check
        // If not walk-in and no customer selected/entered (checking customerId null and name/phone empty)
        if (formData.customerId !== 'walk-in' && !formData.customerId && (!formData.customerName.trim() || !formData.customerPhone.trim())) {
            showMessage(t('pos_select_customer_or_walk_in'), 'error');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Validation: Manual Customer Details - Name and Phone are required, email is optional
        if (formData.customerId !== 'walk-in' && !formData.customerId) {
            if (!formData.customerName.trim()) {
                showMessage(t('msg_customer_name_required'), 'error');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            if (!formData.customerPhone.trim()) {
                showMessage(t('msg_customer_phone_required'), 'error');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            // Email validation only if provided
            if (formData.customerEmail.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.customerEmail)) {
                    showMessage(t('msg_valid_email_required'), 'error');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
            }
        }

        if (invoiceItems.length === 0) {
            showMessage(t('msg_at_least_one_item_required'), 'error');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const invalidItems = invoiceItems.filter((item) => !item.productId || item.quantity <= 0);
        if (invalidItems.length > 0) {
            showMessage(t('msg_select_products_set_quantities'), 'error');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        let freshQuoteData = quotePreview;
        if (!isOnline) {
            // Offline: skip quote API, use local computed totals
            freshQuoteData = null;
        } else {
            try {
                if (quotePayload) {
                    setLoading(true);
                    const freshQuote = await quoteOrder(quotePayload).unwrap();
                    freshQuoteData = freshQuote?.data || freshQuote;
                    setQuotePreview(freshQuoteData);
                }
            } catch (err: any) {
                const message =
                    err?.status === 422 && err?.data?.errors
                        ? Object.values(err.data.errors).flat().join('\n')
                        : err?.data?.message || err?.data?.error || err?.error || t('msg_failed_create_order');
                showMessage(message, 'error');
                setLoading(false);
                return;
            }
        }

        const freshTotals = freshQuoteData?.totals || {};
        const freshPayment = freshQuoteData?.payment || {};
        const grandTotal = Number(freshTotals.grand_total ?? backendGrandTotal);
        const orderTax = Number(freshTotals.tax ?? backendTax);
        const orderDiscount = Number(freshTotals.discount ?? backendDiscount);
        const orderSubtotal = Number(freshTotals.total ?? backendSubtotal);
        setLoading(false);

        // Validation: Split Payment — rows must sum to grand total
        if (formData.isSplitPayment) {
            if (formData.splitPayments.length < 2) {
                showMessage('Split payment requires at least 2 payment methods.', 'error');
                return;
            }
            const splitSum = formData.splitPayments.reduce((s, p) => s + p.amount, 0);
            if (Math.abs(splitSum - grandTotal) > 0.01) {
                showMessage(`Split payment total (${splitSum.toFixed(2)}) must equal order total (${grandTotal.toFixed(2)}).`, 'error');
                return;
            }
        }

        // Validation: Cash Payment Amount Received
        if (!formData.isSplitPayment && formData.paymentStatus === 'paid' && formData.paymentMethod.toLowerCase() === 'cash') {
            if (!formData.amountPaid || formData.amountPaid <= 0) {
                showMessage(t('msg_enter_amount_received'), 'error');
                // You might want to scroll to the specific section, but top is safe
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            // Optional: Check if amount is enough? usually 'paid' implies full payment
            if (formData.amountPaid < grandTotal) {
                showMessage(t('msg_amount_received_less_total'), 'error');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
        }

        // Validation for partial payment
        if (formData.paymentStatus === 'partial') {
            if (!formData.partialPaymentAmount || formData.partialPaymentAmount <= 0) {
                showMessage(t('msg_enter_partial_payment_amount'), 'error');
                return;
            }
            if (formData.partialPaymentAmount >= grandTotal) {
                // Use already calculated grandTotal
                showMessage(t('msg_partial_payment_less_than_total'), 'error');
                return;
            }
        }

        // Calculate amount paid based on payment status
        let actualAmountPaid = 0;
        let actualChangeAmount = 0;
        let dueAmount = 0;

        if (formData.paymentStatus === 'paid') {
            // For paid status, use amountPaid for cash or full amount for other methods
            actualAmountPaid = Number(freshPayment.amount_paid ?? (formData.paymentMethod.toLowerCase() === 'cash' ? formData.amountPaid : grandTotal));
            actualChangeAmount = Number(freshPayment.change_amount ?? (formData.paymentMethod.toLowerCase() === 'cash' ? formData.changeAmount : 0));
            dueAmount = 0;
        } else if (formData.paymentStatus === 'partial') {
            // For partial, use the partial payment amount
            actualAmountPaid = Number(freshPayment.amount_paid ?? formData.partialPaymentAmount);
            actualChangeAmount = 0;
            dueAmount = Number(freshPayment.due_amount ?? grandTotal - formData.partialPaymentAmount);
        } else if (formData.paymentStatus === 'due') {
            // For due, no amount paid
            actualAmountPaid = 0;
            actualChangeAmount = 0;
            dueAmount = Number(freshPayment.due_amount ?? grandTotal);
        }

        const orderData: any = {
            store_id: currentStoreId,
            payment_status: formData.paymentStatus,
            ...(formData.isSplitPayment
                ? { payments: formData.splitPayments, payment_method: 'Split' }
                : { payment_method: formData.paymentMethod }),
            tax: orderTax,
            discount: orderDiscount,
            total: orderSubtotal,
            grand_total: grandTotal,
            amount_paid: actualAmountPaid,
            change_amount: actualChangeAmount,
            due_amount: dueAmount,
            points_to_redeem: selectedCustomer && formData.usePoints ? formData.pointsToUse : 0,
            balance_to_redeem: selectedCustomer && formData.useBalance ? formData.balanceToUse : 0,
            ...(formData.couponCode ? { coupon_code: formData.couponCode } : {}),
            items: invoiceItems.map((item) => {
                const itemBasePrice = item.rate * item.quantity;
                const itemTax = calculateItemTax(item);
                const itemSubtotal = item.tax_included && item.tax_rate ? itemBasePrice : itemBasePrice + itemTax;

                const orderItem: any = {
                    product_id: item.productId,
                    stock_id: item.stockId, // Include stock_id for variants
                    quantity: item.quantity,
                    unit_price: item.rate,
                    unit: item.unit || 'piece',
                    discount: 0,
                    tax: item.tax_rate || 0,
                    tax_included: item.tax_included || false,
                    subtotal: itemSubtotal,
                };

                // Include serial numbers if present
                if (item.has_serial && item.serials && item.serials.length > 0) {
                    orderItem.serial_ids = item.serials.map((s: any) => s.id);
                }

                // Include warranty if present
                if (item.has_warranty && item.warranty) {
                    orderItem.warranty_id = item.warranty.id;
                    orderItem.activate_warranty = true; // Flag to activate warranty on invoice creation
                }

                return orderItem;
            }),
        };

        if (formData.customerId === 'walk-in') {
            orderData.customer_id = null;
            orderData.is_walk_in = true;
        } else if (formData.customerId && formData.customerId !== 'walk-in') {
            orderData.customer_id = formData.customerId;
            orderData.is_walk_in = false;
        } else {
            // Create customer instantly if new customer data is provided
            if (!isOnline) {
                orderData.customer_id = null;
                orderData.is_walk_in = false;
                orderData.customer_name = formData.customerName.trim();
                orderData.customer_number = formData.customerPhone?.trim() || null;
                orderData.customer_email = formData.customerEmail?.trim() || null;
            } else {
                try {
                const newCustomerData = {
                    name: formData.customerName.trim(),
                    phone: formData.customerPhone.trim(),
                    email: formData.customerEmail.trim() || null,
                    store_id: currentStoreId,
                    membership: 'normal',
                    points: 0,
                    balance: 0,
                    is_active: true,
                };

                const createdCustomer = await createCustomer(newCustomerData).unwrap();
                orderData.customer_id = createdCustomer.data.id;
                orderData.is_walk_in = false;

                showMessage(t('msg_customer_created_success'), 'success');
                } catch (customerErr: any) {
                console.error('Failed to create customer:', customerErr);
                orderData.customer_id = null;
                if (formData.customerName?.trim()) {
                    // Has a name → pass as new-customer fields; backend will create on sync
                    orderData.is_walk_in = false;
                    orderData.customer_name = formData.customerName.trim();
                    orderData.customer_number = formData.customerPhone?.trim() || null;
                    orderData.customer_email = formData.customerEmail?.trim() || null;
                } else {
                    // No name at all → treat as walk-in (avoids "customer name required" 500)
                    orderData.is_walk_in = true;
                }
                showMessage(t('msg_customer_create_failed_order_continue'), 'error');
                }
            }
        }

        if (!isOnline) {
            // Offline path: queue the order locally
            const localId = `OFFLINE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            const localInvoice = generateLocalInvoiceNumber();
            const deviceId = getDeviceId();
            const offlineOrder = {
                localId,
                storeId: currentStoreId!,
                localInvoice,
                payload: {
                    ...orderData,
                    // Sanitize: empty string fails nullable|email validation on API routes
                    customer_email: orderData.customer_email || null,
                    // Non-cash paid: send 0 so backend normalizes to fresh grand_total (avoids amount mismatch 422)
                    amount_paid:
                        orderData.payment_status === 'paid' &&
                        orderData.payment_method?.toLowerCase() !== 'cash'
                            ? 0
                            : orderData.amount_paid,
                    local_order_id: localId,
                    idempotency_key: localId,
                    device_id: deviceId,
                    offline_created_at: new Date().toISOString(),
                },
                queuedAt: new Date().toISOString(),
                status: 'pending' as const,
                retryCount: 0,
                totalAmount: grandTotal,
                itemCount: invoiceItems.length,
            };
            await saveOfflineOrder(offlineOrder);
            dispatch(queueOfflineOrder(offlineOrder));
            // Clear cart immediately — prevents duplicate queuing if app crashes before preview closes
            dispatch(clearItemsRedux(currentStoreId!));
            setQuotePreview(null);
            setOrderResponse({
                data: {
                    id: localId,
                    order_id: localId,
                    invoice: localInvoice,
                    invoice_number: localInvoice,
                    customer: {
                        name: formData.customerName || t('pos_walk_in_customer'),
                        email: formData.customerEmail || '',
                        phone: formData.customerPhone || '',
                    },
                    products: invoiceItems.map((item) => ({
                        product_id: item.productId,
                        product_name: item.title || t('lbl_untitled'),
                        name: item.title || t('lbl_untitled'),
                        quantity: item.quantity,
                        unit_price: item.rate,
                        price: item.rate,
                        unit: item.unit || 'piece',
                        subtotal: item.amount || item.rate * item.quantity,
                        tax: item.tax_rate || 0,
                        tax_included: item.tax_included || false,
                    })),
                    payment_method: formData.paymentMethod,
                    payment_status: formData.paymentStatus,
                    amount_paid: actualAmountPaid,
                    change_amount: actualChangeAmount,
                    due_amount: dueAmount,
                    tax: orderTax,
                    discount: orderDiscount,
                    total: orderSubtotal,
                    grand_total: grandTotal,
                    totals: {
                        total: orderSubtotal,
                        subtotal: orderSubtotal,
                        tax: orderTax,
                        discount: orderDiscount,
                        grand_total: grandTotal,
                    },
                    offline: true,
                },
            });
            setAutoPrint(postActionRef.current === 'receipt' ? 'receipt' : null);
            setShowPreview(true);
            showMessage(t('msg_order_queued_offline'), 'success');
            return;
        }

        try {
            setLoading(true);
            const response = await createOrder(orderData).unwrap();
            setQuotePreview(null);
            setOrderResponse(response);
            setAutoPrint(postActionRef.current === 'receipt' ? 'receipt' : null);
            setShowPreview(true);

            refetch();
            setLoading(false);
            showMessage(t('msg_order_created_success'), 'success');

            // Don't clear items yet - we need them for the preview to show variant/warranty data
            // They will be cleared when the preview is closed
            // dispatch(clearItemsRedux());
            // clearCustomerSelection();
            // setFormData({
            //     customerId: null,
            //     customerName: '',
            //     customerEmail: '',
            //     customerPhone: '',
            //     discount: 0,
            //     membershipDiscount: 0,
            //     paymentMethod: '',
            //     paymentStatus: '',
            //     usePoints: false,
            //     useBalance: false,
            //     pointsToUse: 0,
            //     balanceToUse: 0,
            //     useWholesale: false,
            //     amountPaid: 0,
            //     changeAmount: 0,
            //     partialPaymentAmount: 0,
            //     dueAmount: 0,
            // });
        } catch (err: any) {
            setLoading(false);

            let errorMessage = t('msg_failed_create_order');

            if (err?.status === 422 && err?.data?.errors) {
                errorMessage = Object.values(err.data.errors).flat().join('\n');
            } else if (err?.data?.message) {
                errorMessage = err.data.message;
            } else if (err?.data?.error) {
                errorMessage = err.data.error;
            } else if (err?.error) {
                errorMessage = err.error;
            }

            console.error('Failed to create order:', errorMessage);
            showMessage(errorMessage, 'error');
        }
    };

    // Return mode submit handler
    const handleReturnSubmit = async () => {
        // Calculate valid return items first
        const validReturnItems = returnItemsData
            .filter((item) => item.returnQuantity > 0)
            .map((item) => ({
                order_item_id: item.orderItemId,
                quantity_returned: item.returnQuantity,
            }));
        const validExchangeItems = exchangeItemsData.filter((item) => Number(item.quantity) > 0);

        // Validate: Must have either exchange items OR return items (or both)
        if (validExchangeItems.length === 0 && validReturnItems.length === 0) {
            showMessage(t('msg_add_exchange_or_return_items'), 'error');
            return;
        }

        if (!(await checkReturnReasons())) return;

        // Check if return reason is already set in Redux
        let reasonId = returnReasonData.reasonId;
        let notes = returnReasonData.notes;

        if (!reasonId) {
            // Show return reason selection modal ONLY if not already set
            const result = await Swal.fire({
                title: t('pos_select_return_reason'),
                input: 'select',
                inputOptions: returnReasons.reduce((acc: Record<string, string>, reason: any) => {
                    acc[reason.id] = reason.name;
                    return acc;
                }, {}),
                inputPlaceholder: t('pos_select_reason_placeholder'),
                showCancelButton: true,
                confirmButtonText: t('btn_submit_return'),
                confirmButtonColor: '#f59e0b',
                cancelButtonColor: '#6b7280',
                inputValidator: (value) => {
                    if (!value) {
                        return t('msg_select_return_reason');
                    }
                    return null;
                },
            });

            if (!result.isConfirmed || !result.value) return;

            reasonId = parseInt(result.value);

            // Optional: ask for notes
            const notesResult = await Swal.fire({
                title: t('pos_return_notes_optional'),
                input: 'textarea',
                inputPlaceholder: t('pos_return_notes_placeholder'),
                showCancelButton: true,
                confirmButtonText: t('pos_complete_return'),
                confirmButtonColor: '#10b981',
                cancelButtonText: t('btn_skip'),
            });

            notes = notesResult.value || '';

            // Update return reason in Redux
            if (currentStoreId) {
                dispatch(setReturnReason({ storeId: currentStoreId, reasonId, notes }));
            }
        }

        // Prepare return data
        const returnData = {
            order_id: orderId,
            store_id: currentStoreId,
            return_reason_id: reasonId,
            notes: notes,
            payment_method: formData.paymentMethod || 'cash',
            return_items: validReturnItems,
            new_items: validExchangeItems.map((item) => ({
                product_id: item.productId,
                stock_id: item.stockId,
                quantity: item.quantity,
                unit_price: item.rate,
            })),
        };

        // Quote first — show preview before committing
        try {
            setLoading(true);
            const quoteResult = await quoteOrderReturn({
                order_id: orderId!,
                store_id: currentStoreId!,
                return_items: validReturnItems,
                new_items: validExchangeItems.map((item) => ({
                    product_id: item.productId,
                    stock_id: item.stockId,
                    quantity: item.quantity,
                    unit_price: item.rate,
                })),
            }).unwrap();
            setLoading(false);
            setPendingReturnData(returnData);
            setReturnQuotePreview((quoteResult as any)?.data || quoteResult);
            setShowReturnQuoteModal(true);
        } catch (error: any) {
            setLoading(false);
            // If quote endpoint fails, fall through directly to submit
            await submitReturnDirectly(returnData);
        }
    };

    const submitReturnDirectly = async (returnData: any) => {
        try {
            setLoading(true);
            const response = await createOrderReturn(returnData).unwrap();

            setLoading(false);
            showMessage(t('msg_return_processed_success'), 'success');

            if (currentStoreId) {
                dispatch(clearReturnSession(currentStoreId));
            }

            router.push(`/orders?showReturn=${response.data.id}`);
        } catch (error: any) {
            console.error('Return error:', error);
            const message =
                error?.status === 422 && error?.data?.errors
                    ? Object.values(error.data.errors).flat().join('\n')
                    : error?.data?.message || error?.data?.error || error?.error || t('msg_failed_process_return');
            showMessage(message, 'error');
            setLoading(false);
        }
    };

    const handleConfirmReturn = async () => {
        if (!pendingReturnData) return;
        setShowReturnQuoteModal(false);
        setReturnQuotePreview(null);
        await submitReturnDirectly(pendingReturnData);
        setPendingReturnData(null);
    };

    const handlePreview = async () => {
        if (invoiceItems.length === 0) {
            showMessage(t('msg_no_items_to_preview'), 'error');
            return;
        }

        if (isReturnMode) {
            setShowPreview(true);
            return;
        }

        if (!quotePayload) {
            showMessage(t('msg_select_payment_method_status'), 'error');
            return;
        }

        try {
            setLoading(true);
            const response = await quoteOrder(quotePayload).unwrap();
            setQuotePreview(response.data || response);
            setOrderResponse(null);
            setShowPreview(true);
        } catch (err: any) {
            const message =
                err?.status === 422 && err?.data?.errors
                    ? Object.values(err.data.errors).flat().join('\n')
                    : err?.data?.message || err?.data?.error || err?.error || t('msg_failed_create_order');
            showMessage(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToEdit = () => {
        setShowPreview(false);
        setAutoPrint(null);

        // If in return mode, always redirect to orders page
        if (isReturnMode) {
            if (currentStoreId) {
                dispatch(clearReturnSession(currentStoreId));
            }
            setOrderResponse(null);
            setReturnPreviewSnapshot(null);
            router.push('/orders');
            return;
        }

        // If order/return was created, clear the items and form
        if (orderResponse && currentStoreId) {
            // Normal POS - clear items and reset form
            dispatch(clearItemsRedux(currentStoreId));
            clearCustomerSelection();
            setFormData({
                customerId: null,
                customerName: '',
                customerEmail: '',
                customerPhone: '',
                discount: 0,
                membershipDiscount: 0,
                paymentMethod: '',
                paymentStatus: '',
                usePoints: false,
                useBalance: false,
                pointsToUse: 0,
                balanceToUse: 0,
                useWholesale: false,
                amountPaid: 0,
                changeAmount: 0,
                partialPaymentAmount: 0,
                dueAmount: 0,
                isSplitPayment: false,
                splitPayments: [],
                couponCode: '',
                couponDiscount: 0,
                couponId: null,
            });
        }

        setOrderResponse(null);
        setQuotePreview(null);
    };

    const getPreviewData = () => {
        if (orderResponse) {
            // API response structure: response.data contains the order data
            // Items can be under 'items' or 'products' depending on the API response
            const orderData = orderResponse.data || orderResponse;
            const responseItems = orderData.items || orderData.products || [];

            // For return mode, build special preview data
            if (isReturnMode) {
                // Use snapshot if available (stable data), otherwise live Redux data
                const activeReturnItems = returnPreviewSnapshot?.returnItems || returnItemsData.filter((item) => item.returnQuantity > 0);
                const activeExchangeItems = returnPreviewSnapshot?.exchangeItems || exchangeItemsData;
                const activeReturnTotal = returnPreviewSnapshot ? returnPreviewSnapshot.returnTotal : returnTotal;
                const activeExchangeTotal = returnPreviewSnapshot ? returnPreviewSnapshot.exchangeTotal : newItemsTotal;
                const activeNetTransaction = returnPreviewSnapshot ? returnPreviewSnapshot.netTransaction : returnNetAmount;
                const activeReasonId = returnPreviewSnapshot ? returnPreviewSnapshot.returnReasonId : returnReasonData.reasonId;
                const activeNotes = returnPreviewSnapshot ? returnPreviewSnapshot.notes : returnReasonData.notes;

                // Get items that customer is KEEPING from original order (originalQuantity - returnQuantity)
                const keptItems = activeReturnItems
                    .filter((item: any) => item.originalQuantity - item.returnQuantity > 0)
                    .map((item: any, idx: number) => ({
                        id: idx + 1,
                        title: item.title || t('lbl_unknown_item'),
                        quantity: item.originalQuantity - item.returnQuantity, // Items kept
                        price: item.rate,
                        amount: item.rate * (item.originalQuantity - item.returnQuantity),
                        unit: getDisplayUnit(item.unit),
                        isKept: true,
                        variantName: item.variantName,
                        variantData: item.variantData,
                    }));

                // Get items that were RETURNED (have returnQuantity > 0)
                const returnedItems = activeReturnItems
                    .filter((item: any) => item.returnQuantity > 0)
                    .map((item: any, idx: number) => ({
                        id: keptItems.length + idx + 1,
                        title: item.title || t('lbl_unknown_item'),
                        quantity: item.returnQuantity,
                        price: item.rate,
                        amount: item.rate * item.returnQuantity,
                        unit: getDisplayUnit(item.unit),
                        isReturned: true,
                        variantName: item.variantName,
                        variantData: item.variantData,
                    }));

                // Get exchange items
                const exchangeItems = activeExchangeItems.map((item: any, idx: number) => ({
                    id: keptItems.length + returnedItems.length + idx + 1,
                    title: item.title || t('lbl_unknown_item'),
                    quantity: item.quantity,
                    price: item.rate,
                    amount: item.amount || item.rate * item.quantity,
                    unit: getDisplayUnit(item.unit),
                    isExchange: true,
                    variantName: item.variantName,
                    variantData: item.variantData,
                }));

                const customer = orderData.customer || originalOrder?.customer;

                // Calculate subtotal of kept + exchange items (what customer has now)
                const keptItemsTotal = keptItems.reduce((sum: number, item: any) => sum + item.amount, 0);
                const newOrderSubtotal = keptItemsTotal + activeExchangeTotal;

                return {
                    customer: {
                        name: customer?.name || t('lbl_customer'),
                        email: customer?.email || '',
                        phone: customer?.phone || '',
                    },
                    invoice: orderData.return_number || orderData.invoice_number || `#RTN-${orderData.id || t('lbl_na')}`,
                    order_id: orderData.id || orderData.return_id,
                    original_order_id: orderId,
                    isReturn: true,
                    keptItems: keptItems, // Items kept from original order
                    returnedItems: returnedItems, // Items being returned
                    exchangeItems: exchangeItems, // New exchange items
                    items: [...keptItems, ...exchangeItems, ...returnedItems], // All items for table display
                    returnTotal: activeReturnTotal,
                    exchangeTotal: activeExchangeTotal,
                    netTransaction: activeNetTransaction,
                    keptItemsTotal: keptItemsTotal, // Total value of items kept
                    return_reason: returnReasons.find((r: any) => r.id === activeReasonId)?.name || t('lbl_na'),
                    notes: activeNotes || '',
                    paymentMethod: orderData.payment_method || formData.paymentMethod || t('lbl_cash'),
                    totals: {
                        returnAmount: activeReturnTotal,
                        exchangeAmount: activeExchangeTotal,
                        netAmount: activeNetTransaction,
                        subtotal: newOrderSubtotal, // Subtotal of kept + exchange items
                        total: Math.abs(activeNetTransaction),
                        grand_total: Math.abs(activeNetTransaction),
                    },
                    isOrderCreated: true,
                };
            }

            return {
                customer: {
                    name: orderData.customer?.name || formData.customerName || t('pos_walk_in_customer'),
                    email: orderData.customer?.email || formData.customerEmail || '',
                    phone: orderData.customer?.phone || formData.customerPhone || '',
                    membership: selectedCustomer?.membership || 'normal',
                    points: Number(selectedCustomer?.points) || 0,
                },
                invoice: orderData.invoice || orderData.invoice_number || `#INV-${orderData.order_id || orderData.id || t('lbl_na')}`,
                order_id: orderData.order_id || orderData.id,
                items:
                    responseItems.length > 0
                        ? responseItems.map((product: any, idx: number) => {
                              // Find matching item from invoiceItems to get variant/serial/warranty data
                              const originalItem = invoiceItems[idx];

                              return {
                                  id: idx + 1,
                                  title: product.name || product.product_name || originalItem?.title || t('lbl_unknown_item'),
                                  quantity: product.quantity || originalItem?.quantity || 1,
                                  price: product.unit_price || product.price || originalItem?.rate || 0,
                                  amount: product.subtotal || product.amount || product.quantity * product.unit_price || originalItem?.amount || 0,
                                  unit: getDisplayUnit(product.unit || originalItem?.unit),
                                  tax_rate: product.tax || originalItem?.tax_rate,
                                  tax_included: product.tax_included || originalItem?.tax_included,
                                  // Include variant data
                                  variantName: originalItem?.variantName,
                                  variantData: originalItem?.variantData,
                                  // Include serial data
                                  has_serial: originalItem?.has_serial || false,
                                  serials: originalItem?.serials || [],
                                  // Include warranty data
                                  has_warranty: originalItem?.has_warranty || false,
                                  warranty: originalItem?.warranty || null,
                              };
                          })
                        : // Fallback: if API doesn't return items, use invoiceItems directly
                          invoiceItems.map((item, idx) => ({
                              id: idx + 1,
                              title: item.title || t('lbl_untitled'),
                              quantity: item.quantity,
                              price: item.rate,
                              amount: item.rate * item.quantity,
                              unit: getDisplayUnit(item.unit),
                              tax_rate: item.tax_rate,
                              tax_included: item.tax_included,
                              variantName: item.variantName,
                              variantData: item.variantData,
                              has_serial: item.has_serial || false,
                              serials: item.serials || [],
                              has_warranty: item.has_warranty || false,
                              warranty: item.warranty || null,
                          })),
                tax: parseFloat(orderData.totals?.tax || orderData.tax || 0),
                discount: orderData.totals?.discount || orderData.discount || 0,
                membershipDiscount: formData.membershipDiscount,
                paymentMethod: orderData.payment_method,
                payment_status: orderData.payment_status,
                amount_paid: orderData.amount_paid || 0,
                due_amount: orderData.due_amount || 0,
                totals: {
                    subtotal: parseFloat(orderData.totals?.total || orderData.total || calculateSubtotalWithoutTax()),
                    tax: parseFloat(orderData.totals?.tax || orderData.tax || calculateTax()),
                    discount: orderData.totals?.discount || orderData.discount || calculateDiscount(),
                    membershipDiscount: calculateMembershipDiscount(),
                    pointsDiscount: calculatePointsDiscount(),
                    balanceDiscount: calculateBalanceDiscount(),
                    total: parseFloat(orderData.totals?.grand_total || orderData.grand_total || calculateTotal()),
                    grand_total: parseFloat(orderData.totals?.grand_total || orderData.grand_total || calculateTotal()),
                },
                isOrderCreated: true,
            };
        }

        if (quotePreview && !isReturnMode) {
            const quoteItems = quotePreview.items || [];
            const quoteTotals = quotePreview.totals || {};
            const quotePayment = quotePreview.payment || {};

            return {
                customer: {
                    name: formData.customerName || t('pos_walk_in_customer'),
                    email: formData.customerEmail,
                    phone: formData.customerPhone,
                    membership: selectedCustomer?.membership || 'normal',
                    points: Number(selectedCustomer?.points) || 0,
                },
                items: quoteItems.map((item: any, idx: number) => {
                    const originalItem = invoiceItems[idx];
                    return {
                        id: idx + 1,
                        title: item.product_name || originalItem?.title || t('lbl_unknown_item'),
                        quantity: item.quantity || originalItem?.quantity || 1,
                        price: item.unit_price || originalItem?.rate || 0,
                        amount: item.subtotal || 0,
                        tax_rate: item.tax,
                        tax_included: item.tax_included,
                        unit: getDisplayUnit(item.unit || originalItem?.unit),
                        variantName: originalItem?.variantName,
                        variantData: originalItem?.variantData,
                        has_serial: originalItem?.has_serial || false,
                        serials: originalItem?.serials || [],
                        has_warranty: originalItem?.has_warranty || false,
                        warranty: originalItem?.warranty || null,
                    };
                }),
                paymentMethod: quotePayment.payment_method || formData.paymentMethod,
                paymentStatus: quotePayment.payment_status || formData.paymentStatus,
                amount_paid: quotePayment.amount_paid || 0,
                due_amount: quotePayment.due_amount || 0,
                totals: {
                    subtotal: Number(quoteTotals.total || 0),
                    tax: Number(quoteTotals.tax || 0),
                    discount: Number(quoteTotals.discount || 0),
                    membershipDiscount: calculateMembershipDiscount(),
                    pointsDiscount: Number(quoteTotals.loyalty_points_value || 0),
                    balanceDiscount: Number(quoteTotals.account_balance_redeemed || 0),
                    total: Number(quoteTotals.grand_total || 0),
                    grand_total: Number(quoteTotals.grand_total || 0),
                },
                isOrderCreated: false,
            };
        }

        return {
            customer: {
                name: formData.customerName,
                email: formData.customerEmail,
                phone: formData.customerPhone,
                membership: selectedCustomer?.membership || 'normal',
                points: Number(selectedCustomer?.points) || 0,
            },
            items: invoiceItems.map((item, idx) => ({
                id: idx + 1,
                title: item.title || t('lbl_untitled'),
                quantity: item.quantity,
                price: item.rate,
                amount: item.rate * item.quantity,
                tax_rate: item.tax_rate,
                tax_included: item.tax_included,
                unit: getDisplayUnit(item.unit),
                // Include variant data
                variantName: item.variantName,
                variantData: item.variantData,
                // Include serial data
                has_serial: item.has_serial || false,
                serials: item.serials || [],
                // Include warranty data
                has_warranty: item.has_warranty || false,
                warranty: item.warranty || null,
            })),
            tax: 0,
            discount: formData.discount,
            membershipDiscount: formData.membershipDiscount,
            paymentMethod: formData.paymentMethod,
            paymentStatus: formData.paymentStatus,
            partialPaymentAmount: formData.partialPaymentAmount || 0,
            dueAmount: formData.paymentStatus === 'due' ? calculateTotal() : formData.paymentStatus === 'partial' ? calculateTotal() - (formData.partialPaymentAmount || 0) : 0,
            totals: {
                subtotal: calculateSubtotalWithoutTax(),
                tax: calculateTax(),
                discount: calculateDiscount(),
                membershipDiscount: calculateMembershipDiscount(),
                pointsDiscount: calculatePointsDiscount(),
                balanceDiscount: calculateBalanceDiscount(),
                total: calculateTotal(),
                grand_total: calculateTotal(),
            },
            isOrderCreated: false,
        };
    };

    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    const currentDate = now.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    const currentTime = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <div className="relative mt-4 w-full xl:mt-0 xl:w-full">
            <Toaster />
            <LoadingOverlay isLoading={loading} />
            <PreviewModal isOpen={showPreview} data={getPreviewData()} storeId={currentStoreId || undefined} onClose={handleBackToEdit} autoPrint={autoPrint} />
            {showReturnQuoteModal && returnQuotePreview && (
                <ReturnQuotePreviewModal
                    quote={returnQuotePreview}
                    onConfirm={handleConfirmReturn}
                    onCancel={() => {
                        setShowReturnQuoteModal(false);
                        setReturnQuotePreview(null);
                        setPendingReturnData(null);
                    }}
                    isLoading={loading}
                />
            )}

            {/* Store Branding Header */}
            {!isReturnMode && (
                <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-white shadow-sm">
                            {currentStore?.store_name?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-800">{currentStore?.store_name || 'POS Terminal'}</p>
                            {currentStore?.store_location && (
                                <p className="truncate text-xs text-gray-400">{currentStore.store_location}</p>
                            )}
                        </div>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-xs text-gray-400">{currentDate}</p>
                        <p className="text-xs font-semibold text-primary">{currentTime}</p>
                    </div>
                </div>
            )}

            <div className="panel">
                <CustomerSection
                    formData={formData}
                    selectedCustomer={selectedCustomer}
                    isManualCustomerEntry={isManualCustomerEntry}
                    showManualCustomerForm={showManualCustomerForm}
                    customerSearch={customerSearch}
                    customers={customers}
                    isSearching={isSearching}
                    showSearchResults={showSearchResults}
                    searchParams={searchParams}
                    searchInputRef={searchInputRef}
                    error={error}
                    onSearchChange={handleSearchChange}
                    onFocusResults={handleCustomerSearchFocus}
                    onCustomerSelect={handleCustomerSelect}
                    onClearCustomer={clearCustomerSelection}
                    onToggleManualEntry={handleNewCustomerClick}
                    onInputChange={handleInputChange}
                    onSelectWalkInCustomer={handleWalkInCustomerSelect}
                    onClearWalkInCustomer={handleClearWalkInCustomer}
                    getBadgeClass={getMembershipBadgeClass}
                    getMembershipDiscount={getMembershipDiscount}
                />
            </div>

            <div className="panel mt-3">
                <OrderDetailsSection
                    invoiceItems={invoiceItems}
                    formData={formData}
                    onWholesaleToggle={handleWholesaleToggle}
                    onClearItems={clearAllItems}
                    onQuantityChange={handleQuantityChange}
                    onQuantityBlur={handleQuantityBlur}
                    onUnitPriceChange={handleUnitPriceChange}
                    onUnitPriceBlur={handleUnitPriceBlur}
                    onRemoveItem={handleRemoveItem}
                    onItemWholesaleToggle={handleItemWholesaleToggle}
                    isReturnMode={isReturnMode}
                />

                {!isReturnMode && (
                    <div className="mt-4 border-t border-gray-100 pt-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Coupon</p>
                        <CouponInput
                            storeId={currentStoreId}
                            orderTotal={backendGrandTotal}
                            customerId={typeof formData.customerId === 'number' ? formData.customerId : null}
                            appliedCode={formData.couponCode}
                            couponDiscount={formData.couponDiscount}
                            onApply={(result) => setFormData((prev) => ({
                                ...prev,
                                couponCode: result.code,
                                couponDiscount: result.discount_amount,
                                couponId: result.coupon_id,
                            }))}
                            onRemove={() => setFormData((prev) => ({
                                ...prev,
                                couponCode: '',
                                couponDiscount: 0,
                                couponId: null,
                            }))}
                        />
                    </div>
                )}

                <PaymentSummarySection
                    formData={formData}
                    selectedCustomer={selectedCustomer}
                    paymentMethodOptions={paymentMethodOptions}
                    paymentStatusOptions={paymentStatusOptions}
                    onInputChange={handleInputChange}
                    totalQty={totalQty}
                    unit={invoiceItems[0]?.unit}
                    subtotalWithoutTax={backendSubtotal}
                    taxAmount={backendTax}
                    discountAmount={displayedOrderDiscount}
                    membershipDiscountAmount={displayedMembershipDiscount}
                    pointsDiscount={backendPointsDiscount}
                    balanceDiscount={backendBalanceDiscount}
                    totalPayable={backendGrandTotal}
                    isWalkInCustomer={formData.customerId === 'walk-in'}
                    // Return mode props
                    isReturnMode={isReturnMode}
                    returnTotal={returnTotal}
                    newItemsTotal={newItemsTotal}
                    returnNetAmount={returnNetAmount}
                    onOpenSplitModal={() => setShowSplitModal(true)}
                />

                <SplitPaymentModal
                    isOpen={showSplitModal}
                    totalPayable={backendGrandTotal}
                    paymentMethodOptions={paymentMethodOptions}
                    initialSplitPayments={formData.splitPayments}
                    onConfirm={(payments: SplitPayment[]) => {
                        setFormData((prev) => ({
                            ...prev,
                            isSplitPayment: true,
                            splitPayments: payments,
                            paymentStatus: 'paid',
                        }));
                        setShowSplitModal(false);
                    }}
                    onClose={() => setShowSplitModal(false)}
                />

                <CashPaymentSection
                    formData={formData}
                    onInputChange={handleInputChange}
                    totalPayable={backendGrandTotal}
                    isWalkInCustomer={formData.customerId === 'walk-in'}
                    isReturnMode={isReturnMode}
                    returnNetAmount={returnNetAmount}
                />

                {isReturnMode ? (
                    <div className="mt-4 flex gap-3 pb-16 sm:pb-0">
                        <button
                            type="button"
                            onClick={handleReturnSubmit}
                            disabled={loading}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <IconSave />}
                            {t('btn_submit_return')}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/orders')}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
                        >
                            {t('btn_cancel')}
                        </button>
                    </div>
                ) : (
                    <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 p-4 pb-20 sm:pb-4">
                        <div className="mb-3 flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-500">
                                {invoiceItems.length} {invoiceItems.length === 1 ? t('lbl_item') : t('lbl_items')}
                            </span>
                            <span className="font-bold text-primary">{formatCurrency(backendGrandTotal)}</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                            <button
                                type="button"
                                onClick={() => { postActionRef.current = 'invoice'; handleSubmit(); }}
                                disabled={loading || invoiceItems.length === 0}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                            >
                                {loading ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <IconSave />
                                )}
                                {t('btn_confirm_order')}
                            </button>
                            <button
                                type="button"
                                onClick={() => { postActionRef.current = 'receipt'; handleSubmit(); }}
                                disabled={loading || invoiceItems.length === 0}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                            >
                                {loading ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <IconPrinter />
                                )}
                                {t('btn_confirm_print_receipt')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PosRightSide;
