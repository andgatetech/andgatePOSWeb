'use client';
import ContactSupportCard from '@/lib/protected/ContactSupportCard';
import { RootState } from '@/store';
import { useLogoutMutation } from '@/store/features/auth/authApi';
import { AlertCircle, Clock, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export default function UserPendingScreen() {
    const router = useRouter();
    const [logout] = useLogoutMutation();
    const user = useSelector((state: RootState) => state.auth?.user);

    const whatsappMessage = [
        'Hello andgate Support,',
        '',
        'My account is PENDING APPROVAL and I am waiting for activation.',
        '',
        `User ID   : ${user?.id ?? 'N/A'}`,
        `Name      : ${user?.name ?? 'N/A'}`,
        `Email     : ${user?.email ?? 'N/A'}`,
        `Issue     : Account Pending Verification`,
        '',
        'Please approve or update my account status.',
    ].join('\n');

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
                <div className="rounded-2xl border-2 border-yellow-200 bg-white p-6 shadow-xl lg:p-8">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left: Icon & Status */}
                        <div className="flex flex-col items-center justify-center border-b border-gray-200 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                            <div className="mb-4 rounded-full bg-yellow-100 p-5">
                                <Clock className="h-12 w-12 text-yellow-600" />
                            </div>
                            <div className="inline-flex items-center rounded-full bg-yellow-100 px-4 py-2 text-xs font-semibold text-yellow-800">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Pending Verification
                            </div>
                        </div>

                        {/* Middle: Info */}
                        <div className="lg:col-span-2">
                            <h1 className="mb-3 text-2xl font-black text-gray-900 lg:text-3xl">Account Pending Approval</h1>
                            <p className="mb-4 text-sm text-gray-600 lg:text-base">
                                Your account has been created successfully, but it&apos;s currently pending for admin approval. Please wait while our team reviews your registration.
                            </p>

                            {/* Info Box */}
                            <div className="mb-4 rounded-lg bg-blue-50 p-4">
                                <div className="mb-2 flex items-center">
                                    <Shield className="mr-2 h-4 w-4 text-blue-600" />
                                    <h3 className="text-sm font-semibold text-blue-900">What happens next?</h3>
                                </div>
                                <ul className="space-y-1 text-xs text-blue-800 lg:text-sm">
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Review within 24-48 hours</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Email notification once approved</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Full access after approval</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact */}
                            <ContactSupportCard accentColor="blue" whatsappMessage={whatsappMessage} />
                            <div className="mt-3">
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="mt-4 text-center text-xs text-gray-500 lg:text-sm">This usually takes 24-48 hours. Thank you for your patience!</p>
            </div>
        </div>
    );
}
