'use client';

import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useDeleteFeedbackMutation, useGetAllFeedbacksQuery } from '@/store/features/feedback/feedbackApi';
import { Bug, Calendar, CheckCircle, Clock, Eye, Filter, Lightbulb, MessageSquare, RefreshCw, Search, Star, ThumbsUp, Trash2, User, X, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { useState } from 'react';

const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString.split(' ')[0] || '';
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const FeedbackManagementPage = () => {
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        category: '',
        dateFrom: '',
        dateTo: '',
        rating: '',
    });

    const [expandedFeedback, setExpandedFeedback] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const { data: feedbackData, isLoading, error, refetch } = useGetAllFeedbacksQuery(filters);
    const [deleteFeedback, { isLoading: isDeleting }] = useDeleteFeedbackMutation();

    const feedbacks = feedbackData?.data || [];

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400', icon: <Clock className="h-3 w-3" /> },
        { value: 'reviewed', label: 'Reviewed', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-400', icon: <Eye className="h-3 w-3" /> },
        { value: 'resolved', label: 'Resolved', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400', icon: <CheckCircle className="h-3 w-3" /> },
    ];

    const categoryOptions = [
        { value: '', label: 'All Categories' },
        { value: 'bug', label: 'Bug Report', icon: <Bug className="h-4 w-4" />, bg: 'bg-rose-500', light: 'bg-rose-50 text-rose-700' },
        { value: 'suggestion', label: 'Suggestion', icon: <Lightbulb className="h-4 w-4" />, bg: 'bg-amber-500', light: 'bg-amber-50 text-amber-700' },
        { value: 'compliment', label: 'Compliment', icon: <ThumbsUp className="h-4 w-4" />, bg: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700' },
        { value: 'general', label: 'General', icon: <MessageSquare className="h-4 w-4" />, bg: 'bg-violet-500', light: 'bg-violet-50 text-violet-700' },
    ];

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleDelete = async (feedbackId) => {
        const confirmed = await showConfirmDialog('Delete Feedback?', 'Are you sure you want to delete this feedback?', 'Yes, delete it!', 'Cancel', false);

        if (confirmed) {
            try {
                await deleteFeedback(feedbackId);
                showSuccessDialog('Deleted!', 'Feedback deleted successfully');
                refetch();
            } catch (error) {
                console.error('Failed to delete feedback:', error);
                showErrorDialog('Error', 'Failed to delete feedback');
            }
        }
    };

    const getStatusBadge = (status) => {
        const s = statusOptions.find((s) => s.value === status);
        if (!s || !s.value) return null;
        return (
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                {s.label}
            </span>
        );
    };

    const getCategoryConfig = (category) => {
        return categoryOptions.find((c) => c.value === category) || categoryOptions[categoryOptions.length - 1];
    };

    const clearFilters = () => {
        setFilters({ search: '', status: '', category: '', dateFrom: '', dateTo: '', rating: '' });
    };

    const hasActiveFilters = filters.search || filters.status || filters.category || filters.dateFrom || filters.dateTo || filters.rating;

    const stats = [
        { label: 'Total', value: feedbacks.length, icon: <MessageSquare className="h-5 w-5" />, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
        { label: 'Pending', value: feedbacks.filter((f) => f.status === 'pending').length, icon: <Clock className="h-5 w-5" />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
        { label: 'Reviewed', value: feedbacks.filter((f) => f.status === 'reviewed').length, icon: <Eye className="h-5 w-5" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'Resolved', value: feedbacks.filter((f) => f.status === 'resolved').length, icon: <CheckCircle className="h-5 w-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    ];

    return (
        <div className="space-y-6">
            {/* ── Page Header ── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
                    <p className="mt-1 text-sm text-gray-500">Monitor and manage customer feedback submissions</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900">
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {stats.map((stat, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-xl border ${stat.border} ${stat.bg} p-4`}>
                        <div className={`${stat.color}`}>{stat.icon}</div>
                        <div>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Filter Panel ── */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">Filters & Search</span>
                        {hasActiveFilters && (
                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                                Active
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                        {showFilters ? 'Less' : 'More'} filters
                        {showFilters ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                </div>

                <div className="border-t border-gray-100 px-5 py-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search title or message..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                        {/* Status */}
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                        >
                            {statusOptions.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        {/* Category */}
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                        >
                            {categoryOptions.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {showFilters && (
                        <div className="mt-3 grid grid-cols-1 gap-3 border-t border-gray-100 pt-3 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">From Date</label>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">To Date</label>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Minimum Rating</label>
                                <select
                                    value={filters.rating}
                                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                                >
                                    <option value="">All Ratings</option>
                                    <option value="5">5 Stars</option>
                                    <option value="4">4+ Stars</option>
                                    <option value="3">3+ Stars</option>
                                    <option value="2">2+ Stars</option>
                                    <option value="1">1+ Stars</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Active filter chips */}
                    {hasActiveFilters && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                            {filters.search && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2.5 py-1 text-xs font-medium text-violet-700">
                                    Search: &quot;{filters.search}&quot;
                                    <button onClick={() => handleFilterChange('search', '')} className="ml-0.5 hover:text-violet-900"><X className="h-3 w-3" /></button>
                                </span>
                            )}
                            {filters.status && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-700">
                                    Status: {statusOptions.find((s) => s.value === filters.status)?.label}
                                    <button onClick={() => handleFilterChange('status', '')} className="ml-0.5 hover:text-blue-900"><X className="h-3 w-3" /></button>
                                </span>
                            )}
                            {filters.category && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700">
                                    Category: {categoryOptions.find((c) => c.value === filters.category)?.label}
                                    <button onClick={() => handleFilterChange('category', '')} className="ml-0.5 hover:text-amber-900"><X className="h-3 w-3" /></button>
                                </span>
                            )}
                            <button onClick={clearFilters} className="ml-auto text-xs font-medium text-gray-400 underline hover:text-gray-600">
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Feedback List ── */}
            {isLoading ? (
                <Loader fullScreen={false} message="Loading feedback..." className="py-12" />
            ) : feedbacks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100">
                        <MessageSquare className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="mb-1 text-base font-semibold text-gray-700">No feedback found</h3>
                    <p className="max-w-xs text-sm text-gray-400">Try adjusting your filters or search terms to find feedback.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {feedbacks.map((feedback) => {
                        const catConfig = getCategoryConfig(feedback.category);
                        const isExpanded = expandedFeedback === feedback.id;

                        return (
                            <div
                                key={feedback.id}
                                className="group rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                            >
                                {/* Card top accent bar */}
                                <div className={`h-1 w-full rounded-t-xl ${catConfig?.bg}`} />

                                <div className="p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Category icon */}
                                        <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white ${catConfig?.bg}`}>
                                            {catConfig?.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            {/* Title row */}
                                            <div className="mb-1.5 flex flex-wrap items-start justify-between gap-2">
                                                <h3 className="text-base font-semibold text-gray-900 leading-snug">
                                                    {feedback.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(feedback.status)}
                                                    <button
                                                        onClick={() => handleDelete(feedback.id)}
                                                        disabled={isDeleting}
                                                        className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                                                        title="Delete feedback"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Meta row */}
                                            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                                <span className="inline-flex items-center gap-1">
                                                    <User className="h-3.5 w-3.5" />
                                                    {feedback.user?.name || 'Anonymous'}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {formatDate(feedback.created_at)}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${catConfig?.light}`}>
                                                    {feedback.category}
                                                </span>
                                                {feedback.rating && (
                                                    <span className="inline-flex items-center gap-1 text-amber-500">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star
                                                                key={s}
                                                                className={`h-3.5 w-3.5 ${s <= feedback.rating ? 'fill-current' : 'fill-none text-gray-200'}`}
                                                            />
                                                        ))}
                                                        <span className="ml-0.5 text-gray-400">{feedback.rating}/5</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Message */}
                                            <p className={`text-sm leading-relaxed text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
                                                {feedback.message}
                                            </p>
                                            {feedback.message?.length > 150 && (
                                                <button
                                                    onClick={() => setExpandedFeedback(isExpanded ? null : feedback.id)}
                                                    className="mt-1.5 text-xs font-medium text-violet-600 hover:text-violet-800"
                                                >
                                                    {isExpanded ? 'Show less ↑' : 'Read more ↓'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FeedbackManagementPage;
