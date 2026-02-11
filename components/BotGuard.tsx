"use client"

import React, { useEffect, useState } from "react"
import { isBot } from "@/lib/bot-detection"
import { ShieldAlert, Loader2 } from "lucide-react"

interface BotGuardProps {
    children: React.ReactNode;
    serverBotDetected?: boolean;
}

export const BotGuard = ({ children, serverBotDetected = false }: BotGuardProps) => {
    const [isBlocked, setIsBlocked] = useState<boolean | null>(null)

    useEffect(() => {
        // 0. If server already detected a bot, immediately unblock
        // This is a safety catch in case the layout rendered us but think it's a bot
        // though logic usually skips BotGuard entirely if serverBotDetected is true.
        if (serverBotDetected) {
            console.log("🛡️ BotGuard: Server bypass signal received.")
            setIsBlocked(false)
            return
        }

        // 1. Check persistent block
        if (typeof window !== 'undefined' && localStorage.getItem('gs_security_blocked') === 'true') {
            setIsBlocked(true)
            return
        }

        // 2. Run heuristics
        if (isBot()) {
            console.warn("🛡️ BotGuard: Bot detected!", { userAgent: navigator.userAgent })
            setIsBlocked(true)
        } else {
            console.log("🛡️ BotGuard: User verified.")
            setIsBlocked(false)
        }
    }, [serverBotDetected])

    if (isBlocked === true) {
        return (
            <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center text-center px-6 selection:bg-red-500/30">
                <div className="flex flex-col items-center gap-6 max-w-md animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                        <ShieldAlert className="w-12 h-12 text-red-500" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Security Verification</h2>
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                        <p className="text-slate-400 text-sm leading-relaxed font-light">
                            Access to GymSaver has been restricted. Automated tools, headless browser heuristics, or suspicious environment markers were detected.
                            <br /><br />
                            Our systems prioritize platform integrity. If you believe this is a collective error, please try again from a standard, verified browser.
                        </p>
                    </div>
                    <div className="pt-4">
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Error Code: GS_SEC_BOT_01</p>
                    </div>
                </div>
            </div>
        )
    }

    // While detecting, we can either show a loader or just nothing
    if (isBlocked === null) {
        return (
            <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin opacity-20" />
            </div>
        )
    }

    return <>{children}</>
}
