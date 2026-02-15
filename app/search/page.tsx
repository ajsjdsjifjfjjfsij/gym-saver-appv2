import { headers } from "next/headers";
import SearchClient from "./SearchClient";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search Gyms | GymSaver',
    description: 'Find and compare gym prices near you. Filter by price, location, and facilities.',
    alternates: {
        canonical: 'https://www.gymsaverapp.com/search',
    },
};

export default async function SearchPage() {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent")?.toLowerCase() || "";

    // Search engine detection on the server
    const searchEngines = ["googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider", "yandexbot", "crawler"];
    const isSearchEngine = searchEngines.some(bot => userAgent.includes(bot));

    // If it's a search engine, provide London coordinates to prevent soft 404 (thin content)
    const initialBotLocation = isSearchEngine ? { lat: 51.5074, lng: -0.1278 } : null;

    return <SearchClient initialBotLocation={initialBotLocation} />;
}
