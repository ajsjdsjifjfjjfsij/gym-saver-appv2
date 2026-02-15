"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, MapPin, Search, Star, Smartphone, ShieldCheck, Zap, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { useEffect } from "react";

export default function LandingPage() {
    const { user } = useAuth();
    const router = useRouter();

    // Optional: Auto-redirect logged-in users to the app
    // useEffect(() => {
    //     if (user) {
    //          router.push('/search');
    //     }
    // }, [user, router]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-green-500/30">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-48 flex items-center justify-between relative">
                    <div className="relative h-10 w-[280px] flex items-center justify-start overflow-visible">
                        <Image
                            src="/images/gymsaver_header_logo.png"
                            alt="GymSaver - Compare Gym Prices & Find Deals"
                            width={600}
                            height={160}
                            className="h-auto w-[280px] object-contain absolute left-0 top-1/2 -translate-y-1/2 z-10"
                        />
                    </div>
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 text-sm font-medium text-gray-400">
                        <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="/affiliate" className="hover:text-white transition-colors">Affiliate</Link>
                        <Link href="/search" className="hover:text-white transition-colors">Web App</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" asChild className="text-gray-400 hover:text-white">
                            <Link href="/login">Log in</Link>
                        </Button>
                        <Button
                            className="bg-[#6BD85E] text-black hover:bg-[#5bc250] font-bold rounded-full px-6"
                            onClick={() => router.push("/search")}
                        >
                            <span className="flex items-center justify-center w-full h-full">
                                <span className="relative">
                                    Launch App
                                    <ArrowRight className="absolute left-full ml-[2px] top-1/2 -translate-y-1/2 h-4 w-4" />
                                </span>
                            </span>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#6BD85E]/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />

                <div className="container max-w-6xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#6BD85E] mb-8 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live Prices
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent pb-2">
                        The <span className="text-[#6BD85E]">Gym</span> <br /> Comparison App
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        One search. Every price. Zero over paying.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            size="lg"
                            className="h-14 px-8 min-w-[210px] text-lg font-bold bg-[#6BD85E] text-black hover:bg-[#5bc250] rounded-full w-full sm:w-auto shadow-[0_0_20px_rgba(107,216,94,0.3)] hover:shadow-[0_0_30px_rgba(107,216,94,0.5)] transition-all"
                            onClick={() => router.push("/search")}
                        >
                            <span className="flex items-center justify-center">
                                <span className="relative">
                                    <Search className="absolute right-full mr-1 top-1/2 -translate-y-1/2 h-5 w-5" />
                                    Find Gyms
                                </span>
                            </span>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="h-14 px-8 min-w-[210px] text-lg font-medium border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full w-full sm:w-auto">
                            <Link href="/download" className="flex items-center justify-center">
                                Download App
                            </Link>
                        </Button>
                    </div>

                    {/* Preview Image / Mockup */}
                    <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-black/50 backdrop-blur-sm p-2 shadow-2xl">
                        <div className="absolute -inset-1 bg-gradient-to-b from-white/10 to-transparent rounded-2xl blur-sm -z-10" />
                        <div className="aspect-[16/9] rounded-xl overflow-hidden bg-zinc-900 relative group selection:bg-none">
                            <Image
                                src="/images/gymsaver_product_preview.png"
                                alt="GymSaver - Find Cheap Gym Memberships & Local Fitness Deals"
                                fill
                                className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-zinc-950">
                <div className="container max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Gym Comparison Made Simple</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Stop overpaying for fitness. We aggregate data from major UK chains and independent gyms to bring you total price transparency.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: MapPin,
                                title: "Interactive Map",
                                desc: "Visualize gyms near you with our powerful geolocation map. Filter by distance, price, and type."
                            },
                            {
                                icon: Zap,
                                title: "Real-Time Pricing",
                                desc: "We track price changes and offers so you never miss a deal. Community verified updates ensure accuracy."
                            },
                            {
                                icon: Bell,
                                title: "Push Notifications",
                                desc: "Get real-time alerts for price changes, exclusive gym deals, and day passes. Available for subscribers."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="h-12 w-12 rounded-2xl bg-[#6BD85E]/10 flex items-center justify-center mb-6">
                                    <feature.icon className="h-6 w-6 text-[#6BD85E]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="container max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to start saving?</h2>
                    <p className="text-xl text-gray-400 mb-10">
                        Join thousands of users converting to GymSaver today.
                        Available on iOS, Android, and Web.
                    </p>
                    <Button
                        size="lg"
                        className="h-16 px-10 text-xl font-bold bg-white text-black hover:bg-gray-200 rounded-full shadow-lg"
                        onClick={() => router.push("/search")}
                    >
                        Enter Web App
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 bg-black">
                <div className="container max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div
                            className="relative overflow-visible"
                            style={{
                                width: '180px',
                                transform: 'translate(-32px, 0px)'
                            }}
                        >
                            <Image
                                src="/images/official_logo.png"
                                alt="GymSaver - Save Money on Gym Memberships"
                                width={180}
                                height={48}
                                className="h-auto w-full object-contain opacity-90 hover:opacity-100 transition-opacity"
                            />
                        </div>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-500">
                        <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
                        <Link href="/legal/terms" className="hover:text-white">Terms</Link>
                        <Link href="/contact" className="hover:text-white">Contact</Link>
                    </div>
                    <div className="text-sm text-gray-600">
                        © {new Date().getFullYear()} GymSaver. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
