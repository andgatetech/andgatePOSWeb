'use client';

import { useSendAnnouncementMutation } from '@/store/features/notification/notificationApi';
import type { SendAnnouncementPayload } from '@/store/features/notification/notificationTypes';
import { AlertCircle, AlertTriangle, ArrowLeft, CheckCircle, Info, Send } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getTranslation } from '@/i18n';
import 'react-quill/dist/quill.snow.css';

// Load ReactQuill dynamically to prevent Next.js SSR document not defined errors
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function SendNotificationPage() {
    const { t } = getTranslation();
    const router = useRouter();
    const [sendAnnouncement, { isLoading }] = useSendAnnouncementMutation();

    const [formData, setFormData] = useState<SendAnnouncementPayload>({
        title: '',
        message: '',
        severity: 'info',
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Strip HTML tags to check if the quill editor is empty
        const strippedMessage = formData.message.replace(/<[^>]*>?/gm, '').trim();

        if (!formData.title.trim() || !strippedMessage) {
            setError(t('msg_title_and_message_required'));
            return;
        }

        try {
            await sendAnnouncement(formData).unwrap();
            setSuccess(true);
            setTimeout(() => {
                router.push('/notifications');
            }, 1500);
        } catch (err: any) {
            setError(err?.data?.message || t('msg_failed_send_announcement'));
        }
    };

    return (
        <div className="panel flex h-full flex-col">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">{t('btn_send_announcement')}</h5>
                <button type="button" className="btn btn-outline-primary btn-sm flex items-center gap-2" onClick={() => router.push('/notifications')}>
                    <ArrowLeft className="h-4 w-4" />
                    {t('btn_back_to_notifications')}
                </button>
            </div>

            <div className="mb-5 rounded border border-info/20 bg-info/10 p-3 text-sm text-info">
                <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{t('msg_announcement_info')}</p>
                </div>
            </div>

            {success ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="mb-4 rounded-full bg-success/20 p-3 text-success">
                        <Send className="h-8 w-8" />
                    </div>
                    <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white-light">{t('msg_announcement_sent')}</h4>
                    <p className="text-gray-500">{t('msg_announcement_sent_desc')}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && <div className="rounded bg-danger/10 px-4 py-2 font-semibold text-danger">{error}</div>}

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="col-span-1 lg:col-span-2">
                            <label htmlFor="title" className="mb-1 block text-sm font-medium">
                                {t('lbl_title')}
                            </label>
                            <input
                                id="title"
                                type="text"
                                className="form-input w-full"
                                placeholder={t('placeholder_announcement_title')}
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="col-span-1 lg:col-span-2">
                            <label htmlFor="severity" className="mb-1 block text-sm font-medium">
                                {t('lbl_severity')}
                            </label>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex cursor-pointer items-center">
                                    <input
                                        type="radio"
                                        name="severity"
                                        className="form-radio text-info"
                                        value="info"
                                        checked={formData.severity === 'info'}
                                        onChange={() => setFormData({ ...formData, severity: 'info' })}
                                    />
                                    <span className="flex items-center gap-1 ltr:ml-2 rtl:mr-2">
                                        <Info className="h-4 w-4 text-info" /> {t('lbl_info')}
                                    </span>
                                </label>
                                <label className="flex cursor-pointer items-center">
                                    <input
                                        type="radio"
                                        name="severity"
                                        className="form-radio text-warning"
                                        value="warning"
                                        checked={formData.severity === 'warning'}
                                        onChange={() => setFormData({ ...formData, severity: 'warning' })}
                                    />
                                    <span className="flex items-center gap-1 ltr:ml-2 rtl:mr-2">
                                        <AlertTriangle className="h-4 w-4 text-warning" /> {t('lbl_warning')}
                                    </span>
                                </label>
                                <label className="flex cursor-pointer items-center">
                                    <input
                                        type="radio"
                                        name="severity"
                                        className="form-radio text-danger"
                                        value="critical"
                                        checked={formData.severity === 'critical'}
                                        onChange={() => setFormData({ ...formData, severity: 'critical' })}
                                    />
                                    <span className="flex items-center gap-1 ltr:ml-2 rtl:mr-2">
                                        <AlertCircle className="h-4 w-4 text-danger" /> {t('lbl_critical')}
                                    </span>
                                </label>
                                <label className="flex cursor-pointer items-center">
                                    <input
                                        type="radio"
                                        name="severity"
                                        className="form-radio text-success"
                                        value="success"
                                        checked={formData.severity === 'success'}
                                        onChange={() => setFormData({ ...formData, severity: 'success' })}
                                    />
                                    <span className="flex items-center gap-1 ltr:ml-2 rtl:mr-2">
                                        <CheckCircle className="h-4 w-4 text-success" /> {t('lbl_success')}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pb-10">
                        <label htmlFor="message" className="mb-1 block text-sm font-medium">
                            {t('lbl_message')}
                        </label>
                        <div className="h-64">
                            <ReactQuill
                                theme="snow"
                                value={formData.message}
                                onChange={(value) => setFormData({ ...formData, message: value })}
                                className="h-48"
                                placeholder={t('placeholder_announcement_desc')}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-3">
                        <button type="button" className="btn btn-outline-danger" onClick={() => router.push('/notifications')} disabled={isLoading}>
                            {t('btn_cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-l-transparent align-middle"></span>
                                    {t('lbl_sending')}
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Send className="h-4 w-4" />
                                    {t('btn_send_announcement')}
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
