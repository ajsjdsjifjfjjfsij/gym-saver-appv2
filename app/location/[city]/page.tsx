import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import SearchClient from '@/app/search/SearchClient';
import { UK_CITIES } from '@/lib/uk-cities';

// Dynamic SSG generation for top UK cities
export async function generateStaticParams() {
    // Top 200+ UK towns and cities for search volume coverage
    const cities = Array.from(new Set(UK_CITIES)); // Ensure uniqueness
    return cities.map(city => ({ city }));
}

interface LocationPageProps {
    params: Promise<{ city: string }>;
}

// Format the URL slug "manchester" back into "Manchester"
function formatCityName(slug: string | null | undefined): string {
    if (!slug) {
        console.warn("⚠️ Warning: Empty slug passed to formatCityName");
        return "Unknown City";
    }
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Generate highly targeted SEO metadata for each specific city page
export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
    const { city } = await params;
    const cityName = formatCityName(city);

    return {
        title: `Cheap Gyms in ${cityName} | Compare Gym Prices | GymSaver`,
        description: `Find the best and cheapest gym deals in ${cityName}. Compare prices for PureGym, The Gym Group, JD Gyms, and local fitness centers near you.`,
        keywords: [`gyms in ${cityName}`, `cheap gyms ${cityName}`, `compare gym prices ${cityName}`, `${cityName} fitness memberships`, `24 hour gyms ${cityName}`, `24hr gym near me`, `cheap gyms near me`],
        alternates: {
            canonical: `/location/${city.toLowerCase()}`,
        },
        openGraph: {
            title: `Best Gym Deals in ${cityName} | GymSaver`,
            description: `Compare prices for top gyms in ${cityName} and stop overpaying for memberships.`,
            url: `https://www.gymsaverapp.com/location/${city}`,
            siteName: 'GymSaver',
            images: [
                {
                    url: '/opengraph-image.png',
                    width: 1200,
                    height: 630,
                    alt: `Compare Gym Prices in ${cityName}`,
                },
            ],
            type: 'website',
        },
    };
}

export default async function LocationPage({ params }: LocationPageProps) {
    const { city } = await params;
    const cityName = formatCityName(city);

    // We pass the city name nicely to the search client to instantly fetch that city
    // In order to properly center the map, we need the coordinates for this city.
    // We will rely on the SearchClient's internal auto-geocoding for the visual map,
    // but we can server-render a strong H1 tag for the SEO bots.

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Best Gyms and Fitness Deals in ${cityName}`,
        "description": `Compare the cheapest gyms, 24-hour fitness centers, and day passes available in ${cityName}.`,
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "item": {
                    "@type": "LocalBusiness",
                    "name": `Gyms in ${cityName}`,
                    "url": `https://www.gymsaverapp.com/location/${city.toLowerCase()}`
                }
            }
        ]
    };

    return (
        <div className="flex flex-col min-h-screen bg-background relative z-0">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* SEO Hidden H1 - Read by bots, hidden from users visually because 
                SearchClient takes over the whole screen */}
            <h1 className="sr-only">
                Compare Cheap Gyms and Fitness Deals in {cityName}
            </h1>

            {/* In a real production setup, we'd fetch the city coordinates server-side
                and pass them directly. Here we'll pass the city name down, but we need
                to modify SearchClient slightly to accept an initial query.
                For now, we just drop in SearchClient and we will add a small patch to it. */}
            <SearchClient initialSearchQuery={cityName} />

            {/* SEO Content Block - Visually hidden but fully indexable by search engines */}
            <div className="sr-only">
                <h2>Gyms and Fitness Centers in {cityName}</h2>
                <p>
                    Looking for a gym in {cityName}? GymSaver helps you compare the best gym memberships,
                    day passes, and 24-hour fitness centers near you. Don't overpay for fitness—search
                    and compare prices for PureGym, The Gym Group, JD Gyms, David Lloyd, and independent
                    local gyms in {cityName} to find the cheapest and best-rated facilities for your workout goals.
                </p>
                <p>
                    Whether you are a student looking for a cheap membership, a professional needing a 24-hour gym
                    near central {cityName}, or searching for no-contract pay-as-you-go gym passes, use the map
                    above to instantly locate deals.
                </p>
            </div>
        </div>
    );
}
