'use client';

import { getTranslation } from '@/i18n';

export default function PartnerPoliciesPage() {
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
    ];

    return (
        <main className="px-4 py-10">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-slate-900">{t('aff_policy_page_title')}</h1>
                <p className="mt-2 text-sm text-slate-500">{t('aff_policy_page_subtitle')}</p>

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
