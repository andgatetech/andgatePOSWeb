'use client';

import { Barcode, PackageSearch, QrCode } from 'lucide-react';

const EmptyLabelState = () => {
    return (
        <div className="flex h-full items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md text-center">
                {/* Icon */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <PackageSearch className="h-10 w-10 text-gray-600" />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-xl font-semibold text-gray-900">No Products Selected</h3>
                <p className="mb-8 text-sm text-gray-600">Select products from the left panel to generate labels</p>

                {/* Feature Cards */}
                <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <span className="text-lg font-bold text-gray-600">1</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">Select Products</h4>
                            <p className="text-xs text-gray-600">Choose products from the left panel</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <Barcode className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">Choose Label Type</h4>
                            <p className="text-xs text-gray-600">Select Barcode or QR Code format</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <QrCode className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">Configure & Generate</h4>
                            <p className="text-xs text-gray-600">Set quantity and generate labels</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyLabelState;
