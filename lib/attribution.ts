export type AttributionPayload = {
    source: string;
    campaign: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    fbclid: string;
    landing_page: string;
};

type SearchParamsReader = {
    get(name: string): string | null;
};

export function buildAttribution(searchParams: SearchParamsReader, defaults: { source: string; campaign: string }): AttributionPayload {
    const utmSource = searchParams.get('utm_source') || '';
    const utmMedium = searchParams.get('utm_medium') || '';
    const utmCampaign = searchParams.get('utm_campaign') || '';
    const fbclid = searchParams.get('fbclid') || '';
    const campaign = searchParams.get('campaign') || utmCampaign || defaults.campaign;

    return {
        source: utmSource || defaults.source,
        campaign,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        fbclid,
        landing_page: typeof window === 'undefined' ? '' : window.location.href,
    };
}
