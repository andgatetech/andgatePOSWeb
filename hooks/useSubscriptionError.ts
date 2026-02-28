import { useEffect, useState } from 'react';

interface SubscriptionErrorData {
    errorType: 'no_active_subscription' | 'feature_unavailable' | 'limit_reached' | 'subscription_required' | 'expired' | 'no_subscription' | 'quota_exhausted' | 'subscription_expired' | null;
    message: string;
    details?: {
        limit?: number;
        current?: number;
        used?: number;
        feature?: string;
        required_features?: string[];
        [key: string]: any;
    };
}

interface ApiError {
    data?: {
        errors?: {
            subscription?: string;
            store?: string;
            product?: string;
            feature?: string;
            [key: string]: any;
        };
        message?: string;
        error_type?: string;
        feature?: string;
        used?: number;
        limit?: number;
        required_permission?: string;
    };
    status?: number;
}

/**
 * Hook to detect and handle subscription-related errors from API responses
 *
 * @param error - The error object from RTK Query or API call
 * @returns Object containing subscription error state and helper functions
 */
export const useSubscriptionError = (error?: ApiError) => {
    const [subscriptionError, setSubscriptionError] = useState<SubscriptionErrorData>({
        errorType: null,
        message: '',
        details: undefined,
    });

    useEffect(() => {
        if (!error) {
            setSubscriptionError({ errorType: null, message: '', details: undefined });
            return;
        }

        // Check if it's a new middleware subscription-related error (403 status and error_type)
        if (error.status === 403 && error.data?.error_type) {
            const data = error.data;
            if (['no_subscription', 'subscription_expired', 'quota_exhausted'].includes(data.error_type || '')) {
                setSubscriptionError({
                    errorType: data.error_type as any,
                    message: data.message || 'Subscription error.',
                    details: {
                        feature: data.feature,
                        used: data.used,
                        limit: data.limit,
                    },
                });
                return;
            }
        }

        // Check if it's a legacy subscription-related error (403 status via validation exception)
        if (error.status === 403 && error.data?.errors) {
            const errors = error.data.errors;

            // No active subscription
            if (errors.subscription === 'no_active_subscription') {
                setSubscriptionError({
                    errorType: 'no_active_subscription',
                    message: errors.message || 'No active subscription found for this user.',
                    details: {},
                });
                return;
            }

            // Store limit reached
            if (errors.store === 'limit_reached') {
                setSubscriptionError({
                    errorType: 'limit_reached',
                    message: errors.message || 'You have reached your store limit.',
                    details: {
                        limit: errors.limit,
                        current: errors.current,
                    },
                });
                return;
            }

            // Store feature unavailable
            if (errors.store === 'feature_unavailable') {
                setSubscriptionError({
                    errorType: 'feature_unavailable',
                    message: errors.message || 'Store creation is not available in your subscription plan.',
                    details: {},
                });
                return;
            }

            // Product limit reached
            if (errors.product === 'limit_reached') {
                setSubscriptionError({
                    errorType: 'limit_reached',
                    message: errors.message || 'You have reached your product limit.',
                    details: {
                        limit: errors.limit,
                        current: errors.current,
                        store_id: errors.store_id,
                    },
                });
                return;
            }

            // Product feature unavailable
            if (errors.product === 'feature_unavailable') {
                setSubscriptionError({
                    errorType: 'feature_unavailable',
                    message: errors.message || 'Product creation is not available in your subscription plan.',
                    details: {},
                });
                return;
            }

            // Feature subscription required
            if (errors.feature === 'subscription_required') {
                setSubscriptionError({
                    errorType: 'subscription_required',
                    message: errors.message || 'This feature requires a subscription.',
                    details: {
                        required_features: errors.required_features || [],
                    },
                });
                return;
            }
        }

        // If we reach here, it's not a subscription error we recognize
        setSubscriptionError({ errorType: null, message: '', details: undefined });
    }, [error]);

    return {
        hasSubscriptionError: subscriptionError.errorType !== null,
        subscriptionError,
        clearError: () => setSubscriptionError({ errorType: null, message: '', details: undefined }),
    };
};

export default useSubscriptionError;
