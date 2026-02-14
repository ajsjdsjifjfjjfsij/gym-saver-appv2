"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Apple, Smartphone, ArrowRight, Check, Star, MapPin, Bookmark, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DownloadPage() {
    const [logoSize, setLogoSize] = useState(290);
    const [logoX, setLogoX] = useState(0);
    const [logoY, setLogoY] = useState(0);
    const [footerLogoSize, setFooterLogoSize] = useState(180);
    const [footerLogoX, setFooterLogoX] = useState(-32);
    const [footerLogoY, setFooterLogoY] = useState(0);
    const [mobileLogoSize, setMobileLogoSize] = useState(120);
    const [mobileLogoX, setMobileLogoX] = useState(0);
    const [mobileLogoY, setMobileLogoY] = useState(0);
    const [activeTab, setActiveTab] = useState<'header' | 'footer' | 'mobile'>('mobile');
    const [showControls, setShowControls] = useState(false);

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            {/* Background Glow Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#6BD85E] rounded-full blur-[150px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#6BD85E] rounded-full blur-[150px] opacity-10 pointer-events-none" />

            {/* Navbar (Minimal) */}
            <header className="container mx-auto p-6 flex justify-between items-center relative z-10">
                <div
                    className="relative h-10 flex items-center justify-start overflow-visible"
                    style={{
                        width: `${logoSize}px`,
                        transform: `translate(${logoX}px, ${logoY}px)`
                    }}
                >
                    <Image
                        src="/images/gymsaver_header_logo.png"
                        alt="GymSaver"
                        width={600}
                        height={160}
                        className="h-auto w-full object-contain"
                        priority
                    />
                </div>
                <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                    <Link href="/">Open Web App</Link>
                </Button>
            </header>

            {/* Hero Section */}
            <main className="flex-1 container mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-12 relative z-10">

                {/* Text Content */}
                <div className="flex-1 space-y-8 text-center lg:text-left animate-fade-in opacity-0 [animation-delay:200ms]" style={{ animationFillMode: 'forwards' }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#6BD85E] mb-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live Prices
                    </div>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                        The Comparison App <br />
                        For <span className="text-[#6BD85E]">Gyms</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                        One search. Every Gym. The best price near you.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-6">
                        {/* Official App Store Badge */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="transition-transform hover:scale-[1.03] active:scale-[0.98] duration-200 opacity-60">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                                    alt="Download on the App Store"
                                    className="h-[50px] w-auto grayscale"
                                />
                            </div>
                            <span className="text-[10px] font-black text-[#6BD85E] uppercase tracking-[0.2em] animate-pulse">Coming Soon!</span>
                        </div>

                        {/* Official Google Play Badge */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="transition-transform hover:scale-[1.03] active:scale-[0.98] duration-200 opacity-60">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                    alt="Get it on Google Play"
                                    className="h-[50px] w-auto grayscale"
                                />
                            </div>
                            <span className="text-[10px] font-black text-[#6BD85E] uppercase tracking-[0.2em] animate-pulse">Coming Soon!</span>
                        </div>
                    </div>

                    <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#6BD85E]" /> No Contracts
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#6BD85E]" /> Best Price Guarantee
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#6BD85E]" /> UK Live Prices
                        </div>
                    </div>
                </div>

                {/* Phone Mockup */}
                <div className="flex-1 relative w-full max-w-[400px] lg:max-w-none flex justify-center animate-fade-in opacity-0 [animation-delay:400ms]" style={{ animationFillMode: 'forwards' }}>

                    {/* Abstract Circle behind phone */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-[#6BD85E]/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

                    {/* Phone Frame */}
                    <div className="relative z-10 w-[300px] h-[600px] bg-black rounded-[40px] border-8 border-zinc-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[25px] w-[120px] bg-black rounded-b-2xl z-20" />

                        {/* Screen Content - Using Splash Screen Image as placeholder, usually map or home screen */}
                        <div className="w-full h-full bg-zinc-900 relative">
                            {/* Header in Mockup */}
                            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-center pt-4">
                                <div
                                    className="relative overflow-visible"
                                    style={{
                                        width: `${mobileLogoSize}px`,
                                        transform: `translate(${mobileLogoX}px, ${mobileLogoY}px)`
                                    }}
                                >
                                    <Image
                                        src="/images/official_logo.png"
                                        alt="GymSaver"
                                        width={120}
                                        height={32}
                                        className="w-full h-auto object-contain opacity-90 transition-opacity"
                                    />
                                </div>
                            </div>

                            {/* Gym Cards Mockup (High Fidelity representation) */}
                            <div className="pt-24 px-3 space-y-4">
                                {/* Card 1: PureGym */}
                                <div className="w-full h-36 bg-zinc-900/90 rounded-2xl flex overflow-hidden glass-card neon-glow-card group premium-lift relative">
                                    <div className="w-28 h-full relative shrink-0">
                                        <img
                                            src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=400"
                                            alt="App Preview"
                                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute top-2 left-2 bg-[#6BD85E] text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg">0.8 mi</div>
                                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[7px] font-bold px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-widest">Live</div>
                                    </div>
                                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-[#6BD85E] font-black text-[13px] leading-tight truncate tracking-tight">PureGym London</h4>
                                                <p className="text-[9px] text-slate-400 flex items-center gap-1 truncate font-medium mt-0.5">
                                                    <MapPin className="w-2.5 h-2.5 text-[#6BD85E]" /> Strand, WC2N
                                                </p>
                                            </div>
                                            <Bookmark className="w-3.5 h-3.5 text-slate-500 hover:text-[#6BD85E] transition-colors" />
                                        </div>
                                        <div className="flex items-center gap-2 mt-auto pb-2">
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10">
                                                <Star className="w-2.5 h-2.5 fill-[#6BD85E] text-[#6BD85E]" />
                                                <span className="text-[9px] font-bold text-white">4.5</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                                            <div className="flex items-baseline gap-0.5">
                                                <span className="text-[11px] font-black text-white">£24.99</span>
                                                <span className="text-[8px] text-slate-500 font-medium">/mo</span>
                                            </div>
                                            <div className="bg-[#6BD85E] text-black text-[9px] font-black px-2.5 py-1.5 rounded-xl shadow-lg hover:scale-105 transition-transform uppercase tracking-tighter">Sign Up</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2: The Gym Group */}
                                <div className="w-full h-36 bg-zinc-900/90 rounded-2xl flex overflow-hidden glass-card neon-glow-card relative">
                                    <div className="w-28 h-full relative shrink-0">
                                        <img
                                            src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=400"
                                            alt="App Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 left-2 bg-[#6BD85E] text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg">1.2 mi</div>
                                    </div>
                                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-[#6BD85E] font-black text-[13px] leading-tight truncate tracking-tight">The Gym Group</h4>
                                                <p className="text-[9px] text-slate-400 flex items-center gap-1 truncate font-medium mt-0.5">
                                                    <MapPin className="w-2.5 h-2.5 text-[#6BD85E]" /> Piccadilly, M1
                                                </p>
                                            </div>
                                            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                                        </div>
                                        <div className="flex items-center gap-2 mt-auto pb-2">
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10">
                                                <Star className="w-2.5 h-2.5 fill-[#6BD85E] text-[#6BD85E]" />
                                                <span className="text-[9px] font-bold text-white">4.2</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                                            <div className="flex items-baseline gap-0.5">
                                                <span className="text-[11px] font-black text-white">£19.99</span>
                                                <span className="text-[8px] text-slate-500 font-medium">/mo</span>
                                            </div>
                                            <div className="bg-[#6BD85E] text-black text-[9px] font-black px-2.5 py-1.5 rounded-xl shadow-lg uppercase tracking-tighter">Sign Up</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3: Virgin Active */}
                                <div className="w-full h-36 bg-zinc-900/90 rounded-2xl flex overflow-hidden glass-card neon-glow-card relative">
                                    <div className="w-28 h-full relative shrink-0">
                                        <img
                                            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400"
                                            alt="App Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 left-2 bg-[#6BD85E] text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg">2.1 mi</div>
                                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[7px] font-bold px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-widest">Live</div>
                                    </div>
                                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-[#6BD85E] font-black text-[13px] leading-tight truncate tracking-tight">Virgin Active</h4>
                                                <p className="text-[9px] text-slate-400 flex items-center gap-1 truncate font-medium mt-0.5">
                                                    <MapPin className="w-2.5 h-2.5 text-[#6BD85E]" /> Kensington, W8
                                                </p>
                                            </div>
                                            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                                        </div>
                                        <div className="flex items-center gap-2 mt-auto pb-2">
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10">
                                                <Star className="w-2.5 h-2.5 fill-[#6BD85E] text-[#6BD85E]" />
                                                <span className="text-[9px] font-bold text-white">4.8</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                                            <div className="flex items-baseline gap-0.5">
                                                <span className="text-[11px] font-black text-white">£79.99</span>
                                                <span className="text-[8px] text-slate-500 font-medium">/mo</span>
                                            </div>
                                            <div className="bg-[#6BD85E] text-black text-[9px] font-black px-2.5 py-1.5 rounded-xl shadow-lg uppercase tracking-tighter">Sign Up</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Nav Mockup */}
                            <div className="absolute bottom-0 left-0 w-full h-16 bg-black border-t border-white/10 flex justify-around items-center px-6">
                                <div className="w-6 h-6 rounded-full bg-[#6BD85E]" />
                                <div className="w-6 h-6 rounded-full bg-zinc-800" />
                                <div className="w-6 h-6 rounded-full bg-zinc-800" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="container mx-auto p-12 flex flex-col items-center gap-6 relative z-10 border-t border-white/5 bg-zinc-950/50">
                <div
                    className="relative overflow-visible"
                    style={{
                        width: `${footerLogoSize}px`,
                        transform: `translate(${footerLogoX}px, ${footerLogoY}px)`
                    }}
                >
                    <Image
                        src="/images/official_logo.png"
                        alt="GymSaver"
                        width={180}
                        height={48}
                        className="h-auto w-full object-contain opacity-90 hover:opacity-100 transition-opacity"
                    />
                </div>
                <div className="text-slate-600 text-sm">
                    © {new Date().getFullYear()} GymSaver. All rights reserved.
                </div>
            </footer>
            {/* Logo Size/Placement Control Box */}
            {showControls && (
                <div className="fixed bottom-6 right-6 bg-zinc-900/90 border border-white/10 p-5 rounded-2xl z-[100] text-xs space-y-4 backdrop-blur-xl shadow-2xl w-64 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2 font-black text-[#6BD85E] uppercase tracking-widest text-[10px]">
                            <Settings2 className="w-3.5 h-3.5" />
                            Logo Controls
                        </div>
                        <button onClick={() => setShowControls(false)} className="text-white/40 hover:text-white transition-colors">✕</button>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex p-1 bg-white/5 rounded-xl gap-1">
                        <button
                            onClick={() => setActiveTab('header')}
                            className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-[9px] ${activeTab === 'header' ? 'bg-[#6BD85E] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Header
                        </button>
                        <button
                            onClick={() => setActiveTab('footer')}
                            className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-[9px] ${activeTab === 'footer' ? 'bg-[#6BD85E] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Footer
                        </button>
                        <button
                            onClick={() => setActiveTab('mobile')}
                            className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-[9px] ${activeTab === 'mobile' ? 'bg-[#6BD85E] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Mobile
                        </button>
                    </div>

                    <div className="space-y-3">
                        {activeTab === 'header' && (
                            <>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-slate-400 font-bold uppercase tracking-tighter text-[9px]">
                                        <span>Width</span>
                                        <span className="text-white">{logoSize}px</span>
                                    </div>
                                    <input
                                        type="range" min="150" max="600" step="5"
                                        value={logoSize}
                                        onChange={(e) => setLogoSize(parseInt(e.target.value))}
                                        className="w-full accent-[#6BD85E] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-slate-400 font-bold uppercase tracking-tighter text-[9px]">
                                        <span>X Offset</span>
                                        <span className="text-white">{logoX}px</span>
                                    </div>
                                    <input
                                        type="range" min="-100" max="100" step="1"
                                        value={logoX}
                                        onChange={(e) => setLogoX(parseInt(e.target.value))}
                                        className="w-full accent-[#6BD85E] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-slate-400 font-bold uppercase tracking-tighter text-[9px]">
                                        <span>Y Offset</span>
                                        <span className="text-white">{logoY}px</span>
                                    </div>
                                    <input
                                        type="range" min="-50" max="50" step="1"
                                        value={logoY}
                                        onChange={(e) => setLogoY(parseInt(e.target.value))}
                                        className="w-full accent-[#6BD85E] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'footer' && (
                            <>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-slate-400 font-bold uppercase tracking-tighter text-[9px]">
                                        <span>Width</span>
                                        <span className="text-white">{footerLogoSize}px</span>
                                    </div>
                                    <input
                                        type="range" min="100" max="500" step="5"
                                        value={footerLogoSize}
                                        onChange={(e) => setFooterLogoSize(parseInt(e.target.value))}
                                        className="w-full accent-[#6BD85E] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-slate-400 font-bold uppercase tracking-tighter text-[9px]">
                                        <span>X Offset</span>
                                        <span className="text-white">{footerLogoX}px</span>
                                    </div>
                                    <input
                                        type="range" min="-100" max="100" step="1"
                                        value={footerLogoX}
                                        onChange={(e) => setFooterLogoX(parseInt(e.target.value))}
                                        className="w-full accent-[#6BD85E] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-slate-400 font-bold uppercase tracking-tighter text-[9px]">
                                        <span>Y Offset</span>
                                        <span className="text-white">{footerLogoY}px</span>
                                    </div>
                                    <input
                                        type="range" min="-100" max="100" step="1"
                                        value={footerLogoY}
                                        onChange={(e) => setFooterLogoY(parseInt(e.target.value))}
                                        className="w-full accent-[#6BD85E] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'mobile' && (
                            <>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-slate-400 font-bold uppercase tracking-tighter text-[9px]">
                                        <span>Width</span>
                                        <span className="text-white">{mobileLogoSize}px</span>
                                    </div>
                                    <input
                                        type="range" min="50" max="250" step="2"
                                        value={mobileLogoSize}
                                        onChange={(e) => setMobileLogoSize(parseInt(e.target.value))}
                                        className="w-full accent-[#6BD85E] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-slate-400 font-bold uppercase tracking-tighter text-[9px]">
                                        <span>X Offset</span>
                                        <span className="text-white">{mobileLogoX}px</span>
                                    </div>
                                    <input
                                        type="range" min="-100" max="100" step="1"
                                        value={mobileLogoX}
                                        onChange={(e) => setMobileLogoX(parseInt(e.target.value))}
                                        className="w-full accent-[#6BD85E] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-slate-400 font-bold uppercase tracking-tighter text-[9px]">
                                        <span>Y Offset</span>
                                        <span className="text-white">{mobileLogoY}px</span>
                                    </div>
                                    <input
                                        type="range" min="-30" max="30" step="1"
                                        value={mobileLogoY}
                                        onChange={(e) => setMobileLogoY(parseInt(e.target.value))}
                                        className="w-full accent-[#6BD85E] opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="bg-white/5 rounded-lg p-2 text-[8px] text-slate-500 font-medium leading-tight">
                        Switch tabs to tweak any logo placement. Then, share the values with me!
                    </div>
                </div>
            )}
        </div>
    )
}
