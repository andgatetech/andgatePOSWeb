import { Package } from 'lucide-react';

/**
 * EmptyState Component
 * Displays when no products are selected for stock adjustment
 */
const EmptyState = () => {
    return (
        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                    <Package className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Stock Adjustment</h3>
                <p className="mb-4 text-gray-600">Select products from the left panel to adjust stock levels</p>
                <div className="mx-auto max-w-md space-y-2 text-left text-sm text-gray-500">
                    <div className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"></div>
                        <span>Search or scan products to add them to adjustment list</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"></div>
                        <span>Set adjustment type (increase/decrease) and quantity</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"></div>
                        <span>Add reason and notes for audit trail</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyState;
