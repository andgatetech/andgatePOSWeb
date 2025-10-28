'use client';

import { Power } from 'lucide-react';
import React from 'react';

interface StoreStatusTabProps {
    formData: {
        is_active: boolean;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StoreStatusTab: React.FC<StoreStatusTabProps> = ({ formData, handleInputChange }) => {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">Store Status</h3>

                <div className="rounded-xl bg-gray-50 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${formData.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <Power className="h-8 w-8" />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900">Store is {formData.is_active ? 'Active' : 'Inactive'}</h4>
                                <p className="mt-1 text-sm text-gray-600">
                                    {formData.is_active ? 'Your store is currently operational and accepting orders' : 'Your store is currently closed and not accepting orders'}
                                </p>
                            </div>
                        </div>

                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleInputChange}
                            className="h-8 w-8 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                    </div>
                </div>

                {/* Warning Box */}
                <div className={`mt-6 rounded-xl border p-4 ${formData.is_active ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <p className={`text-sm ${formData.is_active ? 'text-green-800' : 'text-red-800'}`}>
                        <strong>Note:</strong>{' '}
                        {formData.is_active ? 'Customers can browse and purchase products from your store.' : 'Customers will not be able to place orders while the store is inactive.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StoreStatusTab;
