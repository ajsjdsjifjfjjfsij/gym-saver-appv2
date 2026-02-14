"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"

export const SplashScreen = () => {
    const [isVisible, setIsVisible] = useState(true)
    const [shouldRender, setShouldRender] = useState(true)

    useEffect(() => {
        // Minimum 4 seconds duration as requested, set to 5s for premium feel
        const timer = setTimeout(() => {
            setIsVisible(false)
        }, 5000)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!isVisible) {
            const timer = setTimeout(() => {
                setShouldRender(false)
            }, 1500) // Slower fade out for premium feel
            return () => clearTimeout(timer)
        }
    }, [isVisible])

    if (!shouldRender) return null

    return (
        <div
            className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-[1500ms] ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            <div className="relative animate-fade-in flex flex-col items-center gap-8 px-4">
                <div
                    className="relative w-48 h-32 sm:w-80 sm:h-52 drop-shadow-[0_0_35px_rgba(74,222,128,0.3)]"
                    style={{ transform: "translate(-15px, 50px)" }}
                >
                    <Image
                        src="/images/gymsaver_logo_new.png"
                        alt="GymSaver Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                {/* Loading Spinner - Perfectly Centered via Flexbox */}
                <div className="flex items-center justify-center">
                    <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-[#6BD85E] animate-spin" strokeWidth={2} />
                </div>
            </div>
        </div>
    )
}
