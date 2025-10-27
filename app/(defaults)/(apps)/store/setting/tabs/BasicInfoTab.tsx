'use client';

import { Building2, MapPin, Phone, Tag } from 'lucide-react';
import React from 'react';

interface BasicInfoTabProps {
    formData: {
        store_name: string;
        store_location: string;
        store_contact: string;
        max_discount: string;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ formData, handleInputChange }) => {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">Store Information</h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Store Name */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Building2 className="mr-2 h-4 w-4 text-blue-600" />
                            Store Name *
                        </label>
                        <input
                            type="text"
                            name="store_name"
                            value={formData.store_name}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            placeholder="Enter store name"
                            required
                        />
                    </div>

                    {/* Store Location */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <MapPin className="mr-2 h-4 w-4 text-green-600" />
                            Store Location
                        </label>
                        <input
                            type="text"
                            name="store_location"
                            value={formData.store_location}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-green-500 focus:ring-2 focus:ring-green-200"
                            placeholder="Enter complete address"
                        />
                    </div>

                    {/* Store Contact */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Phone className="mr-2 h-4 w-4 text-purple-600" />
                            Contact Number
                        </label>
                        <input
                            type="tel"
                            name="store_contact"
                            value={formData.store_contact}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                            placeholder="Enter phone number"
                        />
                    </div>

                    {/* Max Discount */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Tag className="mr-2 h-4 w-4 text-orange-600" />
                            Maximum Discount (%)
                        </label>
                        <input
                            type="number"
                            name="max_discount"
                            value={formData.max_discount}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            placeholder="0-100"
                            min="0"
                            max="100"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoTab;
