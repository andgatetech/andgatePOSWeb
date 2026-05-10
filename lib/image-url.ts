const storageBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');

export const resolveStorageUrl = (value: unknown): string => {
    if (typeof value !== 'string') {
        return '';
    }

    const rawUrl = value.trim().replace(/\\/g, '/');
    if (!rawUrl) {
        return '';
    }

    if (/^(https?:)?\/\//.test(rawUrl) || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
        return rawUrl;
    }

    const pathWithLeadingSlash = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
    if (pathWithLeadingSlash.startsWith('/storage/')) {
        return `${storageBaseUrl}${pathWithLeadingSlash}`;
    }

    return `${storageBaseUrl}/storage${pathWithLeadingSlash}`;
};

export const resolveProductImageUrl = (image: any): string => resolveStorageUrl(image?.url || image?.path || image?.dataURL || image?.data_url || image?.image_url);
