"use client"

import SignUpForm from "@/components/auth/SignUpForm"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShieldCheck, Zap, Bell, Star } from "lucide-react"

export default function SignUpPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#6BD85E]/10 blur-[120px] rounded-full opacity-30 pointer-events-none" />

            <Button
                variant="ghost"
                className="absolute top-4 left-4 text-slate-400 hover:text-white hover:bg-white/10 z-10"
                onClick={() => router.push('/')}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Home
            </Button>

            <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center mt-16 md:mt-0 relative z-10">
                {/* Branding / Benefits Side */}
                <div className="space-y-8 hidden md:block">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6BD85E]/10 border border-[#6BD85E]/20 text-xs font-semibold text-[#6BD85E]">
                        <Zap className="h-3.5 w-3.5" />
                        Beta Access
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                            Start Saving with <br />
                            <span className="text-[#6BD85E] neon-text">GymSaver App</span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed max-w-md">
                            Create your account to unlock personalized gym mapping, price tracking, and exclusive membership deals.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {[
                            { icon: ShieldCheck, text: "Secure price verification", color: "text-blue-400" },
                            { icon: Bell, text: "Real-time deal alerts", color: "text-orange-400" },
                            { icon: Star, text: "Save your favorite gyms", color: "text-yellow-400" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className={`h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors`}>
                                    <item.icon className={`h-5 w-5 ${item.color}`} />
                                </div>
                                <span className="text-slate-200 font-medium">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Side */}
                <SignUpForm />
            </div>

            <footer className="mt-20 text-slate-500 text-xs text-center border-t border-white/5 pt-8 w-full max-w-5xl opacity-50">
                © {new Date().getFullYear()} GymSaver App. All rights reserved.
            </footer>
        </div>
    )
}
