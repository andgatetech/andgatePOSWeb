'use client';

import CashPaymentSection from '@/app/(application)/(protected)/pos/pos-right-side/CashPaymentSection';
import CustomerSection from '@/app/(application)/(protected)/pos/pos-right-side/CustomerSection';
import LoadingOverlay from '@/app/(application)/(protected)/pos/pos-right-side/LoadingOverlay';
import OrderDetailsSection from '@/app/(application)/(protected)/pos/pos-right-side/OrderDetailsSection';
import PaymentSummarySection from '@/app/(application)/(protected)/pos/pos-right-side/PaymentSummarySection';
import PreviewModal from '@/app/(application)/(protected)/pos/pos-right-side/PreviewModal';
import type { Customer, CustomerApiResponse, PosFormData } from '@/app/(application)/(protected)/pos/pos-right-side/types';
import { MEMBERSHIP_DISCOUNTS } from '@/app/(application)/(protected)/pos/pos-right-side/types';
import IconEye from '@/components/icon/icon-eye';
import IconSave from '@/components/icon/icon-save';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showConfirmDialog, showMessage } from '@/lib/toast';
import type { RootState } from '@/store';
import { useUpdateOrderMutation } from '@/store/features/Order/Order';
import { clearItemsRedux, removeItemRedux, updateItemRedux } from '@/store/features/Order/OrderEditSlice';
import { useGetStoreCustomersListQuery } from '@/store/features/customer/customer';
import { useGetPaymentMethodsQuery } from '@/store/features/store/storeApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const DEFAULT_PAYMENT_METHOD = {
    id: 0,
    payment_method_name: 'Cash',
};

interface OrderEditRightSideProps {
    orderId: number | null;
    originalOrder: any;
}

