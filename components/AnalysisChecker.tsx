"use client"

import { useEffect } from "react"

export function AnalysisChecker() {
    useEffect(() => {
        // Only run in development
        if (process.env.NODE_ENV === "production") return

        console.log("🛠️ Starting Startup Analysis Check...")

        const checkAnalysis = async () => {
            try {
                const res = await fetch("/api/debug/analyze")
                const data = await res.json()

                if (data.success) {
                    console.log("✅ Startup Analysis Clean:", data.output)
                    if (data.output.includes("❌") || data.output.includes("⚠️")) {
                        console.warn("⚠️ Analysis detected potential issues. Check console for details.")
                    }
                } else {
                    console.error("❌ Startup Analysis Failed:", data.error)
                }
            } catch (err) {
                console.error("🚫 Connection to Analysis API failed:", err)
            }
        }

        checkAnalysis()
    }, [])

    return null // Headless component
}
