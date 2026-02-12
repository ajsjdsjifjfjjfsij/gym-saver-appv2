import { Button } from "@/components/ui/button"
import { X, TrendingUp, ShoppingBag, Globe, Smartphone } from "lucide-react"
import { useState } from "react"

interface AdBannerProps {
    variant?: "web" | "mobile"
    className?: string
}

export function AdBanner({ className }: AdBannerProps) {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <div className={`
            group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer flex flex-col sm:flex-row h-auto sm:h-40 w-full
            premium-lift bg-[#0a0a0a]
            neon-glow-card glass-card
            ${className}
        `}>
            {/* Left Side: Image Area */}
            <div className="w-full h-48 sm:h-full sm:w-64 shrink-0 relative bg-black/50 overflow-hidden sm:border-r border-b sm:border-b-0 border-white/10 flex items-center justify-center">
                <div className="relative w-full h-full p-6 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                    {/* Placeholder for ad image - using a gradient or icon if image not available, but user had an image in AdModal */}
                    <div className="h-16 w-16 rounded-xl bg-[#6BD85E]/20 flex items-center justify-center shadow-[0_0_20px_rgba(107,216,94,0.3)]">
                        <TrendingUp className="h-8 w-8 text-[#6BD85E]" />
                    </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute top-3 left-3 z-10">
                    <span className="text-[10px] font-bold text-black bg-[#6BD85E] px-2 py-0.5 rounded-full shadow-lg">
                        Sponsored
                    </span>
                </div>
            </div>

            {/* Right Side: Info Area */}
            <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <h3 className="font-bold text-xl sm:text-lg leading-tight truncate text-[#6BD85E] group-hover:scale-[1.01] origin-left transition-transform tracking-wide">
                            Join the GymSaver Network
                        </h3>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate font-light italic">
                            <Globe className="h-3 w-3 shrink-0" />
                            Partner with us today
                        </p>
                        <div className="mt-1 flex items-center">
                            <span className="text-[10px] font-bold text-black bg-[#6BD85E] px-2 py-0.5 rounded-full shadow-sm blink-soft">
                                Limited Time Offer
                            </span>
                        </div>
                    </div>

                    <button onClick={(e) => {
                        e.stopPropagation();
                        setIsVisible(false);
                    }} className="text-slate-500 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary border border-white/5">
                        <span className="text-[11px] font-bold text-white">Verified Partner</span>
                    </div>
                </div>

                <div className="flex flex-col pt-2 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] font-light text-slate-500 uppercase tracking-tighter">Boost Your Business</span>
                        </div>

                        <Button
                            variant="default"
                            size="sm"
                            className="bg-[#6BD85E] hover:bg-[#5bc250] text-black font-black h-8 px-4 rounded-xl shadow-[0_0_15px_rgba(107,216,94,0.3)] hover:shadow-[0_0_20px_rgba(107,216,94,0.5)] transition-all uppercase text-[11px] tracking-tight"
                        >
                            Learn More
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
