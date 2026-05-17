import type { Metadata } from 'next';
import AffiliateNav from './components/affiliate-nav';

export const metadata: Metadata = {
    title: 'Partner Program | AndgatePOS',
    description: 'Join the AndgatePOS Partner Program. Earn sales commission from successful customer subscriptions after approval and lock period.',
};

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <AffiliateNav />
            {children}
        </div>
    );
}
