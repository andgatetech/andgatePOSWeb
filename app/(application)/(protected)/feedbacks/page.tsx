'use client';

import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useDeleteFeedbackMutation, useGetAllFeedbacksQuery } from '@/store/features/feedback/feedbackApi';
import { Bug, Calendar, CheckCircle, ChevronDown, ChevronRight, Clock, Download, Eye, Filter, Lightbulb, MessageSquare, RefreshCw, Search, Star, ThumbsUp, Trash2, User, X } from 'lucide-react';
import { useState } from 'react';

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
        { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
        { value: 'reviewed', label: 'Reviewed', color: 'bg-blue-100 text-blue-800', icon: <Eye className="h-4 w-4" /> },
        { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
    ];

    const categoryOptions = [
        { value: '', label: 'All Categories' },
        { value: 'bug', label: 'Bug Report', icon: <Bug className="h-4 w-4" />, color: 'from-red-500 to-pink-500' },
        { value: 'suggestion', label: 'Suggestion', icon: <Lightbulb className="h-4 w-4" />, color: 'from-yellow-500 to-orange-500' },
        { value: 'compliment', label: 'Compliment', icon: <ThumbsUp className="h-4 w-4" />, color: 'from-green-500 to-emerald-500' },
        { value: 'general', label: 'General', icon: <MessageSquare className="h-4 w-4" />, color: 'from-blue-500 to-purple-500' },
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
        const statusConfig = statusOptions.find((s) => s.value === status);
        if (!statusConfig) return null;

        return (
            <span className={`inline-flex items-center space-x-1 rounded-full px-3 py-1 text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.icon}
                <span>{statusConfig.label}</span>
            </span>
        );
    };

    const getCategoryIcon = (category) => {
        const categoryConfig = categoryOptions.find((c) => c.value === category);
        if (!categoryConfig) return <MessageSquare className="h-4 w-4" />;

        return <div className={`inline-flex rounded-lg bg-gradient-to-r p-2 ${categoryConfig.color} text-white`}>{categoryConfig.icon}</div>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            status: '',
            category: '',
            dateFrom: '',
            dateTo: '',
            rating: '',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-4xl font-bold text-gray-900">Feedback Management</h1>
                            <p className="text-gray-600">Monitor and respond to customer feedback</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button onClick={() => refetch()} className="flex items-center space-x-2 rounded-xl bg-white px-4 py-2 shadow-sm transition-all hover:shadow-md">
                                <RefreshCw className="h-4 w-4" />
                                <span>Refresh</span>
                            </button>
                            <button className="flex items-center space-x-2 rounded-xl bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                                <Download className="h-4 w-4" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        {[
                            { label: 'Total Feedback', value: feedbacks.length, color: 'from-blue-500 to-blue-600', icon: <MessageSquare className="h-6 w-6" /> },
                            { label: 'Pending', value: feedbacks.filter((f) => f.status === 'pending').length, color: 'from-yellow-500 to-yellow-600', icon: <Clock className="h-6 w-6" /> },
                            { label: 'Reviewed', value: feedbacks.filter((f) => f.status === 'reviewed').length, color: 'from-purple-500 to-purple-600', icon: <Eye className="h-6 w-6" /> },
                            { label: 'Resolved', value: feedbacks.filter((f) => f.status === 'resolved').length, color: 'from-green-500 to-green-600', icon: <CheckCircle className="h-6 w-6" /> },
                        ].map((stat, index) => (
                            <div key={index} className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                    <div className={`bg-gradient-to-r ${stat.color} rounded-xl p-3 text-white`}>{stat.icon}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
                        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                            <Filter className="h-4 w-4" />
                            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
                            {showFilters ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by title or message..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full rounded-xl border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="rounded-xl border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {/* Category Filter */}
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="rounded-xl border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        >
                            {categoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 md:grid-cols-3">
                            {/* Date From */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">From Date</label>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Date To */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">To Date</label>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Rating Filter */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Minimum Rating</label>
                                <select
                                    value={filters.rating}
                                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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

                    {/* Active Filters */}
                    {(filters.search || filters.status || filters.category || filters.dateFrom || filters.dateTo || filters.rating) && (
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                            <div className="flex flex-wrap gap-2">
                                {filters.search && (
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                        Search: &quot;{filters.search}&quot;
                                        <button onClick={() => handleFilterChange('search', '')} className="ml-2">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.status && (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                        Status: {statusOptions.find((s) => s.value === filters.status)?.label}
                                        <button onClick={() => handleFilterChange('status', '')} className="ml-2">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                            <button onClick={clearFilters} className="text-sm text-gray-600 underline hover:text-gray-800">
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Feedback List */}
                <div className="space-y-6">
                    {isLoading ? (
                        <Loader fullScreen={false} message="Loading feedback..." className="py-12" />
                    ) : feedbacks.length === 0 ? (
                        <div className="py-12 text-center">
                            <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900">No feedback found</h3>
                            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
                        </div>
                    ) : (
                        feedbacks.map((feedback) => (
                            <div key={feedback.id} className="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
                                <div className="p-6">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex flex-1 items-start space-x-4">
                                            {getCategoryIcon(feedback.category)}
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="text-lg font-semibold text-gray-900">{feedback.title}</h3>
                                                    </div>
                                                    {/* Status Badge positioned at top right */}
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusBadge(feedback.status)}
                                                        <button
                                                            onClick={() => handleDelete(feedback.id)}
                                                            disabled={isDeleting}
                                                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mb-3 flex items-center space-x-4 text-sm text-gray-500">
                                                    <div className="flex items-center space-x-1">
                                                        <User className="h-4 w-4" />
                                                        <span>{feedback.user?.name || 'Anonymous'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{formatDate(feedback.created_at)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-600">{feedback.category}</span>
                                                    </div>
                                                    {feedback.rating && (
                                                        <div className="flex items-center space-x-1">
                                                            <Star className="h-4 w-4 fill-current text-yellow-400" />
                                                            <span>{feedback.rating}/5</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className={`leading-relaxed text-gray-700 ${expandedFeedback === feedback.id ? '' : 'line-clamp-2'}`}>{feedback.message}</p>
                                                {feedback.message.length > 150 && (
                                                    <button
                                                        onClick={() => setExpandedFeedback(expandedFeedback === feedback.id ? null : feedback.id)}
                                                        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        {expandedFeedback === feedback.id ? 'Show less' : 'Show more'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackManagementPage;
