'use client';

import { Camera, ImageIcon, Upload, X } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface BrandingTabProps {
    storeData: any;
    logoFile: any;
    logoPreview: any;
    handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    clearLogo: () => void;
}

const BrandingTab: React.FC<BrandingTabProps> = ({ storeData, logoFile, logoPreview, handleLogoChange, clearLogo }) => {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">Store Branding</h3>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Upload Section */}
                    <div className="space-y-4">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Camera className="mr-2 h-4 w-4 text-cyan-600" />
                            Upload Store Logo
                        </label>
                        <div className="relative">
                            <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} className="hidden" />
                            <label
                                htmlFor="logo-upload"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-all hover:border-cyan-400 hover:bg-cyan-50"
                            >
                                <Upload className="mb-3 h-12 w-12 text-gray-400" />
                                <p className="mb-2 text-sm font-medium text-gray-700">Click to upload logo</p>
                                <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 2MB)</p>
                            </label>
                        </div>

                        {logoFile && (
                            <div className="rounded-xl bg-green-50 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <ImageIcon className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-green-900">New logo selected</p>
                                            <p className="text-xs text-green-700">{logoFile.name}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={clearLogo} className="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview Section */}
                    <div className="space-y-4">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <ImageIcon className="mr-2 h-4 w-4 text-purple-600" />
                            Logo Preview
                        </label>

                        <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-8">
                            {logoPreview || storeData?.data?.logo ? (
                                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white">
                                    <Image src={logoPreview || storeData.data.logo} alt="Store Logo" fill className="object-contain p-4" />
                                </div>
                            ) : (
                                <div className="flex aspect-square w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
                                    <ImageIcon className="mb-3 h-16 w-16 text-gray-300" />
                                    <p className="text-sm text-gray-500">No logo uploaded</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Guidelines */}
                <div className="mt-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                    <h4 className="mb-2 text-sm font-semibold text-cyan-900">Logo Guidelines</h4>
                    <ul className="space-y-1 text-xs text-cyan-700">
                        <li>• Recommended size: 500x500 pixels or larger</li>
                        <li>• Format: PNG with transparent background preferred</li>
                        <li>• Keep file size under 2MB for optimal loading</li>
                        <li>• Use high-quality images for best results</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BrandingTab;
