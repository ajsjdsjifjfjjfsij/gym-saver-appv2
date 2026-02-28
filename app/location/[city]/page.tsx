import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/header';
import SearchClient from '@/app/search/SearchClient';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Dynamic SSG generation for top UK cities
export async function generateStaticParams() {
    return [
        { city: 'london' },
        { city: 'manchester' },
        { city: 'birmingham' },
        { city: 'leeds' },
        { city: 'glasgow' },
        { city: 'sheffield' },
        { city: 'liverpool' },
        { city: 'edinburgh' },
        { city: 'bristol' },
        { city: 'cardiff' }
    ];
}

interface LocationPageProps {
    params: { city: string };
}

// Format the URL slug "manchester" back into "Manchester"
function formatCityName(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Generate highly targeted SEO metadata for each specific city page
export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
    const cityName = formatCityName(params.city);

    return {
        title: `Cheap Gyms in ${cityName} | Compare Gym Prices | GymSaver`,
        description: `Find the best and cheapest gym deals in ${cityName}. Compare prices for PureGym, The Gym Group, JD Gyms, and local fitness centers near you.`,
        keywords: [`gyms in ${cityName}`, `cheap gyms ${cityName}`, `compare gym prices ${cityName}`, `${cityName} fitness memberships`, `24 hour gyms ${cityName}`],
        alternates: {
            canonical: `https://www.gymsaverapp.com/location/${params.city}`,
        },
        openGraph: {
            title: `Best Gym Deals in ${cityName} | GymSaver`,
            description: `Compare prices for top gyms in ${cityName} and stop overpaying for memberships.`,
            url: `https://www.gymsaverapp.com/location/${params.city}`,
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
    const cityName = formatCityName(params.city);

    // We pass the city name nicely to the search client to instantly fetch that city
    // In order to properly center the map, we need the coordinates for this city.
    // We will rely on the SearchClient's internal auto-geocoding for the visual map,
    // but we can server-render a strong H1 tag for the SEO bots.

    return (
        <div className="flex flex-col min-h-screen bg-background relative z-0">
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
        </div>
    );
}
