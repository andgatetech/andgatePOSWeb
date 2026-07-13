export type AttributionPayload = {
    source: string;
    campaign: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
    utm_term: string;
    fbclid: string;
    fbp: string;
    fbc: string;
    landing_page: string;
    referrer: string;
    initial_path: string;
    latest_path: string;
};

type SearchParamsReader = {
    get(name: string): string | null;
};

const FIRST_TOUCH_KEY = 'andgatebos:first_touch_attribution';
const LAST_TOUCH_KEY = 'andgatebos:last_touch_attribution';

export function buildAttribution(searchParams: SearchParamsReader, defaults: { source: string; campaign: string }): AttributionPayload {
    const storedFirstTouch = readStoredAttribution(FIRST_TOUCH_KEY);
    const storedLastTouch = readStoredAttribution(LAST_TOUCH_KEY);
    const urlAttribution = readUrlAttribution(searchParams, defaults);
    const hasUrlAttribution = Boolean(
        urlAttribution.utm_source ||
        urlAttribution.utm_medium ||
        urlAttribution.utm_campaign ||
        urlAttribution.utm_content ||
        urlAttribution.utm_term ||
        urlAttribution.fbclid ||
        searchParams.get('campaign') ||
        searchParams.get('source')
    );

    if (typeof window !== 'undefined' && hasUrlAttribution) {
        const enriched = withLandingPage(urlAttribution);
        if (!storedFirstTouch) {
            writeStoredAttribution(FIRST_TOUCH_KEY, enriched);
        }
        writeStoredAttribution(LAST_TOUCH_KEY, enriched);
    }

    const storedAttribution = storedFirstTouch ?? storedLastTouch;

    return {
        ...urlAttribution,
        ...(storedAttribution ?? {}),
        ...(hasUrlAttribution ? withoutEmpty(urlAttribution) : {}),
        source: hasUrlAttribution ? urlAttribution.source : storedAttribution?.source || defaults.source,
        campaign: hasUrlAttribution ? urlAttribution.campaign : storedAttribution?.campaign || defaults.campaign,
        landing_page: storedFirstTouch?.landing_page || storedAttribution?.landing_page || currentLandingPage(),
        latest_path: urlAttribution.latest_path,
        fbp: urlAttribution.fbp || storedAttribution?.fbp || '',
        fbc: urlAttribution.fbc || storedAttribution?.fbc || '',
    };
}

function readUrlAttribution(searchParams: SearchParamsReader, defaults: { source: string; campaign: string }): AttributionPayload {
    const utmSource = searchParams.get('utm_source') || '';
    const utmMedium = searchParams.get('utm_medium') || '';
    const utmCampaign = searchParams.get('utm_campaign') || '';
    const utmContent = searchParams.get('utm_content') || '';
    const utmTerm = searchParams.get('utm_term') || '';
    const fbclid = searchParams.get('fbclid') || '';
    const campaign = searchParams.get('campaign') || utmCampaign || defaults.campaign;

    return {
        source: searchParams.get('source') || defaults.source,
        campaign,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_term: utmTerm,
        fbclid,
        fbp: readCookie('_fbp'),
        fbc: readCookie('_fbc') || buildFbcFromClickId(fbclid),
        landing_page: currentLandingPage(),
        referrer: typeof document === 'undefined' ? '' : document.referrer,
        initial_path: typeof window === 'undefined' ? '' : window.location.pathname,
        latest_path: typeof window === 'undefined' ? '' : window.location.pathname,
    };
}

function currentLandingPage() {
    return typeof window === 'undefined' ? '' : window.location.href;
}

function withLandingPage(payload: AttributionPayload): AttributionPayload {
    return {
        ...payload,
        landing_page: payload.landing_page || currentLandingPage(),
    };
}

function withoutEmpty(payload: AttributionPayload): Partial<AttributionPayload> {
    return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== '')) as Partial<AttributionPayload>;
}

function readStoredAttribution(key: string): AttributionPayload | null {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as AttributionPayload;
    } catch {
        return null;
    }
}

function writeStoredAttribution(key: string, payload: AttributionPayload): void {
    try {
        window.localStorage.setItem(key, JSON.stringify(payload));
    } catch {
        // Attribution is useful, but registration must not depend on storage access.
    }
}

function readCookie(name: string) {
    if (typeof document === 'undefined') return '';

    return document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${name}=`))
        ?.split('=')
        .slice(1)
        .join('=') || '';
}

function buildFbcFromClickId(fbclid: string) {
    if (!fbclid) return '';
    return `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}`;
}
