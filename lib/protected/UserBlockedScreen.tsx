'use client';
import { useLogoutMutation } from '@/store/features/auth/authApi';
import { AlertTriangle, Mail, Phone, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserBlockedScreen() {
    const router = useRouter();
    const [logout] = useLogoutMutation();

    const handleLogout = async () => {
        router.push('/login');
        try {
            await logout(null);
        } catch (err) {
            console.error('Logout API failed:', err);
        }
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(';').forEach((cookie) => {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
    };

    return (
        <div className="p-4 py-6">
            <div className="mx-auto w-full max-w-5xl">
                {/* Main Card */}
                <div className="rounded-2xl border-2 border-red-200 bg-white p-6 shadow-xl lg:p-8">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left: Icon & Status */}
                        <div className="flex flex-col items-center justify-center border-b border-gray-200 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                            <div className="mb-4 rounded-full bg-red-100 p-5">
                                <ShieldAlert className="h-12 w-12 text-red-600" />
                            </div>
                            <div className="inline-flex items-center rounded-full bg-red-100 px-4 py-2 text-xs font-semibold text-red-800">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Blocked
                            </div>
                        </div>

                        {/* Middle: Info */}
                        <div className="lg:col-span-2">
                            <h1 className="mb-3 text-2xl font-black text-gray-900 lg:text-3xl">Account Access Restricted</h1>
                            <p className="mb-4 text-sm text-gray-600 lg:text-base">
                                Your account has been temporarily blocked. This may be due to policy violations, payment issues, or security concerns.
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
                                        <span>Contact support immediately to resolve this</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Provide your account details for verification</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Our team will investigate and assist you</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href="mailto:support@andgatetech.net"
                                    className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-red-700 hover:shadow-md lg:px-4 lg:text-sm"
                                >
                                    <Mail className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                                    support@andgatetech.net
                                </a>
                                <a
                                    href="tel:+8801819646514"
                                    className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-red-700 hover:shadow-md lg:px-4 lg:text-sm"
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
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50 lg:px-4 lg:text-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="mt-4 text-center text-xs text-gray-500 lg:text-sm">We&apos;re here to help. Please reach out to our support team for assistance.</p>
            </div>
        </div>
    );
}
