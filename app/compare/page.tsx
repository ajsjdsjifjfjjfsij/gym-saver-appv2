"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, X, Star, MapPin, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthContext"
import { useGymPrices } from "@/hooks/useGymPrices"
import { getGymFacilities, getGymPrice } from "@/lib/gym-utils"

interface Gym {
    id: string
    name: string
    address: string
    rating: number
    type: string
    priceLevel: string
    lat: number
    lng: number
    distance?: number
    photo_reference?: string
    photos?: string[]
    website?: string
}

// Facility definitions for comparison
const FACILITIES = [
    { key: "pool", label: "Pool", icon: "🏊" },
    { key: "sauna", label: "Sauna/Steam", icon: "🧖" },
    { key: "24hr", label: "24/7 Access", icon: "🕒" },
    { key: "classes", label: "Classes", icon: "🧘" },
    { key: "parking", label: "Free Parking", icon: "🚗" },
    { key: "weights", label: "Free Weights", icon: "🏋" },
]

export default function CompareGymsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [comparedGyms, setComparedGyms] = useState<Gym[]>([])
    const { prices: livePrices } = useGymPrices()

    // Load saved gyms from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("comparedGyms") // Reading comparedGyms
            if (saved) {
                const parsed = JSON.parse(saved);
                setComparedGyms(Array.isArray(parsed) ? parsed : []);
            }
        }
    }, [])

    // Randomly assign facilities based on gym name/type for the comparison view
    // (Logic duplicated from saved/page.tsx for consistency)
    const gymsWithFacilities = useMemo(() => {
        return comparedGyms.slice(0, 3).map(gym => {
            const livePrice = livePrices[gym.id];
            const { monthly } = getGymPrice(gym, livePrice);

            return {
                ...gym,
                facilities: getGymFacilities(gym),
                detailedPricing: {
                    monthly: monthly,
                    annual: monthly * 12,
                }
            }
        })
    }, [comparedGyms, livePrices])

    const removeGym = (id: string) => {
        const updated = comparedGyms.filter(g => g.id !== id)
        setComparedGyms(updated)
        // Update localStorage as well so going back/refreshing keeps state
        localStorage.setItem("comparedGyms", JSON.stringify(updated))

        if (updated.length < 2) {
            // Optional: Redirect back if less than 2? Or just show empty state?
            // User can add more.
        }
    }

    // Show loading only during auth check
    if (authLoading) return null;

    // Guests can compare gyms from localStorage

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Header
                searchQuery=""
                onSearchChange={() => { }}
                savedCount={0} // Not relevant here
                onToggleSavedView={() => { }}
                showSavedOnly={false}
                onAuthRequired={() => { }}
                variant="app"
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 overflow-x-hidden">
                <div className="flex items-center gap-3 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-white/10 h-10 w-10 flex-none"
                        onClick={() => router.push('/search')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Compare Selected Gyms
                        </h1>
                        <p className="text-slate-500 text-xs md:text-sm">Comparing {comparedGyms.length} gyms side-by-side.</p>
                    </div>
                </div>

                {gymsWithFacilities.length < 2 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                            <Star className="h-10 w-10 text-slate-700" />
                        </div>
                        <h2 className="text-xl font-bold">Select gyms to compare</h2>
                        <p className="text-slate-500 max-w-xs mx-auto">
                            You need at least 2 gyms to compare. Go back to search and select more.
                        </p>
                        <Button
                            className="bg-[#6BD85E] text-black font-bold hover:bg-[#5bc250] rounded-full"
                            onClick={() => router.push(user ? "/search" : "/signup")}
                        >
                            Find Gyms
                        </Button>
                    </div>
                ) : (
                    <div className="relative pb-20">
                        {/* Comparison Grid with Unified Columns */}
                        <div className="grid gap-px bg-white/5 border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden"
                            style={{ gridTemplateColumns: `repeat(${gymsWithFacilities.length}, minmax(0, 1fr))` }}>
                            {gymsWithFacilities.map((gym, idx) => (
                                <div key={gym.id} className={`flex flex-col bg-black relative ${idx % 2 === 0 ? 'bg-zinc-950/40' : 'bg-black'}`}>
                                    {/* Sticky Gym Header with Pricing */}
                                    <div className="sticky top-[72px] z-30 p-2 md:p-5 bg-zinc-950/95 backdrop-blur-xl border-b border-white/5 shadow-2xl">
                                        <div className="relative group">
                                            <button
                                                onClick={() => removeGym(gym.id)}
                                                className="absolute -top-1 -right-1 z-40 h-6 w-6 md:h-8 md:w-8 bg-red-500/20 active:bg-red-500 text-red-500 active:text-white rounded-full flex items-center justify-center border border-red-500/30 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 backdrop-blur-md shadow-xl active:scale-95"
                                            >
                                                <X className="h-3 w-3 md:h-4 md:w-4" />
                                            </button>
                                            <div className="h-24 md:h-40 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 mb-2 md:mb-4 relative bg-zinc-900">
                                                {gym.photos?.[0] || gym.photo_reference ? (
                                                    <img
                                                        src={(gym.photos?.[0] || gym.photo_reference || "").startsWith('http')
                                                            ? (gym.photos?.[0] || gym.photo_reference || "")
                                                            : `https://places.googleapis.com/v1/${gym.photos?.[0] || gym.photo_reference}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&maxHeightPx=400&maxWidthPx=400`
                                                        }
                                                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500"
                                                        alt={gym.name}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                        <span className="text-xs">No Image</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                                <div className="absolute bottom-1.5 md:bottom-3 left-1.5 md:left-3 right-1.5 md:right-3 flex items-end justify-between">
                                                    <div>
                                                        <h3 className="font-black text-[10px] md:text-xl text-white drop-shadow-lg leading-tight truncate max-w-[60px] md:max-w-none">{gym.name}</h3>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-1 md:px-2 py-0.5 rounded-full border border-white/10">
                                                                <Star className="h-2 w-2 md:h-2.5 md:w-2.5 fill-[#6BD85E] text-[#6BD85E]" />
                                                                <span className="text-[8px] md:text-[10px] font-black text-white">{gym.rating}</span>
                                                            </div>
                                                            {gym.distance !== undefined && (
                                                                <div className="flex items-center gap-1 bg-blue-500/60 backdrop-blur-md px-1 md:px-2 py-0.5 rounded-full border border-white/10">
                                                                    <MapPin className="h-2 w-2 md:h-2.5 md:w-2.5 text-white" />
                                                                    <span className="text-[8px] md:text-[10px] font-black text-white">{gym.distance.toFixed(1)}mi</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Integrated Price Summary */}
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-4 px-0.5">
                                                <div className="flex flex-col">
                                                    <span className="text-[7px] md:text-[9px] uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-500 font-black mb-0 md:mb-0.5 ml-0.5">Memb.</span>
                                                    <div className="flex items-baseline gap-0.5">
                                                        <span className="text-sm md:text-3xl font-black text-[#6BD85E]">£{gym.detailedPricing.monthly}</span>
                                                        <span className="text-[8px] md:text-[10px] text-slate-500 font-bold">/mo</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-start md:items-end">
                                                    <div className="px-1 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[7px] md:text-[9px] font-black leading-none">
                                                        SAVE £{(gym.detailedPricing.monthly * 12 - gym.detailedPricing.annual).toFixed(0)}
                                                    </div>
                                                    <span className="text-[6px] md:text-[8px] text-blue-500/50 font-bold mt-0.5 md:mt-1 uppercase tracking-tighter hidden md:block">Annually</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Facilities Section */}
                                    <div className="p-2 md:p-6 pt-4 md:pt-8 space-y-3 md:space-y-6 relative">
                                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>
                                        <span className="block text-center text-[7px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-500 font-bold mb-2 md:mb-4 truncate">Facilities</span>
                                        <div className="grid grid-cols-1 gap-1.5 md:gap-4">
                                            {FACILITIES.map(fac => {
                                                const hasFac = (gym.facilities as any)[fac.key];
                                                return (
                                                    <div key={fac.key} className={`flex items-center justify-between p-1.5 md:p-3 rounded-lg md:rounded-xl border transition-colors ${hasFac ? 'bg-[#6BD85E]/5 border-[#6BD85E]/10' : 'bg-white/[0.02] border-white/5 opacity-40'}`}>
                                                        <div className="flex items-center gap-1.5 md:gap-3">
                                                            <span className="text-xs md:text-lg">{fac.icon}</span>
                                                            <span className={`text-[7px] md:text-xs font-bold truncate max-w-[40px] md:max-w-none ${hasFac ? 'text-white' : 'text-slate-500'}`}>{fac.label}</span>
                                                        </div>
                                                        {hasFac ? (
                                                            <div className="h-3 w-3 md:h-5 md:w-5 rounded-full bg-[#6BD85E] flex items-center justify-center text-black">
                                                                <Check className="h-2 w-2 md:h-3 md:w-3 stroke-[3] md:stroke-[4]" />
                                                            </div>
                                                        ) : (
                                                            <X className="h-3 w-3 md:h-5 md:w-5 text-slate-700" />
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Distance Comparison Row */}
                                            <div className="flex items-center justify-between p-1.5 md:p-3 rounded-lg md:rounded-xl border bg-blue-500/5 border-blue-500/10">
                                                <div className="flex items-center gap-1.5 md:gap-3">
                                                    <span className="text-xs md:text-lg">📍</span>
                                                    <span className="text-[7px] md:text-xs font-bold text-white">Distance</span>
                                                </div>
                                                <span className="text-[8px] md:text-[10px] font-black text-blue-400">
                                                    {gym.distance !== undefined ? `${gym.distance.toFixed(1)} mi` : "N/A"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Mobile Action Buttons (Miniaturized) */}
                                        <div className="mt-4 md:mt-auto pt-4 md:p-6">
                                            <Button
                                                className="w-full bg-[#6BD85E] hover:bg-[#5bc250] text-black font-black transition-all hover:scale-[1.02] active:scale-[0.98] group rounded-lg md:rounded-xl h-8 md:h-12 text-[8px] md:text-sm px-1 md:px-4"
                                                asChild
                                            >
                                                <a href={`${gym.website}${gym.website?.includes('?') ? '&' : '?'}ref=gymsaver`} target="_blank" rel="noopener noreferrer">
                                                    Sign Up
                                                    <ExternalLink className="ml-1 md:ml-2 h-2 w-2 md:h-4 md:w-4 opacity-50 type-opacity-100 transition-opacity" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
