'use client';
import { useEffect, useMemo, useState, type ButtonHTMLAttributes, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { ArrowLeft, CheckCircle2, Circle, CreditCard, Download, FileText, Globe2, Loader2, MapPin, Package, Phone, Printer, ReceiptText, RotateCcw, ShoppingBag, Truck, User } from 'lucide-react';

import Loader from '@/lib/Loader';
import { cn } from '@/lib/utils';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetEcommerceOrderQuery, useUpdateEcommerceOrderPaymentMutation, useUpdateEcommerceOrderStatusMutation } from '@/store/features/ecommerce/ecommerceManagementApi';
import { useGetStoreLogoQuery } from '@/store/features/store/storeApi';
import { useParams, useRouter } from 'next/navigation';
import { generateOrderInvoicePDF } from './generate-order-invoice-pdf';
import { StatusBadge } from './EcommerceBadges';
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

/* ------------------------------------------------------------------ */
/*  Atoms                                                              */
/* ------------------------------------------------------------------ */

type CardProps = HTMLAttributes<HTMLDivElement>;
type HeadingProps = HTMLAttributes<HTMLHeadingElement>;
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline' | 'secondary';
};
type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
    variant?: 'secondary' | 'outline';
};

const Card = ({ className, ...props }: CardProps) => <div className={cn('rounded-xl border bg-white shadow-sm', className)} {...props} />;

const CardHeader = ({ className, ...props }: CardProps) => <div className={cn('flex flex-col p-6', className)} {...props} />;

const CardContent = ({ className, ...props }: CardProps) => <div className={cn('p-6', className)} {...props} />;

const CardTitle = ({ className, ...props }: HeadingProps) => <h2 className={cn('text-lg font-semibold text-slate-900', className)} {...props} />;

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
                'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
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

const normalizePaymentStatus = (value?: string): PaymentStatus => {
    const status = String(value || '').toLowerCase();
    return ECOMMERCE_PAYMENT_STATUSES.includes(status as PaymentStatus) ? (status as PaymentStatus) : 'pending';
};

/* ------------------------------------------------------------------ */
/*  Status Stepper                                                     */
/* ------------------------------------------------------------------ */

