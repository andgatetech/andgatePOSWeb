'use client';
import { useEffect, useMemo, useState, type ButtonHTMLAttributes, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import {
    ArrowLeft,
    Banknote,
    CalendarClock,
    CheckCircle2,
    Circle,
    CreditCard,
    Download,
    FileText,
    Globe2,
    Loader2,
    Mail,
    MapPin,
    Package,
    Phone,
    Printer,
    ReceiptText,
    RotateCcw,
    ShoppingBag,
    Store,
    Truck,
    User,
} from 'lucide-react';

import Loader from '@/lib/Loader';
import { getTranslation } from '@/i18n';
import { closeReservedPdfWindow, reservePdfWindow } from '@/lib/pdf-mobile-download';
import { cn } from '@/lib/utils';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import {
    useCalculateCourierPriceMutation,
    useCreateCourierShipmentMutation,
    useGetCourierCredentialsQuery,
    useGetEcommerceOrderQuery,
    useGetPathaoCitiesQuery,
    useGetPathaoZonesQuery,
    useGetRedxPickupStoresQuery,
    useLazyGetRedxAreasQuery,
    useRefreshCourierStatusMutation,
    useUpdateEcommerceOrderPaymentMutation,
    useUpdateEcommerceOrderStatusMutation,
} from '@/store/features/ecommerce/ecommerceManagementApi';
import { useGetStoreLogoQuery } from '@/store/features/store/storeApi';
import { useParams, useRouter } from 'next/navigation';
import { generateOrderInvoicePDF, reserveInvoicePrintWindow, type InvoicePayload } from './generate-order-invoice-pdf';
import { StatusBadge } from './EcommerceBadges';
import CourierFraudCheckPanel from './CourierFraudCheckPanel';
import {
    ECOMMERCE_ORDER_STATUSES,
    ECOMMERCE_ORDER_TIMESTAMPS,
    ECOMMERCE_PAYMENT_METHODS,
    ECOMMERCE_PAYMENT_STATUSES,
    formatApiError,
    getEcommerceFallbackText,
    getEcommercePaymentMethodLabel,
    getEcommerceSourceLabel,
    getEcommerceStatusLabel,
    normalizeEcommerceOrderStatus,
} from './ecommerceUtils';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type OrderStatus = (typeof ECOMMERCE_ORDER_STATUSES)[number];
type PaymentStatus = (typeof ECOMMERCE_PAYMENT_STATUSES)[number];

const STEPPER_FLOW: OrderStatus[] = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'returned'];

const getCourierFulfillmentSignal = (courierStatus?: string): { tone: 'info' | 'warning' | 'success'; suggestedStatus?: OrderStatus; messageKey: string } | null => {
    const status = String(courierStatus || '').toLowerCase();
    if (!status) return null;

    if (status.includes('delivered')) {
        return { tone: 'success', suggestedStatus: 'delivered', messageKey: 'ecommerce_detail_courier_signal_delivered' };
    }

    if (status.includes('return')) {
        return { tone: 'warning', suggestedStatus: 'returned', messageKey: 'ecommerce_detail_courier_signal_returned' };
    }

    if (status.includes('pickup_cancelled') || status.includes('cancel')) {
        return { tone: 'warning', messageKey: 'ecommerce_detail_courier_signal_pickup_cancelled' };
    }

    if (status.includes('picked') || status.includes('sorting') || status.includes('transit') || status.includes('last_mile') || status.includes('assigned_for_delivery')) {
        return { tone: 'info', suggestedStatus: 'shipped', messageKey: 'ecommerce_detail_courier_signal_in_transit' };
    }

    if (status.includes('pending') || status.includes('pickup_requested') || status.includes('assigned_for_pickup')) {
        return { tone: 'info', suggestedStatus: 'packed', messageKey: 'ecommerce_detail_courier_signal_pending_pickup' };
    }

    return null;
};

/* ------------------------------------------------------------------ */
/*  Atoms                                                              */
/* ------------------------------------------------------------------ */

type CardProps = HTMLAttributes<HTMLDivElement>;
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline' | 'secondary';
};
type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
    variant?: 'secondary' | 'outline';
};

const Card = ({ className, ...props }: CardProps) => <div className={cn('rounded-lg border border-slate-200 bg-white shadow-sm', className)} {...props} />;

const CardHeader = ({ className, ...props }: CardProps) => <div className={cn('flex flex-col p-6', className)} {...props} />;

const CardContent = ({ className, ...props }: CardProps) => <div className={cn('p-6', className)} {...props} />;

const Badge = ({ className, variant = 'secondary', ...props }: BadgeProps) => (
    <span
        className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
            variant === 'secondary' ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-slate-300 bg-transparent text-slate-700',
            className
        )}
        {...props}
    />
);

