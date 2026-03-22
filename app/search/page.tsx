import { headers } from "next/headers";
import SearchClient from "./SearchClient";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search & Compare Gyms Near Me | GymSaver (Gym Saver App)',
    description: 'Find gyms near you, compare membership prices, and discover exclusive deals. Filter by 24-hour access, swimming pools, day passes, and more with the Gym Saver app.',
    keywords: ['find a gym', 'gyms near me', 'compare gym memberships', 'gym database', 'fitness clubs UK', 'local gym deals', '24hr gym near me', 'cheap gyms near me', 'gym saver', 'gym saver app', 'gymsaver app'],
    alternates: {
        // Enforce strict canonical link to avoid indexing parameter URLs from interactive map
        canonical: 'https://www.gymsaverapp.com/search',
    },
};

export default async function SearchPage() {
    let userAgent = "";
    let isSearchEngine = false;

    if (!process.env.CAPACITOR_BUILD) {
        try {
            const headersList = await headers();
            userAgent = headersList.get("user-agent")?.toLowerCase() || "";
            // Search engine detection on the server
            const searchEngines = ["googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider", "yandexbot", "crawler"];
            isSearchEngine = searchEngines.some(bot => userAgent.includes(bot));
        } catch (e) {
            console.warn("Headers not available during static build/prerender.");
        }
    }

    // If it's a search engine, provide London coordinates to prevent soft 404 (thin content)
    const initialBotLocation = isSearchEngine ? { lat: 51.5074, lng: -0.1278 } : null;

    return <SearchClient initialBotLocation={initialBotLocation} />;
}
