import LandingIndexPageView from '@/components/seo/LandingIndexPageView';
import { getAppUrl } from '@/lib/seo-config';
import { Metadata } from 'next';

const baseUrl = getAppUrl();

export const metadata: Metadata = {
    title: 'Business OS & POS Software Bangladesh Pages | AndgateBOS',
    description: 'Explore AndgateBOS pages for SME Business OS, POS software, retail POS, restaurant POS, pharmacy POS, grocery POS, inventory and billing software in Bangladesh.',
    alternates: {
        canonical: `${baseUrl}/landing`,
    },
};

export default function LandingIndexPage() {
    return <LandingIndexPageView />;
}
