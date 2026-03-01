"use client"

import { useEffect } from "react"
import { getApiBaseUrl } from "@/lib/api-env"

export function AnalysisChecker() {
    useEffect(() => {
        // Only run in development
        if (process.env.NODE_ENV === "production") return

        console.log("🛠️ Starting Startup Analysis Check...")

        const checkAnalysis = async () => {
            try {
                const baseUrl = getApiBaseUrl();
                const res = await fetch(`${baseUrl}/api/debug/analyze`)
                const data = await res.json()

                if (data.success) {
                    console.log("✅ Startup Analysis Clean:", data.output)
                    if (data.output.includes("❌") || data.output.includes("⚠️")) {
                        console.warn("⚠️ Analysis detected potential issues. Check console for details.")
                    }
                } else {
                    console.warn("Startup Analysis skipped or failed:", data.error)
                }
            } catch (err) {
                // Silently fail in production or restricted environments
                if (process.env.NODE_ENV !== "production") {
                    console.warn("Connection to Analysis API failed:", err)
                }
            }
        }

        checkAnalysis()
    }, [])

    return null // Headless component
}
