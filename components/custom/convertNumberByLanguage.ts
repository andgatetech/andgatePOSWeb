const engToBn: Record<string, string> = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
};

const bnToEng: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
};
export function convertNumberByLanguage(input: string | number): string {
    const val = String(input);

    const lang =
        document?.cookie
            ?.split('; ')
            ?.find((x) => x.startsWith('i18nextLng='))
            ?.split('=')?.[1] || 'en';

    if (lang === 'bn') {
        // English → Bangla
        return val.replace(/[0-9]/g, (d) => engToBn[d]);
    }

    if (lang === 'en') {
        // Bangla → English
        return val.replace(/[০-৯]/g, (d) => bnToEng[d]);
    }

    return val;
}
