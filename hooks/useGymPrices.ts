import { useState, useEffect } from 'react';
import { rtdb } from '@/lib/firebase';
import { useAuth } from '@/components/auth/AuthContext';
import { ref, onValue, off } from 'firebase/database';

export interface GymPrice {
    monthlyPrice?: number; // Kept for backward compatibility if needed, but likely undefined
    joiningfees?: number;  // Matches Swift app's lowercase key
    lastUpdated: number;
    prices?: {
        name: string;
        price: number;
        description?: string;
    }[];
}

export type GymPricesMap = Record<string, GymPrice>;

export function useGymPrices() {
    const [prices, setPrices] = useState<GymPricesMap>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();

    useEffect(() => {
        if (!rtdb) {
            setLoading(false);
            return;
        }

        // Firebase rules now allow public read for gym_prices, so fetch for all users
        setLoading(true);
        const pricesRef = ref(rtdb, 'gym_prices');

        // Set up real-time listener
        onValue(pricesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setPrices(data);
                setError(null);
            } else {
                setPrices({});
            }
            setLoading(false);
        }, (err) => {
            // Suppress permission_denied errors gracefully
            if (err.message.includes("permission_denied")) {
                console.log("Firebase RTDB: Permission denied. Prices will not be available.");
                setPrices({});
                setError(null); // Do not set error state
            } else {
                console.error("Error fetching gym prices from RTDB:", err);
                setError(err.message);
            }
            setLoading(false);
        });

        // Cleanup listener on unmount
        return () => {
            off(pricesRef);
        };
    }, []);

    return { prices, loading, error };
}
