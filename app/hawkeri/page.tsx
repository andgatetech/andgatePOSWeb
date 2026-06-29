import { apiBaseUrl } from '@/lib/api-url';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, ChevronRight, Clock3, Heart, MapPin, PackageCheck, Search, ShieldCheck, ShoppingBag, Sparkles, Star, Store, Truck, Zap } from 'lucide-react';

type LocalizedText = {
    en?: string | null;
    bn?: string | null;
};

type HomepageSection = {
    id: number;
    section_key: string;
    type: string;
    title?: LocalizedText;
    subtitle?: LocalizedText;
    eyebrow?: LocalizedText;
    cta?: {
        label_en?: string | null;
        label_bn?: string | null;
        url?: string | null;
    };
    image_url?: string | null;
    mobile_image_url?: string | null;
    items?: any[];
    settings?: Record<string, any>;
    display_order?: number;
};

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
const APP_ORIGIN = (process.env.NEXT_PUBLIC_APP_URL || 'https://andgatepos.com').replace(/\/+$/, '');
const HAWKERI_URL = 'https://andgatepos.com/hawkeri';

export const metadata: Metadata = {
    title: 'Hawkeri Online Shopping Bangladesh',
    description: 'Shop local Bangladeshi stores through Hawkeri. Discover daily deals, verified sellers, essentials, fashion, electronics, grocery and more.',
    alternates: { canonical: HAWKERI_URL },
    openGraph: {
        title: 'Hawkeri Online Shopping Bangladesh',
        description: 'A fresh local ecommerce marketplace powered by AndgatePOS sellers.',
        url: HAWKERI_URL,
        images: [{ url: '/assets/images/shopping-bag.png', width: 512, height: 512, alt: 'Hawkeri' }],
    },
};

