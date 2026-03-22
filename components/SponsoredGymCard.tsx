"use client"

import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"

export function SponsoredGymCard() {
    return (
        <div className="group relative overflow-hidden rounded-2xl transition-all duration-500 flex flex-col sm:flex-row h-auto sm:h-40 neon-glow-card ring-1 ring-[#6BD85E]/50 bg-gradient-to-r from-[#6BD85E]/10 to-transparent shadow-[0_0_20px_rgba(107,216,94,0.1)]">
            {/* Advertisement Tag */}
            <div className="absolute top-0 right-0 z-30 px-3 py-1 bg-[#6BD85E] text-black font-black text-[10px] uppercase tracking-widest rounded-bl-xl shadow-lg">
                Advertisement
            </div>

            {/* Mock Image Section */}
            <div className="w-full h-48 sm:h-full sm:w-64 shrink-0 relative bg-slate-900 sm:rounded-l-2xl rounded-t-2xl sm:rounded-tr-none border-b sm:border-r sm:border-b-0 border-[#6BD85E]/20 overflow-hidden z-20 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent z-10"></div>
                <img 
                    src="https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=800&auto=format&fit=crop" 
                    className="absolute inset-0 w-full h-full object-cover block sm:rounded-l-2xl rounded-t-2xl sm:rounded-tr-none grayscale opacity-60 mix-blend-overlay" 
                    alt="Sponsored Ad"
                />
                <div className="z-20 text-center px-4 flex flex-col items-center">
                    <h4 className="font-black text-2xl text-white tracking-widest leading-tight">YOUR<br/><span className="text-[#6BD85E]">BRAND</span></h4>
                    <p className="text-xs text-white mt-3 font-bold tracking-wide drop-shadow-lg bg-black/40 px-3 py-1 rounded-full border border-white/10">(Apply now to advertise in this location)</p>
                </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0 p-4 flex flex-col justify-between bg-black/95 sm:rounded-r-2xl rounded-b-2xl sm:rounded-bl-none relative z-10 border-l border-white/5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <h3 className="font-bold text-xl sm:text-lg leading-tight truncate text-white">
                            Your Special Offer Here
                        </h3>
                        <p className="text-[11px] text-[#6BD85E] flex items-center gap-1 truncate font-light">
                            <MapPin className="h-3 w-3 shrink-0" /> Your Local Address
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-semibold text-black bg-[#6BD85E] uppercase tracking-widest px-2 py-0.5 rounded">
                        EXCLUSIVE DEAL
                    </span>
                    <span className="text-[11px] text-slate-300 line-clamp-2">
                        A short description of why users should visit your business today.
                    </span>
                </div>

                <div className="flex flex-col pt-2 border-t border-white/5 space-y-2 mt-auto">
                    <div className="flex items-center justify-end">
                        <Link href="/advertise">
                            <Button variant="default" size="sm" className="bg-[#6BD85E] hover:bg-[#5bc250] text-black font-black h-8 px-4 rounded-xl shadow-[0_0_15px_rgba(107,216,94,0.3)] hover:shadow-[0_0_20px_rgba(107,216,94,0.5)] transition-all uppercase text-[11px] tracking-tight gap-2">
                                Learn More <ExternalLink className="w-3 h-3" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
