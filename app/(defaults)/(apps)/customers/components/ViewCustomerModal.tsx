'use client';

import { Award, Calendar, CheckCircle, CreditCard, Mail, Phone, Star, Store, User, X, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ViewCustomerModalProps {
    customer: any;
    isOpen: boolean;
    onClose: () => void;
}

const ViewCustomerModal: React.FC<ViewCustomerModalProps> = ({ customer, isOpen, onClose }) => {
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

    if (!isOpen || !customer) return null;

    const isActive = customer.is_active === true || customer.is_active === 1;
    const statusConfig = isActive
        ? { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-5 w-5" /> }
        : { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="h-5 w-5" /> };

    const membershipConfig: Record<string, { gradient: string; bgLight: string; textColor: string; icon: any }> = {
        normal: { gradient: 'from-gray-600 to-gray-700', bgLight: 'bg-gray-100', textColor: 'text-gray-800', icon: <User className="h-5 w-5" /> },
        silver: { gradient: 'from-slate-600 to-slate-700', bgLight: 'bg-slate-100', textColor: 'text-slate-800', icon: <Award className="h-5 w-5" /> },
        gold: { gradient: 'from-yellow-600 to-yellow-700', bgLight: 'bg-yellow-100', textColor: 'text-yellow-800', icon: <Star className="h-5 w-5" /> },
        platinum: { gradient: 'from-purple-600 to-purple-700', bgLight: 'bg-purple-100', textColor: 'text-purple-800', icon: <Award className="h-5 w-5" /> },
    };

    const membership = customer.membership?.toLowerCase() || 'normal';
    const membershipStyle = membershipConfig[membership] || membershipConfig.normal;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div ref={modalRef} className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={`sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r ${membershipStyle.gradient} px-6 py-4`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white bg-opacity-20 shadow-lg">{membershipStyle.icon}</div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{customer.name}</h2>
                                <div className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                    {statusConfig.icon}
                                    <span>{isActive ? 'Active' : 'Inactive'}</span>
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
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{customer.email || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                                        <Phone className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Phone Number</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{customer.phone || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                                        <Store className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Store</p>
                                        <p className="mt-0.5 text-sm font-semibold text-gray-900">{customer.store_name || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Membership & Balance */}
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                <Award className="h-5 w-5 text-purple-600" />
                                Membership & Balance
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${membershipStyle.bgLight}`}>{membershipStyle.icon}</div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Membership Tier</p>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${membershipStyle.bgLight} ${membershipStyle.textColor}`}>
                                                {membershipStyle.icon}
                                                <span className="capitalize">{membership}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100">
                                        <Star className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Loyalty Points</p>
                                        <p className="mt-0.5 text-xl font-bold text-gray-900">
                                            {customer.points || 0} <span className="text-sm font-normal text-gray-500">points</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${customer.balance > 0 ? 'bg-green-100' : customer.balance < 0 ? 'bg-red-100' : 'bg-gray-100'}`}
                                    >
                                        <CreditCard className={`h-4 w-4 ${customer.balance > 0 ? 'text-green-600' : customer.balance < 0 ? 'text-red-600' : 'text-gray-600'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Account Balance</p>
                                        <p className={`mt-0.5 text-xl font-bold ${customer.balance > 0 ? 'text-green-600' : customer.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                            ৳{Math.abs(customer.balance || 0).toFixed(2)}
                                            {customer.balance < 0 && <span className="ml-2 text-sm font-normal text-red-500">(Due)</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100">
                                        <CheckCircle className="h-4 w-4 text-teal-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500">Account Status</p>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                {statusConfig.icon}
                                                <span>{isActive ? 'Active' : 'Inactive'}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Details */}
                    {customer.details && (
                        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
                                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                Additional Details
                            </h3>
                            <p className="text-sm text-gray-700">{customer.details}</p>
                        </div>
                    )}

                    {/* Dates */}
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Joined Date</p>
                                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                                        {new Date(customer.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-gray-600">{new Date(customer.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Last Updated</p>
                                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                                        {new Date(customer.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-gray-600">{new Date(customer.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
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
                                <p className="font-medium">Customer Information</p>
                                <p className="mt-1 text-xs text-blue-700">Manage customer loyalty points, membership tiers, and account balance to enhance customer experience and drive sales.</p>
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

export default ViewCustomerModal;
