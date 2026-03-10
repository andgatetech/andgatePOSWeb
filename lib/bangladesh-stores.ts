// ─────────────────────────────────────────────────────────────────────────────
// Bangladesh Store Location Data
// One record per Division → broken into major cities / districts
// ─────────────────────────────────────────────────────────────────────────────

export type StoreTier = 'flagship' | 'standard' | 'express';

export interface StoreLocation {
    id: string;
    name: string; // City / area name
    division: string; // Division it belongs to
    lat: number;
    lng: number;
    storeCount: number; // Number of POS stores active in this area
    tier: StoreTier;
    phone?: string;
    address?: string;
}

export interface Division {
    id: string;
    name: string;
    lat: number; // Division centroid
    lng: number;
    color: string; // Hex for choropleth / marker tint
    totalStores: number; // Sum of storeCount in division
}

// ─── Divisions ────────────────────────────────────────────────────────────────
export const BANGLADESH_DIVISIONS: Division[] = [
    { id: 'dhaka', name: 'Dhaka', lat: 23.8103, lng: 90.4125, color: '#3B82F6', totalStores: 48 },
    { id: 'chittagong', name: 'Chittagong', lat: 22.3569, lng: 91.7832, color: '#10B981', totalStores: 29 },
    { id: 'rajshahi', name: 'Rajshahi', lat: 24.3745, lng: 88.6042, color: '#F59E0B', totalStores: 18 },
    { id: 'khulna', name: 'Khulna', lat: 22.8456, lng: 89.5403, color: '#8B5CF6', totalStores: 15 },
    { id: 'barishal', name: 'Barishal', lat: 22.701, lng: 90.3535, color: '#EF4444', totalStores: 10 },
    { id: 'sylhet', name: 'Sylhet', lat: 24.8949, lng: 91.8687, color: '#06B6D4', totalStores: 14 },
    { id: 'rangpur', name: 'Rangpur', lat: 25.7439, lng: 89.2752, color: '#F97316', totalStores: 12 },
    { id: 'mymensingh', name: 'Mymensingh', lat: 24.7471, lng: 90.4203, color: '#EC4899', totalStores: 11 },
];

