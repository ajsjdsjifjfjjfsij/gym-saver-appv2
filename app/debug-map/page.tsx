"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function DebugMapPage() {
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<string>("Initializing...")
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    useEffect(() => {
        if (!apiKey) {
            setError("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing from environment.")
            return
        }

        const loadMap = () => {
            setStatus("Loading Google Maps script...")
            const script = document.createElement("script")
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initDebugMap`
            script.async = true
            script.defer = true

            script.onerror = () => {
                setError("Failed to load Google Maps script. Check your network or API key.")
            }

            (window as any).initDebugMap = () => {
                setStatus("Script loaded. Initializing map...")
                try {
                    const mapDiv = document.getElementById("debug-map")
                    if (mapDiv) {
                        new google.maps.Map(mapDiv, {
                            center: { lat: 51.5074, lng: -0.1278 },
                            zoom: 10,
                        })
                        setStatus("Map initialized successfully! ✅")
                    }
                } catch (e: any) {
                    setError(`Map initialization failed: ${e.message}`)
                }
            }

            document.head.appendChild(script)
        }

        loadMap()

        // Monitor for Google Maps global errors
        const originalConsoleError = console.error
        console.error = (...args) => {
            if (args[0] && typeof args[0] === 'string' && args[0].includes('Google Maps JavaScript API error')) {
                setError(args[0])
            }
            originalConsoleError.apply(console, args)
        }

        return () => {
            console.error = originalConsoleError
        }
    }, [apiKey])

    return (
        <div className="p-8 space-y-4 bg-slate-900 min-h-screen text-white">
            <h1 className="text-2xl font-bold text-[#6BD85E]">Google Maps Debugger</h1>

            <div className="bg-slate-800 p-4 rounded-xl border border-white/10">
                <p className="font-mono text-sm">API Key: {apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}` : "MISSING"}</p>
                <p className="mt-2">Status: <span className="text-yellow-400">{status}</span></p>
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-500 p-4 rounded-xl text-red-200">
                    <h2 className="font-bold">Error Detected:</h2>
                    <p className="font-mono text-sm whitespace-pre-wrap mt-2">{error}</p>
                    <div className="mt-4 p-3 bg-black/40 rounded border border-red-500/30 text-xs">
                        <p><strong>Common Fixes:</strong></p>
                        <ul className="list-disc ml-4 mt-1 space-y-1">
                            <li><strong>RefererNotAllowedMapError:</strong> Add your current domain (e.g. localhost:3000) to the API Key restrictions in Google Console.</li>
                            <li><strong>ApiNotActivatedMapError:</strong> Enable "Maps JavaScript API" in Google Cloud Console.</li>
                            <li><strong>InvalidKeyMapError:</strong> Double check the key string.</li>
                        </ul>
                    </div>
                </div>
            )}

            <div id="debug-map" className="w-full h-[400px] bg-slate-800 rounded-2xl border border-white/10 flex items-center justify-center">
                {!error && status !== "Map initialized successfully! ✅" && <p>Map should appear here...</p>}
            </div>

            <div className="flex gap-4">
                <Button onClick={() => window.location.reload()} className="bg-white/10 hover:bg-white/20">Reload Test</Button>
                <Button onClick={() => window.location.href = '/'} className="bg-[#6BD85E] text-black font-bold">Back to App</Button>
            </div>
        </div>
    )
}
