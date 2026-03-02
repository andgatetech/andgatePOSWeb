'use client';
import ContactSupportCard from '@/lib/protected/ContactSupportCard';
import { RootState } from '@/store';
import { AlertTriangle, Ban } from 'lucide-react';
import { useSelector } from 'react-redux';

interface StoreDisabledScreenProps {
    storeName?: string;
}

export default function StoreDisabledScreen({ storeName }: StoreDisabledScreenProps) {
    const user = useSelector((state: RootState) => state.auth?.user);

    const whatsappMessage = [
        'Hello andgate Support,',
        '',
        'My store has been DISABLED and I cannot access it.',
        '',
        `User ID   : ${user?.id ?? 'N/A'}`,
        `Name      : ${user?.name ?? 'N/A'}`,
        `Email     : ${user?.email ?? 'N/A'}`,
        `Store     : ${storeName ?? 'N/A'}`,
        `Issue     : Store Disabled`,
        '',
        'Please help re-enable my store.',
    ].join('\n');

    return (
        <div className="p-4 py-6">
            <div className="mx-auto w-full max-w-5xl">
                {/* Main Card */}
                <div className="rounded-2xl border-2 border-red-200 bg-white p-6 shadow-xl lg:p-8">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left: Icon & Status */}
                        <div className="flex flex-col items-center justify-center border-b border-gray-200 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                            <div className="mb-4 rounded-full bg-red-100 p-5">
                                <Ban className="h-12 w-12 text-red-600" />
                            </div>
                            <div className="inline-flex items-center rounded-full bg-red-100 px-4 py-2 text-xs font-semibold text-red-800">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Store Disabled
                            </div>
                        </div>

                        {/* Middle: Info */}
                        <div className="lg:col-span-2">
                            <h1 className="mb-3 text-2xl font-black text-gray-900 lg:text-3xl">Store Has Been Disabled</h1>
                            {storeName && <p className="mb-2 text-sm font-semibold text-red-600">Store: {storeName}</p>}
                            <p className="mb-4 text-sm text-gray-600 lg:text-base">
                                This store has been disabled by the administrator. You cannot access its data or perform any operations. Please contact your administrator or support team to resolve
                                this issue.
                            </p>

                            {/* Info Box */}
                            <div className="mb-4 rounded-lg bg-red-50 p-4">
                                <div className="mb-2 flex items-center">
                                    <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                                    <h3 className="text-sm font-semibold text-red-900">What should you do?</h3>
                                </div>
                                <ul className="space-y-1 text-xs text-red-800 lg:text-sm">
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Switch to another active store from the sidebar</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Contact the administrator to enable this store</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>This may be due to policy violations or payment issues</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact */}
                            <ContactSupportCard accentColor="red" whatsappMessage={whatsappMessage} />
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="mt-4 text-center text-xs text-gray-500 lg:text-sm">Please switch to an active store or contact support for assistance.</p>
            </div>
        </div>
    );
}
