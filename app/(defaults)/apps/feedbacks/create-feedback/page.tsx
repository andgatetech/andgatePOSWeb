'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCreateFeedbackMutation } from '@/store/features/feedback/feedbackApi';
import { TextInput } from '@mantine/core';
import { AlertCircle, ArrowRight, Bug, CheckCircle, Eye, File, FileImage, Heart, Lightbulb, Loader2, MessageSquare, Send, Star, Store, Target, ThumbsUp, Upload, X, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const FeedbackPage = () => {
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
            label: 'Suggestion',
            icon: <Lightbulb className="h-5 w-5" />,
            color: 'from-yellow-500 to-orange-500',
            description: 'Ideas to improve our service',
        },
        {
            id: 'bug',
            label: 'Bug Report',
            icon: <Bug className="h-5 w-5" />,
            color: 'from-red-500 to-pink-500',
            description: 'Report technical issues',
        },
        {
            id: 'compliment',
            label: 'Compliment',
            icon: <ThumbsUp className="h-5 w-5" />,
            color: 'from-green-500 to-emerald-500',
            description: 'Share what you love',
        },
        {
            id: 'general',
            label: 'General',
            icon: <MessageSquare className="h-5 w-5" />,
            color: 'from-blue-500 to-purple-500',
            description: 'Any other feedback',
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
            // Check file size (max 5MB)
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

        setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, 10)); // Max 10 files
    };

    const handleFileRemove = (fileId) => {
        setSelectedFiles((prev) => {
            const updatedFiles = prev.filter((f) => f.id !== fileId);
            // Clean up preview URLs
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
        return <File className="h-5 w-5 text-gray-500" />;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.message.trim() || !selectedCategory) {
            return;
        }

        // Create FormData for file upload
        const submitFormData = new FormData();
        submitFormData.append('title', formData.title);
        submitFormData.append('message', formData.message);
        submitFormData.append('category', selectedCategory);
        submitFormData.append('store_id', currentStoreId);

        if (formData.rating > 0) {
            submitFormData.append('rating', formData.rating.toString());
        }

        // Append files
        selectedFiles.forEach((fileObj, index) => {
            submitFormData.append('files[]', fileObj.file);
        });

        try {
            await createFeedback(submitFormData);
            router('apps/feedbacks');
            setSubmitted(true);
            // Reset form after successful submission
            setTimeout(() => {
                setFormData({ title: '', message: '', rating: 0, category: '' });
                setSelectedCategory('');
                setSelectedFiles([]);
                setSubmitted(false);
            }, 4000);
        } catch (err) {
            console.error('Failed to submit feedback:', err);
        }
    };

    const isFormValid = formData.title.trim() && formData.message.trim() && selectedCategory;

    // Success Page
    if (submitted && isSuccess) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
                {/* Background Effects */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute left-10 top-1/4 h-20 w-20 animate-pulse rounded-full bg-blue-200 opacity-20"></div>
                    <div className="absolute right-10 top-1/3 h-16 w-16 animate-pulse rounded-full bg-purple-200 opacity-20 delay-75"></div>
                    <div className="absolute bottom-1/4 left-1/4 h-12 w-12 animate-pulse rounded-full bg-indigo-200 opacity-20 delay-150"></div>
                </div>

                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-12 text-center shadow-2xl">
                        {/* Success Animation Background */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 opacity-50"></div>

                        <div className="relative z-10">
                            <div className="mb-8">
                                <div className="mb-6 inline-flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
                                    <CheckCircle className="h-10 w-10 text-white" />
                                </div>
                                <h2 className="mb-3 text-3xl font-bold text-gray-900">Thank You!</h2>
                                <p className="text-lg leading-relaxed text-gray-600">Your feedback has been submitted successfully. We truly appreciate your input and will review it carefully.</p>
                            </div>

                            <div className="mb-8 rounded-2xl bg-blue-50 p-6">
                                <div className="mb-3 flex items-center justify-center">
                                    <Heart className="mr-2 h-5 w-5 text-red-500" />
                                    <span className="text-sm font-semibold text-gray-700">Our Promise</span>
                                </div>
                                <p className="text-sm text-gray-600">Every piece of feedback helps us improve AndGatePOS. Your voice matters in shaping the future of our platform.</p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="group flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
                                >
                                    Submit Another Feedback
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                                <button className="w-full rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200">Return to Dashboard</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            {/* Background Grid */}
            <div className="bg-grid-slate-100 absolute inset-0 -z-10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>

            {/* Floating Elements */}
            <div className="absolute left-10 top-1/4 h-20 w-20 animate-pulse rounded-full bg-blue-200 opacity-20"></div>
            <div className="absolute right-10 top-1/3 h-16 w-16 animate-pulse rounded-full bg-purple-200 opacity-20 delay-75"></div>
            <div className="absolute bottom-1/4 left-1/4 h-12 w-12 animate-pulse rounded-full bg-indigo-200 opacity-20 delay-150"></div>

            <div className="relative px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <div className="mb-6 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                            <Zap className="mr-2 h-4 w-4" />
                            Help Us Improve AndGatePOS
                        </div>

                        <h1 className="mb-6 text-5xl font-black leading-tight text-gray-900 md:text-6xl">
                            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Share Your</span>
                            <span className="block">Feedback</span>
                        </h1>

                        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 md:text-2xl">
                            Your insights drive our innovation. Help us build the perfect POS solution for Bangladeshi businesses.
                        </p>
                    </div>

                    {/* Main Feedback Form */}
                    <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
                        {/* Form Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                            <div className="flex items-center">
                                <div className="mr-4 rounded-xl bg-white/20 p-3">
                                    <MessageSquare className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Feedback Form</h2>
                                    <p className="text-blue-100">Tell us what's on your mind</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 p-8">
                            {/* Feedback Category Selection */}
                            <div>
                                <label className="mb-4 block text-lg font-semibold text-gray-900">What type of feedback is this?</label>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {feedbackCategories.map((category) => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => handleCategorySelect(category.id)}
                                            className={`rounded-2xl border-2 p-4 text-left transition-all duration-300 hover:scale-105 ${
                                                selectedCategory === category.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className={`inline-flex rounded-xl bg-gradient-to-r p-2 ${category.color} text-white`}>{category.icon}</div>
                                                <div className="flex-1">
                                                    <h3 className="mb-1 font-semibold text-gray-900">{category.label}</h3>
                                                    <p className="text-sm text-gray-600">{category.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Store Field */}
                            <div>
                                <div className="relative">
                                    {/* <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={currentStore.store_name}
                                        className="w-full rounded-2xl border-2 border-gray-200 px-6 py-4 text-lg placeholder-gray-400 transition-all duration-300 focus:border-blue-500 focus:ring-0"
                                        placeholder="Brief summary of your feedback"
                                        required
                                    />
                                    <Store className="absolute right-4 top-4 h-6 w-6 text-gray-400" /> */}
                                    <TextInput
                                        label="Store"
                                        value={currentStore?.store_name || ''}
                                        readOnly
                                        styles={{
                                            label: { fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' },
                                            input: {
                                                borderRadius: '8px',
                                                border: '2px solid #e5e7eb',
                                                // padding: '12px 16px 12px 44px',
                                                padding: '16px 16px 16px 44px',
                                                fontSize: '14px',
                                                backgroundColor: '#f3f4f6',
                                                cursor: 'not-allowed',
                                            },
                                        }}
                                    />
                                    <Store className="absolute left-3 top-9 h-4 w-4 text-purple-500" />
                                </div>
                            </div>
                            {/* Title Field */}
                            <div>
                                <label htmlFor="title" className="mb-3 block text-lg font-semibold text-gray-900">
                                    Feedback Title *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full rounded-2xl border-2 border-gray-200 px-6 py-4 text-lg placeholder-gray-400 transition-all duration-300 focus:border-blue-500 focus:ring-0"
                                        placeholder="Brief summary of your feedback"
                                        required
                                    />
                                    <Target className="absolute right-4 top-4 h-6 w-6 text-gray-400" />
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="mb-3 block text-lg font-semibold text-gray-900">Overall Rating (Optional)</label>
                                <div className="flex items-center space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRatingClick(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="p-1 transition-all duration-200 hover:scale-110"
                                        >
                                            <Star
                                                className={`h-10 w-10 transition-all duration-200 ${
                                                    star <= (hoveredRating || formData.rating) ? 'fill-current text-yellow-400 drop-shadow-sm' : 'text-gray-300 hover:text-gray-400'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                    {formData.rating > 0 && (
                                        <div className="ml-4 rounded-full bg-yellow-50 px-4 py-2">
                                            <span className="text-sm font-medium text-yellow-800">{formData.rating} out of 5 stars</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message Field */}
                            <div>
                                <label htmlFor="message" className="mb-3 block text-lg font-semibold text-gray-900">
                                    Your Detailed Feedback *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows={6}
                                    className="w-full resize-none rounded-2xl border-2 border-gray-200 px-6 py-4 text-lg placeholder-gray-400 transition-all duration-300 focus:border-blue-500 focus:ring-0"
                                    placeholder="Share your thoughts, suggestions, or concerns in detail. The more specific you are, the better we can help..."
                                    required
                                />
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-sm text-gray-500">{formData.message.length} characters</span>
                                    <span className="text-sm text-gray-500">Minimum 10 characters recommended</span>
                                </div>
                            </div>

                            {/* File Upload Section */}
                            <div>
                                <label className="mb-3 block text-lg font-semibold text-gray-900">Attach Files (Optional)</label>
                                <p className="mb-4 text-sm text-gray-600">Upload screenshots, documents, or other files to help explain your feedback. Maximum 5MB per file, up to 10 files.</p>

                                {/* File Drop Zone */}
                                <div
                                    className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
                                        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
                                        <Upload className={`mx-auto mb-4 h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                                        <h4 className={`mb-2 text-lg font-semibold ${dragActive ? 'text-blue-900' : 'text-gray-900'}`}>{dragActive ? 'Drop files here' : 'Upload Files'}</h4>
                                        <p className={`text-sm ${dragActive ? 'text-blue-700' : 'text-gray-600'}`}>Drag and drop files here, or click to browse</p>
                                        <p className="mt-1 text-xs text-gray-500">Supports: Images, PDF, DOC, TXT, Excel files</p>
                                    </div>
                                </div>

                                {/* Selected Files Display */}
                                {selectedFiles.length > 0 && (
                                    <div className="mt-6">
                                        <h5 className="mb-4 font-semibold text-gray-900">Selected Files ({selectedFiles.length}/10)</h5>
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            {selectedFiles.map((fileObj) => (
                                                <div key={fileObj.id} className="flex items-center space-x-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                                                    <div className="flex-shrink-0">
                                                        {fileObj.preview ? (
                                                            <div className="relative">
                                                                <img src={fileObj.preview} alt={fileObj.name} className="h-10 w-10 rounded-lg object-cover" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => window.open(fileObj.preview, '_blank')}
                                                                    className="absolute -right-1 -top-1 rounded-full bg-blue-500 p-1 text-white hover:bg-blue-600"
                                                                >
                                                                    <Eye className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            getFileIcon(fileObj.type)
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-gray-900">{fileObj.name}</p>
                                                        <p className="text-xs text-gray-500">{formatFileSize(fileObj.size)}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleFileRemove(fileObj.id)}
                                                        className="flex-shrink-0 rounded-full bg-red-100 p-1 text-red-600 transition-colors hover:bg-red-200"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center space-x-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    <span className="font-medium">{error?.data?.message || error?.message || 'Failed to submit feedback. Please try again.'}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!isFormValid || isLoading}
                                    className={`flex w-full items-center justify-center space-x-3 rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 ${
                                        isFormValid && !isLoading
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl'
                                            : 'cursor-not-allowed bg-gray-300 text-gray-500'
                                    }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span>Submitting Your Feedback...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-6 w-6" />
                                            <span>Submit Feedback</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Help Text */}
                            <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                                <div className="flex items-start space-x-3">
                                    <div className="rounded-full bg-blue-100 p-2">
                                        <MessageSquare className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="mb-2 font-semibold text-gray-900">We Value Your Input</h4>
                                        <p className="text-sm leading-relaxed text-gray-600">
                                            Your feedback helps us improve AndGatePOS for all Bangladeshi businesses. We review every submission and may follow up with you for clarification or
                                            updates. Thank you for helping us build better software! 🚀
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;
