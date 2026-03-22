"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ExternalLink, MapPin, Search } from "lucide-react"

export default function AdvertisePage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [adType, setAdType] = useState("")
    const [message, setMessage] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        const subject = encodeURIComponent(`New Advertisement Enquiry from ${name}`)
        const body = encodeURIComponent(
            `Name: ${name}\n` +
            `Type of Advertisement: ${adType}\n\n` +
            `Further Information:\n${message}`
        )
        
        window.location.href = `mailto:admin@gymsaverapp.com?subject=${subject}&body=${body}`
    }

    return (
        <div className="min-h-screen bg-black text-white relative">
            
            {/* Navigation Bar Header (Matches site aesthetics) */}
            <nav className="sticky top-0 w-full z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        className="text-slate-400 hover:text-white hover:bg-white/10 -ml-4"
                        onClick={() => router.push('/')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Button>
                    <div className="font-bold text-xl tracking-tight hidden md:block text-[#6BD85E]">
                        GymSaver Advertising
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-16 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-[#6BD85E]/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />
                
                <div className="container max-w-5xl mx-auto px-6 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent pb-2">
                        Reach Local Audiences <br/>
                        <span className="text-[#6BD85E]">Where They Sweat.</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        We currently offer highly targeted local advertisement placements across the UK directly within GymSaver's interactive gym cards. Put your business in front of thousands of active residents in your area.
                    </p>
                </div>
            </section>

            {/* Core Content Grid */}
            <section className="container max-w-6xl mx-auto px-6 pb-24 relative z-10">
                <div className="grid lg:grid-cols-5 gap-12 items-start">
                    
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="bg-black/80 border border-white/10 neon-glow-card shadow-[0_0_20px_rgba(107,216,94,0.1)]">
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-2xl font-bold text-[#6BD85E]">Enquire About Placements</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Fill out the details below and we will get back to you with availability and pricing to supercharge your local sales.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-white">Name or Company Name *</Label>
                                        <Input
                                            id="name"
                                            required
                                            className="bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E]"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type" className="text-white">Type of Advertisement *</Label>
                                        <Input
                                            id="type"
                                            placeholder="e.g. Local Supplement Store, PT Services"
                                            required
                                            className="bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E]"
                                            value={adType}
                                            onChange={(e) => setAdType(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message" className="text-white">Further Information</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Target locations, duration, or any questions please leave here..."
                                            className="min-h-[120px] bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E]"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold h-12 text-lg">
                                        Submit Enquiry
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Visual Preview */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-full bg-[#6BD85E]/20 flex items-center justify-center">
                                    <Search className="h-5 w-5 text-[#6BD85E]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Unbeatable Visibility</h3>
                                    <p className="text-sm text-slate-400">Your ad is positioned elegantly within local search results.</p>
                                </div>
                            </div>
                            
                            <div className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3 pl-2">Preview: How users see your ad</div>
                            
                            {/* Advertisement Card Mockup */}
                            <div className="group relative overflow-hidden rounded-2xl transition-all duration-500 flex flex-col sm:flex-row h-auto sm:h-40 neon-glow-card ring-1 ring-[#6BD85E]/50 bg-gradient-to-r from-[#6BD85E]/10 to-transparent">
                                {/* AD TAG overlay */}
                                <div className="absolute top-0 right-0 z-30 px-3 py-1 bg-[#6BD85E] text-black font-black text-[10px] uppercase tracking-widest rounded-bl-xl shadow-lg">
                                    Advertisement
                                </div>

                                <div className="w-full h-48 sm:h-full sm:w-64 shrink-0 relative bg-slate-900 sm:rounded-l-2xl rounded-t-2xl sm:rounded-tr-none border-b sm:border-r sm:border-b-0 border-[#6BD85E]/20 overflow-hidden z-20 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent z-10"></div>
                                    <img src="https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover block sm:rounded-l-2xl rounded-t-2xl sm:rounded-tr-none grayscale opacity-60 mix-blend-overlay" />
                                    <div className="z-20 text-center px-4">
                                        <h4 className="font-black text-2xl text-white tracking-widest">YOUR<br/><span className="text-[#6BD85E]">BRAND</span></h4>
                                    </div>
                                </div>
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
                                        <span className="text-[11px] text-slate-300">
                                            A short description of why users should visit your business today.
                                        </span>
                                    </div>
                                    <div className="flex flex-col pt-2 border-t border-white/5 space-y-2 mt-auto">
                                        <div className="flex items-center justify-end">
                                            <Button variant="default" size="sm" className="bg-[#6BD85E] hover:bg-[#5bc250] text-black font-black h-8 px-4 rounded-xl shadow-[0_0_15px_rgba(107,216,94,0.3)] hover:shadow-[0_0_20px_rgba(107,216,94,0.5)] transition-all uppercase text-[11px] tracking-tight gap-2 pointer-events-none">
                                                Learn More <ExternalLink className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-black/50 border border-white/5">
                                    <h4 className="text-[#6BD85E] font-bold text-lg mb-1">Targeting</h4>
                                    <p className="text-sm text-slate-400">Pinpoint specific cities or regions where your potential customers are looking for gyms.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-black/50 border border-white/5">
                                    <h4 className="text-[#6BD85E] font-bold text-lg mb-1">Engagement</h4>
                                    <p className="text-sm text-slate-400">Our native ad format integrates seamlessly, resulting in higher CTR than standard banners.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
