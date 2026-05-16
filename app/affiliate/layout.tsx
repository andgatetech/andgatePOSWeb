import type { Metadata } from 'next';
import AffiliateNav from './components/affiliate-nav';

export const metadata: Metadata = {
    title: 'Affiliate Program | AndgatePOS',
    description: 'Join the andgatePOS affiliate program and earn up to 40% commission per referral. bKash/Nagad payout.',
};

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <AffiliateNav />
            {children}
        </div>
    );
}
