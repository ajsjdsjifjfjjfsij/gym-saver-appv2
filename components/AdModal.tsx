"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, Zap, Target, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function AdModal() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const hasSeenAd = localStorage.getItem("hasSeenPartnerPackageAd")
        if (!hasSeenAd) {
            const timer = setTimeout(() => {
                setIsOpen(true)
            }, 1500) // 1.5s delay
            return () => clearTimeout(timer)
        }
    }, [])

    const handleClose = () => {
        localStorage.setItem("hasSeenPartnerPackageAd", "true")
        setIsOpen(false)
    }

    const handleAction = () => {
        handleClose()
        router.push("/offers")
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
                <div className="relative group p-1 w-full max-w-2xl mx-auto">
                    {/* Close Button (Absolute, outside the card flow like a badge) */}
                    <button
                        onClick={handleClose}
                        className="absolute -top-2 -right-2 z-50 bg-black/50 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors border border-white/10 backdrop-blur-md"
                    >
                        <span className="sr-only">Close</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    {/* Main Card - STRICT GymCard Clone */}
                    <div
                        onClick={handleAction}
                        className="
                        group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer flex flex-col sm:flex-row h-auto sm:h-40
                        premium-lift bg-[#0a0a0a]
                        neon-glow-card glass-card
                    ">

                        {/* Left Side: Image Area (Exact GymCard dimension classes) */}
                        <div className="w-full h-48 sm:h-full sm:w-64 shrink-0 relative bg-black/50 overflow-hidden sm:border-r border-b sm:border-b-0 border-white/10 flex items-center justify-center">

                            <div className="relative w-full h-full p-6 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                                <Image
                                    src="/images/gymsaver_logo_new.png"
                                    alt="GymSaver Partner"
                                    width={200}
                                    height={100}
                                    className="object-contain"
                                />
                            </div>

                            {/* Floating Top Left Badge (Matches GymCard distance badge) */}
                            <div className="absolute top-3 left-3 z-10">
                                <span className="text-[10px] font-bold text-black bg-[#6BD85E] px-2 py-0.5 rounded-full shadow-lg">
                                    Official Partner
                                </span>
                            </div>
                        </div>

                        {/* Right Side: Info Area (Exact GymCard padding/flex classes) */}
                        <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-col gap-1 min-w-0 flex-1">
                                    {/* Title (Exact GymCard title styling) */}
                                    <h3 className="font-bold text-xl sm:text-lg leading-tight truncate text-[#6BD85E] group-hover:scale-[1.01] origin-left transition-transform tracking-wide">
                                        Gym Partner Package
                                    </h3>
                                    {/* Address/Subtext (Exact GymCard subtext styling) */}
                                    <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate font-light italic">
                                        <Target className="h-3 w-3 shrink-0" />
                                        Featured placement in your area
                                    </p>
                                    {/* Offer Badge (Exact GymCard offer styling) */}
                                    <div className="mt-1 flex items-center">
                                        <span className="text-[10px] font-bold text-black bg-[#6BD85E] px-2 py-0.5 rounded-full shadow-sm blink-soft">
                                            Limited Spaces Available!
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary border border-white/5">
                                    <Star className="h-3 w-3 fill-[#6BD85E] text-[#6BD85E]" />
                                    <span className="text-[11px] font-bold text-white">5.0</span>
                                </div>
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                                    PREMIUM
                                </span>
                            </div>

                            {/* Bottom Row (Exact GymCard price/button row styling) */}
                            <div className="flex flex-col pt-2 border-t border-white/5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[10px] font-light text-slate-500 uppercase tracking-tighter">Verified</span>
                                        <span className="text-lg font-black text-white">Top Tier</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClose();
                                            }}
                                            className="h-8 px-3 rounded-full border border-white/5 transition-all text-xs font-bold tracking-tight bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                        >
                                            Dismiss
                                        </Button>

                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="bg-[#6BD85E] hover:bg-[#5bc250] text-black font-black h-8 px-4 rounded-xl shadow-[0_0_15px_rgba(107,216,94,0.3)] hover:shadow-[0_0_20px_rgba(107,216,94,0.5)] transition-all uppercase text-[11px] tracking-tight"
                                            onClick={handleAction}
                                        >
                                            Apply Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
