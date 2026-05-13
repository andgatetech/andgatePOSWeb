import LandingIndexPageView from '@/components/seo/LandingIndexPageView';
import { getAppUrl } from '@/lib/seo-config';
import { Metadata } from 'next';

const baseUrl = getAppUrl();

export const metadata: Metadata = {
    title: 'POS Software Bangladesh Landing Pages | AndgatePOS',
    description: 'Explore AndgatePOS landing pages for POS software, retail POS, restaurant POS, pharmacy POS, grocery POS, inventory and billing software in Bangladesh.',
    alternates: {
        canonical: `${baseUrl}/landing`,
    },
};

export default function LandingIndexPage() {
    return <LandingIndexPageView />;
}
