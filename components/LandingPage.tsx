"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, MapPin, Search, Star, Smartphone, ShieldCheck, Zap, Bell, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { useEffect, useState } from "react";
import { SeoFooter } from "@/components/seo-footer";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";

export default function LandingPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [gymCount, setGymCount] = useState<number | null>(null);
    const [userCount, setUserCount] = useState<number | null>(null);

    useEffect(() => {
        async function fetchGymCount() {
            try {
                const res = await fetch("/api/gyms/count");
                if (res.ok) {
                    const data = await res.json();
                    if (data.count) {
                        setGymCount(data.count);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch gym count:", error);
            }
        }

        async function fetchUserCount() {
            try {
                const snapshot = await getCountFromServer(collection(db, "users"));
                setUserCount(snapshot.data().count);
            } catch (error) {
                console.error("Failed to fetch user count:", error);
            }
        }

        fetchGymCount();
        fetchUserCount();
    }, []);

    // Optional: Auto-redirect logged-in users to the app
    // useEffect(() => {
    //     if (user) {
    //          router.push('/search');
    //     }
    // }, [user, router]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-green-500/30 font-sans">

            {/* Top Announcement Banner */}
            <div className="w-full bg-gradient-to-r from-[#6BD85E]/20 via-[#6BD85E]/10 to-transparent border-b border-[#6BD85E]/20 relative z-[60]">
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center text-xs sm:text-sm">
                    <span className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-gray-300">Are you a local business?</span>
                        <Link href="/advertise" className="text-[#6BD85E] font-bold hover:underline ml-1">
                            Advertise to gym-goers in your area →
                        </Link>
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sticky top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
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
                        <Link href="/list-your-gym" className="hover:text-white transition-colors">List Your Gym</Link>
                        <Link href="/advertise" className="hover:text-white transition-colors">Advertise</Link>
                        <Link href="/press" className="hover:text-white transition-colors">Press</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" asChild className="hidden sm:inline-flex text-gray-400 hover:text-white">
                            <Link href="/login">Log in</Link>
                        </Button>

                        {/* Mobile Menu */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden text-gray-400 hover:text-white">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-zinc-950 border-white/10 text-white w-[280px]">
                                <SheetHeader>
                                    <SheetTitle className="text-left text-white mb-4">Menu</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-6 text-lg font-medium text-gray-300 mt-4">
                                    <Link href="/list-your-gym" className="hover:text-white transition-colors">List Your Gym</Link>
                                    <Link href="/advertise" className="hover:text-white transition-colors">Advertise</Link>
                                    <Link href="/press" className="hover:text-white transition-colors">Press</Link>
                                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                                    <div className="h-px bg-white/10 my-2" />
                                    <Link href="/login" className="hover:text-white transition-colors">Log in</Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
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
                        One search. Every price. Zero overpaying.
                    </p>

                    <div className="mb-10 flex justify-center animate-fade-in-up delay-100">
                        <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6 py-2.5 rounded-2xl bg-[#6BD85E]/10 border border-[#6BD85E]/20 backdrop-blur-sm shadow-[0_0_20px_rgba(107,216,94,0.1)]">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-[#6BD85E]" />
                                <span className="text-sm font-semibold tracking-wide">
                                    <span className="text-[#6BD85E] text-base mr-1">{gymCount ? gymCount.toLocaleString() : "1,875"}</span>
                                    GYMS LISTED
                                </span>
                            </div>
                            <div className="h-4 w-px bg-white/10 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-[#6BD85E]" />
                                <span className="text-sm font-semibold tracking-wide uppercase">
                                    <span className="text-[#6BD85E] text-base mr-1">{userCount ? userCount.toLocaleString() : "854"}</span>
                                    Signed Up Users
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
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
                            <Button size="lg" variant="outline" asChild className="h-14 px-8 min-w-[210px] text-lg font-medium border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full w-full sm:w-auto hidden">
                                <Link href="/download" className="flex items-center justify-center">
                                    Download App
                                </Link>
                            </Button>
                        </div>
                        
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 px-8 min-w-[210px] text-lg font-bold border-[#6BD85E]/30 bg-[#6BD85E]/10 hover:bg-[#6BD85E]/20 text-[#6BD85E] rounded-full w-full sm:w-auto shadow-[0_0_15px_rgba(107,216,94,0.1)] transition-all hover:scale-105"
                            onClick={() => router.push("/gym-bounty")}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Zap className="h-5 w-5" />
                                Post a Gym Bounty
                            </span>
                        </Button>
                    </div>

                    {/* Preview Image / Mockup */}
                    <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-black/50 backdrop-blur-sm p-2 shadow-2xl">
                        <div className="absolute -inset-1 bg-gradient-to-b from-white/10 to-transparent rounded-2xl blur-sm -z-10" />
                        <div className="aspect-[4/5] sm:aspect-[16/9] rounded-xl overflow-hidden bg-zinc-900 relative group selection:bg-none">
                            {/* Mobile Image */}
                            <Image
                                src="/images/gymsaver_product_preview_mobile.png"
                                alt="GymSaver - Find Cheap Gym Memberships & Local Fitness Deals"
                                fill
                                className="object-cover group-hover:scale-[1.02] transition-transform duration-700 block sm:hidden"
                                priority
                            />
                            {/* Desktop Image */}
                            <Image
                                src="/images/gymsaver_product_preview.png"
                                alt="GymSaver - Find Cheap Gym Memberships & Local Fitness Deals"
                                fill
                                className="object-cover group-hover:scale-[1.02] transition-transform duration-700 hidden sm:block"
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

            {/* SEO Internal Linking Grid */}
            <SeoFooter />

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 bg-black">
                <div className="container max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div
                            className="relative overflow-visible"
                            style={{
                                width: '180px',
                                transform: 'translate(-6px, 0px)'
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
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-500">
                        <Link href="/advertise" className="hover:text-white">Advertise</Link>
                        <Link href="/list-your-gym" className="hover:text-white">List Your Gym</Link>
                        <Link href="/press" className="hover:text-white">Press</Link>
                        <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
                        <Link href="/legal/terms" className="hover:text-white">Terms</Link>
                        <Link href="/contact" className="hover:text-white">Contact</Link>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        © {new Date().getFullYear()} GymSaver. All rights reserved.
                        <Link href="https://instagram.com/GymsaverHQ" target="_blank" className="hover:text-white transition-colors ml-4">Instagram</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
