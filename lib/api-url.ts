const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const withLeadingSlash = (value: string) => value.startsWith('/') ? value : `/${value}`;

export function apiBaseUrl(): string {
    const host = trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL || '');
    const prefix = withLeadingSlash(process.env.NEXT_PUBLIC_API_PREFIX || '/api');

    return `${host}${prefix}`;
}
