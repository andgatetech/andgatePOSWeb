'use client';

import { useState } from 'react';
import { getTranslation } from '@/i18n';
import { useCreateCustomerDuePaymentLinkMutation, useSendCustomerDuePaymentLinkReminderMutation } from '@/store/features/customerDue/customerDueApi';
import { Copy, MessageCircle, Send, Share2, X } from 'lucide-react';

interface PaymentLinkModalProps {
    open: boolean;
    onClose: () => void;
    dueId: number | string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    remainingAmount: number;
}

export default function PaymentLinkModal({ open, onClose, dueId, customerName, customerPhone, customerEmail, remainingAmount }: PaymentLinkModalProps) {
    const { t } = getTranslation();
    const [createLink, { isLoading: creating }] = useCreateCustomerDuePaymentLinkMutation();
    const [sendReminder, { isLoading: sending }] = useSendCustomerDuePaymentLinkReminderMutation();

    const [link, setLink] = useState<any>(null);
    const [form, setForm] = useState({
        amount: remainingAmount > 0 ? String(remainingAmount) : '',
        expires_in_days: '7',
        customer_name: customerName || '',
        customer_phone: customerPhone || '',
        customer_email: customerEmail || '',
        notes: '',
    });

    if (!open) return null;

    const handleCreate = async () => {
        try {
            const result = await createLink({
                id: dueId,
                amount: form.amount ? parseFloat(form.amount) : undefined,
                expires_in_days: parseInt(form.expires_in_days, 10),
                customer_name: form.customer_name || undefined,
                customer_phone: form.customer_phone || undefined,
                customer_email: form.customer_email || undefined,
                notes: form.notes || undefined,
            }).unwrap();
            setLink(result.data?.link);
        } catch (e) {
            // error handled by RTK
        }
    };

    const handleShare = async (type: 'whatsapp' | 'sms' | 'copy') => {
        if (!link) return;

        if (type === 'copy') {
            navigator.clipboard.writeText(link.share_url);
            return;
        }

        try {
            const result = await sendReminder({ id: dueId, linkId: link.id }).unwrap();
            const url = type === 'whatsapp' ? result.data?.whatsapp_url : result.data?.sms_url;
            if (url) window.open(url, '_blank');
        } catch (e) {
            // error handled by RTK
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <Share2 className="h-5 w-5 text-primary" />
                        {t('lbl_send_payment_link')}
                    </h3>
                    <button onClick={onClose} className="rounded-full p-1 text-gray-500 hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {!link ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_amount')}</label>
                                <input type="number" min={0.01} step={0.01} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="form-input w-full" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_expires_in_days')}</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={90}
                                    value={form.expires_in_days}
                                    onChange={(e) => setForm({ ...form, expires_in_days: e.target.value })}
                                    className="form-input w-full"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_customer_name')}</label>
                                <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="form-input w-full" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_customer_phone')}</label>
                                <input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="form-input w-full" />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_customer_email')}</label>
                            <input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className="form-input w-full" />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_notes')}</label>
                            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="form-textarea w-full" />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={onClose} className="btn btn-outline-danger">
                                {t('lbl_cancel')}
                            </button>
                            <button onClick={handleCreate} disabled={creating} className="btn btn-primary">
                                {creating ? t('lbl_generating') : t('lbl_generate_link')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                            <p className="text-sm text-gray-500">{t('lbl_share_this_link')}</p>
                            <p className="mt-1 break-all font-mono text-sm font-medium text-primary">{link.share_url}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => handleShare('whatsapp')} disabled={sending} className="btn btn-outline-success flex items-center justify-center gap-1">
                                <MessageCircle className="h-4 w-4" /> WhatsApp
                            </button>
                            <button onClick={() => handleShare('sms')} disabled={sending} className="btn btn-outline-info flex items-center justify-center gap-1">
                                <Send className="h-4 w-4" /> SMS
                            </button>
                            <button onClick={() => handleShare('copy')} className="btn btn-outline-primary flex items-center justify-center gap-1">
                                <Copy className="h-4 w-4" /> {t('lbl_copy')}
                            </button>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={onClose} className="btn btn-outline-secondary">
                                {t('lbl_close')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
