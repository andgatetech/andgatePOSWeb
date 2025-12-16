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
                    <select
                        value={globalReason}
                        onChange={(e) => onReasonChange(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select reason</option>
                        <option value="damaged">Damaged</option>
                        <option value="expired">Expired</option>
                        <option value="lost">Lost/Stolen</option>
                        <option value="found">Found</option>
                        <option value="returned">Customer Return</option>
                        <option value="correction">Stock Correction</option>
                        <option value="other">Other</option>
                    </select>
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
