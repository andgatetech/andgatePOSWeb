'use client';

import { useTranslation } from '@/components/i18n/TranslationProvider';
import { AUTH_TOKEN_EXPIRES_AT_COOKIE, AUTH_TOKEN_EXPIRES_AT_KEY, getCookieMaxAgeFromExpiry, getLoginTokenExpiresAt, isTokenExpired, setAuthCookie, setPermissionsCookie } from '@/lib/auth-session';
import { buildAttribution } from '@/lib/attribution';
import { createMarketingEventId, trackEvent } from '@/lib/analytics';
import { getExperimentVariant, getSessionId, getVisitorId } from '@/lib/visitor';
import { RootState } from '@/store';
import { useRegisterMutation } from '@/store/features/auth/authApi';
import { login } from '@/store/features/auth/authSlice';
import { Building as IconBuilding, Eye as IconEye, EyeOff as IconEyeOff, Lock as IconLockDots, Mail as IconMail, Phone as IconPhone, User as IconUser } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

type ComponentsAuthRegisterFormProps = {
    defaultSource?: string;
    defaultCampaign?: string;
};

const ComponentsAuthRegisterForm = ({ defaultSource = 'website_registration', defaultCampaign = 'public_registration' }: ComponentsAuthRegisterFormProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [runTour, setRunTour] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [registerApi, { isLoading }] = useRegisterMutation();
    const startedRef = useRef(false);

    const refCode = searchParams.get('ref') ?? '';
    const attribution = useMemo(
        () =>
            buildAttribution(searchParams, {
                source: searchParams.get('source') || defaultSource,
                campaign: defaultCampaign,
            }),
        [searchParams, defaultSource, defaultCampaign]
    );

    const [credentials, setCredentials] = useState({
        store_name: '',
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        store_type: 'retail',
        ref_code: refCode,
        ...attribution,
    });

    useEffect(() => {
        setCredentials((prev) => ({ ...prev, ref_code: refCode, ...attribution }));
    }, [refCode, attribution]);

    useEffect(() => {
        trackEvent('registration_form_viewed', 'RegistrationFormViewed', {
            source: attribution.source,
            campaign: attribution.campaign,
            ...attribution,
        });
    }, [attribution]);

    const updateCredential = (key: keyof typeof credentials, value: string) => {
        if (!startedRef.current) {
            startedRef.current = true;
            trackEvent('registration_started', 'RegistrationStarted', {
                source: credentials.source,
                campaign: credentials.campaign,
                first_field: key,
            });
        }
        setCredentials((prev) => ({ ...prev, [key]: value }));
    };

    // Start tour on component mount (optional - you can trigger this differently)
    useEffect(() => {
        // Check if user hasn't seen the tour before
        const hasSeenTour = localStorage.getItem('register-tour-completed');
        if (!hasSeenTour) {
            setTimeout(() => setRunTour(true), 1000); // Start tour after 1 second
        }
    }, []);

    const submitForm = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const registrationEventId = createMarketingEventId('CompleteRegistration');
            const trialEventId = createMarketingEventId('StartTrial');
            const visitorContext = {
                visitor_id: getVisitorId(),
                session_id: getSessionId(),
                latest_path: window.location.pathname,
                experiment_key: 'public_register_v1',
                experiment_variant: getExperimentVariant('public_register_v1', ['control']),
                registration_event_id: registrationEventId,
                trial_event_id: trialEventId,
            };

            trackEvent('registration_submit_attempt', 'RegistrationSubmit', {
                source: credentials.source,
                campaign: credentials.campaign,
                store_type: credentials.store_type,
                visitor_id: visitorContext.visitor_id,
                session_id: visitorContext.session_id,
            });

            const result = await registerApi({ ...credentials, ...visitorContext }).unwrap();
            const { user, token, permissions } = result.data; // user already has store & subscription_user
            const tokenExpiresAt = getLoginTokenExpiresAt(result.data);

            if (isTokenExpired(tokenExpiresAt)) {
                toast.error(t('register_token_expired'));
                return;
            }
            const validTokenExpiresAt = tokenExpiresAt as string;

            const maxAge = getCookieMaxAgeFromExpiry(validTokenExpiresAt);

            // Save token + role in cookies
            setAuthCookie('token', token, maxAge);
            setAuthCookie('role', user.role, maxAge);
            setPermissionsCookie(permissions ?? [], maxAge);
            setAuthCookie(AUTH_TOKEN_EXPIRES_AT_COOKIE, validTokenExpiresAt, maxAge);

            localStorage.setItem(AUTH_TOKEN_EXPIRES_AT_KEY, validTokenExpiresAt);

            // Save full user data + permissions in Redux
            dispatch(login({ user, token, tokenExpiresAt: validTokenExpiresAt, permissions }));

            trackEvent('register_success', 'CompleteRegistration', {
                event_id: registrationEventId,
                content_name: 'AndgateBOS Registration',
                content_category: 'SaaS Signup',
                status: true,
                store_type: credentials.store_type,
                source: credentials.source,
                campaign: credentials.campaign,
                utm_source: credentials.utm_source,
                utm_medium: credentials.utm_medium,
                utm_campaign: credentials.utm_campaign,
                utm_content: credentials.utm_content,
                utm_term: credentials.utm_term,
                fbclid: credentials.fbclid,
                fbp: credentials.fbp,
                fbc: credentials.fbc,
                landing_page: credentials.landing_page,
                referrer: credentials.referrer,
                initial_path: credentials.initial_path,
                latest_path: visitorContext.latest_path,
                visitor_id: visitorContext.visitor_id,
                session_id: visitorContext.session_id,
                experiment_key: visitorContext.experiment_key,
                experiment_variant: visitorContext.experiment_variant,
                user_data: {
                    email: credentials.email,
                    phone: credentials.phone,
                    name: credentials.name,
                    external_id: user.id,
                    country: 'bd',
                },
            });

            trackEvent('trial_started', 'StartTrial', {
                event_id: trialEventId,
                content_name: 'AndgateBOS Trial',
                content_category: 'SaaS Trial',
                status: true,
                store_type: credentials.store_type,
                source: credentials.source,
                campaign: credentials.campaign,
                utm_source: credentials.utm_source,
                utm_medium: credentials.utm_medium,
                utm_campaign: credentials.utm_campaign,
                utm_content: credentials.utm_content,
                utm_term: credentials.utm_term,
                fbclid: credentials.fbclid,
                fbp: credentials.fbp,
                fbc: credentials.fbc,
                landing_page: credentials.landing_page,
                referrer: credentials.referrer,
                initial_path: credentials.initial_path,
                latest_path: visitorContext.latest_path,
                visitor_id: visitorContext.visitor_id,
                session_id: visitorContext.session_id,
                experiment_key: visitorContext.experiment_key,
                experiment_variant: visitorContext.experiment_variant,
                user_data: {
                    email: credentials.email,
                    phone: credentials.phone,
                    name: credentials.name,
                    external_id: user.id,
                    country: 'bd',
                },
            });

            trackEvent('trial_started_custom', 'TrialStarted', {
                event_id: createMarketingEventId('TrialStarted'),
                content_name: 'AndgateBOS Trial',
                content_category: 'SaaS Trial',
                status: true,
                store_type: credentials.store_type,
                source: credentials.source,
                campaign: credentials.campaign,
                utm_source: credentials.utm_source,
                utm_medium: credentials.utm_medium,
                utm_campaign: credentials.utm_campaign,
                utm_content: credentials.utm_content,
                utm_term: credentials.utm_term,
                fbclid: credentials.fbclid,
                fbp: credentials.fbp,
                fbc: credentials.fbc,
                landing_page: credentials.landing_page,
                referrer: credentials.referrer,
                initial_path: credentials.initial_path,
                latest_path: visitorContext.latest_path,
                visitor_id: visitorContext.visitor_id,
                session_id: visitorContext.session_id,
                experiment_key: visitorContext.experiment_key,
                experiment_variant: visitorContext.experiment_variant,
                user_data: {
                    email: credentials.email,
                    phone: credentials.phone,
                    name: credentials.name,
                    external_id: user.id,
                    country: 'bd',
                },
            });

            toast.success(t('register_success_redirect'));
            setTimeout(() => router.push('/dashboard'), 800);
        } catch (error: any) {
            // Handle all RTK Query error shapes
            const message =
                error?.data?.message ||
                error?.data?.errors?.email?.[0] ||
                error?.data?.errors?.phone?.[0] ||
                error?.data?.errors?.password?.[0] ||
                (error?.status === 'FETCH_ERROR' ? t('error_cannot_connect_server') : null) ||
                t('register_failed');
            toast.error(message);
            trackEvent('registration_failed', 'RegistrationFailed', {
                source: credentials.source,
                campaign: credentials.campaign,
                store_type: credentials.store_type,
                error_status: error?.status || 'unknown',
            });
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
            {refCode && (
                <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-sm font-medium text-success">
                    <span>🤝</span>
                    <span>
                        রেফারেল কোড:{' '}
                        <strong lang="en" dir="ltr">
                            {refCode.toUpperCase()}
                        </strong>{' '}
                        — কমিশন ট্র্যাক হবে
                    </span>
                </div>
            )}
            <div>
                <label htmlFor="Name">{t('register-page.form.name_label')}</label>
                <div className="relative text-white-dark">
                    <input
                        id="Name"
                        required
                        onChange={(e) => updateCredential('name', e.target.value)}
                        type="text"
                        placeholder={t('register-page.form.name_placeholder')}
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconUser size={18} />
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="Email">{t('register-page.form.email_label')}</label>
                <div className="relative text-white-dark">
                    <input
                        id="Email"
                        required
                        onChange={(e) => updateCredential('email', e.target.value)}
                        type="email"
                        placeholder={t('register-page.form.email_placeholder')}
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconMail size={18} />
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="Phone">{t('register-page.form.phone_label')}</label>
                <div className="relative text-white-dark">
                    <input
                        id="Phone"
                        required
                        onChange={(e) => updateCredential('phone', e.target.value)}
                        type="tel"
                        placeholder={t('register-page.form.phone_placeholder')}
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconPhone size={18} />
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="StoreName">{t('register-page.form.store_name_label')}</label>
                <div className="relative text-white-dark">
                    <input
                        id="StoreName"
                        required
                        onChange={(e) => updateCredential('store_name', e.target.value)}
                        type="text"
                        placeholder={t('register-page.form.store_name_placeholder')}
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconBuilding size={18} />
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="Password">{t('register-page.form.password_label')}</label>
                <div className="relative text-white-dark">
                    <input
                        id="Password"
                        required
                        onChange={(e) => updateCredential('password', e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('register-page.form.password_placeholder')}
                        className="form-input pe-12 ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconLockDots size={18} />
                    </span>
                    <span
                        className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="PasswordConfirm">{t('register-page.form.repeat_password_label')}</label>
                <div className="relative text-white-dark">
                    <input
                        id="PasswordConfirm"
                        required
                        onChange={(e) => updateCredential('password_confirmation', e.target.value)}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder={t('register-page.form.repeat_password_placeholder')}
                        className="form-input pe-12 ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconLockDots size={18} />
                    </span>
                    <span
                        className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </span>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] py-3 text-sm font-semibold uppercase text-white shadow-[0_10px_20px_-10px_rgba(4,108,169,0.44)] transition-all hover:from-[#034d79] hover:to-[#02395b] disabled:opacity-50"
            >
                {isLoading ? t('register-page.form.signing_up') : t('register-page.form.sign_up_button')}
            </button>
        </form>
    );
};

export default ComponentsAuthRegisterForm;
