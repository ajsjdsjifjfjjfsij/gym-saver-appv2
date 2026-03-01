import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SearchClient from '@/app/search/SearchClient';

// Dynamic SSG generation for popular UK gym chains
export async function generateStaticParams() {
    const chains = [
        'puregym',
        'the-gym-group',
        'jd-gyms',
        'david-lloyd',
        'virgin-active',
        'nuffield-health',
        'anytime-fitness',
        'snap-fitness',
        'everlast-fitness',
        'bannatyne',
        'easygym',
        'third-space',
        'equinox'
    ];
    return chains.map(chain => ({ chain }));
}

interface ChainPageProps {
    params: Promise<{ chain: string }>;
}

// Format the URL slug "the-gym-group" back into "The Gym Group"
function formatChainName(slug: string | null | undefined): string {
    if (!slug) {
        console.warn("⚠️ Warning: Empty slug passed to formatChainName");
        return "Unknown Chain";
    }
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Generate highly targeted SEO metadata for each specific gym chain page
export async function generateMetadata({ params }: ChainPageProps): Promise<Metadata> {
    const { chain } = await params;
    const chainName = formatChainName(chain);

    return {
        title: `Compare ${chainName} Prices & Memberships | GymSaver UK`,
        description: `Find ${chainName} locations near you. Compare their membership prices, day passes, and facilities with other local gyms to make sure you get the best deal.`,
        keywords: [`${chainName} prices`, `${chainName} near me`, `${chainName} memberships`, `compare ${chainName}`, `cheap ${chainName} deals`, `24hr gym near me`, `cheap gyms near me`],
        alternates: {
            canonical: `https://www.gymsaverapp.com/gym-chain/${chain}`,
        },
        openGraph: {
            title: `${chainName} Prices & Locations | GymSaver`,
            description: `Don't overpay for your ${chainName} membership. Compare prices with local alternatives.`,
            url: `https://www.gymsaverapp.com/gym-chain/${chain}`,
            siteName: 'GymSaver',
            images: [
                {
                    url: '/opengraph-image.png',
                    width: 1200,
                    height: 630,
                    alt: `Compare ${chainName} Prices`,
                },
            ],
            type: 'website',
        },
    };
}

export default async function ChainPage({ params }: ChainPageProps) {
    const { chain } = await params;
    const chainName = formatChainName(chain);

    return (
        <div className="flex flex-col min-h-screen bg-background relative z-0">
            {/* SEO Hidden H1 - Read by bots, hidden from users visually because 
                SearchClient takes over the whole screen */}
            <h1 className="sr-only">
                Find {chainName} Locations and Compare Membership Prices
            </h1>

            {/* We pass the formatted chain name down to SearchClient to auto-populate
                the search query when real users land on the page */}
            <SearchClient initialSearchQuery={chainName} />
        </div>
    );
}
