"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2, Target, Zap, TrendingUp, Mail, ShieldCheck, Sparkles, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function OffersPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        gymName: "",
        location: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call and "email" sending
        console.log("Partner Application Submitted:", formData)

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        setLoading(false)
        setSubmitted(true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-[#6BD85E]/30 relative overflow-hidden">
            {/* Abstract Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6BD85E]/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#6BD85E]/5 blur-[100px] rounded-full pointer-events-none" />

            <Header
                variant="app"
                searchQuery=""
                onSearchChange={() => { }}
                savedCount={0}
                onToggleSavedView={() => { }}
                showSavedOnly={false}
                onAuthRequired={() => router.push("/login")}
            />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
                <div className="flex flex-col items-center text-center mb-16 space-y-6">
                    <div className="relative h-24 w-80 mb-4 transition-transform duration-700 hover:scale-105">
                        <Image
                            src="/images/gymsaver_logo_new.png"
                            alt="GymSaver App"
                            fill
                            className="object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        />
                    </div>

                    <div className="space-y-4 max-w-3xl">
                        <Badge className="bg-[#6BD85E]/10 text-[#6BD85E] border border-[#6BD85E]/20 font-black uppercase tracking-[0.2em] text-[10px] px-6 py-2 rounded-full backdrop-blur-md">
                            Exclusive Business Partner Program
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white">
                            Gym Partner <span className="text-[#6BD85E]">Package</span>
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-[#6BD85E] animate-pulse">
                            <AlertCircle className="h-5 w-5" />
                            <p className="text-lg font-black uppercase tracking-widest italic">Limited Spaces Available</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Value Proposition */}
                    <div className="grid gap-4">
                        {[
                            {
                                icon: Target,
                                title: "Priority Featured Placement",
                                desc: "Dominate your local market. Appear at the top of results for your specific area.",
                                accent: "border-[#6BD85E]/30 bg-[#6BD85E]/5"
                            },
                            {
                                icon: TrendingUp,
                                title: "Direct Member Conversion",
                                desc: "Transform app traffic into active memberships with a direct, high-intent link pipeline.",
                                accent: "border-blue-500/30 bg-blue-500/5"
                            },
                            {
                                icon: ShieldCheck,
                                title: "Verified Partner Status",
                                desc: "Stand out with exclusive branding that signals trust and quality to every user.",
                                accent: "border-purple-500/30 bg-purple-500/5"
                            }
                        ].map((item, i) => (
                            <div key={i} className={`p-8 rounded-[2rem] border ${item.accent} backdrop-blur-xl transition-all hover:scale-[1.02] duration-500 shadow-2xl`}>
                                <div className="flex gap-6 items-start">
                                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                                        <item.icon className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">{item.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Application Form */}
                    <Card className="bg-white/5 backdrop-blur-3xl border-white/10 rounded-[2.5rem] p-4 shadow-2xl relative group h-full">
                        <div className="absolute top-0 right-10 -translate-y-1/2">
                            <div className="bg-[#6BD85E] text-black text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg scale-110">
                                <Sparkles className="h-3 w-3" />
                                APPLY NOW
                            </div>
                        </div>

                        <CardHeader className="text-center pb-8 pt-8 px-8">
                            <CardTitle className="text-3xl font-black text-white uppercase tracking-tight">Become a Partner</CardTitle>
                            <CardDescription className="text-slate-400 text-base">
                                Join our network of elite fitness providers and start growing your membership base today.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            {!submitted ? (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Your Name</Label>
                                            <Input
                                                id="name"
                                                required
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="h-14 bg-black/40 border-white/10 rounded-2xl focus:ring-[#6BD85E] focus:border-[#6BD85E] transition-all text-white placeholder:text-zinc-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Work Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                placeholder="john@gym.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="h-14 bg-black/40 border-white/10 rounded-2xl focus:ring-[#6BD85E] focus:border-[#6BD85E] transition-all text-white placeholder:text-zinc-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gymName" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gym / Brand Name</Label>
                                        <Input
                                            id="gymName"
                                            required
                                            placeholder="e.g. PureGym London"
                                            value={formData.gymName}
                                            onChange={handleChange}
                                            className="h-14 bg-black/40 border-white/10 rounded-2xl focus:ring-[#6BD85E] focus:border-[#6BD85E] transition-all text-white placeholder:text-zinc-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Location</Label>
                                        <Input
                                            id="location"
                                            required
                                            placeholder="City, District or Postcode"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="h-14 bg-black/40 border-white/10 rounded-2xl focus:ring-[#6BD85E] focus:border-[#6BD85E] transition-all text-white placeholder:text-zinc-700"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-16 bg-[#6BD85E] hover:bg-[#5bc250] text-black font-black text-xl rounded-2.5xl shadow-[0_0_30px_rgba(107,216,94,0.3)] transition-all flex items-center justify-center gap-2 group mt-4 uppercase tracking-tighter"
                                    >
                                        {loading ? (
                                            <>
                                                <Zap className="h-5 w-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Submit Application
                                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <div className="text-center space-y-8 py-10">
                                    <div className="h-24 w-24 bg-[#6BD85E] rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(107,216,94,0.4)]">
                                        <Mail className="h-10 w-10 text-black" />
                                    </div>
                                    <div className="space-y-3">
                                        <h2 className="text-3xl font-black text-white uppercase italic">Application Pending</h2>
                                        <p className="text-slate-400 leading-relaxed text-sm">
                                            Our partner success team will review your application and reach out within 24 hours to discuss the package details.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => router.push("/search")}
                                        className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl transition-all uppercase tracking-widest text-xs"
                                    >
                                        Return to App
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            <footer className="border-t border-white/5 py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="relative h-8 w-32 opacity-30 grayscale hover:grayscale-0 transition-all cursor-pointer">
                        <Image src="/images/gymsaver_header_logo.png" alt="GymSaver" fill className="object-contain" />
                    </div>
                    <div className="flex gap-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        <Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Support Center</Link>
                        <Link href="/affiliate" className="hover:text-white transition-colors">Affiliate HUB</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
