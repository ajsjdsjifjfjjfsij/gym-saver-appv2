"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function AffiliatePage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Affiliate Form Submitted:", { name, email, message })
        setSubmitted(true)
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative">
            <Button
                variant="ghost"
                className="absolute top-4 left-4 text-slate-400 hover:text-white hover:bg-white/10"
                onClick={() => router.push('/')}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Home
            </Button>

            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center mt-12 md:mt-0">
                {/* Information Side */}
                <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Partner with <span className="text-[#6BD85E]">GymSaver</span>
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        Join our partnership network and help us build the future of fitness discovery in the UK. We're looking for strategic partners to grow and earn together.
                    </p>
                    <ul className="space-y-4">
                        {[
                            "Brand exposure to thousands of active gym seekers",
                            "Qualified traffic generation for your fitness business",
                            "Early access to innovative search & comparison tools",
                            "Flexible partnership models for long-term revenue"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-200">
                                <div className="h-2 w-2 rounded-full bg-[#6BD85E]" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Form Side */}
                <Card className="bg-zinc-950 border-white/10 shadow-[0_0_30px_rgba(107,216,94,0.15)]">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-white">Partner With Us</CardTitle>
                        <CardDescription className="text-slate-400">
                            Tell us about your platform and your vision for a partnership.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-white">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Your Name"
                                        required
                                        className="bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E]"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-white">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        required
                                        className="bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E]"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message" className="text-white">Partnership Proposal</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Tell us about yourself..."
                                        required
                                        className="min-h-[100px] bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E]"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold h-12">
                                    Submit Application
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center py-10 space-y-4">
                                <div className="h-16 w-16 bg-[#6BD85E]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#6BD85E]/30 shadow-[0_0_20px_rgba(107,216,94,0.2)]">
                                    <span className="text-[#6BD85E] text-2xl font-bold">✓</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white">Application Sent!</h3>
                                <p className="text-slate-400">
                                    Thank you for your interest. Our team will review your application and get back to you within 48 hours.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-6 border-white/10 text-white hover:bg-white/10 hover:text-white"
                                    onClick={() => setSubmitted(false)}
                                >
                                    Submit Another
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <footer className="mt-20 border-t border-white/5 pt-8 w-full max-w-4xl flex flex-col items-center gap-6">
                <div
                    className="relative overflow-visible"
                    style={{
                        width: '180px',
                        transform: 'translate(-32px, 0px)'
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
                <div className="text-slate-500 text-xs text-center">
                    © {new Date().getFullYear()} GymSaver Partnerships. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
