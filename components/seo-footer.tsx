import Link from "next/link";
import { UK_CITIES } from "@/lib/uk-cities";

// Select the top 36 cities for the footer grid to ensure balanced columns
const TOP_CITIES = [
    "london", "birmingham", "manchester", "leeds", "glasgow", "sheffield",
    "edinburgh", "liverpool", "bristol", "cardiff", "belfast", "nottingham",
    "newcastle", "southampton", "wolverhampton", "coventry", "leicester",
    "bradford", "sunderland", "hull", "peterborough", "cambridge", "norwich",
    "plymouth", "bournemouth", "swindon", "gloucester", "cheltenham", "exeter",
    "brighton", "portsmouth", "milton-keynes", "reading", "slough", "oxford", "aberdeen"
];

function formatCityName(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export function SeoFooter() {
    return (
        <section className="border-t border-white/5 bg-zinc-950 py-16">
            <div className="container max-w-6xl mx-auto px-6">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Find Gyms Near You</h2>
                    <p className="text-gray-400 text-sm">
                        Discover the best gym deals, 24-hour fitness centers, and cheapest memberships across the UK.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
                    {TOP_CITIES.map((city) => (
                        <Link
                            key={city}
                            href={`/location/${city}`}
                            className="text-sm text-gray-500 hover:text-[#6BD85E] transition-colors truncate"
                        >
                            Gyms in {formatCityName(city)}
                        </Link>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-4 text-xs text-gray-600">
                    <span className="text-gray-500 font-semibold mr-2">Top Chains:</span>
                    <Link href="/gym-chain/puregym" className="hover:text-white">PureGym</Link>
                    <Link href="/gym-chain/the-gym-group" className="hover:text-white">The Gym Group</Link>
                    <Link href="/gym-chain/jd-gyms" className="hover:text-white">JD Gyms</Link>
                    <Link href="/gym-chain/david-lloyd" className="hover:text-white">David Lloyd</Link>
                    <Link href="/gym-chain/anytime-fitness" className="hover:text-white">Anytime Fitness</Link>
                </div>
            </div>
        </section>
    );
}