async function getHomepageSections(): Promise<HomepageSection[]> {
    try {
        const baseUrl = apiBaseUrl();
        const endpoint = `${baseUrl.startsWith('http') ? baseUrl : `${APP_ORIGIN}${baseUrl}`}/ecommerce/homepage`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(endpoint, {
            next: { revalidate: 60 },
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) return [];
        const payload = await res.json();
        const sections = payload?.data?.sections;
        return Array.isArray(sections) ? sections : [];
    } catch {
        return [];
    }
}

function text(value?: LocalizedText, fallback = '') {
    return value?.en || value?.bn || fallback;
}

function imageUrl(value?: string | null) {
    if (!value) return '';
    if (/^(https?:)?\/\//.test(value) || value.startsWith('data:')) return value;
    if (value.startsWith('/storage/') && API_ORIGIN) return `${API_ORIGIN}${value}`;
    return value;
}

function ctaHref(section: HomepageSection) {
    return section.cta?.url || '/hawkeri#collections';
}

function itemTitle(item: any, fallback = 'Hawkeri item') {
    return item.title_en || item.title || item.product_name || item.store_name || fallback;
}

function itemSubtitle(item: any, fallback = '') {
    return item.subtitle_en || item.subtitle || item.location || item.description || fallback;
}

function itemPrice(item: any) {
    return item.subtitle_en || item.price || item.deal_price || item.sale_price || item.regular_price || 'Price coming soon';
}

const fallbackSections: HomepageSection[] = [
    {
        id: 1,
        section_key: 'hawkeri-main-hero',
        type: 'hero',
        eyebrow: { en: 'Local marketplace' },
        title: { en: 'Shop Bangladesh local stores from one trusted marketplace' },
        subtitle: { en: 'Find daily essentials, fashion, electronics, beauty and gifts from sellers connected to real shop operations.' },
        cta: { label_en: 'Start shopping', url: '#collections' },
        image_url: '/assets/images/carousel1.jpeg',
        settings: { tone: 'fresh' },
    },
    {
        id: 2,
        section_key: 'quick-promos',
        type: 'promo_tiles',
        title: { en: 'Today on Hawkeri' },
        subtitle: { en: 'Fast picks for busy shoppers' },
        items: [
            { title_en: 'Grocery deals', subtitle_en: 'Fresh daily needs', image_url: '/assets/images/shopping-bag.png', url: '#collections' },
            { title_en: 'Fashion drops', subtitle_en: 'Style from local sellers', image_url: '/assets/images/product-shoes.jpg', url: '#collections' },
            { title_en: 'Gadgets & accessories', subtitle_en: 'Useful tech picks', image_url: '/assets/images/product-watch.jpg', url: '#collections' },
            { title_en: 'Work essentials', subtitle_en: 'Bags, tech and desk picks', image_url: '/assets/images/product-laptop.jpg', url: '#collections' },
        ],
    },
    {
        id: 3,
        section_key: 'trust-strip',
        type: 'trust_strip',
        title: { en: 'Why shoppers remember Hawkeri' },
        items: [
            { title_en: 'Verified sellers', subtitle_en: 'Stores managed through AndgatePOS' },
            { title_en: 'Local delivery', subtitle_en: 'Bangladesh-friendly fulfillment' },
            { title_en: 'Fresh stock', subtitle_en: 'Products sync from real shops' },
            { title_en: 'Secure checkout', subtitle_en: 'Built for COD and digital payment flows' },
        ],
    },
    {
        id: 4,
        section_key: 'collections',
        type: 'product_collection',
        title: { en: 'Popular picks' },
        subtitle: { en: 'A lively storefront that changes with campaigns' },
        items: [
            { title_en: 'Wireless Headphones', subtitle_en: '৳1,450', image_url: '/assets/images/product-headphones.jpg' },
            { title_en: 'Smart Watch', subtitle_en: '৳3,990', image_url: '/assets/images/product-watch.jpg' },
            { title_en: 'Everyday Shoes', subtitle_en: '৳2,450', image_url: '/assets/images/product-shoes.jpg' },
            { title_en: 'Creator Camera', subtitle_en: '৳24,500', image_url: '/assets/images/product-camera.jpg' },
            { title_en: 'Office Laptop', subtitle_en: '৳58,000', image_url: '/assets/images/product-laptop.jpg' },
            { title_en: 'Gift Bundle', subtitle_en: '৳890', image_url: '/assets/images/shopping-bag.png' },
        ],
    },
    {
        id: 5,
        section_key: 'featured-stores',
        type: 'featured_stores',
        eyebrow: { en: 'Seller spotlight' },
        title: { en: 'Stores worth discovering' },
        subtitle: { en: 'A marketplace feel with real local seller presence.' },
        items: [
            { title_en: 'Style House BD', subtitle_en: 'Fashion seller · Dhaka' },
            { title_en: 'Daily Basket', subtitle_en: 'Grocery and home needs' },
            { title_en: 'Tech Corner', subtitle_en: 'Gadgets and accessories' },
        ],
    },
];

const badgeItems = [
    { title: 'Fresh deals', text: 'Campaigns and offers ready for local shoppers', icon: Sparkles, tone: 'text-[#d94f2b] bg-[#fff0eb]' },
    { title: 'Verified sellers', text: 'Storefronts connected to AndgatePOS workflows', icon: BadgeCheck, tone: 'text-[#006b5f] bg-[#e7f6f2]' },
    { title: 'Local shops', text: 'Discover products from nearby Bangladesh businesses', icon: Store, tone: 'text-[#335c99] bg-[#edf4ff]' },
    { title: 'Fast checkout', text: 'Designed for simple COD and payment journeys', icon: Truck, tone: 'text-[#8a5a00] bg-[#fff7e6]' },
];

const heroStats = [
    { value: 'Local', label: 'seller network' },
    { value: 'COD', label: 'friendly checkout' },
    { value: 'Live', label: 'campaign updates' },
];

export default async function HawkeriHomePage() {
    const remoteSections = await getHomepageSections();
    const sections = remoteSections.length ? remoteSections : fallbackSections;
    const hero = sections.find((section) => section.type === 'hero') || fallbackSections[0];
    const rest = sections.filter((section) => section.id !== hero.id);

    return (
        <main className="min-h-screen bg-[#f5f7f6] text-slate-950">
            <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
                    <Link href="/hawkeri" className="flex items-center gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#006b5f] text-white shadow-sm">
                            <ShoppingBag className="h-5 w-5" />
                        </span>
                        <span>
                            <span className="block text-lg font-black leading-none tracking-tight">Hawkeri</span>
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#006b5f]">Local marketplace</span>
                        </span>
                    </Link>
                    <div className="order-3 flex h-11 w-full items-center rounded-lg border border-slate-200 bg-slate-50 px-4 md:order-none md:ml-auto md:min-w-[320px] md:max-w-lg md:flex-1">
                        <Search className="h-4 w-4 text-slate-400" />
                        <span className="ml-2 text-sm text-slate-400">Search grocery, fashion, electronics...</span>
                    </div>
                    <a href="#collections" className="ml-auto inline-flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white md:ml-0">
                        Shop <ChevronRight className="h-4 w-4" />
                    </a>
                </div>
            </header>

            <section className="relative overflow-hidden border-b border-slate-200 bg-white">
                <div className="mx-auto grid max-w-7xl gap-5 px-4 pb-8 pt-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_392px] lg:px-8 lg:py-8">
                    <HeroSection section={hero} />
                    <aside className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        {badgeItems.map((item) => (
                            <div key={item.title} className="flex min-h-[104px] items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <span className={`${item.tone} flex h-11 w-11 shrink-0 items-center justify-center rounded-lg`}>
                                    <item.icon className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-sm font-extrabold text-slate-950">{item.title}</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.text}</p>
                                </div>
                            </div>
                        ))}
                        <div className="rounded-lg border border-slate-200 bg-[#fff7e6] p-4 shadow-sm sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center gap-2 text-sm font-black text-[#8a5a00]">
                                <Zap className="h-4 w-4" />
                                Live from local stores
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600">Products, campaigns and seller showcases can update from platform admin without redesigning the page.</p>
                        </div>
                    </aside>
                </div>
            </section>

            <div id="collections" className="mx-auto max-w-7xl space-y-9 px-4 py-9 sm:px-6 lg:px-8">
                {rest.map((section) => (
                    <HomepageSectionRenderer key={section.section_key || section.id} section={section} />
                ))}
            </div>
        </main>
    );
}

function HeroSection({ section }: { section: HomepageSection }) {
    const img = imageUrl(section.mobile_image_url || section.image_url);

    return (
        <div className="relative min-h-[470px] overflow-hidden rounded-lg bg-slate-950 text-white shadow-xl shadow-slate-950/18">
            {img ? <img src={img} alt={text(section.title, 'Hawkeri')} className="absolute inset-0 h-full w-full object-cover" /> : null}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-900/60 to-[#006b5f]/10" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/90 to-transparent" />
            <div className="relative flex min-h-[470px] flex-col justify-end p-6 sm:p-8 lg:p-10">
                <div className="mb-auto flex flex-wrap gap-2">
                    <span className="rounded-lg border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">{text(section.eyebrow, 'Hawkeri picks')}</span>
                    <span className="rounded-lg border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">Bangladesh local stores</span>
                </div>
                <h1 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">{text(section.title, 'Shop local. Remember the experience.')}</h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-white/82 sm:text-lg">{text(section.subtitle, 'A vivid marketplace homepage controlled from platform admin.')}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a href={ctaHref(section)} className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-black text-[#006b5f]">
                        {section.cta?.label_en || 'Explore deals'} <ArrowRight className="h-4 w-4" />
                    </a>
                    <span className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-3 text-sm font-bold text-white/85">
                        <ShieldCheck className="h-4 w-4" /> Verified sellers
                    </span>
                </div>
                <div className="mt-7 grid max-w-2xl grid-cols-3 gap-2">
                    {heroStats.map((stat) => (
                        <div key={stat.label} className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur">
                            <p className="text-lg font-black leading-none">{stat.value}</p>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/68">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function HomepageSectionRenderer({ section }: { section: HomepageSection }) {
    if (section.type === 'promo_tiles') return <PromoTiles section={section} />;
    if (section.type === 'trust_strip') return <TrustStrip section={section} />;
    if (section.type === 'featured_stores') return <FeaturedStores section={section} />;
    if (section.type === 'category_campaign' || section.type === 'custom_banner') return <CampaignBanner section={section} />;
    return <ProductCollection section={section} />;
}

function SectionHeading({ section, inverse = false }: { section: HomepageSection; inverse?: boolean }) {
    return (
        <div className="mb-4 flex items-end justify-between gap-4">
            <div>
                {text(section.eyebrow) ? <p className={inverse ? 'text-xs font-black uppercase tracking-wide text-emerald-100' : 'text-xs font-black uppercase tracking-wide text-[#006b5f]'}>{text(section.eyebrow)}</p> : null}
                <h2 className={inverse ? 'mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl' : 'mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl'}>{text(section.title, 'Featured section')}</h2>
                {text(section.subtitle) ? <p className={inverse ? 'mt-1 max-w-2xl text-sm leading-6 text-white/72' : 'mt-1 max-w-2xl text-sm leading-6 text-slate-500'}>{text(section.subtitle)}</p> : null}
            </div>
            {section.cta?.label_en ? (
                <a href={ctaHref(section)} className={inverse ? 'hidden rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white sm:inline-flex' : 'hidden rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 sm:inline-flex'}>
                    {section.cta.label_en}
                </a>
            ) : null}
        </div>
    );
}

function PromoTiles({ section }: { section: HomepageSection }) {
    const items = section.items?.length ? section.items : fallbackSections[1].items || [];

    return (
        <section>
            <SectionHeading section={section} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {items.slice(0, 6).map((item, index) => (
                    <a key={`${itemTitle(item, String(index))}`} href={item.url || '#collections'} className="group relative min-h-[190px] overflow-hidden rounded-lg bg-slate-900 p-5 text-white shadow-sm">
                        {imageUrl(item.image_url) ? <img src={imageUrl(item.image_url)} alt={itemTitle(item, 'Promo')} className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-300 group-hover:scale-105" /> : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                        <div className="relative flex h-full min-h-[140px] flex-col justify-end">
                            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/16 backdrop-blur">
                                <PackageCheck className="h-4 w-4" />
                            </span>
                            <p className="text-lg font-black">{itemTitle(item, 'Promo tile')}</p>
                            <p className="mt-1 text-sm text-white/78">{itemSubtitle(item, 'Shop now')}</p>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}

function ProductCollection({ section }: { section: HomepageSection }) {
    const items = section.items?.length ? section.items : fallbackSections[3].items || [];

    return (
        <section>
            <SectionHeading section={section} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                {items.slice(0, 12).map((item, index) => (
                    <article key={`${itemTitle(item, String(index))}`} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                        <div className="relative aspect-square bg-[#eaf3f6]">
                            {imageUrl(item.image_url) ? <img src={imageUrl(item.image_url)} alt={itemTitle(item, 'Product')} className="h-full w-full object-cover" /> : null}
                            <span className="absolute left-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-black text-[#006b5f] shadow-sm">New</span>
                            <button aria-label="Save product" className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-600 shadow-sm">
                                <Heart className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-3">
                            <p className="line-clamp-2 min-h-[40px] text-sm font-extrabold text-slate-900">{itemTitle(item, 'Hawkeri product')}</p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                                <span className="text-sm font-black text-emerald-700">{itemPrice(item)}</span>
                                <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                                    <Star className="h-3 w-3 fill-current" /> 4.{(index % 8) + 1}
                                </span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

function TrustStrip({ section }: { section: HomepageSection }) {
    const items = section.items?.length ? section.items : fallbackSections[2].items || [];
    const icons = [BadgeCheck, Truck, Clock3, MapPin];

    return (
        <section className="rounded-lg border border-[#004c44]/10 bg-[#006b5f] p-5 text-white shadow-sm sm:p-6">
            <SectionHeading inverse section={{ ...section, title: section.title || { en: 'Shop with confidence' } }} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {items.slice(0, 4).map((item, index) => {
                    const Icon = icons[index % icons.length];
                    return (
                        <div key={`${itemTitle(item, String(index))}`} className="min-h-[142px] rounded-lg bg-white/10 p-4">
                            <Icon className="h-5 w-5 text-emerald-200" />
                            <p className="mt-3 font-black">{itemTitle(item, 'Trust point')}</p>
                            <p className="mt-1 text-sm leading-6 text-white/72">{itemSubtitle(item, 'Built for local commerce.')}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function FeaturedStores({ section }: { section: HomepageSection }) {
    const items = section.items?.length ? section.items : [
        { title_en: 'Verified fashion seller', subtitle_en: 'Dhaka' },
        { title_en: 'Daily grocery shop', subtitle_en: 'Local essentials' },
        { title_en: 'Electronics corner', subtitle_en: 'Gadgets and accessories' },
    ];

    return (
        <section>
            <SectionHeading section={section} />
            <div className="grid gap-3 sm:grid-cols-3">
                {items.slice(0, 6).map((item, index) => (
                    <div key={`${itemTitle(item, String(index))}`} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#fff7e6] text-[#8a5a00]">
                                <Store className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-slate-950">{itemTitle(item, 'Hawkeri store')}</p>
                                <p className="text-sm text-slate-500">{itemSubtitle(item, 'Verified seller')}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function CampaignBanner({ section }: { section: HomepageSection }) {
    const img = imageUrl(section.mobile_image_url || section.image_url);

    return (
        <section className="relative overflow-hidden rounded-lg border border-slate-200 bg-[#fff7e6] p-6 sm:p-8">
            {img ? <img src={img} alt={text(section.title, 'Campaign')} className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-90 md:block" /> : null}
            {img ? <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-r from-[#fff7e6] via-[#fff7e6]/55 to-transparent md:block" /> : null}
            <div className="relative max-w-xl">
                {text(section.eyebrow) ? <p className="text-xs font-black uppercase tracking-wide text-[#006b5f]">{text(section.eyebrow)}</p> : null}
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{text(section.title, 'Seasonal campaign')}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text(section.subtitle, 'Curated products from local sellers.')}</p>
                <a href={ctaHref(section)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white">
                    {section.cta?.label_en || 'View collection'} <ArrowRight className="h-4 w-4" />
                </a>
            </div>
        </section>
    );
}
