'use client';

import { getTranslation } from '@/i18n';
import { AlertTriangle, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';

export default function AffiliatePoliciesPage() {
    const { t } = getTranslation();

    const SECTIONS = [
        {
            title: t('aff_policy_s1_title'),
            points: [t('aff_policy_s1_p1'), t('aff_policy_s1_p2'), t('aff_policy_s1_p3')],
        },
        {
            title: t('aff_policy_s2_title'),
            points: [t('aff_policy_s2_p1'), t('aff_policy_s2_p2'), t('aff_policy_s2_p3')],
        },
        {
            title: t('aff_policy_s3_title'),
            points: [t('aff_policy_s3_p1'), t('aff_policy_s3_p2'), t('aff_policy_s3_p3')],
        },
        {
            title: t('aff_policy_s4_title'),
            points: [t('aff_policy_s4_p1'), t('aff_policy_s4_p2'), t('aff_policy_s4_p3')],
        },
        {
            title: t('aff_policy_s5_title'),
            points: [t('aff_policy_s5_p1'), t('aff_policy_s5_p2'), t('aff_policy_s5_p3')],
        },
        {
            title: t('aff_policy_s6_title'),
            points: [t('aff_policy_s6_p1'), t('aff_policy_s6_p2'), t('aff_policy_s6_p3')],
        },
        {
            title: t('aff_policy_s7_title'),
            points: [t('aff_policy_s7_p1')],
        },
        {
            title: t('aff_policy_s8_title'),
            points: [t('aff_policy_s8_p1'), t('aff_policy_s8_p2'), t('aff_policy_s8_p3')],
        },
        {
            title: t('aff_policy_s9_title'),
            points: [t('aff_policy_s9_p1'), t('aff_policy_s9_p2'), t('aff_policy_s9_p3')],
        },
    ];

    const allowed = [t('aff_policy_allowed_1'), t('aff_policy_allowed_2'), t('aff_policy_allowed_3')];
    const notAllowed = [t('aff_policy_not_allowed_1'), t('aff_policy_not_allowed_2'), t('aff_policy_not_allowed_3')];

    return (
        <main className="px-4 py-10">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-slate-900">{t('aff_policy_page_title')}</h1>
                <p className="mt-2 text-sm text-slate-500">{t('aff_policy_page_subtitle')}</p>

                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                        <p className="text-sm leading-6 text-amber-900">{t('aff_policy_plain_warning')}</p>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                        <h2 className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                            <CheckCircle2 className="h-4 w-4" />
                            {t('aff_policy_allowed_title')}
                        </h2>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                            {allowed.map((point) => <li key={point}>• {point}</li>)}
                        </ul>
                    </section>
                    <section className="rounded-xl border border-red-200 bg-red-50 p-5">
                        <h2 className="flex items-center gap-2 text-sm font-bold text-red-800">
                            <XCircle className="h-4 w-4" />
                            {t('aff_policy_not_allowed_title')}
                        </h2>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                            {notAllowed.map((point) => <li key={point}>• {point}</li>)}
                        </ul>
                    </section>
                </div>

                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                        <p className="text-sm leading-6 text-blue-900">{t('aff_policy_disclosure_rule')}</p>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    {SECTIONS.map((section) => (
                        <section key={section.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-bold text-primary">{section.title}</h2>
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                                {section.points.map((point) => <li key={point}>{point}</li>)}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}