// ─── Individual store locations ───────────────────────────────────────────────
export const STORE_LOCATIONS: StoreLocation[] = [
    // ── Dhaka Division ──
    {
        id: 'dhaka-motijheel',
        name: 'Motijheel',
        division: 'Dhaka',
        lat: 23.733,
        lng: 90.4167,
        storeCount: 12,
        tier: 'flagship',
        phone: '+880-2-9551234',
        address: 'Dilkusha Commercial Area, Motijheel, Dhaka-1000',
    },
    {
        id: 'dhaka-gulshan',
        name: 'Gulshan',
        division: 'Dhaka',
        lat: 23.7806,
        lng: 90.4193,
        storeCount: 8,
        tier: 'flagship',
        phone: '+880-2-9884512',
        address: 'Gulshan Avenue, Gulshan-2, Dhaka-1212',
    },
    {
        id: 'dhaka-uttara',
        name: 'Uttara',
        division: 'Dhaka',
        lat: 23.8759,
        lng: 90.3795,
        storeCount: 6,
        tier: 'standard',
        phone: '+880-2-8900234',
        address: 'Sector-7, Uttara, Dhaka-1230',
    },
    {
        id: 'dhaka-dhanmondi',
        name: 'Dhanmondi',
        division: 'Dhaka',
        lat: 23.7461,
        lng: 90.3742,
        storeCount: 7,
        tier: 'standard',
        phone: '+880-2-9121345',
        address: 'Road-27, Dhanmondi, Dhaka-1209',
    },
    {
        id: 'narayanganj',
        name: 'Narayanganj',
        division: 'Dhaka',
        lat: 23.6238,
        lng: 90.4996,
        storeCount: 5,
        tier: 'standard',
        address: 'Bangabandhu Road, Narayanganj-1400',
    },
    {
        id: 'gazipur',
        name: 'Gazipur',
        division: 'Dhaka',
        lat: 23.9999,
        lng: 90.4203,
        storeCount: 5,
        tier: 'standard',
        address: 'Gazipur Chowrasta, Gazipur-1700',
    },
    {
        id: 'manikganj',
        name: 'Manikganj',
        division: 'Dhaka',
        lat: 23.8634,
        lng: 90.0051,
        storeCount: 3,
        tier: 'express',
        address: 'Manikganj Sadar, Manikganj-1800',
    },
    {
        id: 'munshiganj',
        name: 'Munshiganj',
        division: 'Dhaka',
        lat: 23.5422,
        lng: 90.5303,
        storeCount: 2,
        tier: 'express',
        address: 'Munshiganj Sadar, Munshiganj-1500',
    },

    // ── Chittagong Division ──
    {
        id: 'ctg-agrabad',
        name: 'Agrabad',
        division: 'Chittagong',
        lat: 22.3282,
        lng: 91.8224,
        storeCount: 10,
        tier: 'flagship',
        phone: '+880-31-712345',
        address: 'Agrabad Commercial Area, Chittagong-4100',
    },
    {
        id: 'ctg-nasirabad',
        name: 'Nasirabad',
        division: 'Chittagong',
        lat: 22.354,
        lng: 91.796,
        storeCount: 6,
        tier: 'standard',
        address: 'Nasirabad H/E, Chittagong-4200',
    },
    {
        id: 'cox-bazar',
        name: "Cox's Bazar",
        division: 'Chittagong',
        lat: 21.4272,
        lng: 92.0058,
        storeCount: 4,
        tier: 'standard',
        phone: '+880-341-56789',
        address: "Main Road, Cox's Bazar-4700",
    },
    {
        id: 'comilla',
        name: 'Comilla',
        division: 'Chittagong',
        lat: 23.4607,
        lng: 91.1809,
        storeCount: 5,
        tier: 'standard',
        address: 'Comilla Sadar, Comilla-3500',
    },
    {
        id: 'brahmanbaria',
        name: 'Brahmanbaria',
        division: 'Chittagong',
        lat: 23.957,
        lng: 91.1119,
        storeCount: 4,
        tier: 'express',
        address: 'Brahmanbaria Sadar, Brahmanbaria-3400',
    },

    // ── Rajshahi Division ──
    {
        id: 'rajshahi-city',
        name: 'Rajshahi City',
        division: 'Rajshahi',
        lat: 24.3745,
        lng: 88.6042,
        storeCount: 8,
        tier: 'flagship',
        phone: '+880-721-775543',
        address: 'Saheb Bazar, Rajshahi-6000',
    },
    {
        id: 'bogura',
        name: 'Bogura',
        division: 'Rajshahi',
        lat: 24.8465,
        lng: 89.372,
        storeCount: 5,
        tier: 'standard',
        address: 'Satmatha, Bogura-5800',
    },
    {
        id: 'naogaon',
        name: 'Naogaon',
        division: 'Rajshahi',
        lat: 24.7936,
        lng: 88.9314,
        storeCount: 3,
        tier: 'express',
        address: 'Naogaon Sadar, Naogaon-6500',
    },
    {
        id: 'chapai-nbganj',
        name: 'Chapai Nawabganj',
        division: 'Rajshahi',
        lat: 24.5975,
        lng: 88.2748,
        storeCount: 2,
        tier: 'express',
        address: 'Chapai Nawabganj Sadar-6300',
    },

    // ── Khulna Division ──
    {
        id: 'khulna-city',
        name: 'Khulna City',
        division: 'Khulna',
        lat: 22.8456,
        lng: 89.5403,
        storeCount: 7,
        tier: 'flagship',
        phone: '+880-41-724123',
        address: 'KDA Avenue, Khulna-9100',
    },
    {
        id: 'jessore',
        name: 'Jessore',
        division: 'Khulna',
        lat: 23.1664,
        lng: 89.2082,
        storeCount: 5,
        tier: 'standard',
        address: 'Jessore Sadar, Jessore-7400',
    },
    {
        id: 'satkhira',
        name: 'Satkhira',
        division: 'Khulna',
        lat: 22.7185,
        lng: 89.0705,
        storeCount: 3,
        tier: 'express',
        address: 'Satkhira Sadar-9400',
    },

    // ── Sylhet Division ──
    {
        id: 'sylhet-city',
        name: 'Sylhet City',
        division: 'Sylhet',
        lat: 24.8898,
        lng: 91.8677,
        storeCount: 7,
        tier: 'flagship',
        phone: '+880-821-715432',
        address: 'Zindabazar, Sylhet-3100',
    },
    {
        id: 'moulvibazar',
        name: 'Moulvibazar',
        division: 'Sylhet',
        lat: 24.4826,
        lng: 91.7774,
        storeCount: 4,
        tier: 'standard',
        address: 'Moulvibazar Sadar-3200',
    },
    {
        id: 'habiganj',
        name: 'Habiganj',
        division: 'Sylhet',
        lat: 24.3745,
        lng: 91.4156,
        storeCount: 3,
        tier: 'express',
        address: 'Habiganj Sadar-3300',
    },

    // ── Rangpur Division ──
    {
        id: 'rangpur-city',
        name: 'Rangpur City',
        division: 'Rangpur',
        lat: 25.7439,
        lng: 89.2752,
        storeCount: 6,
        tier: 'flagship',
        phone: '+880-521-65123',
        address: 'Station Road, Rangpur-5400',
    },
    {
        id: 'dinajpur',
        name: 'Dinajpur',
        division: 'Rangpur',
        lat: 25.6279,
        lng: 88.6338,
        storeCount: 4,
        tier: 'standard',
        address: 'Dinajpur Sadar-5200',
    },
    {
        id: 'gaibandha',
        name: 'Gaibandha',
        division: 'Rangpur',
        lat: 25.3283,
        lng: 89.5284,
        storeCount: 2,
        tier: 'express',
        address: 'Gaibandha Sadar-5700',
    },

    // ── Barishal Division ──
    {
        id: 'barishal-city',
        name: 'Barishal City',
        division: 'Barishal',
        lat: 22.701,
        lng: 90.3535,
        storeCount: 6,
        tier: 'flagship',
        phone: '+880-431-64123',
        address: 'Sadar Road, Barishal-8200',
    },
    {
        id: 'bhola',
        name: 'Bhola',
        division: 'Barishal',
        lat: 22.686,
        lng: 90.6481,
        storeCount: 2,
        tier: 'express',
        address: 'Bhola Sadar-8300',
    },
    {
        id: 'patuakhali',
        name: 'Patuakhali',
        division: 'Barishal',
        lat: 22.3596,
        lng: 90.3298,
        storeCount: 2,
        tier: 'express',
        address: 'Patuakhali Sadar-8600',
    },

    // ── Mymensingh Division ──
    {
        id: 'mymensingh-city',
        name: 'Mymensingh City',
        division: 'Mymensingh',
        lat: 24.7471,
        lng: 90.4203,
        storeCount: 6,
        tier: 'flagship',
        phone: '+880-91-67123',
        address: 'Ganginar Par, Mymensingh-2200',
    },
    {
        id: 'netrokona',
        name: 'Netrokona',
        division: 'Mymensingh',
        lat: 24.8703,
        lng: 90.7278,
        storeCount: 3,
        tier: 'standard',
        address: 'Netrokona Sadar-2400',
    },
    {
        id: 'kishoreganj',
        name: 'Kishoreganj',
        division: 'Mymensingh',
        lat: 24.4448,
        lng: 90.7768,
        storeCount: 2,
        tier: 'express',
        address: 'Kishoreganj Sadar-2300',
    },
];

// ─── Helper: get color for a tier ────────────────────────────────────────────
export const TIER_CONFIG: Record<StoreTier, { color: string; label: string; size: number }> = {
    flagship: { color: '#3B82F6', label: 'Flagship Hub', size: 32 },
    standard: { color: '#10B981', label: 'Standard Store', size: 24 },
    express: { color: '#F59E0B', label: 'Express Point', size: 18 },
};

export const TOTAL_STORES = STORE_LOCATIONS.reduce((sum, s) => sum + s.storeCount, 0);
export const TOTAL_DIVISIONS = BANGLADESH_DIVISIONS.length;
export const TOTAL_CITIES = STORE_LOCATIONS.length;
