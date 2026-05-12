'use client';

import { getTranslation } from '@/i18n';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useGetBrandQuery, useUpdateBrandMutation } from '@/store/features/brand/brandApi';
import { ArrowLeft, Image as ImageIcon, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BrandEditPage() {
    const { t } = getTranslation();
    const router = useRouter();
    const params = useParams();
    const brandId = Number(params.id);

    const { data, isLoading } = useGetBrandQuery(brandId, { skip: !brandId });
    const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();

    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formImage, setFormImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        const d = data as any;
        const brand = d?.data ?? d ?? null;
        if (!brand) return;
        setFormName(brand.name || '');
        setFormDescription(brand.description || '');
        setImagePreview(brand.image_url || null);
    }, [data]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFormImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setFormImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) {
            showErrorDialog(t('msg_error'), t('brand_name_required'));
            return;
        }
        const formData = new FormData();
        formData.append('name', formName.trim());
        formData.append('description', formDescription.trim());
        if (formImage) formData.append('image', formImage);

        try {
            await updateBrand({ id: brandId, formData }).unwrap();
            showSuccessDialog(t('msg_success'), t('brand_updated'));
            router.push('/brand');
        } catch {
            showErrorDialog(t('msg_error'), t('brand_error_update'));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#046ca9] border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => router.push('/brand')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                    <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('brand_edit_title')}</h1>
                    <p className="text-sm text-gray-500">{formName}</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-6">
                        {/* Image Upload */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">{t('brand_image_label')}</label>
                            <div className="rounded-xl border-2 border-dashed border-gray-300 p-6">
                                {imagePreview ? (
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-20 w-20 overflow-hidden rounded-xl">
                                            <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            {t('btn_remove')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                        <p className="mb-3 text-sm text-gray-500">{t('msg_upload_hint')}</p>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleImageChange}
                                            className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#046ca9]/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#046ca9] hover:file:bg-[#046ca9]/20"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                {t('lbl_name')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder={t('brand_name_placeholder')}
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#046ca9]"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_description')}</label>
                            <textarea
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                rows={3}
                                placeholder={t('brand_desc_placeholder')}
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#046ca9]"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-8 py-6">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
                            <button
                                type="button"
                                onClick={() => router.push('/brand')}
                                className="w-full rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
                            >
                                {t('btn_cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#046ca9] to-[#034d79] px-8 py-3 font-medium text-white transition-all hover:brightness-105 focus:ring-4 focus:ring-[#046ca9]/30 disabled:opacity-50 sm:w-auto sm:min-w-[160px]"
                            >
                                {isUpdating ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        {t('btn_updating')}
                                    </>
                                ) : (
                                    t('btn_save_changes')
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
