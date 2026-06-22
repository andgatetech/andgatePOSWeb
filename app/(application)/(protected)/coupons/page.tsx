'use client';
import DateColumn from '@/components/common/DateColumn';
import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { Coupon, CouponPayload, useCreateCouponMutation, useDeleteCouponMutation, useGetCouponsQuery, useUpdateCouponMutation } from '@/store/features/coupon/couponApi';
import { Edit, Plus, Save, Tag, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const emptyForm = {
    code: '',
    name: '',
    type: 'percent' as 'percent' | 'fixed',
    value: '',
    min_order_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    per_customer_limit: '',
    starts_at: '',
    expires_at: '',
    is_active: true,
};

const CouponModal = ({ showModal, modalType, selectedCoupon, onClose, onSubmit, loading }: any) => {
    const { t } = getTranslation();
    const { symbol } = useCurrency();
    const [formData, setFormData] = useState(emptyForm);

    useMemo(() => {
        if (showModal) {
            if (modalType === 'edit' && selectedCoupon) {
                setFormData({
                    code: selectedCoupon.code || '',
                    name: selectedCoupon.name || '',
                    type: selectedCoupon.type || 'percent',
                    value: selectedCoupon.value ?? '',
                    min_order_amount: selectedCoupon.min_order_amount ?? '',
                    max_discount_amount: selectedCoupon.max_discount_amount ?? '',
                    usage_limit: selectedCoupon.usage_limit ?? '',
                    per_customer_limit: selectedCoupon.per_customer_limit ?? '',
                    starts_at: selectedCoupon.starts_at ? selectedCoupon.starts_at.slice(0, 10) : '',
                    expires_at: selectedCoupon.expires_at ? selectedCoupon.expires_at.slice(0, 10) : '',
                    is_active: Boolean(selectedCoupon.is_active),
                });
            } else {
                setFormData(emptyForm);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showModal, modalType, selectedCoupon]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
                <div className="border-b border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">{modalType === 'create' ? t('coupon_create_title') : t('coupon_edit_title')}</h2>
                        <button onClick={onClose} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {t('coupon_code')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:border-transparent focus:ring-2 focus:ring-primary"
                                placeholder="EID2026"
                                disabled={modalType === 'edit'}
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {t('coupon_name')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary"
                                placeholder={t('coupon_name_placeholder')}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">{t('coupon_type')}</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percent' | 'fixed' })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary"
                            >
                                <option value="percent">{t('coupon_type_percent')}</option>
                                <option value="fixed">{t('coupon_type_fixed')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {t('coupon_value')} ({formData.type === 'percent' ? '%' : symbol}) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">{t('coupon_min_order')}</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.min_order_amount}
                                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary"
                                placeholder={t('coupon_optional')}
                            />
                        </div>
                        {formData.type === 'percent' && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('coupon_max_discount')}</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.max_discount_amount}
                                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary"
                                    placeholder={t('coupon_optional')}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">{t('coupon_usage_limit')}</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.usage_limit}
                                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary"
                                placeholder={t('coupon_unlimited')}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">{t('coupon_per_customer_limit')}</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.per_customer_limit}
                                onChange={(e) => setFormData({ ...formData, per_customer_limit: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary"
                                placeholder={t('coupon_unlimited')}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">{t('coupon_starts_at')}</label>
                            <input
                                type="date"
                                value={formData.starts_at}
                                onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">{t('coupon_expires_at')}</label>
                            <input
                                type="date"
                                value={formData.expires_at}
                                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                            {t('coupon_is_active')}
                        </label>
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                        <button type="button" onClick={onClose} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-1">
                            {t('btn_cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 sm:flex-1"
                        >
                            <Save className="h-4 w-4" />
                            {loading ? t('btn_creating') : modalType === 'create' ? t('btn_create') : t('btn_update')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CouponsPage = () => {
    const { t } = getTranslation();
    const { symbol } = useCurrency();
    const { data: couponsResponse, isLoading, error } = useGetCouponsQuery();
    const [createCoupon] = useCreateCouponMutation();
    const [updateCoupon] = useUpdateCouponMutation();
    const [deleteCoupon] = useDeleteCouponMutation();

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'create' | 'edit'>('create');
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [loading, setLoading] = useState(false);

    const coupons = useMemo(() => couponsResponse?.data || [], [couponsResponse]);

    const openModal = (type: 'create' | 'edit', coupon: Coupon | null = null) => {
        setModalType(type);
        setSelectedCoupon(coupon);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCoupon(null);
    };

    const handleSubmit = async (formData: typeof emptyForm) => {
        setLoading(true);
        try {
            const payload: CouponPayload = {
                code: formData.code.trim().toUpperCase(),
                name: formData.name.trim(),
                type: formData.type,
                value: Number(formData.value),
                min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : null,
                max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
                usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
                per_customer_limit: formData.per_customer_limit ? Number(formData.per_customer_limit) : null,
                starts_at: formData.starts_at || null,
                expires_at: formData.expires_at || null,
                is_active: formData.is_active,
            };

            if (modalType === 'create') {
                await createCoupon(payload).unwrap();
                showSuccessDialog(t('msg_success'), t('coupon_created'));
            } else if (selectedCoupon) {
                const { code, ...updatePayload } = payload;
                await updateCoupon({ id: selectedCoupon.id, body: updatePayload }).unwrap();
                showSuccessDialog(t('msg_success'), t('coupon_updated'));
            }
            closeModal();
        } catch (err: any) {
            const errorMessage = err?.data?.errors?.code?.[0] || err?.data?.message || t('msg_error_occurred');
            showErrorDialog(t('msg_error'), errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirmDialog(t('msg_confirm_delete_title'), t('msg_confirm_delete_text'), t('msg_confirm_delete_btn'), t('btn_cancel'), false);
        if (confirmed) {
            try {
                await deleteCoupon(id).unwrap();
                showSuccessDialog(t('msg_success'), t('coupon_deleted'));
            } catch {
                showErrorDialog(t('msg_error'), t('coupon_error_delete'));
            }
        }
    };

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'code',
                label: t('coupon_code'),
                render: (value, row) => (
                    <div>
                        <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-sm font-bold text-primary">{value}</span>
                        <div className="mt-1 text-xs text-gray-500">{row.name}</div>
                    </div>
                ),
            },
            {
                key: 'value',
                label: t('coupon_value'),
                render: (value, row) => <span className="text-sm font-semibold text-gray-900">{row.type === 'percent' ? `${value}%` : `${symbol}${value}`}</span>,
            },
            {
                key: 'usage_count',
                label: t('coupon_usage'),
                render: (value, row) => (
                    <span className="text-sm text-gray-700">
                        {value} / {row.usage_limit ?? '∞'}
                    </span>
                ),
            },
            {
                key: 'expires_at',
                label: t('coupon_expires_at'),
                render: (value) => (value ? <DateColumn date={value} /> : <span className="text-sm text-gray-400">{t('coupon_no_expiry')}</span>),
            },
            {
                key: 'is_active',
                label: t('lbl_status'),
                render: (value) => (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {value ? t('status_active') : t('status_inactive')}
                    </span>
                ),
            },
        ],
        [t, symbol]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: t('btn_edit'),
                onClick: (coupon) => openModal('edit', coupon),
                icon: <Edit className="h-4 w-4" />,
                className: 'text-blue-600 hover:bg-blue-50',
            },
            {
                label: t('btn_delete'),
                onClick: (coupon) => handleDelete(coupon.id),
                icon: <Trash2 className="h-4 w-4" />,
                className: 'text-red-600 hover:bg-red-50',
            },
        ],
        [t]
    );

    if (isLoading) return <Loader message={t('coupon_loading')} />;

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">{t('coupon_error_load')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                        <Tag className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('coupon_page_title')}</h1>
                        <p className="text-sm text-gray-500">{t('coupon_page_desc')}</p>
                    </div>
                </div>
                <button
                    onClick={() => openModal('create')}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    {t('coupon_add')}
                </button>
            </div>

            <ReusableTable
                data={coupons}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
                emptyState={{
                    icon: (
                        <div className="flex justify-center">
                            <Tag className="h-16 w-16 text-gray-400" />
                        </div>
                    ),
                    title: t('coupon_no_data'),
                    description: t('coupon_no_data_desc'),
                    action: (
                        <button onClick={() => openModal('create')} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                            <Plus className="h-4 w-4" />
                            {t('coupon_create_first')}
                        </button>
                    ),
                }}
            />

            <CouponModal showModal={showModal} modalType={modalType} selectedCoupon={selectedCoupon} onClose={closeModal} onSubmit={handleSubmit} loading={loading} />
        </div>
    );
};

export default CouponsPage;
