export const normalizeSupplierList = (payload: unknown): any[] => {
    if (Array.isArray(payload)) return payload;

    if (payload && typeof payload === 'object') {
        const items = (payload as { items?: unknown }).items;
        if (Array.isArray(items)) return items;

        const data = (payload as { data?: unknown }).data;
        if (Array.isArray(data)) return data;
    }

    return [];
};
