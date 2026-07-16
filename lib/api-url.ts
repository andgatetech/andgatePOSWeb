const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const withLeadingSlash = (value: string) => value.startsWith('/') ? value : `/${value}`;

export function apiBaseUrl(): string {
    const prefix = withLeadingSlash(process.env.NEXT_PUBLIC_API_PREFIX || '/api');

    if (process.env.NEXT_PUBLIC_API_PROXY_ENABLED !== 'false') {
        return prefix;
    }

    const host = trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL || '');
    return `${host}${prefix}`;
}
