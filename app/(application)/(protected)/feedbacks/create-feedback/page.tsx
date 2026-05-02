'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useCreateFeedbackMutation } from '@/store/features/feedback/feedbackApi';
import { TextInput } from '@mantine/core';
import { AlertCircle, ArrowLeft, Bug, CheckCircle, Eye, File, FileImage, Heart, Lightbulb, Loader2, MessageSquare, Send, Star, Store, Target, ThumbsUp, Upload, X, Zap } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

const FeedbackPage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStoreId, currentStore } = useCurrentStore();
    const [createFeedback, { isLoading, isSuccess, error }] = useCreateFeedbackMutation();

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        rating: 0,
        category: '',
        store_id: currentStoreId || '',
    });

    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    const feedbackCategories = [
        {
            id: 'suggestion',
            label: t('feedback_suggestion'),
            icon: <Lightbulb className="h-4 w-4" />,
            color: 'bg-amber-500',
            light: 'bg-amber-50 border-amber-300 text-amber-700',
            ring: 'ring-amber-400',
            description: t('feedback_suggestion_desc'),
        },
        {
            id: 'bug',
            label: t('feedback_bug'),
            icon: <Bug className="h-4 w-4" />,
            color: 'bg-rose-500',
            light: 'bg-rose-50 border-rose-300 text-rose-700',
            ring: 'ring-rose-400',
            description: t('feedback_bug_desc'),
        },
        {
            id: 'compliment',
            label: t('feedback_compliment'),
            icon: <ThumbsUp className="h-4 w-4" />,
            color: 'bg-emerald-500',
            light: 'bg-emerald-50 border-emerald-300 text-emerald-700',
            ring: 'ring-emerald-400',
            description: t('feedback_compliment_desc'),
        },
        {
            id: 'general',
            label: t('feedback_general'),
            icon: <MessageSquare className="h-4 w-4" />,
            color: 'bg-violet-500',
            light: 'bg-violet-50 border-violet-300 text-violet-700',
            ring: 'ring-violet-400',
            description: t('feedback_general_desc'),
        },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRatingClick = (rating) => {
        setFormData((prev) => ({
            ...prev,
            rating,
        }));
    };

    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
        setFormData((prev) => ({
            ...prev,
            category: categoryId,
        }));
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        handleFilesAdd(files);
    };

    const handleFilesAdd = (files) => {
        const validFiles = files.filter((file) => {
            if (file.size > 5 * 1024 * 1024) {
                alert(`File ${file.name} is too large. Maximum size is 5MB.`);
                return false;
            }
            return true;
        });

        const newFiles = validFiles.map((file) => ({
            file,
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        }));

        setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, 10));
    };

    const handleFileRemove = (fileId) => {
        setSelectedFiles((prev) => {
            const updatedFiles = prev.filter((f) => f.id !== fileId);
            const removedFile = prev.find((f) => f.id === fileId);
            if (removedFile?.preview) {
                URL.revokeObjectURL(removedFile.preview);
            }
            return updatedFiles;
        });
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files);
            handleFilesAdd(files);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) {
            return <FileImage className="h-5 w-5 text-blue-500" />;
        }
        return <File className="h-5 w-5 text-gray-400" />;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.message.trim() || !selectedCategory) {
            return;
        }

        const submitFormData = new FormData();
        submitFormData.append('title', formData.title);
        submitFormData.append('message', formData.message);
        submitFormData.append('category', selectedCategory);
        submitFormData.append('store_id', currentStoreId);

        if (formData.rating > 0) {
            submitFormData.append('rating', formData.rating.toString());
        }

        selectedFiles.forEach((fileObj, index) => {
            submitFormData.append('files[]', fileObj.file);
        });

        try {
            await createFeedback(submitFormData);
            toast.dismiss();
            toast.success(t('msg_feedback_created'), { toastId: 'create-feedback' });
            router.push('/feedbacks');
            setSubmitted(true);
            setTimeout(() => {
                setFormData({ title: '', message: '', rating: 0, category: '' });
                setSelectedCategory('');
                setSelectedFiles([]);
                setSubmitted(false);
            }, 4000);
        } catch (err) {
            console.error('Failed to submit feedback:', err);
            toast.dismiss();
            toast.error(t('msg_something_went_wrong'));
        }
    };

    const isFormValid = formData.title.trim() && formData.message.trim() && selectedCategory;

    const ratingLabels = ['', t('rating_poor'), t('rating_fair'), t('rating_good'), t('rating_very_good'), t('rating_excellent')];

    // ── Success Screen ──
    if (submitted && isSuccess) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-10 text-center shadow-lg">
                    <div className="mb-5 inline-flex h-16 w-16 animate-bounce items-center justify-center rounded-2xl bg-emerald-500 text-white">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('feedback_success_title')}</h2>
                    <p className="mb-6 text-sm leading-relaxed text-gray-500">
                        {t('feedback_success_desc')}
                    </p>
                    <div className="mb-6 rounded-xl bg-violet-50 p-4">
                        <div className="mb-1 flex items-center justify-center gap-1.5">
                            <Heart className="h-4 w-4 text-rose-500" />
                            <span className="text-xs font-semibold text-gray-700">{t('feedback_promise_title')}</span>
                        </div>
                        <p className="text-xs text-gray-500">{t('feedback_promise_desc')}</p>
                    </div>
                    <div className="space-y-2">
                        <button
                            onClick={() => setSubmitted(false)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                        >
                            {t('btn_submit_another_feedback')}
                        </button>
                        <button
                            onClick={() => router.push('/feedbacks')}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-6 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                        >
                            {t('btn_view_all_feedbacks')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main Form ──
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('feedback_give_title')}</h1>
                    <p className="mt-1 text-sm text-gray-500">{t('feedback_give_desc')}</p>
                </div>
                <button
                    onClick={() => router.push('/feedbacks')}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('btn_back_to_feedbacks')}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* ── Left: Form ── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Category Selection */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-gray-800">{t('lbl_feedback_type')} <span className="text-rose-500">*</span></h2>
                            <p className="mt-0.5 text-xs text-gray-400">{t('feedback_type_question')}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-4">
                            {feedbackCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategorySelect(cat.id)}
                                    className={`flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-center transition-all ${
                                        selectedCategory === cat.id
                                            ? `${cat.light} ring-2 ${cat.ring} ring-offset-1`
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${cat.color}`}>
                                        {cat.icon}
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700">{cat.label}</span>
                                    <span className="text-[10px] leading-tight text-gray-400">{cat.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-gray-800">{t('lbl_feedback_details')}</h2>
                        </div>
                        <div className="space-y-5 p-5">

                            {/* Store Field */}
                            <div className="relative">
                                <TextInput
                                    label={t('lbl_store')}
                                    value={currentStore?.store_name || ''}
                                    readOnly
                                    styles={{
                                        label: { fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' },
                                        input: {
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                            padding: '8px 12px 8px 40px',
                                            fontSize: '14px',
                                            backgroundColor: '#f9fafb',
                                            cursor: 'not-allowed',
                                            color: '#374151',
                                        },
                                    }}
                                />
                                <Store className="absolute left-3 top-8 h-4 w-4 text-violet-400" />
                            </div>

                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="mb-1.5 block text-xs font-medium text-gray-500">
                                    {t('lbl_feedback_title')} <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-4 pr-10 text-sm text-gray-800 placeholder-gray-400 transition focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                                        placeholder={t('placeholder_feedback_title')}
                                        required
                                    />
                                    <Target className="absolute right-3 top-3 h-4 w-4 text-gray-300" />
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="mb-2 block text-xs font-medium text-gray-500">
                                    {t('lbl_overall_rating')} <span className="text-gray-400">({t('lbl_optional')})</span>
                                </label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRatingClick(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="p-0.5 transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`h-7 w-7 transition-colors ${
                                                    star <= (hoveredRating || formData.rating)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'fill-none text-gray-200'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                    {(hoveredRating || formData.rating) > 0 && (
                                        <span className="ml-2 text-xs font-medium text-amber-600">
                                            {ratingLabels[hoveredRating || formData.rating]}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label htmlFor="message" className="mb-1.5 block text-xs font-medium text-gray-500">
                                    {t('lbl_your_detailed_feedback')} <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows={5}
                                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                                    placeholder={t('placeholder_feedback_desc')}
                                    required
                                />
                                <div className="mt-1.5 flex items-center justify-between text-xs text-gray-400">
                                    <span>{formData.message.length} characters</span>
                                    <span>{t('feedback_min_chars')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-sm font-semibold text-gray-800">{t('lbl_attachments')} <span className="text-gray-400 font-normal">({t('lbl_optional')})</span></h2>
                            <p className="mt-0.5 text-xs text-gray-400">{t('feedback_upload_hint')}</p>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Drop Zone */}
                            <div
                                className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                                    dragActive
                                        ? 'border-violet-400 bg-violet-50'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls"
                                />
                                <div className="pointer-events-none">
                                    <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${dragActive ? 'bg-violet-100 text-violet-500' : 'bg-gray-100 text-gray-400'}`}>
                                        <Upload className="h-5 w-5" />
                                    </div>
                                    <p className={`text-sm font-medium ${dragActive ? 'text-violet-700' : 'text-gray-700'}`}>
                                        {dragActive ? t('feedback_drop_here') : t('feedback_drag_upload')}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">{t('feedback_supports')}</p>
                                </div>
                            </div>

                            {/* File List */}
                            {selectedFiles.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500">{t('feedback_selected_files')} ({selectedFiles.length}/10)</p>
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        {selectedFiles.map((fileObj) => (
                                            <div key={fileObj.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
                                                <div className="flex-shrink-0">
                                                    {fileObj.preview ? (
                                                        <div className="relative">
                                                            <Image
                                                                src={fileObj.preview}
                                                                alt={fileObj.name}
                                                                width={36}
                                                                height={36}
                                                                className="h-9 w-9 rounded-lg object-cover"
                                                                unoptimized
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => window.open(fileObj.preview, '_blank')}
                                                                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-primary"
                                                            >
                                                                <Eye className="h-2.5 w-2.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        getFileIcon(fileObj.type)
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-medium text-gray-800">{fileObj.name}</p>
                                                    <p className="text-xs text-gray-400">{formatFileSize(fileObj.size)}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFileRemove(fileObj.id)}
                                                    className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error?.data?.message || error?.message || t('msg_failed_submit_feedback')}</span>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isFormValid || isLoading}
                        className={`flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                            isFormValid && !isLoading
                                ? 'bg-violet-600 text-white shadow-md hover:bg-violet-700 hover:shadow-lg active:scale-[0.99]'
                                : 'cursor-not-allowed bg-gray-100 text-gray-400'
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('feedback_submitting')}
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                {t('btn_submit_feedback')}
                            </>
                        )}
                    </button>
                </div>

                {/* ── Right: Sidebar ── */}
                <div className="space-y-4">
                    {/* Tips card */}
                    <div className="rounded-xl border border-violet-100 bg-violet-50 p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500 text-white">
                                <Zap className="h-3.5 w-3.5" />
                            </div>
                            <h3 className="text-sm font-semibold text-violet-900">{t('feedback_tips_title')}</h3>
                        </div>
                        <ul className="space-y-2 text-xs text-violet-700">
                            {[
                                t('feedback_tip_1'),
                                t('feedback_tip_2'),
                                t('feedback_tip_3'),
                                t('feedback_tip_4'),
                                t('feedback_tip_5'),
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-violet-200 text-[9px] font-bold text-violet-700">{i + 1}</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories info */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-gray-800">{t('feedback_cat_guide_title')}</h3>
                        <div className="space-y-3">
                            {feedbackCategories.map((cat) => (
                                <div key={cat.id} className="flex items-center gap-3">
                                    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white ${cat.color}`}>
                                        {cat.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700">{cat.label}</p>
                                        <p className="text-[10px] text-gray-400">{cat.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Our promise card */}
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
                        <div className="mb-2 flex items-center gap-2">
                            <Heart className="h-4 w-4 text-rose-500" />
                            <h3 className="text-sm font-semibold text-emerald-900">{t('feedback_value_title')}</h3>
                        </div>
                        <p className="text-xs leading-relaxed text-emerald-700">
                            {t('feedback_value_desc')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;
