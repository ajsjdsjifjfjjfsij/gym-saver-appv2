import { Button } from "@/components/ui/button"
import { X, TrendingUp, ShoppingBag, Globe, Smartphone } from "lucide-react"
import { useState } from "react"

interface AdBannerProps {
    variant?: "web" | "mobile"
    className?: string
}

export function AdBanner({ variant = "mobile", className }: AdBannerProps) {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    // Web Version (Desktop/Website)
    if (variant === "web") {
        return (
            <div className={`bg-gradient-to-r from-blue-900 to-slate-900 border-t border-blue-800 p-4 relative shadow-[0_-5px_20px_rgba(0,0,0,0.2)] ${className}`}>
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                            <Globe className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-wider">Web Exclusive</span>
                                <span className="text-xs text-blue-400">Sponsored</span>
                            </div>
                            <h4 className="font-bold text-white text-lg leading-tight">
                                Join our Affiliate Program
                            </h4>
                            <p className="text-sm text-blue-200/70">
                                Earn competitive commission on every referral. Perfect for fitness influencers.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-full h-10 px-6">
                            Start Earning
                        </Button>
                        {/* Close button removed to keep layout fixed */}
                    </div>
                </div>
            </div>
        )
    }

    // Mobile Version (App)
    return (
        <div className={`bg-slate-900 border-t border-slate-800 p-4 relative shadow-[0_-5px_20px_rgba(0,0,0,0.1)] ${className}`}>
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
                        <Smartphone className="h-6 w-6 text-slate-900" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-green-400 uppercase tracking-wider">App Deal</span>
                        <h4 className="font-bold text-white text-sm leading-tight">
                            Unlock Peak Performance
                        </h4>
                        <p className="text-xs text-slate-400 hidden sm:block">
                            Premium supplements for serious athletes.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-200 font-bold rounded-full h-8 px-4 text-xs">
                        Shop Now <ShoppingBag className="ml-1.5 h-3 w-3" />
                    </Button>
                    <button onClick={() => setIsVisible(false)} className="text-slate-500 hover:text-white transition-colors p-1">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
