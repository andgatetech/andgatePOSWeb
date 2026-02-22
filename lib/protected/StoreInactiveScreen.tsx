'use client';
import { AlertTriangle, Mail, Phone, StoreIcon } from 'lucide-react';
import Link from 'next/link';

interface StoreInactiveScreenProps {
    storeName?: string;
}

export default function StoreInactiveScreen({ storeName }: StoreInactiveScreenProps) {
    return (
        <div className="p-4 py-6">
            <div className="mx-auto w-full max-w-5xl">
                {/* Main Card */}
                <div className="rounded-2xl border-2 border-orange-200 bg-white p-6 shadow-xl lg:p-8">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left: Icon & Status */}
                        <div className="flex flex-col items-center justify-center border-b border-gray-200 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                            <div className="mb-4 rounded-full bg-orange-100 p-5">
                                <StoreIcon className="h-12 w-12 text-orange-600" />
                            </div>
                            <div className="inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold text-orange-800">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Store Inactive
                            </div>
                        </div>

                        {/* Middle: Info */}
                        <div className="lg:col-span-2">
                            <h1 className="mb-3 text-2xl font-black text-gray-900 lg:text-3xl">Store is Currently Inactive</h1>
                            {storeName && <p className="mb-2 text-sm font-semibold text-orange-600">Store: {storeName}</p>}
                            <p className="mb-4 text-sm text-gray-600 lg:text-base">
                                This store has been deactivated. You cannot access its data or perform any operations until it is reactivated. Please contact your administrator or support team to
                                resolve this.
                            </p>

                            {/* Info Box */}
                            <div className="mb-4 rounded-lg bg-orange-50 p-4">
                                <div className="mb-2 flex items-center">
                                    <AlertTriangle className="mr-2 h-4 w-4 text-orange-600" />
                                    <h3 className="text-sm font-semibold text-orange-900">What should you do?</h3>
                                </div>
                                <ul className="space-y-1 text-xs text-orange-800 lg:text-sm">
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Switch to another active store from the sidebar</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Contact the administrator to reactivate this store</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Reach out to support if you believe this is a mistake</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href="mailto:support@andgatetech.net"
                                    className="inline-flex items-center rounded-lg bg-orange-600 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-orange-700 hover:shadow-md lg:px-4 lg:text-sm"
                                >
                                    <Mail className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                                    support@andgatetech.net
                                </a>
                                <a
                                    href="tel:+8801819646514"
                                    className="inline-flex items-center rounded-lg bg-orange-600 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-orange-700 hover:shadow-md lg:px-4 lg:text-sm"
                                >
                                    <Phone className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                                    +880 1819-646514
                                </a>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-gray-800 lg:px-4 lg:text-sm"
                                >
                                    Contact Support Team
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="mt-4 text-center text-xs text-gray-500 lg:text-sm">Please switch to an active store or contact support for assistance.</p>
            </div>
        </div>
    );
}
