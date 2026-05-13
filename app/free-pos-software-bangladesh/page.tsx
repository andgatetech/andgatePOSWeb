import HighIntentSeoPageView from '@/components/seo/HighIntentSeoPage';
import { getHighIntentPage } from '@/lib/high-intent-pages';
import { BD_KEYWORDS, getAppUrl } from '@/lib/seo-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const page = getHighIntentPage('/free-pos-software-bangladesh');

export const metadata: Metadata = page
    ? {
          title: page.metaTitle,
          description: page.metaDescription,
          keywords: [page.primaryKeyword, ...page.secondaryKeywords, ...BD_KEYWORDS],
          alternates: { canonical: `${getAppUrl()}${page.path}` },
          openGraph: {
              type: 'website',
              locale: 'en_BD',
              url: `${getAppUrl()}${page.path}`,
              siteName: 'AndgatePOS',
              title: page.metaTitle,
              description: page.metaDescription,
              images: [{ url: page.image, width: 1200, height: 630, alt: page.title }],
          },
          twitter: {
              card: 'summary_large_image',
              title: page.metaTitle,
              description: page.metaDescription,
              images: [page.image],
          },
      }
    : {};

export default function FreePosSoftwareBangladeshPage() {
    if (!page) notFound();

    return <HighIntentSeoPageView page={page} />;
}
