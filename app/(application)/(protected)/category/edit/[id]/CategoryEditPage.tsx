'use client';

import RichTextEditor from '@/components/common/RichTextEditor';
import { getTranslation } from '@/i18n';
import { unwrapApiData } from '@/lib/api-response';
import Loader from '@/lib/Loader';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useGetCategoryByIdQuery, useUpdateCategoryMutation } from '@/store/features/category/categoryApi';
import { ArrowLeft, Layers, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CategoryEditPage() {
    const { t } = getTranslation();
    const router = useRouter();
    const params = useParams();
    const categoryId = Number(params.id);

    const { data, isLoading } = useGetCategoryByIdQuery(categoryId, { skip: !categoryId });
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formImage, setFormImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        const category = unwrapApiData(data, ['category']);
        if (!category) return;
        setFormName(category.name || '');
        setFormDescription(category.description || '');
        setImagePreview(category.image_url || category.image || null);
    }, [data]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFormImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) {
            showErrorDialog(t('msg_error'), t('category_name_required'));
            return;
        }
        try {
            await updateCategory({
                id: categoryId,
                updatedCategory: {
                    name: formName.trim(),
                    description: formDescription.trim(),
                    ...(formImage ? { image: formImage } : {}),
                },
            }).unwrap();
            showSuccessDialog(t('msg_success'), t('category_updated'));
            router.push('/category');
        } catch {
            showErrorDialog(t('msg_error'), t('category_error_update'));
        }
    };

    if (isLoading) return <Loader message={t('category_loading')} />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => router.push('/category')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                    <Layers className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('category_edit_title')}</h1>
                    <p className="text-sm text-gray-500">{formName}</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-6">
                        {/* Image Upload */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">{t('category_image_label')}</label>
                            <div className="rounded-xl border-2 border-dashed border-gray-300 p-6">
                                {imagePreview ? (
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-20 w-20 overflow-hidden rounded-xl">
                                            <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setFormImage(null); setImagePreview(null); }}
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
                                placeholder={t('category_name_placeholder')}
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#046ca9]"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">{t('lbl_description')}</label>
                            <RichTextEditor
                                value={formDescription}
                                onChange={setFormDescription}
                                placeholder={t('category_desc_placeholder')}
                                className="category-description-editor"
                                modules={{ toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'clean']] }}
                                formats={['bold', 'italic', 'underline', 'list', 'link']}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-8 py-6">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
                            <button
                                type="button"
                                onClick={() => router.push('/category')}
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
