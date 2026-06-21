import { WifiOff } from 'lucide-react';

export const metadata = {
    title: 'Offline — AndgatePOS',
};

export default function OfflinePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center dark:bg-gray-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <WifiOff className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">You&apos;re offline</h1>
            <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
                This page hasn&apos;t been loaded before, so it isn&apos;t available offline. Reconnect to the internet and try again.
            </p>
        </div>
    );
}
