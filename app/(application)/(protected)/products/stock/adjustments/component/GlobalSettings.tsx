import Link from 'next/link';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetStoreQuery } from '@/store/features/store/storeApi';

interface GlobalSettingsProps {
    globalReason: string;
    globalNotes: string;
    onReasonChange: (reason: string) => void;
    onNotesChange: (notes: string) => void;
}

/**
 * GlobalSettings Component
 * Global settings that apply to all items without individual settings
 */
const GlobalSettings = ({ globalReason, globalNotes, onReasonChange, onNotesChange }: GlobalSettingsProps) => {
    const { currentStore } = useCurrentStore();
    const { data: storeData } = useGetStoreQuery(currentStore?.id ? { store_id: currentStore.id } : undefined, {
        skip: !currentStore?.id,
    });

    const adjustmentReasons = storeData?.data?.store?.adjustment_reasons || [];
    const selectedReason = adjustmentReasons.find((r: any) => r.id?.toString() === globalReason);

    return (
        <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">i</span>
                Apply to All Products (Optional)
            </h3>
            <p className="mb-4 text-sm text-gray-600">Set default reason and notes for all products that don&apos;t have individual settings</p>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Default Reason for All</label>
                    {adjustmentReasons.length === 0 ? (
                        <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-3">
                            <p className="text-xs font-medium text-yellow-800">
                                No adjustment reasons available.{' '}
                                <Link href="/store/setting?tab=adjustment" className="font-semibold text-yellow-900 underline hover:text-yellow-700">
                                    Create reasons in Store Settings
                                </Link>
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <select
                                value={globalReason}
                                onChange={(e) => onReasonChange(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select reason</option>
                                <option value="default">Default Reason for All</option>
                                {adjustmentReasons
                                    .filter((r: any) => r.is_active === 1 || r.is_active === true)
                                    .map((r: any) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                            </select>
                            {selectedReason?.description && <p className="text-xs italic text-gray-500">{selectedReason.description}</p>}
                        </div>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Default Notes for All</label>
                    <input
                        type="text"
                        value={globalNotes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        placeholder="Enter notes..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default GlobalSettings;
