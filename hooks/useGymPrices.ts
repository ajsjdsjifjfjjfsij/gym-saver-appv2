import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';

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

export function useGymPrices() {
    const [prices, setPrices] = useState<GymPricesMap>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }

        setLoading(true);
        // Subscribe to "gyms" collection in Firestore
        const unsubscribe = onSnapshot(collection(db, "gyms"), (snapshot) => {
            const newPrices: GymPricesMap = {};

            snapshot.forEach((doc) => {
                const data = doc.data();

                // Map Firestore fields to GymPrice interface
                // User requested:
                // name -> gym name
                // city -> location
                // memberships[0].price -> monthly price
                // offers -> current offer
                // place_id -> Google place id

                // Construct the price object
                let monthlyPrice = data.lowest_price;
                if (monthlyPrice === undefined && data.memberships && Array.isArray(data.memberships) && data.memberships.length > 0) {
                    monthlyPrice = Math.min(...data.memberships.map((m: any) => m.price));
                }

                const priceData: GymPrice = {
                    name: data.name,
                    location: data.city, // Map city to location
                    latestOffer: data.offers, // Map offers to latestOffer
                    monthlyPrice: monthlyPrice,
                    joiningfees: 0, // Default or map if available
                    lastUpdated: Date.now(), // Firestore doesn't always have this, use current time or data.updatedAt
                    place_id: data.place_id,
                    prices: data.memberships ? data.memberships.map((m: any) => ({
                        name: m.name || "Membership",
                        price: m.price || 0,
                        description: m.description
                    })) : []
                };

                // Use place_id as the key if available, otherwise doc.id
                const key = data.place_id || doc.id;
                newPrices[key] = priceData;
            });

            setPrices(newPrices);
            setLoading(false);
            setError(null);
        }, (err) => {
            console.error("Error fetching gym prices from Firestore:", err);
            setError(err.message);
            setLoading(false);
        });

        // Cleanup listener on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    return { prices, loading, error };
}
