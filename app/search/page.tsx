import { headers } from "next/headers";
import SearchClient from "./SearchClient";

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
