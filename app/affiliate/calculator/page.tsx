'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGetAffiliateCalculatorQuery } from '@/store/features/affiliate/affiliateApi';
import { useGetPlansQuery, type Plan } from '@/store/features/plans/plansApi';
import { getTranslation } from '@/i18n';
import Link from 'next/link';

const TIERS = [
    { value: 'bronze',   label: 'ব্রোঞ্জ',   pct: '৫০% + ১০%' },
    { value: 'silver',   label: 'সিলভার',   pct: '৬০% + ১২%' },
    { value: 'gold',     label: 'গোল্ড',     pct: '৭০% + ১৫%' },
    { value: 'platinum', label: 'প্লাটিনাম', pct: '৮০% + ১৮%' },
];

function formatBDT(amount: number) {
    return '৳' + Math.round(amount).toLocaleString('en-IN');
}

export default function AffiliateCalculatorPage() {
    const { t } = getTranslation();
    const [tier, setTier] = useState('bronze');
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [customFee, setCustomFee] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const [customers, setCustomers] = useState(10);

    const { data: plansData, isLoading: plansLoading } = useGetPlansQuery();
    const plans: Plan[] = useMemo(() => plansData?.data ?? [], [plansData?.data]);

    useEffect(() => {
        if (plans.length > 0 && selectedPlanId === null && !isCustom) {
            setSelectedPlanId(plans[0].id);
        }
    }, [plans, selectedPlanId, isCustom]);

    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    const monthlyFee = isCustom
        ? Number(customFee) || 0
        : selectedPlan
        ? Math.round(parseFloat(selectedPlan.monthly_price))
        : 0;

    const { data: calcData, isFetching } = useGetAffiliateCalculatorQuery(
        { tier, monthly_fee: monthlyFee, customers },
        { skip: monthlyFee <= 0 || customers <= 0 }
    );

    const result = calcData?.data;

    return (
        <div className="flex items-center justify-center p-3 sm:p-4 pb-12">
            <div className="w-full max-w-2xl">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">{t('aff_calc_title')}</h1>
                    <p className="text-slate-500">{t('aff_calc_subtitle')}</p>
                </div>

                <div className="rounded-2xl bg-white shadow-md border border-slate-200 p-6 mb-6 space-y-6">

                    {/* Tier selector */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700">{t('aff_calc_your_tier')}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {TIERS.map(({ value, label, pct }) => (
                                <button
                                    key={value}
                                    onClick={() => setTier(value)}
                                    className={`rounded-xl py-2.5 px-3 text-sm font-medium border-2 transition text-left ${
                                        tier === value
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-slate-200 text-slate-600 hover:border-primary/40'
                                    }`}
                                >
                                    <span className="font-bold">{label}</span>
                                    <span className="ml-1.5 text-xs opacity-70">({pct})</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Plan selector */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700">{t('aff_calc_plan_label')}</label>
                        {plansLoading ? (
                            <div className="text-sm text-slate-400 py-2">{t('aff_calc_plan_loading')}</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {plans.map((plan) => {
                                    const price = Math.round(parseFloat(plan.monthly_price));
                                    const isSelected = !isCustom && selectedPlanId === plan.id;
                                    return (
                                        <button
                                            key={plan.id}
                                            onClick={() => { setIsCustom(false); setSelectedPlanId(plan.id); }}
                                            className={`rounded-xl py-2.5 px-3 border-2 transition text-left ${
                                                isSelected
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-slate-200 hover:border-primary/40'
                                            }`}
                                        >
                                            <div className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                                                {plan.name_bn || plan.name_en}
                                            </div>
                                            <div className={`text-xs mt-0.5 ${isSelected ? 'text-primary/80' : 'text-slate-500'}`}>
                                                {formatBDT(price)}{t('aff_calc_plan_per_month')}
                                            </div>
                                        </button>
                                    );
                                })}

                                {/* Custom option */}
                                <button
                                    onClick={() => { setIsCustom(true); setSelectedPlanId(null); }}
                                    className={`rounded-xl py-2.5 px-3 border-2 transition text-left ${
                                        isCustom
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-slate-200 text-slate-600 hover:border-primary/40'
                                    }`}
                                >
                                    <div className="text-sm font-semibold">{t('aff_calc_custom_plan')}</div>
                                    <div className="text-xs mt-0.5 opacity-70">{t('aff_calc_custom_plan_desc')}</div>
                                </button>
                            </div>
                        )}

                        {isCustom && (
                            <input
                                type="number"
                                min="100"
                                placeholder={t('aff_calc_custom_ph')}
                                className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                value={customFee}
                                onChange={(e) => setCustomFee(e.target.value)}
                            />
                        )}
                    </div>

                    {/* Customer slider */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700">
                            {t('aff_calc_customers_label')}{' '}
                            <span className="text-primary font-bold">{customers} {t('aff_calc_customers_suffix')}</span>
                        </label>
                        <input
                            type="range"
                            min={1}
                            max={200}
                            value={customers}
                            onChange={(e) => setCustomers(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>১</span><span>৫০</span><span>১০০</span><span>২০০</span>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {result && !isFetching && monthlyFee > 0 && (
                    <div className="rounded-2xl bg-gradient-to-br from-primary to-[#034d79] text-white p-6 shadow-xl">
                        <h2 className="text-lg font-bold mb-4 text-white/90">{t('aff_calc_result_title')}</h2>
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5">
                            {[
                                { labelKey: 'aff_calc_first_month', value: Number(result.first_month),      subKey: 'aff_calc_first_month_sub' },
                                { labelKey: 'aff_calc_renewal',     value: Number(result.monthly_recurring), subKey: 'aff_calc_renewal_sub'     },
                                { labelKey: 'aff_calc_year1',       value: Number(result.total_year_1),      subKey: 'aff_calc_year1_sub'       },
                            ].map(({ labelKey, value, subKey }) => (
                                <div key={labelKey} className="text-center">
                                    <div className="text-xl sm:text-2xl font-bold text-yellow-300">
                                        {formatBDT(value)}
                                    </div>
                                    <div className="text-xs text-white/70 mt-0.5">{t(labelKey)}</div>
                                    <div className="text-xs text-white/50">{t(subKey)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-xl bg-white/10 px-3 py-2.5 text-xs sm:text-sm text-center text-white/80">
                            {customers} {t('aff_calc_customers_suffix')} × {formatBDT(monthlyFee)}{t('aff_calc_plan_per_month')} ×{' '}
                            <strong className="text-white">
                                {TIERS.find((t) => t.value === tier)?.label}
                            </strong>{' '}
                            {t('aff_calc_tier_suffix')}
                        </div>
                        <p className="mt-3 text-center text-xs text-white/70">
                            Income depends on actual successful customer subscriptions. AndgatePOS does not guarantee any fixed income.
                        </p>
                        <div className="mt-4 text-center">
                            <Link
                                href="/affiliate"
                                className="inline-block rounded-xl bg-yellow-400 text-slate-900 font-bold px-8 py-2.5 hover:bg-yellow-300 transition"
                            >
                                {t('aff_calc_join_btn')}
                            </Link>
                        </div>
                    </div>
                )}

                {isFetching && monthlyFee > 0 && (
                    <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center text-slate-400 text-sm">
                        {t('aff_calc_calculating')}
                    </div>
                )}

                {!isCustom && monthlyFee <= 0 && !plansLoading && plans.length === 0 && (
                    <div className="rounded-2xl bg-slate-100 p-6 text-center text-slate-400 text-sm">
                        {t('aff_calc_load_error')}
                    </div>
                )}
            </div>
        </div>
    );
}