const Button = ({ className, children, variant = 'default', type = 'button', ...props }: ButtonProps) => {
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
        default: 'bg-primary text-white hover:bg-primary/90',
        outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100',
        secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    };

    return (
        <button
            type={type}
            className={cn(
                'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

function InfoLine({ label, value }: { label: string; value: ReactNode }) {
    const isEmpty = value === null || value === undefined || value === '';
    return (
        <div className="flex flex-col gap-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
            <div className="text-sm font-medium text-slate-900">{isEmpty ? <span className="text-slate-400">—</span> : value}</div>
        </div>
    );
}

function SectionTitle({ icon: Icon, title, description }: { icon: ElementType; title: string; description?: string }) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-950">{title}</h2>
                {description && <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>}
            </div>
        </div>
    );
}

function InputLabel({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
    return (
        <label className={cn('flex min-w-0 flex-col gap-1.5', className)}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
            {children}
        </label>
    );
}

const controlClass = 'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';

function SummaryMetric({ label, value, icon: Icon, tone = 'neutral' }: { label: string; value: ReactNode; icon: ElementType; tone?: 'neutral' | 'primary' | 'success' | 'warning' }) {
    const toneClass = {
        neutral: 'bg-slate-50 text-slate-600',
        primary: 'bg-primary/10 text-primary',
        success: 'bg-emerald-50 text-emerald-700',
        warning: 'bg-amber-50 text-amber-700',
    }[tone];

    return (
        <div className="flex min-w-0 items-center gap-3 border-t border-slate-100 px-4 py-3 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0">
            <div className={cn('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md', toneClass)}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                <div className="mt-0.5 truncate text-sm font-semibold text-slate-950">{value}</div>
            </div>
        </div>
    );
}

const formatVariantText = (value: unknown) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.filter(Boolean).join(', ');
    if (typeof value === 'object')
        return Object.values(value as Record<string, unknown>)
            .filter(Boolean)
            .map(String)
            .join(', ');
    return String(value);
};

const getStoreLabel = (stores: any[]) => {
    if (!Array.isArray(stores) || stores.length === 0) return getEcommerceFallbackText();
    return (
        stores
            .map((store) => store?.store_name || store?.name)
            .filter(Boolean)
            .join(', ') || getEcommerceFallbackText()
    );
};

const getCourierResponseData = (courier: any) => courier?.provider_response?.data || courier?.response_payload?.data || {};

const getRedxParcel = (courier: any) => courier?.provider_response?.parcel || courier?.response_payload?.parcel || null;

const resolveStoreOrder = (response: any) => {
    const data = response?.data;
    return data?.store_order || data?.order || data?.data?.store_order || data?.data?.order || response?.store_order || response?.order || data || null;
};

const resolveStoreOrderItems = (storeOrder: any) => {
    if (Array.isArray(storeOrder?.items)) return storeOrder.items;
    if (Array.isArray(storeOrder?.order_items)) return storeOrder.order_items;
    if (Array.isArray(storeOrder?.store_items)) return storeOrder.store_items;
    return [];
};

const resolvePathaoList = (response: any) => {
    const candidates = [response?.data?.data?.data, response?.data?.data, response?.data?.items, response?.data, response?.items];
    return candidates.find(Array.isArray) || [];
};

const resolveRedxAreas = (response: any) => {
    const candidates = [response?.data?.data?.areas, response?.data?.data?.data, response?.data?.areas, response?.data?.data, response?.data?.items, response?.data, response?.items];
    return candidates.find(Array.isArray) || [];
};

const redxAreaId = (area: any) => area?.area_id ?? area?.id ?? area?.delivery_area_id;

const redxAreaName = (area: any) => area?.area_name ?? area?.name ?? area?.delivery_area ?? area?.title ?? '';

const redxAreaLabel = (area: any) => {
    const name = redxAreaName(area);
    const district = area?.district_name ?? area?.district ?? area?.city_name ?? area?.city;
    const id = redxAreaId(area);
    return [name, district, id ? `#${id}` : null].filter(Boolean).join(' - ');
};

const resolveRedxPickupStores = (response: any) => {
    const candidates = [response?.data?.data?.pickup_stores, response?.data?.pickup_stores, response?.data?.data, response?.data?.items, response?.data, response?.items];
    return candidates.find(Array.isArray) || [];
};

const redxPickupStoreLabel = (store: any) => {
    const area = store?.area_name || store?.area;
    return [store?.name, area, store?.phone, store?.id ? `#${store.id}` : null].filter(Boolean).join(' - ');
};

const normalizePaymentStatus = (value?: string): PaymentStatus => {
    const status = String(value || '').toLowerCase();
    return ECOMMERCE_PAYMENT_STATUSES.includes(status as PaymentStatus) ? (status as PaymentStatus) : 'pending';
};

/* ------------------------------------------------------------------ */
/*  Status Stepper                                                     */
/* ------------------------------------------------------------------ */

function OrderStatusStepper({ status }: { status: OrderStatus }) {
    const { t } = getTranslation();
    const cancelled = status === 'cancelled';
    const currentIdx = cancelled ? -1 : STEPPER_FLOW.indexOf(status);

    const stepIcons: Record<OrderStatus, ElementType> = {
        pending: Circle,
        confirmed: CheckCircle2,
        packed: Package,
        shipped: Truck,
        delivered: ShoppingBag,
        cancelled: Circle,
        returned: RotateCcw,
    };

    if (cancelled) {
        return <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">{t('ecommerce_detail_cancelled_notice')}</div>;
    }

    return (
        <div className="overflow-x-auto pb-1">
            <div className="relative min-w-[620px]">
                <div className="absolute left-5 right-5 top-5 h-0.5 bg-slate-200" aria-hidden="true" />
                <div
                    className="absolute left-5 top-5 h-0.5 bg-primary transition-all"
                    style={{ width: currentIdx <= 0 ? '0%' : `${(currentIdx / (STEPPER_FLOW.length - 1)) * 100}%` }}
                    aria-hidden="true"
                />
                <ol className="relative grid grid-cols-6 gap-3">
                    {STEPPER_FLOW.map((step, idx) => {
                        const completed = idx < currentIdx;
                        const active = idx === currentIdx;
                        const Icon = stepIcons[step];
                        return (
                            <li key={step} className="flex flex-col items-center text-center">
                                <div
                                    className={cn(
                                        'flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition-colors',
                                        completed && 'border-primary bg-primary/10 text-primary shadow-sm',
                                        active && 'border-primary bg-white text-primary shadow-sm ring-4 ring-primary/25',
                                        !completed && !active && 'border-slate-200 text-slate-400'
                                    )}
                                >
                                    <Icon className="h-5 w-5 text-current" />
                                </div>
                                <span className={cn('mt-2 max-w-[88px] text-center text-xs font-medium leading-4', completed || active ? 'text-slate-900' : 'text-slate-400')}>
                                    {getEcommerceStatusLabel(step)}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

const EcommerceOrderDetailsPage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const params = useParams();
    const rawOrderId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const orderId = Number(rawOrderId);
    const hasValidOrderId = Number.isFinite(orderId) && orderId > 0;
    const { formatCurrency, currency } = useCurrency();
    const { currentStore, currentStoreId, userStores } = useCurrentStore();
    const [status, setStatus] = useState<OrderStatus>('pending');
    const [paymentStatusForm, setPaymentStatusForm] = useState<PaymentStatus>('pending');
    const [paymentMethodForm, setPaymentMethodForm] = useState('cod');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNote, setPaymentNote] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isCourierConfirmOpen, setIsCourierConfirmOpen] = useState(false);
    const [courierProvider, setCourierProvider] = useState('pathao');
    const [courierForm, setCourierForm] = useState({
        merchant_order_id: '',
        recipient_name: '',
        recipient_phone: '',
        recipient_address: '',
        delivery_area: '',
        delivery_area_id: '',
        pickup_store_id: '',
        pickup_area_id: '',
        parcel_weight: '500',
        item_weight: '0.5',
        recipient_city: '',
        recipient_zone: '',
        cod_amount: '',
        item_quantity: '',
        item_description: '',
        note: '',
    });
    const [courierChargeForm, setCourierChargeForm] = useState({
        recipient_city: '',
        recipient_zone: '',
        item_weight: '0.5',
        delivery_area_id: '',
        pickup_area_id: '',
        parcel_weight: '500',
    });
    const [redxAreaSearch, setRedxAreaSearch] = useState('');
    const { data, isLoading, error } = useGetEcommerceOrderQuery(orderId, {
        skip: !hasValidOrderId,
        refetchOnMountOrArgChange: 30,
    });
    const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateEcommerceOrderStatusMutation();
    const [updateOrderPayment, { isLoading: isUpdatingPayment }] = useUpdateEcommerceOrderPaymentMutation();
    const [calculateCourierPrice, { isLoading: isCalculatingCourier }] = useCalculateCourierPriceMutation();
    const [createCourierShipment, { isLoading: isCreatingCourier }] = useCreateCourierShipmentMutation();
    const [refreshCourierStatus, { isLoading: isRefreshingCourier }] = useRefreshCourierStatusMutation();
    const [searchRedxAreas, { data: redxAreasData, isFetching: isLoadingRedxAreas }] = useLazyGetRedxAreasQuery();

    const order = resolveStoreOrder(data);
    const parentOrder = order?.parent_order || order?.ecommerce_order || order?.order || {};
    const items = useMemo(() => resolveStoreOrderItems(order), [order]);
    const transactions = useMemo(() => (Array.isArray(order?.transactions) ? order.transactions : []), [order]);
    const stores = useMemo(() => {
        if (Array.isArray(order?.stores)) return order.stores;
        if (order?.store) return [order.store];
        return [];
    }, [order]);
    const primaryTransaction = transactions[0] || null;
    const customer = order?.customer || order?.ecommerce_customer || parentOrder?.customer || parentOrder?.ecommerce_customer || {};
    const shipping = order?.shipping_address || parentOrder?.shipping_address || {};
    const itemsSubtotal = useMemo(() => items.reduce((sum: number, item: any) => sum + Number(item?.subtotal || 0), 0), [items]);
    const storeItemsSubtotal = Number(order?.store_items_subtotal ?? order?.subtotal ?? itemsSubtotal ?? 0);
    const storeOrderAmount = Number(order?.store_order_amount ?? storeItemsSubtotal ?? 0);
    const storeShippingFee = Number(order?.store_shipping_fee ?? order?.shipping_fee ?? 0);
    const storeTotal = Number(order?.store_total ?? order?.total ?? storeItemsSubtotal ?? 0);
    const courierStoreId = Number(order?.store_id || order?.store?.id || currentStoreId || 0);
    const { data: courierCredentialsData } = useGetCourierCredentialsQuery({ store_id: courierStoreId }, { skip: !courierStoreId });
    const courierCredentials = useMemo(() => {
        const items = courierCredentialsData?.data?.items || courierCredentialsData?.items || [];
        return Array.isArray(items) ? items : [];
    }, [courierCredentialsData]);
    const availableCouriers = useMemo(() => courierCredentials.filter((item: any) => item.is_active), [courierCredentials]);
    const activeCourierCredential = useMemo(() => availableCouriers.find((item: any) => item.provider === courierProvider), [availableCouriers, courierProvider]);
    const canLoadPathaoLocations = courierProvider === 'pathao' && courierStoreId > 0 && availableCouriers.some((item: any) => item.provider === 'pathao');
    const canLoadRedxPickupStores = courierProvider === 'redx' && courierStoreId > 0 && availableCouriers.some((item: any) => item.provider === 'redx');
    const { data: pathaoCitiesData, isFetching: isLoadingPathaoCities } = useGetPathaoCitiesQuery({ store_id: courierStoreId }, { skip: !canLoadPathaoLocations });
    const { data: redxPickupStoresData, isFetching: isLoadingRedxPickupStores } = useGetRedxPickupStoresQuery({ store_id: courierStoreId }, { skip: !canLoadRedxPickupStores });
    const { data: pathaoZonesData, isFetching: isLoadingPathaoZones } = useGetPathaoZonesQuery(
        { cityId: courierChargeForm.recipient_city, store_id: courierStoreId },
        { skip: !canLoadPathaoLocations || !courierChargeForm.recipient_city }
    );
    const pathaoCities = useMemo(() => resolvePathaoList(pathaoCitiesData), [pathaoCitiesData]);
    const pathaoZones = useMemo(() => resolvePathaoList(pathaoZonesData), [pathaoZonesData]);
    const redxAreas = useMemo(() => resolveRedxAreas(redxAreasData), [redxAreasData]);
    const redxPickupStores = useMemo(() => resolveRedxPickupStores(redxPickupStoresData), [redxPickupStoresData]);
    const latestCourier = order?.courier || order?.latest_courier_shipment || order?.courier_shipments?.[0] || null;
    const latestCourierResponseData = getCourierResponseData(latestCourier);
    const latestRedxParcel = getRedxParcel(latestCourier);
    const latestCourierStatus = latestCourierResponseData?.order_status_slug || latestCourierResponseData?.order_status || latestCourier?.courier_status;
    const courierFulfillmentSignal = getCourierFulfillmentSignal(latestCourierStatus);
    const totalQty = useMemo(() => items.reduce((sum: number, item: any) => sum + Number(item?.quantity || 0), 0), [items]);
    const paymentMethod = order?.payment_method || order?.latest_payment_method || primaryTransaction?.payment_method;
    const paymentStatus = order?.payment_status || order?.latest_payment_status || primaryTransaction?.payment_status;
    const matchedStore = useMemo(() => {
        if (stores.length === 0) return currentStore || null;
        return userStores.find((store) => Number(store.id) === Number(stores[0]?.id)) || currentStore || stores[0];
    }, [currentStore, stores, userStores]);
    const invoiceStoreId = Number(matchedStore?.id || currentStoreId || 0);
    const { data: logoData } = useGetStoreLogoQuery(invoiceStoreId, { skip: !invoiceStoreId });
    const defaultMerchantOrderId = `${order?.order_number || parentOrder?.order_number || `STORE-ORDER-${order?.id || orderId}`}-${order?.id || orderId}`;
    const defaultRecipientAddress = [shipping?.address_line, shipping?.area, shipping?.zone, shipping?.city, shipping?.postal_code].filter(Boolean).join(', ') || shipping?.address || '';
    const defaultItemDescription = useMemo(
        () =>
            items
                .slice(0, 5)
                .map((item: any) => item.product_name || item?.product?.product_name || item?.product?.name)
                .filter(Boolean)
                .join(', ') || 'Ecommerce order items',
        [items]
    );

    useEffect(() => {
        const nextStatus = normalizeEcommerceOrderStatus(order?.status);
        if (nextStatus) setStatus(nextStatus);
    }, [order?.status]);

    useEffect(() => {
        setPaymentStatusForm(normalizePaymentStatus(paymentStatus));
        setPaymentMethodForm(paymentMethod || 'cod');
        setPaymentAmount(String(order?.payment_amount ?? order?.amount_paid ?? order?.paid_amount ?? storeTotal ?? ''));
        setPaymentNote(order?.payment_note || primaryTransaction?.payment_note || primaryTransaction?.notes || '');
    }, [order?.amount_paid, order?.paid_amount, order?.payment_amount, order?.payment_note, paymentMethod, paymentStatus, primaryTransaction?.notes, primaryTransaction?.payment_note, storeTotal]);

    useEffect(() => {
        if (availableCouriers.length > 0 && !availableCouriers.some((item: any) => item.provider === courierProvider)) {
            setCourierProvider(availableCouriers[0].provider);
        }
    }, [availableCouriers, courierProvider]);

    useEffect(() => {
        if (!order?.id) return;

        setCourierForm((prev) => ({
            ...prev,
            merchant_order_id: prev.merchant_order_id || defaultMerchantOrderId,
            recipient_name: prev.recipient_name || shipping?.name || customer?.name || 'Customer',
            recipient_phone: prev.recipient_phone || shipping?.phone || customer?.mobile_number || customer?.phone || '',
            recipient_address: prev.recipient_address || defaultRecipientAddress,
            cod_amount: prev.cod_amount || String(order?.due_amount ?? storeTotal ?? 0),
            item_quantity: prev.item_quantity || String(Math.max(Number(totalQty || 0), 1)),
            item_description: prev.item_description || defaultItemDescription,
            note: prev.note || order?.notes || parentOrder?.notes || '',
        }));
    }, [
        customer?.mobile_number,
        customer?.name,
        customer?.phone,
        defaultItemDescription,
        defaultMerchantOrderId,
        defaultRecipientAddress,
        order?.due_amount,
        order?.id,
        order?.notes,
        parentOrder?.notes,
        shipping?.name,
        shipping?.phone,
        storeTotal,
        totalQty,
    ]);

    useEffect(() => {
        if (!redxAreaSearch) {
            setRedxAreaSearch(shipping?.city || shipping?.district || '');
        }
    }, [redxAreaSearch, shipping?.city, shipping?.district]);

    useEffect(() => {
        if (courierProvider !== 'redx' || courierForm.pickup_store_id) return;

        const savedPickupStoreId = activeCourierCredential?.provider_store_id;
        if (savedPickupStoreId) {
            setCourierForm((prev) => ({ ...prev, pickup_store_id: String(savedPickupStoreId) }));
            return;
        }

        if (redxPickupStores.length === 1 && redxPickupStores[0]?.id) {
            setCourierForm((prev) => ({ ...prev, pickup_store_id: String(redxPickupStores[0].id) }));
        }
    }, [activeCourierCredential?.provider_store_id, courierForm.pickup_store_id, courierProvider, redxPickupStores]);

    const handleStatusUpdate = async () => {
        if (!order?.id) return;

        try {
            await updateOrderStatus({ id: order.id, status }).unwrap();
            showSuccessDialog(t('success'), t('ecommerce_detail_status_updated', { status: getEcommerceStatusLabel(status) }));
        } catch (updateError) {
            showErrorDialog(t('error'), formatApiError(updateError));
        }
    };

    const handlePaymentUpdate = async () => {
        if (!order?.id) return;

        try {
            await updateOrderPayment({
                id: order.id,
                payment_status: paymentStatusForm,
                payment_method: paymentMethodForm,
                amount: paymentAmount === '' ? 0 : Number(paymentAmount),
                payment_note: paymentNote,
            }).unwrap();
            showSuccessDialog(t('success'), t('ecommerce_detail_payment_updated', { status: getEcommerceStatusLabel(paymentStatusForm) }));
        } catch (updateError) {
            showErrorDialog(t('error'), formatApiError(updateError));
        }
    };

    const setCourierField = (field: keyof typeof courierForm, value: string) => {
        setCourierForm((prev) => ({ ...prev, [field]: value }));
    };

    const setCourierChargeField = (field: keyof typeof courierChargeForm, value: string) => {
        setCourierChargeForm((prev) => ({
            ...prev,
            [field]: value,
            ...(field === 'recipient_city' ? { recipient_zone: '' } : {}),
        }));
    };

    const handleRedxAreaSearch = async () => {
        if (!courierStoreId) return;

        const params: Record<string, any> = { store_id: courierStoreId };
        const search = redxAreaSearch.trim();

        if (/^\d+$/.test(search)) {
            params.post_code = Number(search);
        } else if (search) {
            params.district_name = search;
        }

        try {
            await searchRedxAreas(params).unwrap();
        } catch (areaError) {
            showErrorDialog(t('error'), formatApiError(areaError));
        }
    };

    const handleRedxAreaSelect = (selectedIndex: string) => {
        const area = redxAreas[Number(selectedIndex)];
        if (!area) return;

        const areaId = redxAreaId(area);
        const areaName = redxAreaName(area);

        if (areaName) setCourierField('delivery_area', String(areaName));
        if (areaId) {
            setCourierField('delivery_area_id', String(areaId));
            setCourierChargeField('delivery_area_id', String(areaId));
        }
    };

    const courierCreatePayload = () => {
        const common: Record<string, any> = {
            provider: courierProvider,
            merchant_order_id: courierForm.merchant_order_id || defaultMerchantOrderId,
            recipient_name: courierForm.recipient_name || shipping?.name || customer?.name || 'Customer',
            recipient_phone: courierForm.recipient_phone || shipping?.phone || customer?.mobile_number || customer?.phone || '',
            recipient_address: courierForm.recipient_address || defaultRecipientAddress,
            cod_amount: Number(courierForm.cod_amount || order?.due_amount || storeTotal || 0),
            item_quantity: Math.max(Number(courierForm.item_quantity || totalQty || 0), 1),
            item_description: courierForm.item_description || defaultItemDescription,
            note: courierForm.note || undefined,
        };

        if (courierProvider === 'pathao') {
            return {
                ...common,
                special_instruction: courierForm.note || undefined,
                item_weight: Number(courierChargeForm.item_weight || courierForm.item_weight || 0.5),
            };
        }

        if (courierProvider === 'redx') {
            return {
                ...common,
                delivery_area: courierForm.delivery_area,
                delivery_area_id: Number(courierForm.delivery_area_id),
                pickup_store_id: courierForm.pickup_store_id ? Number(courierForm.pickup_store_id) : undefined,
                parcel_weight: Number(courierForm.parcel_weight || 500),
            };
        }

        return common;
    };

    const courierPricePayload = () => {
        const common: Record<string, any> = {
            provider: courierProvider,
            cod_amount: Number(courierForm.cod_amount || order?.due_amount || storeTotal || 0),
        };

        if (courierProvider === 'pathao') {
            return {
                ...common,
                recipient_city: Number(courierChargeForm.recipient_city),
                recipient_zone: Number(courierChargeForm.recipient_zone),
                item_weight: Number(courierChargeForm.item_weight || 0.5),
            };
        }

        if (courierProvider === 'redx') {
            return {
                ...common,
                delivery_area_id: Number(courierChargeForm.delivery_area_id),
                pickup_area_id: courierChargeForm.pickup_area_id ? Number(courierChargeForm.pickup_area_id) : undefined,
                parcel_weight: Number(courierChargeForm.parcel_weight || 500),
            };
        }

        return common;
    };

    const handleCourierPrice = async () => {
        if (!order?.id) return;
        try {
            const response = await calculateCourierPrice({ id: order.id, ...courierPricePayload() }).unwrap();
            const payload = response?.data || response;
            const price = payload?.data?.final_price ?? payload?.deliveryCharge ?? payload?.final_price ?? payload?.price;
            showSuccessDialog(t('ecommerce_detail_courier_charge'), price !== undefined ? t('ecommerce_detail_estimated_charge', { amount: formatCurrency(Number(price)) }) : t('ecommerce_detail_courier_charge_returned'));
        } catch (priceError) {
            showErrorDialog(t('ecommerce_detail_price_failed'), formatApiError(priceError));
        }
    };

    const handleCourierCreate = async () => {
        if (!order?.id) return;
        try {
            const response = await createCourierShipment({ id: order.id, ...courierCreatePayload() }).unwrap();
            const payload = response?.data || response;
            const consignment = payload?.consignment_id || payload?.data?.consignment_id;
            setIsCourierConfirmOpen(false);
            showSuccessDialog(t('ecommerce_detail_parcel_created'), consignment ? t('ecommerce_detail_parcel_created_with_consignment', { consignment }) : t('ecommerce_detail_parcel_created_desc'));
        } catch (createError) {
            showErrorDialog(t('ecommerce_detail_create_failed'), formatApiError(createError));
        }
    };

    const handleCourierStatus = async () => {
        if (!order?.id || !latestCourier?.provider) return;
        try {
            const response = await refreshCourierStatus({ id: order.id, provider: latestCourier.provider }).unwrap();
            const providerResponse = response?.data?.provider_response || response?.provider_response;
            const refreshedStatus = providerResponse?.data?.order_status_slug || providerResponse?.data?.order_status || response?.data?.shipment?.courier_status;
            showSuccessDialog(t('ecommerce_detail_status_refreshed'), refreshedStatus ? t('ecommerce_detail_courier_status_now', { status: refreshedStatus }) : t('ecommerce_detail_courier_status_updated'));
        } catch (statusError) {
            showErrorDialog(t('ecommerce_detail_status_failed'), formatApiError(statusError));
        }
    };

    const buildInvoicePayload = (): InvoicePayload => {
        const invoiceNo = order?.order_number || parentOrder?.order_number || `STORE-ORDER-${order?.id || orderId}`;
        return {
            invoice: invoiceNo,
            order_id: order.id,
            order_status: order.status,
            customer: {
                name: customer?.name,
                email: customer?.email,
                phone: customer?.mobile_number || customer?.phone,
            },
            items: items.map((item: any) => ({
                title: item.product_name || item?.product?.product_name || item?.product?.name || getEcommerceFallbackText(),
                variantName: formatVariantText(item.variant_data),
                quantity: Number(item.quantity || 0),
                unit: 'Pcs',
                price: Number(item.unit_price || 0),
                amount: Number(item.subtotal || 0),
            })),
            store_items_count: order?.store_items_count ?? items.length,
            store_items_subtotal: storeItemsSubtotal,
            store_total: storeTotal,
            paymentMethod: getEcommercePaymentMethodLabel(paymentMethod),
            paymentStatus,
            notes: order?.notes,
            store: {
                store_name: matchedStore?.store_name || getStoreLabel(stores),
                store_location: matchedStore?.store_location,
                store_email: matchedStore?.store_email,
                store_contact: matchedStore?.store_contact,
                logo_base64: logoData?.data?.logo_base64,
                currency,
            },
        };
    };

    const handlePrintInvoice = async () => {
        const invoicePayload = buildInvoicePayload();
        const printWindow = reserveInvoicePrintWindow(`invoice-${invoicePayload.invoice || 'order'}.pdf`);
        try {
            setIsDownloading(true);
            await generateOrderInvoicePDF(invoicePayload, printWindow, { action: 'print' });
        } catch (e) {
            closeReservedPdfWindow(printWindow);
            showErrorDialog(t('error'), formatApiError(e, t('ecommerce_detail_print_invoice_failed')));
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        const invoicePayload = buildInvoicePayload();
        const mobilePdfWindow = reservePdfWindow(`invoice-${invoicePayload.invoice || 'order'}.pdf`);
        try {
            setIsDownloading(true);
            await generateOrderInvoicePDF(invoicePayload, mobilePdfWindow);
        } catch (e) {
            closeReservedPdfWindow(mobilePdfWindow);
            showErrorDialog(t('error'), formatApiError(e, t('ecommerce_detail_generate_invoice_failed')));
        } finally {
            setIsDownloading(false);
        }
    };

    if (!hasValidOrderId) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
                    <Card className="border-rose-200 bg-rose-50">
                        <CardContent className="p-6 text-sm text-rose-700">{t('ecommerce_detail_invalid_order_id')}</CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <Loader message={t('ecommerce_loading_order_details')} />;
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
                    <Card className="border-rose-200 bg-rose-50">
                        <CardContent className="space-y-4 p-6">
                            <p className="text-sm text-rose-700">{formatApiError(error, t('ecommerce_detail_load_failed'))}</p>
                            <Button variant="outline" onClick={() => router.push('/ecommerce/orders')}>
                                <ArrowLeft className="h-4 w-4" />
                                {t('ecommerce_detail_back_to_orders')}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const orderNumber = order.order_number || parentOrder?.order_number || `STORE-ORDER-${order.id || orderId}`;
    const customerPhone = shipping?.phone || customer?.mobile_number || customer?.phone || '';
    const shippingAddress = [shipping?.address_line, shipping?.area, shipping?.zone, shipping?.city, shipping?.postal_code].filter(Boolean).join(', ');
    const courierCreatePreview = courierCreatePayload();
    const previewProvider = String(courierCreatePreview.provider || '').toLowerCase();
    const courierPreviewRows: { label: string; value: ReactNode }[] = [
        { label: t('ecommerce_detail_provider'), value: String(courierCreatePreview.provider || '').toUpperCase() },
        { label: t('ecommerce_detail_merchant_order_id'), value: courierCreatePreview.merchant_order_id },
        { label: t('ecommerce_detail_recipient'), value: courierCreatePreview.recipient_name },
        { label: t('lbl_phone'), value: courierCreatePreview.recipient_phone },
        { label: t('ecommerce_detail_address'), value: courierCreatePreview.recipient_address },
        { label: t('ecommerce_detail_cod_amount'), value: formatCurrency(Number(courierCreatePreview.cod_amount || 0)) },
        { label: t('ecommerce_detail_item_weight'), value: courierCreatePreview.item_weight ? `${courierCreatePreview.item_weight} KG` : courierCreatePreview.parcel_weight ? `${courierCreatePreview.parcel_weight} g` : '' },
        { label: t('ecommerce_detail_item_quantity'), value: courierCreatePreview.item_quantity },
        { label: t('lbl_description'), value: courierCreatePreview.item_description || courierCreatePreview.delivery_area },
        ...(previewProvider === 'redx'
            ? [
                  { label: t('ecommerce_detail_delivery_area'), value: courierCreatePreview.delivery_area },
                  { label: t('ecommerce_detail_delivery_area_id'), value: courierCreatePreview.delivery_area_id },
                  { label: t('ecommerce_detail_pickup_store_id'), value: courierCreatePreview.pickup_store_id },
              ]
            : []),
        { label: t('ecommerce_detail_courier_note'), value: courierCreatePreview.special_instruction || courierCreatePreview.note },
    ].filter((row) => row.value !== undefined && row.value !== null && row.value !== '');
    const redxPickupLocation = latestRedxParcel?.pickup_location;
    const redxParcelRows: { label: string; value: ReactNode }[] = latestRedxParcel
        ? [
              { label: t('ecommerce_detail_tracking_id'), value: latestRedxParcel.tracking_id || latestCourier?.tracking_code },
              { label: t('ecommerce_detail_courier_status'), value: latestRedxParcel.status || latestCourier?.courier_status },
              { label: t('ecommerce_detail_delivery_fee'), value: latestRedxParcel.charge !== undefined && latestRedxParcel.charge !== null ? formatCurrency(Number(latestRedxParcel.charge)) : '' },
              { label: t('ecommerce_detail_recipient'), value: latestRedxParcel.customer_name },
              { label: t('lbl_phone'), value: latestRedxParcel.customer_phone },
              { label: t('ecommerce_detail_address'), value: latestRedxParcel.customer_address },
              { label: t('ecommerce_detail_delivery_area'), value: latestRedxParcel.delivery_area },
              { label: t('ecommerce_detail_delivery_area_id'), value: latestRedxParcel.delivery_area_id },
              { label: t('ecommerce_detail_cod_amount'), value: latestRedxParcel.cash_collection_amount !== undefined && latestRedxParcel.cash_collection_amount !== null ? formatCurrency(Number(latestRedxParcel.cash_collection_amount)) : '' },
              { label: t('ecommerce_detail_weight_gram'), value: latestRedxParcel.parcel_weight ? `${latestRedxParcel.parcel_weight} g` : '' },
              { label: t('ecommerce_detail_merchant_order_id'), value: latestRedxParcel.merchant_invoice_id },
              { label: t('ecommerce_detail_delivery_type'), value: latestRedxParcel.delivery_type },
              { label: t('ecommerce_detail_courier_note'), value: latestRedxParcel.instruction },
              { label: t('ecommerce_detail_redx_created_at'), value: latestRedxParcel.created_at },
              { label: t('ecommerce_detail_pickup_location'), value: redxPickupLocation ? [redxPickupLocation.name, redxPickupLocation.address, redxPickupLocation.area_name, redxPickupLocation.area_id ? `#${redxPickupLocation.area_id}` : null].filter(Boolean).join(' - ') : '' },
          ].filter((row) => row.value !== undefined && row.value !== null && row.value !== '')
        : [];
    const hasTimeline = ECOMMERCE_ORDER_TIMESTAMPS.some(({ key }) => order?.[key]);

    return (
        <div className="space-y-5">
                <section className="animate-fade-in overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-5 border-b border-slate-100 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 gap-4">
                            <button
                                type="button"
                                aria-label={t('ecommerce_detail_back_to_orders')}
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                                onClick={() => router.push('/ecommerce/orders')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                                        <Globe2 className="h-3.5 w-3.5" />
                                        {t('ecommerce_detail_badge')}
                                    </span>
                                    <StatusBadge status={order.status} label={`${t('ecommerce_detail_fulfillment')}: ${getEcommerceStatusLabel(order.status)}`} />
                                    <StatusBadge status={paymentStatus} label={`${t('ecommerce_detail_payment')}: ${getEcommerceStatusLabel(paymentStatus)}`} />
                                    {latestCourier && (
                                        <Badge variant="outline" className="capitalize">
                                            {t('ecommerce_detail_courier')}: {latestCourier.provider} {t('ecommerce_detail_parcel')}
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">{orderNumber}</h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    {getStoreLabel(stores)} | {order.created_at || getEcommerceFallbackText()}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button variant="outline" onClick={handlePrintInvoice} disabled={isDownloading}>
                                <Printer className="h-4 w-4" />
                                {t('btn_print')}
                            </Button>
                            <Button onClick={handleDownloadInvoice} disabled={isDownloading}>
                                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                {isDownloading ? t('ecommerce_detail_generating') : t('ecommerce_detail_invoice_pdf')}
                            </Button>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryMetric label={t('ecommerce_detail_store_order_amount')} value={formatCurrency(storeOrderAmount)} icon={Banknote} tone="primary" />
                        <SummaryMetric label={t('ecommerce_detail_items')} value={t('ecommerce_detail_items_metric', { lines: items.length, units: totalQty })} icon={Package} />
                        <SummaryMetric label={t('ecommerce_detail_payment')} value={getEcommercePaymentMethodLabel(paymentMethod)} icon={CreditCard} tone={normalizePaymentStatus(paymentStatus) === 'paid' ? 'success' : 'warning'} />
                        <SummaryMetric label={t('ecommerce_detail_source')} value={getEcommerceSourceLabel(order?.source || parentOrder?.source)} icon={Store} />
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
                    <main className="space-y-5">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between p-5">
                                <SectionTitle icon={ShoppingBag} title={t('ecommerce_detail_items_count', { count: items.length })} description={t('ecommerce_detail_items_desc', { count: totalQty })} />
                                <span className="text-sm font-semibold text-slate-900">{formatCurrency(storeItemsSubtotal)}</span>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[760px] text-sm">
                                        <thead className="bg-slate-50">
                                            <tr className="border-y border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                                <th className="px-5 py-3">{t('ecommerce_detail_product')}</th>
                                                <th className="px-5 py-3">{t('ecommerce_detail_sku')}</th>
                                                <th className="px-5 py-3 text-center">{t('lbl_qty')}</th>
                                                <th className="px-5 py-3 text-right">{t('lbl_unit_price')}</th>
                                                <th className="px-5 py-3 text-right">{t('lbl_subtotal')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {items.map((item: any) => (
                                                <tr key={item.id} className="transition hover:bg-primary/5">
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-slate-950">{item.product_name || item?.product?.product_name || item?.product?.name || getEcommerceFallbackText()}</div>
                                                        {formatVariantText(item.variant_data) && <div className="mt-1 text-xs text-slate-500">{formatVariantText(item.variant_data)}</div>}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="font-mono text-xs text-slate-600">{item.sku || item?.product?.sku || getEcommerceFallbackText()}</span>
                                                    </td>
                                                    <td className="px-5 py-4 text-center font-semibold text-slate-900">{item.quantity}</td>
                                                    <td className="px-5 py-4 text-right text-slate-700">{formatCurrency(item.unit_price)}</td>
                                                    <td className="px-5 py-4 text-right font-semibold text-slate-950">{formatCurrency(item.subtotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50">
                                            <tr>
                                                <td colSpan={4} className="px-5 py-3 text-right text-sm font-semibold text-slate-600">
                                                    {t('ecommerce_store_items_subtotal')}
                                                </td>
                                                <td className="px-5 py-3 text-right text-sm font-bold text-slate-950">{formatCurrency(storeItemsSubtotal)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="animate-slide-up">
                            <CardHeader className="flex-row items-start justify-between gap-4 p-5">
                                <SectionTitle icon={Truck} title={t('ecommerce_detail_fulfillment')} description={t('ecommerce_detail_fulfillment_desc')} />
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)} className={cn(controlClass, 'sm:w-[180px]')}>
                                        {ECOMMERCE_ORDER_STATUSES.map((item) => (
                                            <option key={item} value={item}>
                                                {getEcommerceStatusLabel(item)}
                                            </option>
                                        ))}
                                    </select>
                                    <Button onClick={handleStatusUpdate} disabled={isUpdating}>
                                        {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {t('ecommerce_detail_update_status')}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="border-t border-slate-100 p-5">
                                <OrderStatusStepper status={status} />
                                {latestCourier && (
                                    <div className="mt-4 rounded-md border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                                        <span className="font-semibold">{t('ecommerce_detail_courier_tracking')}:</span>{' '}
                                        <span className="capitalize">{latestCourier.provider}</span> {latestCourierStatus || t('ecommerce_detail_waiting_for_courier_status')}
                                        {latestCourier.consignment_id ? ` (${latestCourier.consignment_id})` : ''}
                                        <span className="ml-1 text-sky-700">{t('ecommerce_detail_courier_tracking_note')}</span>
                                    </div>
                                )}
                                {courierFulfillmentSignal && (
                                    <div
                                        className={cn(
                                            'mt-3 flex flex-col gap-3 rounded-md border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between',
                                            courierFulfillmentSignal.tone === 'success' && 'border-emerald-100 bg-emerald-50 text-emerald-900',
                                            courierFulfillmentSignal.tone === 'warning' && 'border-amber-100 bg-amber-50 text-amber-900',
                                            courierFulfillmentSignal.tone === 'info' && 'border-sky-100 bg-sky-50 text-sky-900'
                                        )}
                                    >
                                        <div>
                                            <p className="font-semibold">{t('ecommerce_detail_courier_fulfillment_check')}</p>
                                            <p className="mt-1 leading-5">{t(courierFulfillmentSignal.messageKey)}</p>
                                        </div>
                                        {courierFulfillmentSignal.suggestedStatus && status !== courierFulfillmentSignal.suggestedStatus && (
                                            <Button variant="outline" onClick={() => setStatus(courierFulfillmentSignal.suggestedStatus as OrderStatus)} className="shrink-0">
                                                {t('ecommerce_detail_set_fulfillment_to', { status: getEcommerceStatusLabel(courierFulfillmentSignal.suggestedStatus) })}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="p-5">
                                <SectionTitle icon={CreditCard} title={t('ecommerce_detail_payment')} description={t('ecommerce_detail_payment_desc')} />
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 border-t border-slate-100 p-5 md:grid-cols-4">
                                <InputLabel label={t('lbl_status')}>
                                    <select value={paymentStatusForm} onChange={(event) => setPaymentStatusForm(event.target.value as PaymentStatus)} className={controlClass}>
                                        {ECOMMERCE_PAYMENT_STATUSES.map((item) => (
                                            <option key={item} value={item}>
                                                {getEcommerceStatusLabel(item)}
                                            </option>
                                        ))}
                                    </select>
                                </InputLabel>
                                <InputLabel label={t('ecommerce_detail_method')}>
                                    <select value={paymentMethodForm} onChange={(event) => setPaymentMethodForm(event.target.value)} className={controlClass}>
                                        {ECOMMERCE_PAYMENT_METHODS.map((item) => (
                                            <option key={item} value={item}>
                                                {getEcommercePaymentMethodLabel(item)}
                                            </option>
                                        ))}
                                    </select>
                                </InputLabel>
                                <InputLabel label={t('lbl_amount')}>
                                    <input type="number" min="0" step="0.01" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} className={controlClass} />
                                </InputLabel>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t('ecommerce_detail_current')}</span>
                                    <div className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
                                        <span className="truncate text-sm font-medium text-slate-700">{getEcommercePaymentMethodLabel(paymentMethod)}</span>
                                        <StatusBadge status={paymentStatus} />
                                    </div>
                                </div>
                                <InputLabel label={t('ecommerce_detail_payment_note')} className="md:col-span-3">
                                    <input type="text" value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} placeholder={t('ecommerce_detail_payment_note_placeholder')} className={cn(controlClass, 'placeholder:text-slate-400')} />
                                </InputLabel>
                                <div className="flex items-end">
                                    <Button onClick={handlePaymentUpdate} disabled={isUpdatingPayment} className="w-full">
                                        {isUpdatingPayment && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {t('ecommerce_detail_update_payment')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex-row items-start justify-between gap-4 p-5">
                                <SectionTitle icon={Package} title={t('ecommerce_detail_courier_parcel')} description={t('ecommerce_detail_courier_parcel_desc')} />
                                {latestCourier && (
                                    <Badge variant="secondary" className="capitalize">
                                        {latestCourier.provider} {latestCourier.courier_status || latestCourier.tracking_code || latestCourier.consignment_id}
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="border-t border-slate-100 p-5">
                                {availableCouriers.length === 0 ? (
                                    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                        {t('ecommerce_detail_no_courier_credentials')}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {!latestCourier && (
                                            <>
                                                <div className="grid gap-4 md:grid-cols-4">
                                                    <InputLabel label={t('ecommerce_detail_provider')}>
                                                        <select value={courierProvider} onChange={(event) => setCourierProvider(event.target.value)} className={controlClass}>
                                                            {availableCouriers.map((credential: any) => (
                                                                <option key={credential.provider} value={credential.provider}>
                                                                    {String(credential.provider).toUpperCase()}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </InputLabel>
                                                    <InputLabel label={t('ecommerce_detail_cod_amount')}>
                                                        <input value={courierForm.cod_amount} onChange={(event) => setCourierField('cod_amount', event.target.value)} className={controlClass} />
                                                    </InputLabel>
                                                    <InputLabel label={t('ecommerce_detail_merchant_order_id')}>
                                                        <input value={courierForm.merchant_order_id} onChange={(event) => setCourierField('merchant_order_id', event.target.value)} className={controlClass} />
                                                    </InputLabel>
                                                    <InputLabel label={t('ecommerce_detail_recipient')}>
                                                        <input value={courierForm.recipient_name} onChange={(event) => setCourierField('recipient_name', event.target.value)} className={controlClass} />
                                                    </InputLabel>
                                                    <InputLabel label={t('lbl_phone')}>
                                                        <input value={courierForm.recipient_phone} onChange={(event) => setCourierField('recipient_phone', event.target.value)} className={controlClass} />
                                                    </InputLabel>
                                                    <InputLabel label={t('ecommerce_detail_item_quantity')}>
                                                        <input type="number" min="1" step="1" value={courierForm.item_quantity} onChange={(event) => setCourierField('item_quantity', event.target.value)} className={controlClass} />
                                                    </InputLabel>
                                                    <InputLabel label={t('ecommerce_detail_address')} className="md:col-span-2">
                                                        <input value={courierForm.recipient_address} onChange={(event) => setCourierField('recipient_address', event.target.value)} className={controlClass} />
                                                    </InputLabel>
                                                    <InputLabel label={t('lbl_description')} className="md:col-span-2">
                                                        <input value={courierForm.item_description} onChange={(event) => setCourierField('item_description', event.target.value)} className={controlClass} />
                                                    </InputLabel>

                                                    {courierProvider === 'redx' && (
                                                        <>
                                                            <div className="md:col-span-4">
                                                                <InputLabel label={t('ecommerce_detail_redx_area_lookup')}>
                                                                    <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                                                                        <input
                                                                            value={redxAreaSearch}
                                                                            onChange={(event) => setRedxAreaSearch(event.target.value)}
                                                                            placeholder={t('ecommerce_detail_redx_area_lookup_placeholder')}
                                                                            className={cn(controlClass, 'placeholder:text-slate-400')}
                                                                        />
                                                                        <Button type="button" variant="outline" onClick={handleRedxAreaSearch} disabled={isLoadingRedxAreas}>
                                                                            {isLoadingRedxAreas && <Loader2 className="h-4 w-4 animate-spin" />}
                                                                            {t('search')}
                                                                        </Button>
                                                                    </div>
                                                                </InputLabel>
                                                                {redxAreas.length > 0 && (
                                                                    <select onChange={(event) => handleRedxAreaSelect(event.target.value)} className={cn(controlClass, 'mt-2')}>
                                                                        <option value="">{t('ecommerce_detail_select_redx_area')}</option>
                                                                        {redxAreas.map((area: any, index: number) => (
                                                                            <option key={`${redxAreaId(area) || index}-${redxAreaName(area)}`} value={index}>
                                                                                {redxAreaLabel(area)}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                )}
                                                            </div>
                                                            <InputLabel label={t('ecommerce_detail_delivery_area')}>
                                                                <input value={courierForm.delivery_area} onChange={(event) => setCourierField('delivery_area', event.target.value)} placeholder={t('ecommerce_detail_delivery_area_placeholder')} className={cn(controlClass, 'placeholder:text-slate-400')} />
                                                            </InputLabel>
                                                            <InputLabel label={t('ecommerce_detail_delivery_area_id')}>
                                                                <input value={courierForm.delivery_area_id} onChange={(event) => setCourierField('delivery_area_id', event.target.value)} className={controlClass} />
                                                            </InputLabel>
                                                            {redxPickupStores.length > 0 && (
                                                                <InputLabel label={t('ecommerce_detail_pickup_store_id')} className="md:col-span-2">
                                                                    <select value={courierForm.pickup_store_id} onChange={(event) => setCourierField('pickup_store_id', event.target.value)} className={controlClass}>
                                                                        <option value="">{isLoadingRedxPickupStores ? t('lbl_loading') : t('ecommerce_detail_select_redx_pickup_store')}</option>
                                                                        {redxPickupStores.map((pickupStore: any) => (
                                                                            <option key={pickupStore.id} value={pickupStore.id}>
                                                                                {redxPickupStoreLabel(pickupStore)}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </InputLabel>
                                                            )}
                                                            <InputLabel label={t('ecommerce_detail_pickup_store_id')}>
                                                                <input value={courierForm.pickup_store_id} onChange={(event) => setCourierField('pickup_store_id', event.target.value)} placeholder={t('ecommerce_detail_optional_if_saved')} className={cn(controlClass, 'placeholder:text-slate-400')} />
                                                            </InputLabel>
                                                            <InputLabel label={t('ecommerce_detail_weight_gram')}>
                                                                <input value={courierForm.parcel_weight} onChange={(event) => setCourierField('parcel_weight', event.target.value)} className={controlClass} />
                                                            </InputLabel>
                                                        </>
                                                    )}
                                                </div>

                                                <InputLabel label={t('ecommerce_detail_courier_note')}>
                                                    <input value={courierForm.note} onChange={(event) => setCourierField('note', event.target.value)} className={controlClass} />
                                                </InputLabel>

                                                <div className="space-y-3 rounded-md border border-slate-100 bg-slate-50 p-4">
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-slate-950">{t('ecommerce_detail_create_parcel_details')}</h3>
                                                        <p className="mt-1 text-xs leading-5 text-slate-500">{t('ecommerce_detail_create_parcel_details_desc')}</p>
                                                    </div>
                                                    <div className="grid gap-4 md:grid-cols-3">
                                                        {courierPreviewRows.map((row) => (
                                                            <InfoLine key={row.label} label={row.label} value={row.value} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {latestCourier && (
                                            <div className="space-y-3 rounded-md border border-emerald-100 bg-emerald-50 p-4">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-emerald-950">{t('ecommerce_detail_existing_parcel')}</h3>
                                                    <p className="mt-1 text-xs leading-5 text-emerald-700">{t('ecommerce_detail_existing_parcel_desc')}</p>
                                                </div>
                                                <div className="grid gap-4 md:grid-cols-3">
                                                    <InfoLine label={t('ecommerce_detail_consignment_id')} value={latestCourier.consignment_id} />
                                                    <InfoLine label={t('ecommerce_detail_merchant_order_id')} value={latestCourier.merchant_order_id} />
                                                    <InfoLine label={t('ecommerce_detail_courier_status')} value={latestCourierStatus} />
                                                    <InfoLine label={t('ecommerce_detail_delivery_fee')} value={latestCourier.delivery_fee !== null && latestCourier.delivery_fee !== undefined ? formatCurrency(Number(latestCourier.delivery_fee)) : ''} />
                                                    <InfoLine label={t('ecommerce_detail_courier_updated_at')} value={latestCourier.courier_status_updated_at || latestCourierResponseData?.updated_at || latestCourier.updated_at} />
                                                    <InfoLine label={t('ecommerce_detail_invoice_id')} value={latestCourier.invoice_id || latestCourierResponseData?.invoice_id} />
                                                </div>
                                                {redxParcelRows.length > 0 && (
                                                    <div className="space-y-3 rounded-md border border-emerald-100 bg-white/80 p-4">
                                                        <h3 className="text-sm font-semibold text-emerald-950">{t('ecommerce_detail_redx_parcel_details')}</h3>
                                                        <div className="grid gap-4 md:grid-cols-3">
                                                            {redxParcelRows.map((row) => (
                                                                <InfoLine key={row.label} label={row.label} value={row.value} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                                            {!latestCourier ? (
                                                <Button onClick={() => setIsCourierConfirmOpen(true)} disabled={isCreatingCourier}>
                                                    {isCreatingCourier && <Loader2 className="h-4 w-4 animate-spin" />}
                                                    {t('ecommerce_detail_create_parcel')}
                                                </Button>
                                            ) : (
                                                <Button variant="secondary" onClick={handleCourierStatus} disabled={isRefreshingCourier}>
                                                    {isRefreshingCourier && <Loader2 className="h-4 w-4 animate-spin" />}
                                                    {t('ecommerce_detail_refresh_status')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {availableCouriers.length > 0 && courierProvider !== 'steadfast' && (
                            <Card>
                                <CardHeader className="p-5">
                                    <SectionTitle icon={Truck} title={t('ecommerce_detail_delivery_charge_check')} description={t('ecommerce_detail_delivery_charge_check_desc')} />
                                </CardHeader>
                                <CardContent className="space-y-4 border-t border-slate-100 p-5">
                                    {courierProvider === 'pathao' && (
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <InputLabel label={t('ecommerce_detail_city')}>
                                                <select
                                                    value={courierChargeForm.recipient_city}
                                                    onChange={(event) => setCourierChargeField('recipient_city', event.target.value)}
                                                    className={controlClass}
                                                    disabled={isLoadingPathaoCities}
                                                >
                                                    <option value="">{isLoadingPathaoCities ? t('lbl_loading') : t('ecommerce_detail_select_city')}</option>
                                                    {pathaoCities.map((city: any) => (
                                                        <option key={city.city_id} value={city.city_id}>
                                                            {city.city_name} ({city.city_id})
                                                        </option>
                                                    ))}
                                                </select>
                                            </InputLabel>
                                            <InputLabel label={t('ecommerce_detail_zone')}>
                                                <select
                                                    value={courierChargeForm.recipient_zone}
                                                    onChange={(event) => setCourierChargeField('recipient_zone', event.target.value)}
                                                    className={controlClass}
                                                    disabled={!courierChargeForm.recipient_city || isLoadingPathaoZones}
                                                >
                                                    <option value="">{isLoadingPathaoZones ? t('lbl_loading') : t('ecommerce_detail_select_zone')}</option>
                                                    {pathaoZones.map((zone: any) => (
                                                        <option key={zone.zone_id} value={zone.zone_id}>
                                                            {zone.zone_name} ({zone.zone_id})
                                                        </option>
                                                    ))}
                                                </select>
                                            </InputLabel>
                                            <InputLabel label={t('ecommerce_detail_weight_kg')}>
                                                <input value={courierChargeForm.item_weight} onChange={(event) => setCourierChargeField('item_weight', event.target.value)} className={controlClass} />
                                            </InputLabel>
                                        </div>
                                    )}

                                    {courierProvider === 'redx' && (
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <InputLabel label={t('ecommerce_detail_delivery_area_id')}>
                                                <input value={courierChargeForm.delivery_area_id} onChange={(event) => setCourierChargeField('delivery_area_id', event.target.value)} className={controlClass} />
                                            </InputLabel>
                                            <InputLabel label={t('ecommerce_detail_pickup_area_id')}>
                                                <input value={courierChargeForm.pickup_area_id} onChange={(event) => setCourierChargeField('pickup_area_id', event.target.value)} placeholder={t('ecommerce_detail_optional_if_saved')} className={cn(controlClass, 'placeholder:text-slate-400')} />
                                            </InputLabel>
                                            <InputLabel label={t('ecommerce_detail_weight_gram')}>
                                                <input value={courierChargeForm.parcel_weight} onChange={(event) => setCourierChargeField('parcel_weight', event.target.value)} className={controlClass} />
                                            </InputLabel>
                                        </div>
                                    )}

                                    <Button variant="outline" onClick={handleCourierPrice} disabled={isCalculatingCourier}>
                                        {isCalculatingCourier && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {t('ecommerce_detail_calculate_charge')}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        <CourierFraudCheckPanel
                            storeId={courierStoreId || null}
                            storeOrderId={order?.id || orderId}
                            defaultPhone={customerPhone}
                            title={t('ecommerce_detail_order_fraud_check')}
                            description={t('ecommerce_detail_order_fraud_check_desc')}
                        />

                        <Card>
                            <CardHeader className="p-5">
                                <SectionTitle icon={ReceiptText} title={t('ecommerce_detail_transactions')} description={t('ecommerce_detail_transactions_desc')} />
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[680px] text-sm">
                                        <thead className="bg-slate-50">
                                            <tr className="border-y border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                                <th className="px-5 py-3">{t('ecommerce_detail_method')}</th>
                                                <th className="px-5 py-3">{t('lbl_status')}</th>
                                                <th className="px-5 py-3">{t('lbl_notes')}</th>
                                                <th className="px-5 py-3">{t('lbl_date')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {transactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">
                                                        {t('ecommerce_detail_no_transactions')}
                                                    </td>
                                                </tr>
                                            ) : (
                                                transactions.map((tx: any) => (
                                                    <tr key={tx.id} className="transition hover:bg-primary/5">
                                                        <td className="px-5 py-4 font-semibold text-slate-950">{getEcommercePaymentMethodLabel(tx.payment_method)}</td>
                                                        <td className="px-5 py-4">
                                                            <StatusBadge status={tx.payment_status} />
                                                        </td>
                                                        <td className="px-5 py-4 text-slate-600">{tx.notes || '--'}</td>
                                                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{tx.created_at || '--'}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </main>

                    <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
                        <Card className="overflow-hidden">
                            <div className="bg-slate-950 px-5 py-4 text-white">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">{t('ecommerce_detail_store_order_amount')}</p>
                                <p className="mt-1 text-3xl font-semibold tracking-tight">{formatCurrency(storeOrderAmount)}</p>
                                <p className="mt-2 text-xs leading-5 text-slate-300">{t('ecommerce_detail_store_order_amount_desc')}</p>
                            </div>
                            <div className="divide-y divide-slate-100">
                                <CompactInfoRow label={t('ecommerce_detail_store_shop')} value={getStoreLabel(stores)} />
                                <CompactInfoRow label={t('ecommerce_detail_source')} value={getEcommerceSourceLabel(order?.source || parentOrder?.source)} />
                                <CompactInfoRow label={t('ecommerce_store_items_subtotal')} value={formatCurrency(storeItemsSubtotal)} />
                                <CompactInfoRow label={t('ecommerce_detail_shipping')} value={formatCurrency(storeShippingFee)} />
                                <CompactInfoRow label={t('ecommerce_detail_payment')} value={getEcommercePaymentMethodLabel(paymentMethod)} />
                                <CompactInfoRow label={t('lbl_created')} value={order.created_at} />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader className="p-5">
                                <SectionTitle icon={User} title={t('lbl_customer')} />
                            </CardHeader>
                            <div className="divide-y divide-slate-100 border-t border-slate-100">
                                <CompactInfoRow label={t('lbl_name')} value={customer?.name} />
                                <CompactInfoRow
                                    label={t('lbl_phone')}
                                    value={
                                        customerPhone ? (
                                            <span className="inline-flex items-center justify-end gap-1.5">
                                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                {customerPhone}
                                            </span>
                                        ) : (
                                            ''
                                        )
                                    }
                                />
                                <CompactInfoRow
                                    label={t('lbl_email')}
                                    value={
                                        customer?.email ? (
                                            <span className="inline-flex items-center justify-end gap-1.5">
                                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                {customer.email}
                                            </span>
                                        ) : (
                                            ''
                                        )
                                    }
                                />
                            </div>
                        </Card>

                        <Card>
                            <CardHeader className="p-5">
                                <SectionTitle icon={MapPin} title={t('ecommerce_detail_shipping')} />
                            </CardHeader>
                            <div className="divide-y divide-slate-100 border-t border-slate-100">
                                <CompactInfoRow label={t('ecommerce_detail_recipient')} value={shipping?.name || customer?.name} />
                                <CompactInfoRow label={t('ecommerce_detail_address')} value={shippingAddress} />
                                {(shipping?.label || shipping?.type) && (
                                    <div className="flex items-center justify-between gap-4 px-5 py-3">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t('lbl_type')}</span>
                                        <div className="flex flex-wrap justify-end gap-2">
                                            {shipping?.label && <Badge variant="secondary">{shipping.label}</Badge>}
                                            {shipping?.type && <Badge variant="outline">{shipping.type}</Badge>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {hasTimeline && (
                            <Card>
                                <CardHeader className="p-5">
                                    <SectionTitle icon={CalendarClock} title={t('ecommerce_detail_stock_timeline')} />
                                </CardHeader>
                                <CardContent className="space-y-4 border-t border-slate-100 p-5">
                                    {ECOMMERCE_ORDER_TIMESTAMPS.map(({ key }) => (
                                        <InfoLine key={key} label={t(`ecommerce_detail_timeline_${key}`)} value={order?.[key]} />
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {order.notes && (
                            <Card className="border-amber-200 bg-amber-50">
                                <CardContent className="flex gap-3 p-5">
                                    <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">{t('ecommerce_detail_customer_note')}</p>
                                        <p className="mt-1 text-sm leading-6 text-amber-950">{order.notes}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </aside>
            </div>

            {isCourierConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                    <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
                        <div className="border-b border-slate-100 p-5">
                            <h2 className="text-base font-semibold text-slate-950">{t('ecommerce_detail_confirm_create_parcel')}</h2>
                            <p className="mt-1 text-sm leading-6 text-slate-500">{t('ecommerce_detail_confirm_create_parcel_desc')}</p>
                        </div>
                        <div className="max-h-[65vh] overflow-y-auto p-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                {courierPreviewRows.map((row) => (
                                    <InfoLine key={row.label} label={row.label} value={row.value} />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 p-5">
                            <Button variant="outline" onClick={() => setIsCourierConfirmOpen(false)} disabled={isCreatingCourier}>
                                {t('lbl_cancel')}
                            </Button>
                            <Button onClick={handleCourierCreate} disabled={isCreatingCourier}>
                                {isCreatingCourier && <Loader2 className="h-4 w-4 animate-spin" />}
                                {t('ecommerce_detail_confirm_create_parcel_action')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EcommerceOrderDetailsPage;

function CompactInfoRow({ label, value }: { label: string; value: ReactNode }) {
    const isEmpty = value === null || value === undefined || value === '';
    return (
        <div className="flex items-center justify-between gap-4 px-5 py-3">
            <span className="flex-shrink-0 text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
            <span className="min-w-0 text-right text-sm font-semibold text-slate-900">{isEmpty ? <span className="text-slate-400">--</span> : value}</span>
        </div>
    );
}
