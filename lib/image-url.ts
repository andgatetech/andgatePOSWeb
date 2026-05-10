const storageBaseUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/?storage\/?$/, '') ||
    ''
).replace(/\/+$/, '');

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

    const normalizedPath = rawUrl.replace(/^\/+/, '');
    const storagePath = normalizedPath.startsWith('storage/') ? `/${normalizedPath}` : `/storage/${normalizedPath}`;

    if (!storageBaseUrl) {
        return storagePath;
    }

    return `${storageBaseUrl}${storagePath}`;
};

export const resolveProductImageUrl = (image: any): string => {
    const source =
        typeof image === 'string'
            ? image
            : image?.url || image?.path || image?.dataURL || image?.data_url || image?.image_url || image?.image || image?.product_image;

    return resolveStorageUrl(source);
};

export const getProductImages = (product: any): any[] => {
    if (!product) {
        return [];
    }

    const images: any[] = [];

    if (Array.isArray(product.images)) {
        images.push(...product.images);
    }

    if (product.image) {
        images.push(product.image);
    }

    if (product.product_image) {
        images.push(product.product_image);
    }

    if (Array.isArray(product.stocks)) {
        product.stocks.forEach((stock: any) => {
            if (Array.isArray(stock?.images)) {
                images.push(...stock.images);
            }
        });
    }

    return images.filter((image) => Boolean(resolveProductImageUrl(image)));
};

export const getPrimaryProductImageUrl = (product: any): string => {
    const [primaryImage] = getProductImages(product);
    return resolveProductImageUrl(primaryImage);
};
