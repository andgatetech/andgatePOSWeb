export async function detectUserLanguage() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();

        if (data.country_code === 'BD') {
            return 'bn';
        } else {
            return 'en';
        }
    } catch (err) {
        // fallback — যদি API কাজ না করে
        const browserLang = navigator.language.startsWith('bn') ? 'bn' : 'en';
        return browserLang;
    }
}