function OrderStatusStepper({ status }: { status: OrderStatus }) {
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
        return <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">This store order has been cancelled.</div>;
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
    const { data, isLoading, error } = useGetEcommerceOrderQuery(orderId, {
        skip: !hasValidOrderId,
        refetchOnMountOrArgChange: 30,
    });
    const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateEcommerceOrderStatusMutation();
    const [updateOrderPayment, { isLoading: isUpdatingPayment }] = useUpdateEcommerceOrderPaymentMutation();

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
    const storeTotal = Number(order?.store_total ?? order?.total ?? storeItemsSubtotal ?? 0);
    const totalQty = useMemo(() => items.reduce((sum: number, item: any) => sum + Number(item?.quantity || 0), 0), [items]);
    const paymentMethod = order?.payment_method || order?.latest_payment_method || primaryTransaction?.payment_method;
    const paymentStatus = order?.payment_status || order?.latest_payment_status || primaryTransaction?.payment_status;
    const matchedStore = useMemo(() => {
        if (stores.length === 0) return currentStore || null;
        return userStores.find((store) => Number(store.id) === Number(stores[0]?.id)) || currentStore || stores[0];
    }, [currentStore, stores, userStores]);
    const invoiceStoreId = Number(matchedStore?.id || currentStoreId || 0);
    const { data: logoData } = useGetStoreLogoQuery(invoiceStoreId, { skip: !invoiceStoreId });

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

    const handleStatusUpdate = async () => {
        if (!order?.id) return;

        try {
            await updateOrderStatus({ id: order.id, status }).unwrap();
            showSuccessDialog('Success', `Store order status updated to ${getEcommerceStatusLabel(status)}.`);
        } catch (updateError) {
            showErrorDialog('Error', formatApiError(updateError));
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
            showSuccessDialog('Success', `Store order payment updated to ${getEcommerceStatusLabel(paymentStatusForm)}.`);
        } catch (updateError) {
            showErrorDialog('Error', formatApiError(updateError));
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            setIsDownloading(true);
            await generateOrderInvoicePDF({
                invoice: order?.order_number || parentOrder?.order_number || `STORE-ORDER-${order?.id || orderId}`,
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
            });
        } catch (e) {
            showErrorDialog('Error', formatApiError(e, 'Failed to generate invoice.'));
        } finally {
            setIsDownloading(false);
        }
    };

    if (!hasValidOrderId) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
                    <Card className="border-rose-200 bg-rose-50">
                        <CardContent className="p-6 text-sm text-rose-700">Invalid ecommerce order id.</CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <Loader message="Loading ecommerce order details..." />;
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
                    <Card className="border-rose-200 bg-rose-50">
                        <CardContent className="space-y-4 p-6">
                            <p className="text-sm text-rose-700">{formatApiError(error, 'Failed to load ecommerce order details.')}</p>
                            <Button variant="outline" onClick={() => router.push('/ecommerce/orders')}>
                                <ArrowLeft className="h-4 w-4" />
                                Back to orders
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <Globe2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Ecommerce Order Details</h1>
                        <p className="text-sm text-gray-500">Review assigned-store items, payment state, and update order status.</p>
                    </div>
                </div>

                {/* Sticky toolbar */}
                <div className="sticky top-0 z-10 -mx-4 rounded-xl border border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                aria-label="Back to orders"
                                className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                                onClick={() => router.push('/ecommerce/orders')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                                        <Globe2 className="h-3.5 w-3.5" />
                                        Store order
                                    </span>
                                    <StatusBadge status={order.status} />
                                    <StatusBadge status={paymentStatus} />
                                </div>
                                <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">{order.order_number || parentOrder?.order_number}</h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Placed on {order.created_at || getEcommerceFallbackText()} · {items.length} item{items.length !== 1 ? 's' : ''} · {totalQty} units
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[560px]">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Store Total</p>
                                <p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(storeTotal)}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Items</p>
                                <p className="mt-1 text-lg font-semibold text-slate-950">{items.length}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Payment</p>
                                <p className="mt-1 text-sm font-semibold text-slate-950">{getEcommercePaymentMethodLabel(paymentMethod)}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Store</p>
                                <p className="mt-1 truncate text-sm font-semibold text-slate-950">{getStoreLabel(stores)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.65fr)]">
                    <Card className="border-slate-200">
                        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Package className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-semibold">Fulfillment Status</CardTitle>
                                    <p className="mt-0.5 text-xs text-slate-500">Delivery controls stock behavior only.</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    value={status}
                                    onChange={(event) => setStatus(event.target.value as OrderStatus)}
                                    className="h-10 w-[170px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                >
                                    {ECOMMERCE_ORDER_STATUSES.map((item) => (
                                        <option key={item} value={item}>
                                            {getEcommerceStatusLabel(item)}
                                        </option>
                                    ))}
                                </select>
                                <Button onClick={handleStatusUpdate} disabled={isUpdating} className="h-10">
                                    {isUpdating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Updating
                                        </>
                                    ) : (
                                        'Update status'
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <OrderStatusStepper status={status} />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                        <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <CreditCard className="h-4 w-4" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold">Payment Collection</CardTitle>
                                <p className="mt-0.5 text-xs text-slate-500">Payment creates the ecommerce sales journal.</p>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Status</span>
                                <select
                                    value={paymentStatusForm}
                                    onChange={(event) => setPaymentStatusForm(event.target.value as PaymentStatus)}
                                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                >
                                    {ECOMMERCE_PAYMENT_STATUSES.map((item) => (
                                        <option key={item} value={item}>
                                            {getEcommerceStatusLabel(item)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Method</span>
                                <select
                                    value={paymentMethodForm}
                                    onChange={(event) => setPaymentMethodForm(event.target.value)}
                                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                >
                                    {ECOMMERCE_PAYMENT_METHODS.map((item) => (
                                        <option key={item} value={item}>
                                            {getEcommercePaymentMethodLabel(item)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Amount</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={paymentAmount}
                                    onChange={(event) => setPaymentAmount(event.target.value)}
                                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                />
                            </label>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Current</span>
                                <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
                                    <span className="truncate text-sm font-medium text-slate-700">{getEcommercePaymentMethodLabel(paymentMethod)}</span>
                                    <StatusBadge status={paymentStatus} />
                                </div>
                            </div>
                            <label className="flex flex-col gap-1.5 sm:col-span-2">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Payment Note</span>
                                <input
                                    type="text"
                                    value={paymentNote}
                                    onChange={(event) => setPaymentNote(event.target.value)}
                                    placeholder="Courier office collected cash"
                                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                                />
                            </label>
                            <Button onClick={handlePaymentUpdate} disabled={isUpdatingPayment} className="h-10 sm:col-span-2">
                                {isUpdatingPayment ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Updating
                                    </>
                                ) : (
                                    'Update payment'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                    <Card className="overflow-hidden border-gray-200">
                        <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                            <section>
                                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-base font-semibold">Customer</CardTitle>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    <CompactInfoRow label="Name" value={customer?.name} />
                                    <CompactInfoRow
                                        label="Phone"
                                        value={
                                            customer?.mobile_number || customer?.phone ? (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                    {customer?.mobile_number || customer?.phone}
                                                </span>
                                            ) : (
                                                ''
                                            )
                                        }
                                    />
                                    <CompactInfoRow label="Email" value={customer?.email} />
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-base font-semibold">Shipping</CardTitle>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    <CompactInfoRow label="Recipient" value={shipping?.name} />
                                    <CompactInfoRow
                                        label="Address"
                                        value={
                                            shipping?.address_line || shipping?.area || shipping?.zone || shipping?.city || shipping?.postal_code ? (
                                                <span className="text-right leading-snug">
                                                    <span className="block">{shipping?.address_line}</span>
                                                    <span className="block text-slate-600">{[shipping?.area, shipping?.zone, shipping?.city, shipping?.postal_code].filter(Boolean).join(', ')}</span>
                                                </span>
                                            ) : (
                                                ''
                                            )
                                        }
                                    />
                                    {(shipping?.label || shipping?.type) && (
                                        <div className="flex items-center justify-between gap-4 px-5 py-3">
                                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Type</span>
                                            <div className="flex flex-wrap justify-end gap-2">
                                                {shipping?.label && (
                                                    <Badge variant="secondary" className="font-normal">
                                                        {shipping.label}
                                                    </Badge>
                                                )}
                                                {shipping?.type && (
                                                    <Badge variant="outline" className="font-normal">
                                                        {shipping.type}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </Card>

                    <Card className="overflow-hidden border-gray-200">
                        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <ReceiptText className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-base font-semibold">Order Summary</CardTitle>
                        </div>
                        <div className="divide-y divide-slate-100 text-sm">
                            <CompactInfoRow label="Store / Shop" value={getStoreLabel(stores)} />
                            <CompactInfoRow label="Source" value={getEcommerceSourceLabel(order?.source || parentOrder?.source)} />
                            <CompactInfoRow label="Subtotal" value={formatCurrency(storeItemsSubtotal)} />
                            <div className="flex items-center justify-between gap-4 bg-slate-50 px-5 py-3">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Store Total</span>
                                <span className="text-xl font-bold text-slate-950">{formatCurrency(storeTotal)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 px-5 py-3">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Payment</span>
                                <div className="flex min-w-0 items-center gap-2 text-right">
                                    <span className="truncate text-sm font-semibold text-slate-800">{getEcommercePaymentMethodLabel(paymentMethod)}</span>
                                    <StatusBadge status={paymentStatus} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {ECOMMERCE_ORDER_TIMESTAMPS.some(({ key }) => order?.[key]) && (
                    <Card className="border-gray-200">
                        <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Package className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-base font-semibold">Stock Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {ECOMMERCE_ORDER_TIMESTAMPS.map(({ key, label }) => (
                                    <InfoLine key={key} label={label} value={order?.[key]} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Items */}
                <Card className="border-gray-200">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-slate-700" />
                            <CardTitle className="text-base font-semibold">Items ({items.length})</CardTitle>
                        </div>
                        <span className="text-sm text-slate-500">{totalQty} units total</span>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr className="border-y border-slate-200 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                        <th className="px-6 py-3">Product</th>
                                        <th className="px-6 py-3">SKU</th>
                                        <th className="px-6 py-3 text-center">Qty</th>
                                        <th className="px-6 py-3 text-right">Unit price</th>
                                        <th className="px-6 py-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item: any) => (
                                        <tr key={item.id} className="transition-colors hover:bg-slate-50/60">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{item.product_name || item?.product?.product_name || item?.product?.name || getEcommerceFallbackText()}</div>
                                                {formatVariantText(item.variant_data) && <div className="mt-0.5 text-xs text-slate-500">{formatVariantText(item.variant_data)}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs text-slate-600">{item.sku || item?.product?.sku || getEcommerceFallbackText()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-slate-900">{item.quantity}</td>
                                            <td className="px-6 py-4 text-right text-slate-700">{formatCurrency(item.unit_price)}</td>
                                            <td className="px-6 py-4 text-right font-semibold text-slate-900">{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50/60">
                                    <tr>
                                        <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-slate-600">
                                            Store items subtotal
                                        </td>
                                        <td className="px-6 py-3 text-right text-sm font-semibold text-slate-900">{formatCurrency(storeItemsSubtotal)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions */}
                <Card className="border-gray-200">
                    <CardHeader className="flex-row items-center gap-2 space-y-0 pb-4">
                        <CreditCard className="h-5 w-5 text-slate-700" />
                        <CardTitle className="text-base font-semibold">Transactions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr className="border-y border-slate-200 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                        <th className="px-6 py-3">Method</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Notes</th>
                                        <th className="px-6 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500">
                                                No transactions recorded for this order.
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx: any) => (
                                            <tr key={tx.id} className="transition-colors hover:bg-slate-50/60">
                                                <td className="px-6 py-4 font-medium text-slate-900">{getEcommercePaymentMethodLabel(tx.payment_method)}</td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={tx.payment_status} />
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{tx.notes || '—'}</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-slate-600">{tx.created_at}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes */}
                {order.notes && (
                    <Card className="border-amber-200 bg-amber-50/50">
                        <CardContent className="flex gap-3 p-5">
                            <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Customer note</p>
                                <p className="mt-1 text-sm leading-relaxed text-amber-900">{order.notes}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Invoice download CTA — bottom of page */}
                <Card className="border-gray-200 bg-white text-slate-900">
                    <CardContent className="flex flex-col items-start gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight">Invoice ready to download</h2>
                                <p className="mt-1 text-sm text-slate-500">A PDF invoice for {order.order_number || parentOrder?.order_number} including store items and payment status.</p>
                            </div>
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                            <Button variant="outline" onClick={() => window.print()} className="h-11">
                                <Printer className="h-4 w-4" />
                                Print
                            </Button>
                            <Button onClick={handleDownloadInvoice} disabled={isDownloading} className="h-11">
                                {isDownloading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generating…
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Download invoice (PDF)
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <p className="pb-4 text-center text-xs text-slate-400">Invoice format mirrors the standard POS receipt template — A4, with header, itemized table, totals, and signature block.</p>
            </div>
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
