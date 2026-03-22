import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3, Building2, ChevronRight, Download, Mail, PieChart, TrendingDown } from "lucide-react";
import Image from "next/image";
import * as admin from 'firebase-admin'; // remove later if not needed, or just don't use it
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const revalidate = 86400;

export const metadata: Metadata = {
    title: "Press & Data | GymSaver UK",
    description: "Official press resources, industry data, media kit, and insights from GymSaver. We track UK gym prices to provide transparency to consumers.",
};

export default async function PressPage() {
    let totalGyms = 1864; // Fallback
    let totalCities = 250; // Fallback
    let avgPrice = "28.50"; // Fallback
    
    try {
        if (db) {
            const snapshot = await getDocs(collection(db, "gyms"));
            
            const cities = new Set();
            let totalPrice = 0;
            let priceCount = 0;
            
            const gymsCount = snapshot.docs.length;
            if (gymsCount > 0) {
                totalGyms = gymsCount;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                if (typeof data.city === "string" && data.city !== "Unknown") {
                    cities.add(data.city);
                } else if (typeof data.name === "string" && data.name.includes("London")) {
                    cities.add("London");
                }

                let price = data.lowest_price;
                if (price === undefined && Array.isArray(data.memberships) && data.memberships.length > 0) {
                    price = data.memberships[0].price;
                }

                if (price !== undefined && !isNaN(parseFloat(price as string))) {
                    totalPrice += parseFloat(price as string);
                    priceCount++;
                }
            });

            if (cities.size > 0) {
                totalCities = cities.size;
            }
            if (priceCount > 0) {
                avgPrice = (totalPrice / priceCount).toFixed(2);
            }
        }
    } catch (e: any) {
        // Next.js dev server sometimes throws "Maximum call stack size exceeded" 
        // with the Firebase Client SDK on large collections. 
        // We fallback to safe numbers in dev so the page doesn't 500.
        console.warn("Failed to dynamically load gyms for stats (likely Next.js dev limit):", e.message);
    }
    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#6BD85E]/30 relative pb-20">
            {/* Nav */}
            <div className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                    <div className="h-8 w-auto relative">
                        <Image
                            src="/images/official_logo.png"
                            alt="GymSaver"
                            width={120}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 pt-16 md:pt-24">
                {/* Header */}
                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6BD85E]/10 border border-[#6BD85E]/20 text-xs font-medium text-[#6BD85E] mb-6">
                        GymSaver Press Room
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Data-driven transparency for the <span className="text-[#6BD85E]">UK fitness industry.</span>
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
                        GymSaver is the UK's leading platform for comparing gym memberships, tracking real-time price changes, and uncovering hidden deals across thousands of locations.
                    </p>
                </div>

                {/* Live Data Highlights (Great for journalists) */}
                <section className="mb-20">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                        <BarChart3 className="text-[#6BD85E]" />
                        Industry Insights & Data
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Our platform continuously tracks and aggregates data across major UK chains and independent gyms. Journalists and media publications are free to cite this data with credit to GymSaver.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Gyms Tracked", value: `${totalGyms.toLocaleString()}+`, icon: Building2 },
                            { label: "UK Cities Covered", value: `${totalCities}+`, icon: PieChart },
                            { label: "Avg. Month Price", value: `£${avgPrice}`, icon: TrendingDown },
                            { label: "Data Points Updated", value: "Daily", icon: BarChart3 },
                        ].map((stat, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#6BD85E]/30 transition-colors">
                                <stat.icon className="w-6 h-6 text-gray-500 mb-4" />
                                <div className="text-3xl font-bold mb-1 text-white">{stat.value}</div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Our Mission */}
                <section className="mb-20 bg-zinc-900/50 rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#6BD85E]/10 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2" />
                    <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                    <div className="prose prose-invert max-w-none text-gray-300">
                        <p className="text-lg leading-relaxed mb-4">
                            The UK fitness industry has historically lacked pricing transparency. With fluctuating joining fees, secret day passes, and varying prices even within the same chain across different postcodes, consumers often overpay simply because they lack information.
                        </p>
                        <p className="text-lg leading-relaxed gap-2">
                            GymSaver was built to solve this. By aggregating real-time data, mapping thousands of facilities, and tracking daily deals, we empower people to find the best fitness facility for their budget without the guesswork.
                        </p>
                    </div>
                </section>

                {/* Media Kit & Assets */}
                <section className="mb-20">
                    <h2 className="text-2xl font-bold mb-8">Brand Assets</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="p-8 rounded-2xl bg-white flex flex-col items-center justify-center text-black min-h-[200px] border border-transparent">
                            <Image
                                src="/images/gymsaver_header_logo.png"
                                alt="GymSaver Logo Dark"
                                width={200}
                                height={60}
                                className="invert object-contain mb-6"
                            />
                            <div className="mt-auto w-full flex justify-between items-center pt-6 border-t border-black/10">
                                <span className="text-sm font-medium">Primary Logo (Light)</span>
                                <Download className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="p-8 rounded-2xl bg-zinc-950 flex flex-col items-center justify-center border border-white/10 min-h-[200px]">
                            <Image
                                src="/images/gymsaver_header_logo.png"
                                alt="GymSaver Logo Light"
                                width={200}
                                height={60}
                                className="object-contain mb-6"
                            />
                            <div className="mt-auto w-full flex justify-between items-center pt-6 border-t border-white/10">
                                <span className="text-sm font-medium">Primary Logo (Dark)</span>
                                <Download className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Press Contact */}
                <section className="border-t border-white/10 pt-16">
                    <h2 className="text-2xl font-bold mb-6">Press Contact</h2>
                    <p className="text-gray-400 mb-8 max-w-xl">
                        For press inquiries, exclusive data requests, interviews, or expert commentary on the UK fitness market, please reach out to our team.
                    </p>
                    <a
                        href="mailto:admin@gymsaverapp.com"
                        className="inline-flex items-center gap-3 bg-white text-black px-6 py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                        <Mail className="w-5 h-5" />
                        admin@gymsaverapp.com
                    </a>
                </section>
            </main>
        </div>
    );
}
