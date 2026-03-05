"use client"

import React, { forwardRef, useState, useEffect } from "react"
import { MapPin, Star, BookmarkCheck, Share2, Info, Instagram } from "lucide-react"
import { Gym, getGymPrice } from "@/lib/gym-utils"

interface ShareableGymCardProps {
    gym: Gym
    resolvedPhotoUrl: string
    isFetchingPhotoUrl?: boolean
    onImageLoaded?: () => void
    format?: "story" | "post" | "square"
}

export const ShareableGymCard = forwardRef<HTMLDivElement, ShareableGymCardProps>(({ gym, resolvedPhotoUrl, isFetchingPhotoUrl, onImageLoaded, format = "square" }, ref) => {
    const price = getGymPrice(gym)
    const [base64Image, setBase64Image] = useState<string | null>(null)

    useEffect(() => {
        if (isFetchingPhotoUrl) return;

        const urlToFetch = resolvedPhotoUrl || "/placeholder-gym.jpg"
        if (!urlToFetch.startsWith('http')) {
            setBase64Image(urlToFetch)
            onImageLoaded?.()
            return
        }

        // We use our internal server-side proxy to fetch the external image, completely bypassing 
        // strict browser CORS policies that block standard client-side base64 canvas drawing.
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(urlToFetch)}`

        fetch(proxyUrl)
            .then(res => {
                if (!res.ok) throw new Error("Proxy fetch failed")
                return res.blob()
            })
            .then(blob => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setBase64Image(reader.result as string)
                    onImageLoaded?.()
                }
                reader.readAsDataURL(blob)
            })
            .catch(err => {
                console.error("Failed to fetch image via proxy:", err)
                setBase64Image("/placeholder-gym.jpg")
                onImageLoaded?.()
            })
    }, [resolvedPhotoUrl, isFetchingPhotoUrl])

    // Define dimensions based on format
    const getDimensions = () => {
        switch (format) {
            case "story": return { width: 1080, height: 1920 }
            case "post": return { width: 1080, height: 1350 }
            case "square": return { width: 1080, height: 1080 }
            default: return { width: 1080, height: 1080 }
        }
    }

    const { width, height } = getDimensions()

    return (
        <div
            ref={ref}
            className={`flex flex-col relative overflow-hidden ${format === 'square' ? 'justify-center' : ''}`}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor: '#0A0A0A', // Deep charcoal black
                fontFamily: 'Inter, system-ui, sans-serif'
            }}
        >
            {/* Top Half: Massive Full-Bleed Gym Image (Hidden on Square) */}
            {format !== "square" && (
                <div
                    className="w-full relative shrink-0"
                    style={{
                        height: format === 'story' ? '1200px' : '650px',
                        backgroundColor: '#18181B',
                        borderBottom: '6px solid #6BD85E'
                    }}
                >
                    {base64Image ? (
                        <img
                            src={base64Image as string}
                            alt={gym.name}
                            className="block w-full h-full object-cover object-center relative z-0"
                        />
                    ) : (
                        <div className="block w-full h-full relative z-0" style={{ backgroundColor: '#0F172A' }} />
                    )}

                    {/* Subtle top gradient for logo visibility if needed */}
                    <div className="absolute inset-x-0 top-0 h-40 z-10" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }} />
                </div>
            )}

            {/* Bottom Half: Concept 3 Sleek Dark Layout */}
            <div className={`flex-1 w-full p-12 flex flex-col justify-between relative z-10 ${format === 'square' ? 'h-full' : ''}`} style={{ backgroundColor: '#0A0A0A' }}>

                {/* Main Content Area: Title on Left, Stars on Right */}
                <div className="flex justify-between items-start gap-8 w-full mt-8">

                    {/* Left Side: Massive Title */}
                    <div className="flex flex-col gap-4 flex-1 max-w-[65%]">
                        <h3 className="font-black leading-[1.1] tracking-tighter uppercase break-words" style={{ color: '#6BD85E', fontSize: format === 'square' ? '5rem' : '4rem' }}>
                            {gym.name}
                        </h3>
                        {gym.address && (
                            <p className="text-[2.2rem] font-medium mt-2 flex items-center gap-3" style={{ color: '#A3A3A3' }}>
                                <MapPin className="h-8 w-8 shrink-0" style={{ color: '#6BD85E' }} />
                                <span className="truncate">{gym.address}</span>
                            </p>
                        )}
                    </div>

                    {/* Right Side: Ratings */}
                    <div className="flex flex-col items-end gap-3 shrink-0 pt-4">
                        {gym.user_ratings_total !== undefined && gym.user_ratings_total > 0 && (
                            <>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((_, i) => (
                                        <Star key={i} className="h-12 w-12" style={{ fill: '#6BD85E', color: '#6BD85E' }} />
                                    ))}
                                </div>
                                <div className="text-[2.2rem] font-bold tracking-wide mt-2" style={{ color: '#FFFFFF' }}>
                                    {gym.rating.toFixed(1)} <span style={{ color: '#D4D4D4', fontWeight: '500' }}>({gym.user_ratings_total} Reviews)</span>
                                </div>
                            </>
                        )}
                        <div className="text-[1.8rem] font-medium tracking-wide mt-1" style={{ color: '#737373' }}>
                            {gym.type || 'Top-Rated Gym'}
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Price Pill & 24/7/Deal info */}
                <div className="flex items-end justify-between w-full pb-8">

                    {/* Concept 3 Vibrant Price Pill & Social Info */}
                    <div className="flex flex-col gap-4 items-start">
                        <div className="flex items-center justify-center rounded-[2.5rem] px-12 py-8" style={{ backgroundColor: '#6BD85E', boxShadow: '0 10px 40px rgba(107, 216, 94, 0.4)' }}>
                            <div className="flex items-center gap-4">
                                <BookmarkCheck className="h-14 w-14" style={{ color: '#000000' }} />
                                <div className="flex items-baseline gap-2">
                                    <span className="font-black leading-none tracking-tighter" style={{ color: '#000000', fontSize: format === 'square' ? '8rem' : '6.5rem' }}>
                                        {price.monthly !== undefined ? `£${price.monthly?.toFixed(2)}` : "TBC"}
                                    </span>
                                    {price.monthly !== undefined && (
                                        <span className="text-[4rem] font-black" style={{ color: '#000000' }}>/mo</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Instagram Branding */}
                        <div className="flex items-center gap-3 pl-4 mt-2">
                            <Instagram className="h-10 w-10 text-white" />
                            <span className="text-[3rem] font-bold tracking-wide" style={{ color: '#FFFFFF' }}>@GymsaverHQ</span>
                        </div>
                    </div>

                    {/* Extra details on right bottom */}
                    <div className="flex flex-col items-end gap-6 pb-2">
                        {(gym.is_24hr || gym.name.toLowerCase().includes("24") || gym.name.toLowerCase().includes("puregym") || gym.name.toLowerCase().includes("jd gyms") || gym.name.toLowerCase().includes("anytime")) && (
                            <span className="text-[2.2rem] font-black px-8 py-3 rounded-full uppercase tracking-widest border-[3px]" style={{ borderColor: '#6BD85E', color: '#6BD85E' }}>
                                24/7
                            </span>
                        )}
                        {gym.latestOffer && typeof gym.latestOffer === "string" && !gym.latestOffer?.toLowerCase().includes("coming soon") && (
                            <span className="text-[2.5rem] font-black tracking-wide" style={{ color: '#FACC15' }}>
                                🔥 {gym.latestOffer}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
})

ShareableGymCard.displayName = "ShareableGymCard"
