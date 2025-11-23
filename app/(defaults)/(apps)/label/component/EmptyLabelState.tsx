'use client';

import { PackageSearch } from 'lucide-react';

const EmptyLabelState = () => {
    return (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
                <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
                    <PackageSearch className="h-16 w-16 text-blue-600" />
                </div>
                <h2 className="mb-3 text-2xl font-bold text-gray-900">No Products Selected</h2>
                <p className="mb-6 text-gray-600">
                    Select products from the left panel to generate
                    <br />
                    barcodes or QR codes for your inventory
                </p>
                <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900">How to use:</h3>
                    <ol className="space-y-2 text-left text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">1</span>
                            <span>Select products from the product panel on the left</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">2</span>
                            <span>Choose label type (Barcode or QR Code)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">3</span>
                            <span>Configure quantity and settings for each product</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">4</span>
                            <span>Click Generate to create your labels</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">5</span>
                            <span>Print or download the generated labels</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default EmptyLabelState;
