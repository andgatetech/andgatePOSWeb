'use client';

import { Camera, ImageIcon, Upload, X } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { getTranslation } from '@/i18n';

interface BrandingTabProps {
    storeData: any;
    logoFile: any;
    logoPreview: any;
    handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    clearLogo: () => void;
}

const BrandingTab: React.FC<BrandingTabProps> = ({ storeData, logoFile, logoPreview, handleLogoChange, clearLogo }) => {
    const { t } = getTranslation();
    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('store_branding_title')}</h3>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Upload Section */}
                    <div className="space-y-4">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                            <Camera className="mr-2 h-4 w-4 text-[#046ca9]" />
                            {t('lbl_upload_store_logo')}
                        </label>
                        <div className="relative">
                            <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} className="hidden" />
                            <label
                                htmlFor="logo-upload"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-all hover:border-[#046ca9] hover:bg-[#046ca9]/5"
                            >
                                <Upload className="mb-3 h-12 w-12 text-gray-400" />
                                <p className="mb-2 text-sm font-medium text-gray-700">{t('msg_click_to_upload_logo')}</p>
                                <p className="text-xs text-gray-500">{t('msg_image_format_hint')}</p>
                            </label>
                        </div>

                        {logoFile && (
                            <div className="rounded-xl bg-[#046ca9]/10 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <ImageIcon className="h-5 w-5 text-[#046ca9]" />
                                        <div>
                                            <p className="text-sm font-medium text-[#034d79]">{t('msg_new_logo_selected')}</p>
                                            <p className="text-xs text-[#046ca9]">{logoFile.name}</p>
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
                            <ImageIcon className="mr-2 h-4 w-4 text-[#046ca9]" />
                            {t('lbl_logo_preview')}
                        </label>

                        <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-8">
                            {logoPreview || storeData?.data?.store?.logo_path ? (
                                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white">
                                    <Image src={logoPreview || storeData.data.store.logo_path} alt="Store Logo" fill className="object-contain p-4" />
                                </div>
                            ) : (
                                <div className="flex aspect-square w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
                                    <ImageIcon className="mb-3 h-16 w-16 text-gray-300" />
                                    <p className="text-sm text-gray-500">{t('msg_no_logo_uploaded')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Guidelines */}
                <div className="mt-6 rounded-xl border border-[#046ca9]/20 bg-[#046ca9]/5 p-4">
                    <h4 className="mb-2 text-sm font-semibold text-[#034d79]">{t('lbl_logo_guidelines')}</h4>
                    <ul className="space-y-1 text-xs text-[#046ca9]">
                        <li>• {t('msg_logo_guideline_1')}</li>
                        <li>• {t('msg_logo_guideline_2')}</li>
                        <li>• {t('msg_logo_guideline_3')}</li>
                        <li>• {t('msg_logo_guideline_4')}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BrandingTab;
