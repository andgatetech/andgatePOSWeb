'use client';

import { useSendAnnouncementMutation } from '@/store/features/notification/notificationApi';
import type { SendAnnouncementPayload } from '@/store/features/notification/notificationTypes';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { X, Send, AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface SendAnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SendAnnouncementModal = ({ isOpen, onClose }: SendAnnouncementModalProps) => {
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

        if (!formData.title.trim() || !formData.message.trim()) {
            setError('Title and message are required.');
            return;
        }

        try {
            await sendAnnouncement(formData).unwrap();
            setSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err: any) {
            setError(err?.data?.message || 'Failed to send announcement.');
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setFormData({
                title: '',
                message: '',
                severity: 'info',
            });
            setError(null);
            setSuccess(false);
            onClose();
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[51]" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                    Send Announcement
                                </div>
                                <div className="p-5">
                                    <div className="mb-5 rounded border border-info/20 bg-info/10 p-3 text-sm text-info">
                                        <div className="flex items-start gap-2">
                                            <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                            <p>This announcement will automatically be sent to <strong>all staff members</strong> associated with your store. They will receive it instantly in their notification list.</p>
                                        </div>
                                    </div>
                                    {success ? (
                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                            <div className="mb-4 rounded-full bg-success/20 p-3 text-success">
                                                <Send className="h-8 w-8" />
                                            </div>
                                            <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white-light">Announcement Sent!</h4>
                                            <p className="text-gray-500">All staff in your store have been notified.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            {error && (
                                                <div className="rounded bg-danger/10 px-4 py-2 font-semibold text-danger">
                                                    {error}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="col-span-1 md:col-span-2">
                                                    <label htmlFor="title" className="mb-1 block text-sm font-medium">Title</label>
                                                    <input 
                                                        id="title" 
                                                        type="text" 
                                                        className="form-input w-full" 
                                                        placeholder="Announcement Title"
                                                        value={formData.title}
                                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                
                                                <div className="col-span-1 md:col-span-2">
                                                    <label htmlFor="severity" className="mb-1 block text-sm font-medium">Severity</label>
                                                    <div className="flex gap-4">
                                                        <label className="flex cursor-pointer items-center">
                                                            <input type="radio" name="severity" className="form-radio text-info" value="info" checked={formData.severity === 'info'} onChange={() => setFormData({ ...formData, severity: 'info' })} />
                                                            <span className="flex items-center gap-1 ltr:ml-2 rtl:mr-2"><Info className="h-4 w-4 text-info"/> Info</span>
                                                        </label>
                                                        <label className="flex cursor-pointer items-center">
                                                            <input type="radio" name="severity" className="form-radio text-warning" value="warning" checked={formData.severity === 'warning'} onChange={() => setFormData({ ...formData, severity: 'warning' })} />
                                                            <span className="flex items-center gap-1 ltr:ml-2 rtl:mr-2"><AlertTriangle className="h-4 w-4 text-warning"/> Warning</span>
                                                        </label>
                                                        <label className="flex cursor-pointer items-center">
                                                            <input type="radio" name="severity" className="form-radio text-danger" value="critical" checked={formData.severity === 'critical'} onChange={() => setFormData({ ...formData, severity: 'critical' })} />
                                                            <span className="flex items-center gap-1 ltr:ml-2 rtl:mr-2"><AlertCircle className="h-4 w-4 text-danger"/> Critical</span>
                                                        </label>
                                                        <label className="flex cursor-pointer items-center">
                                                            <input type="radio" name="severity" className="form-radio text-success" value="success" checked={formData.severity === 'success'} onChange={() => setFormData({ ...formData, severity: 'success' })} />
                                                            <span className="flex items-center gap-1 ltr:ml-2 rtl:mr-2"><CheckCircle className="h-4 w-4 text-success"/> Success</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="message" className="mb-1 block text-sm font-medium">Message</label>
                                                <textarea 
                                                    id="message" 
                                                    className="form-textarea w-full" 
                                                    rows={3} 
                                                    placeholder="Enter announcement details..."
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                    required
                                                ></textarea>
                                            </div>

                                            <div className="mt-8 flex items-center justify-end gap-3">
                                                <button type="button" className="btn btn-outline-danger" onClick={handleClose} disabled={isLoading}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                                    {isLoading ? (
                                                        <span className="flex items-center gap-2">
                                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-l-transparent align-middle"></span>
                                                            Sending...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            <Send className="h-4 w-4" />
                                                            Send Announcement
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SendAnnouncementModal;
