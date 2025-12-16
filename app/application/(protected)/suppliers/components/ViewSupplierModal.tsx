'use client';

import { Building2, Calendar, CheckCircle, Mail, MapPin, Phone, Store, User, X, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ViewSupplierModalProps {
    supplier: any;
    isOpen: boolean;
    onClose: () => void;
}

const ViewSupplierModal: React.FC<ViewSupplierModalProps> = ({ supplier, isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !supplier) return null;

    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
        active: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-5 w-5" /> },
        inactive: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <XCircle className="h-5 w-5" /> },
        blocked: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="h-5 w-5" /> },
    };

    const currentStatus = supplier.status?.toLowerCase() || 'inactive';
    const status = statusConfig[currentStatus] || statusConfig.inactive;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div ref={modalRef} className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white bg-opacity-20 shadow-lg">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{supplier.name}</h2>
                                <div className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${status.bg} ${status.text}`}>
                                    {status.icon}
                                    <span className="capitalize">{currentStatus}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 text-white transition-colors hover:bg-opacity-30">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Contact Information */}
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                <User className="h-5 w-5 text-blue-600" />
                                Contact Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Email Address</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{supplier.email || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                                        <Phone className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Phone Number</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{supplier.phone || 'N/A'}</p>
                                    </div>
                                </div>

                                {supplier.contact_person && (
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                                            <User className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500">Contact Person</p>
                                            <p className="mt-0.5 text-sm font-semibold text-gray-900">{supplier.contact_person}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
                                        <MapPin className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Address</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{supplier.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Business Information */}
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                <Store className="h-5 w-5 text-blue-600" />
                                Business Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                                        <Store className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Store</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{supplier.store_name || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100">
                                        <CheckCircle className="h-4 w-4 text-teal-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Account Status</p>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}>
                                                {status.icon}
                                                <span className="capitalize">{currentStatus}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Created Date</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">
                                            {new Date(supplier.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-gray-600">{new Date(supplier.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                                        <Calendar className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Last Updated</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">
                                            {new Date(supplier.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-gray-600">{new Date(supplier.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-800">
                                <p className="font-medium">Supplier Information</p>
                                <p className="mt-1 text-xs text-blue-700">All supplier details are managed centrally. Contact the supplier directly for business inquiries.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex justify-end">
                        <button onClick={onClose} className="rounded-lg bg-gray-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-gray-700">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewSupplierModal;
