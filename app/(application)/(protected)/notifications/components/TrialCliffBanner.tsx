'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { Clock3, X } from 'lucide-react';
import { RootState } from '@/store';
import { getTranslation } from '@/i18n';

// Shows once the trial has 4 days or fewer left (day 10-14 of the 14-day trial).
// Framed as "here's your next plan" rather than "here's what you'll lose" — an
// unannounced feature cliff on day 15 is the single biggest trial-conversion
// killer pattern; naming it in advance turns it into an expected transition.
// Dismissal is per-day (not per-trial) so it resurfaces daily until conversion
// or expiry instead of going silent for the rest of the trial after one click.
const TrialCliffBanner = () => {
    const { t } = getTranslation();
    const user = useSelector((state: RootState) => state.auth.user);
    const subscriptionUser = (user as any)?.subscription_user;
    const todayKey = new Date().toISOString().slice(0, 10);
    const [dismissed, setDismissed] = useState(false);

    const isTrial = subscriptionUser?.status?.toLowerCase() === 'active' && subscriptionUser?.plan_name_en === 'Trial';
    const expireDate = subscriptionUser?.expire_date;
    const daysRemaining = expireDate ? Math.ceil((new Date(expireDate).getTime() - Date.now()) / 86400000) : null;

    if (!isTrial || daysRemaining === null || daysRemaining > 4 || daysRemaining < 0) return null;
    if (typeof window !== 'undefined' && sessionStorage.getItem('trial_cliff_dismissed') === todayKey) return null;
    if (dismissed) return null;

    const handleDismiss = () => {
        sessionStorage.setItem('trial_cliff_dismissed', todayKey);
        setDismissed(true);
    };

    return (
        <div className="mb-4 flex items-center gap-3 bg-primary/10 px-6 py-2.5 text-sm text-primary">
            <Clock3 className="h-5 w-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
                <span className="font-extrabold ltr:mr-2 rtl:ml-2">
                    {daysRemaining === 0 ? t('trial_cliff_last_day') : t('trial_cliff_days_left', { count: daysRemaining })}
                </span>
                <span className="font-semibold opacity-95">{t('trial_cliff_message')}</span>
                <Link href="/subscription" className="ml-2 whitespace-nowrap font-extrabold underline underline-offset-2">
                    {t('trial_cliff_cta')}
                </Link>
            </div>
            <button type="button" className="flex-shrink-0 rounded p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10" onClick={handleDismiss} title={t('btn_dismiss')}>
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

export default TrialCliffBanner;
