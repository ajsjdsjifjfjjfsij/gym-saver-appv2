export interface Gym {
    id: string;
    name: string;
    address: string;
    rating: number;
    type: string;
    priceLevel: string;
    lat: number;
    lng: number;
    distance?: number;
    photo_reference?: string;
    photos?: string[];
    website?: string;
    latestOffer?: string;
    lowest_price?: number;
    memberships?: any[];
    user_ratings_total?: number;
    googleMapsUri?: string;
    location?: {
        lat: number;
        lng: number;
        address?: string;
    };
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function getGymPrice(gym: Gym) {
    const name = gym.name.toLowerCase();

    // 1. Gym Object Price (from Firestore document directly)
    // IMPORTANT: Treat 0 as "missing" so we can use hardcoded fallbacks or show "coming soon"
    if (gym.lowest_price !== undefined && gym.lowest_price > 0) {
        return {
            monthly: gym.lowest_price,
            joiningFee: 0, // Fallback if not root
            isEstimate: false
        };
    }

    // 2. Specific Hardcoded Chains (Fallback if no data or price is 0)
    // Premium / High End
    if (name.includes("third space")) {
        return { monthly: 230.00, joiningFee: 100, isEstimate: true };
    }
    if (name.includes("equinox")) {
        return { monthly: 240.00, joiningFee: 200, isEstimate: true };
    }
    if (name.includes("david lloyd")) {
        return { monthly: 94.50, joiningFee: 0, isEstimate: true };
    }
    if (name.includes("virgin active")) {
        return { monthly: 99.00, joiningFee: 30, isEstimate: true };
    }
    if (name.includes("harbour club")) {
        return { monthly: 155.00, joiningFee: 100, isEstimate: true };
    }

    // Mid Range
    if (name.includes("nuffield health")) {
        return { monthly: 76.00, joiningFee: 20, isEstimate: true };
    }
    if (name.includes("fitness first")) {
        return { monthly: 49.00, joiningFee: 25, isEstimate: true };
    }
    if (name.includes("bannatyne")) {
        return { monthly: 44.99, joiningFee: 15, isEstimate: true };
    }
    if (name.includes("everlast")) {
        return { monthly: 35.00, joiningFee: 10, isEstimate: true };
    }

    // Budget / Value
    if (name.includes("anytime fitness") || name.includes("anytime")) {
        return { monthly: 39.00, joiningFee: 0, isEstimate: true };
    }
    if (name.includes("snap fitness") || name.includes("snap")) {
        return { monthly: 34.99, joiningFee: 0, isEstimate: true };
    }
    if (name.includes("jd gyms") || name.includes("jd gym")) {
        return { monthly: 21.99, joiningFee: 0, isEstimate: true };
    }
    if (name.includes("the gym group") || name.includes("the gym")) {
        return { monthly: 19.99, joiningFee: 10, isEstimate: true };
    }
    if (name.includes("puregym") || name.includes("pure gym")) {
        return { monthly: 20.99, joiningFee: 15, isEstimate: true };
    }
    if (name.includes("easygym") || name.includes("easy gym")) {
        return { monthly: 19.99, joiningFee: 0, isEstimate: true };
    }

    // 3. Generic Price Level Fallback (Lowest Priority) - REMOVED per user request
    // If no live price and no hardcoded chain match, return null to show "Prices coming soon"

    return {
        monthly: undefined, // undefined indicates "Prices coming soon"
        joiningFee: 0,
        isEstimate: true
    };
}