const OrderEditRightSide: React.FC<OrderEditRightSideProps> = ({ orderId, originalOrder }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { currentStoreId, currentStore } = useCurrentStore();

    const invoiceItems = useSelector((state: RootState) => (currentStoreId && state.orderEdit.sessionsByStore ? state.orderEdit.sessionsByStore[currentStoreId]?.items || [] : []));
    const userId = useSelector((state: RootState) => state.auth.user?.id);

    const searchInputRef = useRef<HTMLDivElement | null>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [customerSearch, setCustomerSearch] = useState('');
    const [searchParams, setSearchParams] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [orderResponse, setOrderResponse] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);

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
    });

    const [isManualCustomerEntry, setIsManualCustomerEntry] = useState(false);
    const showManualCustomerForm = isManualCustomerEntry || !!selectedCustomer;
    const [initialCustomerLoaded, setInitialCustomerLoaded] = useState(false);
    const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

    const [updateOrder] = useUpdateOrderMutation();
    const [loading, setLoading] = useState(false);

    // Customer search API
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
        const payload = (customersResponse as CustomerApiResponse)?.data;
        if (Array.isArray(payload)) {
            return payload;
        }
        if (payload && 'items' in payload && Array.isArray(payload.items)) {
            return payload.items;
        }
        return [];
    }, [customersResponse]);

    // Initialize from original order
    useEffect(() => {
        if (originalOrder) {
            // Handle both nested (single order API) and flattened (list API) structures
            const financialData = originalOrder.financial || originalOrder;
            const paymentData = originalOrder.payment || originalOrder;

            // Initialize discount
            const originalTotal = parseFloat(financialData.total || 0);
            const discountAmount = parseFloat(financialData.discount || 0);
            const discountPercent = originalTotal > 0 ? (discountAmount / originalTotal) * 100 : 0;

            // Get payment details
            const paymentMethod = paymentData.payment_method || originalOrder.payment_method || 'cash';
            const paymentStatus = paymentData.payment_status || originalOrder.payment_status || 'paid';
            const amountPaid = parseFloat(financialData.amount_paid || originalOrder.amount_paid || 0);
            const dueAmount = parseFloat(financialData.due_amount || originalOrder.due_amount || 0);

            // Initialize customer if not walk-in
            if (!originalOrder.is_walk_in && originalOrder.customer) {
                const customer = originalOrder.customer;

                setIsLoadingCustomer(true);

                // Trigger customer search to get full customer details
                setSearchParams(customer.name || customer.email || customer.phone || '');

                // Set basic customer data in form for now
                setFormData((prev) => ({
                    ...prev,
                    customerId: customer.id,
                    customerName: customer.name || '',
                    customerEmail: customer.email || '',
                    customerPhone: customer.phone || '',
                    discount: discountPercent,
                    paymentMethod,
                    paymentStatus,
                    amountPaid,
                    partialPaymentAmount: paymentStatus === 'partial' ? amountPaid : 0,
                    dueAmount,
                }));
            } else if (originalOrder.is_walk_in) {
                // Walk-in customer
                setFormData((prev) => ({
                    ...prev,
                    customerId: 'walk-in',
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    discount: discountPercent,
                    paymentMethod,
                    paymentStatus,
                    amountPaid,
                    partialPaymentAmount: paymentStatus === 'partial' ? amountPaid : 0,
                    dueAmount,
                }));
            } else {
                // No customer (manual entry)
                setFormData((prev) => ({
                    ...prev,
                    discount: discountPercent,
                    paymentMethod,
                    paymentStatus,
                    amountPaid,
                    partialPaymentAmount: paymentStatus === 'partial' ? amountPaid : 0,
                    dueAmount,
                }));
            }
        }
    }, [originalOrder]);

    // Auto-select customer from search results when loading initial order
    useEffect(() => {
        if (!initialCustomerLoaded && originalOrder?.customer && customers.length > 0 && isLoadingCustomer) {
            const customerId = originalOrder.customer.id;
            const foundCustomer = customers.find((c) => c.id === customerId);

            if (foundCustomer) {
                setSelectedCustomer(foundCustomer);
                setCustomerSearch(foundCustomer.name);
                setShowSearchResults(false);
                setInitialCustomerLoaded(true);
                setIsLoadingCustomer(false);

                // Update membership discount if customer has membership
                const membershipDiscountValue = getMembershipDiscount(foundCustomer.membership);
                setFormData((prev) => ({
                    ...prev,
                    membershipDiscount: membershipDiscountValue,
                }));
            }
        }
    }, [customers, originalOrder, initialCustomerLoaded, isLoadingCustomer]);

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

    const { data: paymentMethodsResponse } = useGetPaymentMethodsQuery(currentStoreId ? { store_id: currentStoreId } : skipToken);

    const paymentMethodOptions = useMemo<any[]>(() => {
        const payload = paymentMethodsResponse?.data;
        const methods = Array.isArray(payload) ? payload : [];
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
        });

        if (activeMethods.length === 0) {
            return [DEFAULT_PAYMENT_METHOD];
        }

        return activeMethods;
    }, [paymentMethodsResponse]);

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
            paymentStatus: 'paid',
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

    const handleRemoveItem = (itemId: number) => {
        if (!currentStoreId) return;
        dispatch(removeItemRedux({ storeId: currentStoreId, id: itemId }));
    };

    const handleItemWholesaleToggle = (itemId: number) => {
        const item = invoiceItems.find((line) => line.id === itemId);
        if (!item) return;

        const newIsWholesale = !item.isWholesale;
        const newRate = newIsWholesale ? item.wholesalePrice || item.regularPrice || item.rate : item.regularPrice || item.rate;

        if (!currentStoreId) return;
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
    };

    const handleQuantityChange = (itemId: number, value: string) => {
        const item = invoiceItems.find((line) => line.id === itemId);
        if (!item) return;

        if (value === '') {
            if (!currentStoreId) return;
            dispatch(updateItemRedux({ storeId: currentStoreId, item: { ...item, quantity: 0, amount: 0 } }));
            return;
        }

        const newQuantity = Number(value);

        if (Number.isNaN(newQuantity) || newQuantity < 0) return;

        if (item.PlaceholderQuantity && newQuantity > item.PlaceholderQuantity) {
            showMessage(`Maximum available quantity is ${item.PlaceholderQuantity}`, 'error');
            return;
        }

        if (!currentStoreId) return;
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
    };

    const handleQuantityBlur = (itemId: number) => {
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

    const handleUnitPriceChange = (itemId: number, value: string) => {
        const item = invoiceItems.find((line) => line.id === itemId);
        if (!item) return;

        if (value === '') {
            if (!currentStoreId) return;
            dispatch(updateItemRedux({ storeId: currentStoreId, item: { ...item, rate: 0, amount: 0 } }));
            return;
        }

        const newRate = Number(value);
        if (Number.isNaN(newRate) || newRate < 0) return;

        if (!currentStoreId) return;
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
        return invoiceItems.reduce((total, item) => total + calculateItemTax(item), 0);
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
        if (!formData.usePoints || !selectedCustomer) return 0;
        return Math.min(formData.pointsToUse * 0.01, calculateBaseTotal());
    };

    const calculateBalanceDiscount = () => {
        if (!formData.useBalance || !selectedCustomer) return 0;
        return Math.min(formData.balanceToUse, calculateBaseTotal() - calculatePointsDiscount());
    };

    const calculateTotal = () => {
        return Math.max(0, calculateBaseTotal() - calculatePointsDiscount() - calculateBalanceDiscount());
    };

    useEffect(() => {
        // Update due amount based on payment status and partial payment
        if (formData.paymentStatus === 'due') {
            setFormData((prev) => ({
                ...prev,
                dueAmount: calculateTotal(),
                partialPaymentAmount: 0,
            }));
        } else if (formData.paymentStatus === 'partial') {
            const total = calculateTotal();
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.paymentStatus, formData.partialPaymentAmount, invoiceItems, formData.discount, formData.usePoints, formData.pointsToUse, formData.useBalance, formData.balanceToUse]);

    useEffect(() => {
        const total = calculateTotal();
        const change = formData.amountPaid - total;
        setFormData((prev) => ({
            ...prev,
            changeAmount: change > 0 ? change : 0,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.amountPaid, invoiceItems, formData.discount, formData.usePoints, formData.pointsToUse, formData.useBalance, formData.balanceToUse]);

    const handleWholesaleToggle = (checked: boolean) => {
        // Global wholesale toggle removed - now using per-item control
    };

    const clearAllItems = async () => {
        const confirmed = await showConfirmDialog('Clear Cart?', 'Are you sure you want to clear all items?', 'Yes, clear all', 'Cancel', false);
        if (confirmed && currentStoreId) {
            dispatch(clearItemsRedux(currentStoreId));
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
            } else if (name === 'paymentStatus') {
                setFormData((prev) => ({
                    ...prev,
                    paymentStatus: value,
                    partialPaymentAmount: 0,
                    dueAmount: value === 'due' ? calculateTotal() : 0,
                    paymentMethod: value === 'due' ? 'due' : prev.paymentMethod,
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
        if (invoiceItems.length === 0) {
            showMessage('At least one item is required', 'error');
            return;
        }
        const invalidItems = invoiceItems.filter((item) => !item.productId || item.quantity <= 0);
        if (invalidItems.length > 0) {
            showMessage('Please select products and set quantities for all items', 'error');
            return;
        }

        const grandTotal = calculateTotal();

        // Get original items from originalOrder for comparison
        const originalItems = originalOrder?.items || [];

        // Prepare items array with action types
        const itemsWithActions = invoiceItems.map((item) => {
            const itemBasePrice = item.rate * item.quantity;
            const itemTax = calculateItemTax(item);
            const itemSubtotal = item.tax_included && item.tax_rate ? itemBasePrice : itemBasePrice + itemTax;

            // Determine action type
            let action = 'add'; // Default for new items

            if (item.orderItemId) {
                // Has orderItemId = existing item from DB
                // Check if it was modified
                const originalItem = originalItems.find((orig: any) => orig.id === item.orderItemId);

                if (originalItem) {
                    // Item exists in original order - check if modified
                    const isModified =
                        originalItem.quantity !== item.quantity ||
                        parseFloat(originalItem.unit_price) !== item.rate ||
                        (originalItem.discount || 0) !== (item.discount || 0) ||
                        (originalItem.tax || 0) !== (item.tax_rate || 0) ||
                        originalItem.tax_included !== item.tax_included;

                    action = isModified ? 'update' : 'unchanged';
                }
            }

            const orderItem: any = {
                action: action,
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.rate,
                unit: item.unit || 'pcs',
                discount: item.discount || 0,
                tax: itemTax,
                tax_included: item.tax_included || false,
            };

            // Include order_item id for update/delete actions (not product_id!)
            if (action === 'update' && item.orderItemId) {
                orderItem.id = item.orderItemId; // This is the order_item ID from database
            }

            // Include product_stock_id if available
            if (item.stockId) {
                orderItem.product_stock_id = item.stockId;
            }

            // Include serial and warranty info
            if (item.has_serial && item.serials && item.serials.length > 0) {
                orderItem.serial_ids = item.serials.map((s: any) => s.id);
            }

            if (item.has_warranty && item.warranty) {
                orderItem.warranty_id = item.warranty.id;
            }

            return orderItem;
        });

        // Find deleted items (in original order but not in current items)
        const deletedItems = originalItems
            .filter((origItem: any) => {
                return !invoiceItems.some((currentItem) => currentItem.orderItemId === origItem.id);
            })
            .map((deletedItem: any) => ({
                action: 'delete',
                id: deletedItem.id,
            }));

        // Combine all items, filtering out unchanged items
        const allItems = [...itemsWithActions.filter((item) => item.action !== 'unchanged'), ...deletedItems];

        const orderData: any = {
            items: allItems,
            tax: calculateTax(),
            discount: calculateDiscount(),
            payment_status: formData.paymentStatus,
            payment_method: formData.paymentMethod,
            amount_paid: formData.paymentStatus === 'paid' ? grandTotal : formData.paymentStatus === 'partial' ? formData.partialPaymentAmount : 0,
            change_amount: formData.paymentStatus === 'paid' ? formData.changeAmount : 0,
            due_amount: formData.dueAmount,
        };

        // Log what we're sending to backend
        console.log('=== ORDER UPDATE REQUEST ===');
        console.log('Order ID:', orderId);
        console.log('Order Data:', JSON.stringify(orderData, null, 2));
        console.log('Items with actions:', allItems);
        console.log('\n--- DETAILED ITEM INSPECTION ---');
        invoiceItems.forEach((item, index) => {
            console.log(`Item ${index + 1}:`, {
                productId: item.productId,
                stockId: item.stockId,
                hasStockId: !!item.stockId,
                title: item.title,
                quantity: item.quantity,
            });
        });
        console.log('--- Items sent to backend ---');
        allItems.forEach((item, index) => {
            console.log(`Backend Item ${index + 1}:`, {
                action: item.action,
                product_id: item.product_id,
                product_stock_id: item.product_stock_id,
                hasStockId: !!item.product_stock_id,
                id: item.id,
            });
        });
        console.log('===========================');

        try {
            setLoading(true);
            const response = await updateOrder({ id: orderId, ...orderData }).unwrap();
            setLoading(false);
            showMessage('Order updated successfully!', 'success');

            // Transform backend response to match preview modal format
            const transformedResponse = {
                ...response.data,
                customer: response.data.customer || (response.data.is_walk_in ? { name: 'Walk-in Customer' } : originalOrder.customer),
                items:
                    response.data.items?.map((item: any) => ({
                        id: item.id,
                        title: item.product_name,
                        quantity: item.quantity,
                        price: parseFloat(item.unit_price),
                        amount: parseFloat(item.subtotal),
                        tax_rate: parseFloat(item.tax || 0),
                        tax_included: item.tax_included || false,
                        unit: item.unit || 'piece',
                    })) || [],
                totals: {
                    subtotal: parseFloat(response.data.financial?.total || response.data.total || 0),
                    tax: parseFloat(response.data.financial?.tax || response.data.tax || 0),
                    discount: parseFloat(response.data.financial?.discount || response.data.discount || 0),
                    total: parseFloat(response.data.financial?.grand_total || response.data.grand_total || 0),
                    grand_total: parseFloat(response.data.financial?.grand_total || response.data.grand_total || 0),
                },
                payment_status: response.data.payment?.payment_status || response.data.payment_status,
                payment_method: response.data.payment?.payment_method || response.data.payment_method,
                amount_paid: parseFloat(response.data.financial?.amount_paid || response.data.amount_paid || 0),
                due_amount: parseFloat(response.data.financial?.due_amount || response.data.due_amount || 0),
                isOrderCreated: true,
            };

            // Show preview modal with transformed order data
            setOrderResponse(transformedResponse);
            setShowPreview(true);

            // Don't clear items or redirect yet - preview modal will handle cleanup
        } catch (err: any) {
            setLoading(false);

            let errorMessage = 'Failed to update order';

            if (err?.status === 422 && err?.data?.data) {
                // Handle validation errors
                const errors = err.data.data;
                const errorMessages = Object.values(errors).flat();
                errorMessage = errorMessages.join('\n');
            } else if (err?.data?.message) {
                errorMessage = err.data.message;
            } else if (err?.data?.error) {
                errorMessage = err.data.error;
            } else if (err?.error) {
                errorMessage = err.error;
            }

            console.error('Failed to update order:', errorMessage);
            showMessage(errorMessage, 'error');
        }
    };

    const handlePreview = () => {
        if (invoiceItems.length === 0) {
            showMessage('No items to preview', 'error');
            return;
        }
        setShowPreview(true);
    };

    const handleBackToEdit = () => {
        // If order was successfully updated, redirect to orders page
        if (orderResponse) {
            if (currentStoreId) {
                dispatch(clearItemsRedux(currentStoreId));
            }
            router.push('/orders');
        } else {
            // Just close preview if not yet updated
            setShowPreview(false);
            setOrderResponse(null);
        }
    };

    const getPreviewData = () => {
        // Determine customer info
        let customerInfo = {
            name: 'Walk-in Customer',
            email: '',
            phone: '',
            membership: 'normal',
            points: 0,
        };

        if (formData.customerId === 'walk-in') {
            customerInfo.name = 'Walk-in Customer';
        } else if (selectedCustomer) {
            // Use selected customer from search
            customerInfo = {
                name: selectedCustomer.name,
                email: selectedCustomer.email,
                phone: selectedCustomer.phone,
                membership: selectedCustomer.membership || 'normal',
                points: Number(selectedCustomer.points) || 0,
            };
        } else if (formData.customerName) {
            // Use form data (manual entry or loaded from original order)
            customerInfo = {
                name: formData.customerName,
                email: formData.customerEmail,
                phone: formData.customerPhone,
                membership: 'normal',
                points: 0,
            };
        } else if (originalOrder.customer) {
            // Fallback to original order customer
            customerInfo = {
                name: originalOrder.customer.name,
                email: originalOrder.customer.email || '',
                phone: originalOrder.customer.phone || '',
                membership: 'normal',
                points: 0,
            };
        }

        return {
            customer: customerInfo,
            invoice: originalOrder.invoice,
            order_id: originalOrder.id,
            items: invoiceItems.map((item, idx) => ({
                id: idx + 1,
                title: item.title || 'Untitled',
                quantity: item.quantity,
                price: item.rate,
                amount: item.rate * item.quantity,
                tax_rate: item.tax_rate,
                tax_included: item.tax_included,
                unit: item.unit || 'piece',
                variantName: item.variantName,
                variantData: item.variantData,
                has_serial: item.has_serial || false,
                serials: item.serials || [],
                has_warranty: item.has_warranty || false,
                warranty: item.warranty || null,
            })),
            tax: 0,
            discount: formData.discount,
            membershipDiscount: formData.membershipDiscount,
            paymentMethod: formData.paymentMethod,
            paymentStatus: formData.paymentStatus,
            partialPaymentAmount: formData.partialPaymentAmount || 0,
            amount_paid: formData.amountPaid || formData.partialPaymentAmount || 0,
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
            isOrderCreated: !!orderResponse, // True if order was updated
        };
    };

    return (
        <div className="relative mt-6 w-full sm:mt-6 xl:mt-0 xl:w-full">
            <LoadingOverlay isLoading={loading} />
            <PreviewModal isOpen={showPreview} data={orderResponse || getPreviewData()} storeId={currentStoreId || undefined} onClose={handleBackToEdit} />

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

            <div className="panel">
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
                />

                <PaymentSummarySection
                    formData={formData}
                    selectedCustomer={selectedCustomer}
                    paymentMethodOptions={paymentMethodOptions}
                    paymentStatusOptions={paymentStatusOptions}
                    onInputChange={handleInputChange}
                    subtotalWithoutTax={calculateSubtotalWithoutTax()}
                    taxAmount={calculateTax()}
                    discountAmount={calculateDiscount()}
                    membershipDiscountAmount={calculateMembershipDiscount()}
                    pointsDiscount={calculatePointsDiscount()}
                    balanceDiscount={calculateBalanceDiscount()}
                    totalPayable={calculateTotal()}
                    isWalkInCustomer={formData.customerId === 'walk-in'}
                />

                <CashPaymentSection formData={formData} onInputChange={handleInputChange} totalPayable={calculateTotal()} isWalkInCustomer={formData.customerId === 'walk-in'} />

                <div className="mt-4 flex flex-col gap-2 pb-16 sm:mt-6 sm:flex-row sm:gap-4 sm:pb-0 lg:pb-0">
                    <button type="button" className="btn btn-primary flex-1 text-sm sm:text-base" onClick={handleSubmit} disabled={loading || invoiceItems.length === 0 || isLoadingCustomer}>
                        {isLoadingCustomer ? 'Loading Customer...' : 'Update Order'} <IconSave />
                    </button>
                    <button type="button" className="btn btn-secondary flex-1 text-sm sm:text-base" onClick={handlePreview}>
                        Preview <IconEye />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderEditRightSide;
