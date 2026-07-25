'use client';

import Loader from '@/lib/Loader';
import { getTranslation } from '@/i18n';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import {
    useCreateSupportTicketMutation,
    useDeleteSupportTicketMutation,
    useGetSupportTicketQuery,
    useGetSupportTicketsQuery,
    useReplyToSupportTicketMutation,
} from '@/store/features/support/supportTicketApi';
import { LifeBuoy, Plus, Send, Trash2, X } from 'lucide-react';
import { useState } from 'react';

const statusColor: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700 border-blue-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    closed: 'bg-gray-100 text-gray-600 border-gray-200',
};

const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toLocaleString();
};

const SupportTicketsPage = () => {
    const { t } = getTranslation();
    const { data, isLoading, refetch } = useGetSupportTicketsQuery({});
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const { data: ticketDetail, refetch: refetchDetail } = useGetSupportTicketQuery(selectedId as number, { skip: !selectedId });

    const [createTicket, { isLoading: isCreating }] = useCreateSupportTicketMutation();
    const [replyToTicket, { isLoading: isReplying }] = useReplyToSupportTicketMutation();
    const [deleteTicket] = useDeleteSupportTicketMutation();

    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ subject: '', description: '', category: 'general' });
    const [replyMessage, setReplyMessage] = useState('');

    const tickets = data?.data?.data || data?.data || [];
    const ticket = ticketDetail?.data;

    const handleCreate = async () => {
        if (!form.subject.trim() || form.description.trim().length < 10) {
            showErrorDialog(t('msg_error'), t('support_form_invalid'));
            return;
        }
        try {
            await createTicket(form).unwrap();
            showSuccessDialog(t('msg_success'), t('support_ticket_created'));
            setForm({ subject: '', description: '', category: 'general' });
            setShowCreate(false);
            refetch();
        } catch {
            showErrorDialog(t('msg_error'), t('support_ticket_create_failed'));
        }
    };

    const handleReply = async () => {
        if (!selectedId || !replyMessage.trim()) return;
        try {
            await replyToTicket({ ticketId: selectedId, message: replyMessage }).unwrap();
            setReplyMessage('');
            refetchDetail();
        } catch {
            showErrorDialog(t('msg_error'), t('support_reply_failed'));
        }
    };

    const handleDelete = async (ticketId: number) => {
        const confirmed = await showConfirmDialog(t('support_delete_confirm'), t('support_delete_confirm_desc'), t('btn_yes_delete_it'), t('btn_cancel'), false);
        if (!confirmed) return;
        try {
            await deleteTicket(ticketId).unwrap();
            showSuccessDialog(t('msg_deleted'), t('support_ticket_deleted'));
            if (selectedId === ticketId) setSelectedId(null);
            refetch();
        } catch {
            showErrorDialog(t('msg_error'), t('support_ticket_delete_failed'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <LifeBuoy className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('support_tickets_title')}</h1>
                        <p className="text-sm text-gray-500">{t('support_tickets_desc')}</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreate((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#046ca9] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#034d79]"
                >
                    <Plus className="h-4 w-4" />
                    {t('support_new_ticket')}
                </button>
            </div>

            {showCreate && (
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input
                            type="text"
                            placeholder={t('support_subject_placeholder')}
                            value={form.subject}
                            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[#046ca9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#046ca9]/10"
                        />
                        <select
                            value={form.category}
                            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[#046ca9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#046ca9]/10"
                        >
                            <option value="general">{t('support_cat_general')}</option>
                            <option value="billing">{t('support_cat_billing')}</option>
                            <option value="technical">{t('support_cat_technical')}</option>
                            <option value="feature_request">{t('support_cat_feature_request')}</option>
                        </select>
                    </div>
                    <textarea
                        placeholder={t('support_description_placeholder')}
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        rows={4}
                        className="mt-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[#046ca9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#046ca9]/10"
                    />
                    <div className="mt-3 flex justify-end gap-2">
                        <button onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                            {t('btn_cancel')}
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="rounded-lg bg-[#046ca9] px-4 py-2 text-sm font-medium text-white hover:bg-[#034d79] disabled:opacity-50"
                        >
                            {t('btn_submit')}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="lg:col-span-2 space-y-3">
                    {isLoading ? (
                        <Loader fullScreen={false} message={t('support_loading')} className="py-12" />
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
                            <LifeBuoy className="mb-3 h-8 w-8 text-gray-300" />
                            <h3 className="mb-1 text-sm font-semibold text-gray-700">{t('support_no_tickets')}</h3>
                            <p className="max-w-xs text-xs text-gray-400">{t('support_no_tickets_desc')}</p>
                        </div>
                    ) : (
                        tickets.map((tk: any) => (
                            <div
                                key={tk.id}
                                onClick={() => setSelectedId(tk.id)}
                                className={`group cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${selectedId === tk.id ? 'border-[#046ca9]' : 'border-gray-200'}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-sm font-semibold text-gray-900">{tk.subject}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusColor[tk.status] || statusColor.closed}`}>{tk.status}</span>
                                        {tk.status !== 'resolved' && tk.status !== 'closed' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(tk.id);
                                                }}
                                                className="rounded-lg p-1 text-gray-300 opacity-0 transition-colors hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                                                title={t('btn_delete')}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-gray-400">{tk.ticket_ref} · {formatDate(tk.created_at)}</p>
                            </div>
                        ))
                    )}
                </div>

                <div className="lg:col-span-3">
                    {!ticket ? (
                        <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm text-gray-400">
                            {t('support_select_ticket')}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-gray-100 p-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">{ticket.subject}</h3>
                                    <p className="text-xs text-gray-400">{ticket.ticket_ref}</p>
                                </div>
                                <button onClick={() => setSelectedId(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="max-h-80 space-y-3 overflow-y-auto p-4">
                                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{ticket.description}</div>
                                {(ticket.replies || []).map((r: any) => (
                                    <div
                                        key={r.id}
                                        className={`rounded-lg p-3 text-sm ${r.sender_type === 'user' ? 'ml-6 bg-[#046ca9]/10 text-gray-700' : 'mr-6 bg-amber-50 text-gray-700'}`}
                                    >
                                        <p className="mb-1 text-xs font-medium text-gray-400">{r.sender_type === 'user' ? t('support_you') : t('support_support_team')} · {formatDate(r.created_at)}</p>
                                        {r.message}
                                    </div>
                                ))}
                            </div>
                            {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
                                <div className="flex items-center gap-2 border-t border-gray-100 p-4">
                                    <input
                                        type="text"
                                        placeholder={t('support_reply_placeholder')}
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                                        className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[#046ca9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#046ca9]/10"
                                    />
                                    <button
                                        onClick={handleReply}
                                        disabled={isReplying || !replyMessage.trim()}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#046ca9] px-3 py-2 text-sm font-medium text-white hover:bg-[#034d79] disabled:opacity-50"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        {t('support_send')}
                                    </button>
                                </div>
                            ) : (
                                <p className="border-t border-gray-100 p-4 text-center text-xs text-gray-400">{t('support_ticket_closed_notice')}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportTicketsPage;
