export const unwrapApiData = <T = any>(response: any, namedKeys: string[] = []): T | null => {
    if (!response) return null;

    const candidates = [
        response?.data?.data,
        ...namedKeys.map((key) => response?.data?.[key]),
        response?.data,
        ...namedKeys.map((key) => response?.[key]),
        response,
    ];

    return (candidates.find((item) => item && typeof item === 'object' && !Array.isArray(item)) as T | undefined) ?? null;
};
