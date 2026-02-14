import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export interface GymPrice {
    monthlyPrice?: number;
    joiningfees?: number;
    lastUpdated: number;
    latestOffer?: string; // Added for offers
    prices?: {
        name: string;
        price: number;
        description?: string;
    }[];
    // Fields from Firestore gym document
    name?: string;
    location?: string;
    place_id?: string;
}

export type GymPricesMap = Record<string, GymPrice>;

export function useGymPrices(skip: boolean = false) {
    const [prices, setPrices] = useState<GymPricesMap>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!auth?.currentUser);

    useEffect(() => {
        if (!auth) return;
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        // PERF FIX: We no longer fetch ALL gym prices globally.
        // This was causing a massive download of the entire 'gyms' collection (~2MB+)
        // on every page load, slowing down the initial render of the search results.
        // We now rely on the 'fetchGyms' API call which gets the gym data (including prices) directly.
        setLoading(false);
    }, []);

    return { prices, loading, error };
}
