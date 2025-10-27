'use client';

import { Clock, Sunrise, Sunset } from 'lucide-react';
import React from 'react';

interface OperatingHoursTabProps {
    formData: {
        opening_time: string;
        closing_time: string;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OperatingHoursTab: React.FC<OperatingHoursTabProps> = ({ formData, handleInputChange }) => {
    const calculateTotalHours = () => {
        if (formData.opening_time && formData.closing_time) {
            const openTime = new Date(`1970-01-01T${formData.opening_time}`);
            const closeTime = new Date(`1970-01-01T${formData.closing_time}`);
            const diff = closeTime.getTime() - openTime.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">Business Hours</h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Opening Time */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Sunrise className="mr-2 h-4 w-4 text-orange-600" />
                            Opening Time
                        </label>
                        <input
                            type="time"
                            name="opening_time"
                            value={formData.opening_time}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                    </div>

                    {/* Closing Time */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Sunset className="mr-2 h-4 w-4 text-purple-600" />
                            Closing Time
                        </label>
                        <input
                            type="time"
                            name="closing_time"
                            value={formData.closing_time}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        />
                    </div>
                </div>

                {/* Total Hours Display */}
                {calculateTotalHours() && (
                    <div className="mt-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                        <div className="flex items-center justify-center space-x-3">
                            <Clock className="h-5 w-5 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700">Total Operating Hours:</span>
                            <span className="text-lg font-bold text-purple-700">{calculateTotalHours()}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperatingHoursTab;
