import { GymPrice } from "@/hooks/useGymPrices";

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
    facilities?: any; // For backward compatibility with compare/saved pages
    detailedPricing?: any; // For backward compatibility
}

export const FACILITIES = [
    { key: "pool", label: "Pool", icon: "🏊" },
    { key: "sauna", label: "Sauna/Steam", icon: "🧖" },
    { key: "24hr", label: "24/7 Access", icon: "🕒" },
    { key: "classes", label: "Classes", icon: "🧘" },
    { key: "parking", label: "Free Parking", icon: "🚗" },
    { key: "weights", label: "Free Weights", icon: "🏋" },
];

export function getGymFacilities(gym: Gym) {
    const name = gym.name.toLowerCase();

    return {
        pool: name.includes("spa") || name.includes("hotel") || name.includes("david lloyd") || name.includes("bannatyne") || name.includes("virgin active") || name.includes("nuffield"),
        sauna: name.includes("spa") || name.includes("hotel") || name.includes("bannatyne") || name.includes("nuffield") || name.includes("david lloyd") || name.includes("virgin active"),
        "24hr": name.includes("puregym") || name.includes("anytime") || name.includes("the gym") || name.includes("snap fitness") || name.includes("jd gyms"),
        classes: true, // Most gyms have classes
        parking: !name.includes("city") && !name.includes("central"),
        weights: true, // All gyms have weights
    };
}

export function getGymPrice(gym: Gym, livePrice?: GymPrice) {
    const name = gym.name.toLowerCase();

    // 1. Live Price (Highest Priority)
    if (livePrice?.prices && livePrice.prices.length > 0) {
        return {
            monthly: Math.min(...livePrice.prices.map(p => p.price)),
            joiningFee: livePrice.joiningfees,
            isEstimate: false
        };
    }

    if (livePrice?.monthlyPrice) {
        return {
            monthly: livePrice.monthlyPrice,
            joiningFee: livePrice.joiningfees,
            isEstimate: false
        };
    }

    // 2. Specific Hardcoded Chains (Fallback if no live data)
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
    if (name.includes("anytime fitness")) {
        return { monthly: 39.00, joiningFee: 0, isEstimate: true };
    }
    if (name.includes("snap fitness")) {
        return { monthly: 34.99, joiningFee: 0, isEstimate: true };
    }
    if (name.includes("jd gyms")) {
        return { monthly: 21.99, joiningFee: 0, isEstimate: true };
    }
    if (name.includes("the gym group") || name.includes("the gym")) {
        return { monthly: 19.99, joiningFee: 10, isEstimate: true };
    }
    if (name.includes("puregym")) {
        return { monthly: 20.99, joiningFee: 15, isEstimate: true };
    }
    if (name.includes("easygym")) {
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
