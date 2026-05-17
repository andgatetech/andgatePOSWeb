'use client';

const SECTIONS = [
    {
        title: 'Partner Terms & Conditions',
        points: [
            'AndgatePOS Partner Program is a SaaS referral, reseller, and channel partner program for Bangladesh SMEs.',
            'No partner earns money for recruiting another partner. Commission is linked only to verified AndgatePOS software subscription sales, renewals, approved demos, or approved sales performance bonuses.',
            'Partners must not present AndgatePOS as investment income, fixed income, MLM, pyramid selling, or passive income.',
        ],
    },
    {
        title: 'Commission Policy',
        points: [
            'Sales commission is generated only after a real customer subscription payment is recorded.',
            'Customer retention bonus is generated only from valid renewal payments of active subscriptions.',
            'Commission is not generated from partner signup, partner recruitment, package purchase, or tier unlock payment.',
        ],
    },
    {
        title: 'Payout Policy',
        points: [
            'Commission remains pending for 30 days after customer payment, then becomes payable if no refund, chargeback, or fraud issue exists.',
            'Minimum payout is ৳500. NID may be required for larger payouts and compliance review.',
            'Admin must record bKash/Nagad/bank transaction ID before completing payout.',
        ],
    },
    {
        title: 'Fraud & Abuse Policy',
        points: [
            'Self-referral, same phone/email abuse, fake customer signup, repeated suspicious referrals, or misleading promotion can be rejected.',
            'Suspicious referrals may be placed under manual review. Under-review conversions do not generate payoutable commission.',
            'AndgatePOS may suspend partner accounts for abuse or false promotional claims.',
        ],
    },
    {
        title: 'Promotional Guidelines',
        points: [
            'Allowed: “Earn commission by referring real businesses to AndgatePOS.”',
            'Allowed: “Commission is paid after successful subscription payment and lock period.”',
            'Not allowed: guaranteed income, passive income, recruit and earn, fixed monthly income, investment return, or unlimited income promises.',
        ],
    },
    {
        title: 'Refund / Chargeback Commission Policy',
        points: [
            'If a customer payment is refunded or charged back, related commission can be clawed back.',
            'Clawback entries stay visible in the commission ledger for audit trail.',
            'Paid payouts may be adjusted against future payable commission if needed.',
        ],
    },
    {
        title: 'Earnings Disclaimer',
        points: [
            'Income depends on actual successful customer subscriptions. AndgatePOS does not guarantee any fixed income.',
        ],
    },
];

export default function PartnerPoliciesPage() {
    return (
        <main className="px-4 py-10">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-slate-900">Partner Program Policies</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Compliance-safe rules for AndgatePOS Referral Partner, Channel Partner, and Reseller Partner activity in Bangladesh.
                </p>

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
