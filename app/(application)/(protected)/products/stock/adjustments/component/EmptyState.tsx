import { ArrowDown, ArrowUp, FileText, Package, Search } from 'lucide-react';

/**
 * EmptyState Component
 * Displays when no products are selected for stock adjustment
 */
const EmptyState = () => {
    return (
        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="w-full max-w-2xl space-y-8">
                {/* Main Empty State Card */}
                <div className="rounded-3xl border-2 border-dashed border-blue-300 bg-white/80 p-12 text-center shadow-xl backdrop-blur-sm">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                        <Package className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="mb-3 text-3xl font-bold text-gray-900">Stock Adjustment</h3>
                    <p className="mb-8 text-lg text-gray-600">Select products from the left panel to adjust stock levels</p>

                    {/* Feature Cards */}
                    <div className="mx-auto grid max-w-xl gap-4 text-left">
                        <div className="flex items-start gap-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm transition-all hover:shadow-md">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-500 shadow-sm">
                                <Search className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="mb-1 font-semibold text-gray-900">Search & Scan</h4>
                                <p className="text-sm text-gray-600">Quickly find products by name, SKU, or barcode</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 p-4 shadow-sm transition-all hover:shadow-md">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 shadow-sm">
                                <div className="flex flex-col items-center">
                                    <ArrowUp className="h-3 w-3 text-white" />
                                    <ArrowDown className="h-3 w-3 text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="mb-1 font-semibold text-gray-900">Adjust Quantity</h4>
                                <p className="text-sm text-gray-600">Increase or decrease stock with precise control</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-4 shadow-sm transition-all hover:shadow-md">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-500 shadow-sm">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="mb-1 font-semibold text-gray-900">Track Changes</h4>
                                <p className="text-sm text-gray-600">Add reasons and notes for complete audit trail</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Tips */}
                <div className="rounded-2xl bg-white/60 p-6 backdrop-blur-sm">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs">💡</span>
                        Quick Tips
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p>
                            • Products with <span className="font-medium text-red-600">zero stock</span> can be adjusted
                        </p>
                        <p>
                            • Use <span className="font-medium text-blue-600">barcode scanner</span> for faster product selection
                        </p>
                        <p>
                            • Set <span className="font-medium text-purple-600">global reason</span> to apply to all items at once
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyState;
