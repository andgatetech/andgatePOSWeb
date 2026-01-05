'use client';

import { ReactNode } from 'react';

interface ReportPageLayoutProps {
    title: string;
    description: string;
    icon: ReactNode;
    iconBgClass?: string;
    children: ReactNode;
}

const ReportPageLayout: React.FC<ReportPageLayoutProps> = ({ title, description, icon, iconBgClass = 'bg-gradient-to-r from-blue-600 to-blue-700', children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
                        <div className="flex items-center space-x-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgClass} shadow-md`}>{icon}</div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                                <p className="text-sm text-gray-500">{description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
};

export default ReportPageLayout;
