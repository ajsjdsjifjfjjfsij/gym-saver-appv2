"use client"

import Link from "next/link"
import Image from "next/image"

const TOP_CITIES = [
    'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Sheffield', 'Liverpool', 'Edinburgh', 'Bristol', 'Cardiff',
    'Leicester', 'Coventry', 'Nottingham', 'Bradford', 'Newcastle', 'Belfast', 'Brighton', 'Hull', 'Plymouth', 'Wolverhampton'
];

const GYM_CHAINS = [
    { name: 'PureGym', slug: 'puregym' },
    { name: 'The Gym Group', slug: 'the-gym-group' },
    { name: 'JD Gyms', slug: 'jd-gyms' },
    { name: 'Everlast Fitness', slug: 'everlast-fitness' },
    { name: 'Nuffield Health', slug: 'nuffield-health' }
];

export function Footer() {
    return (
        <footer className="w-full border-t border-white/5 bg-black py-12 text-gray-400">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="inline-block mb-6">
                            <Image
                                src="/images/gymsaver_header_logo.png"
                                alt="GymSaver"
                                width={180}
                                height={48}
                                className="h-8 w-auto object-contain brightness-0 invert opacity-80"
                            />
                        </Link>
                        <p className="text-sm leading-relaxed mb-6">
                            The UK's leading gym comparison platform. Helping thousands of people find the best
                            fitness deals and save money on memberships every day.
                        </p>
                    </div>

                    {/* Popular Locations */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Top Cities</h4>
                        <ul className="space-y-3 text-sm">
                            {TOP_CITIES.slice(0, 10).map((city) => (
                                <li key={city}>
                                    <Link href={`/location/${city.toLowerCase()}`} className="hover:text-[#6BD85E] transition-colors text-xs">
                                        Gyms in {city}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Gym Chains */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Gym Chains</h4>
                        <ul className="space-y-3 text-sm">
                            {GYM_CHAINS.map((chain) => (
                                <li key={chain.slug}>
                                    <Link href={`/gym-chain/${chain.slug}`} className="hover:text-[#6BD85E] transition-colors">
                                        {chain.name} Prices
                                    </Link>
                                </li>
                            ))}
                            <li className="pt-2">
                                <Link href="/compare" className="text-[#6BD85E] hover:underline font-medium">
                                    Compare All Chains
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Company</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/list-your-gym" className="hover:text-[#6BD85E] transition-colors">List Your Gym</Link></li>
                            <li><Link href="/contact" className="hover:text-[#6BD85E] transition-colors">Contact Us</Link></li>
                            <li><Link href="/affiliate" className="hover:text-[#6BD85E] transition-colors">Partner Program</Link></li>
                            <li><Link href="/legal/privacy" className="hover:text-[#6BD85E] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/legal/terms" className="hover:text-[#6BD85E] transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                    <p>© {new Date().getFullYear()} GymSaver. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="https://twitter.com/gymsaverapp" target="_blank" className="hover:text-white transition-colors">Twitter</Link>
                        <p>Made for Fitness in the UK</p>
                    </div>
                </div>
            </div>
        </footer >
    )
}
