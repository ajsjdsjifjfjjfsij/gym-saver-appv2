"use client"

import { Button } from "@/components/ui/button"
import { Star, MapPin, Bookmark, BookmarkCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthContext"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { GymPrice } from "@/hooks/useGymPrices"
import { getGymPrice } from "@/lib/gym-utils"


interface Gym {
  id: string
  name: string
  address: string
  rating: number
  type: string
  priceLevel: string
  lat: number
  lng: number
  distance?: number
  photo_reference?: string
  photos?: string[]
  website?: string
  latestOffer?: string
  user_ratings_total?: number
  googleMapsUri?: string
}

interface GymCardProps {
  gym: Gym
  isSelected: boolean // This refers to the map selection, maybe rename to 'isActive' for clarity if needed, but keeping for now
  isSaved: boolean
  isCompared?: boolean // New prop
  onSelect: () => void
  onToggleSave: () => void
  onToggleCompare?: () => void // New prop
  onAuthRequired?: () => void
  livePrice?: GymPrice
}

export function GymCard({ gym, isSelected, isSaved, isCompared, onSelect, onToggleSave, onToggleCompare, onAuthRequired, livePrice }: GymCardProps) {
  // DEBUG: Inspect props
  console.log(`[GymCard Debug] Gym: ${gym.name} (${gym.id}) | Price Level: ${gym.priceLevel} | Live Price:`, livePrice);

  const { user } = useAuth()
  const router = useRouter()
  const [api, setApi] = useState<any>()
  const [isHovered, setIsHovered] = useState(false)

  // Autoplay on Hover Logic
  useEffect(() => {
    if (!api || !isHovered) return

    const intervalId = setInterval(() => {
      api.scrollNext()
    }, 1500) // Change slide every 1.5 seconds on hover

    return () => clearInterval(intervalId)
  }, [api, isHovered])

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired()
      } else {
        router.push("/signup")
      }
      return
    }
    onToggleSave()
  }

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleCompare) {
      onToggleCompare()
    }
  }

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired()
      } else {
        router.push("/signup")
      }
      return
    }

    if (gym.website) {
      window.open(gym.website, '_blank')
    } else {
      console.log("No website available for", gym.name)
    }
  }

  return (
    <div
      id={`gym-card-${gym.id}`}
      className={`
        group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer flex flex-col sm:flex-row h-auto sm:h-40
        premium-lift
        ${isSelected
          ? "ring-2 ring-primary neon-glow-card scale-[1.01] bg-white/10"
          : "neon-glow-card glass-card scale-100"
        }
        ${isCompared ? "ring-2 ring-blue-500 bg-blue-500/10" : ""} 
      `}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Tick Overlay */}
      {isCompared && (
        <div className="absolute top-0 right-0 z-20 p-1 bg-blue-500 rounded-bl-xl shadow-lg">
          <BookmarkCheck className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Gym Image - Left Side / Top on Mobile */}
      <div className="w-full h-48 sm:h-full sm:w-64 shrink-0 relative bg-black/50 overflow-hidden sm:border-r border-b sm:border-b-0 border-white/10">
        {(gym.photos && gym.photos.length > 0) ? (
          <Carousel setApi={setApi} className="w-full h-full" opts={{ loop: true }}>
            <CarouselContent className="ml-0 h-full">
              {gym.photos.map((photo, index) => (
                <CarouselItem key={index} className="pl-0 h-full w-full">
                  <img
                    src={photo.startsWith("http")
                      ? photo
                      : `https://places.googleapis.com/v1/${photo}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&maxHeightPx=800&maxWidthPx=800`
                    }
                    alt={`${gym.name} - Photo ${index + 1}`}
                    className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-110"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : gym.photo_reference ? (
          <img
            src={gym.photo_reference?.startsWith("http")
              ? gym.photo_reference
              : `https://places.googleapis.com/v1/${gym.photo_reference}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&maxHeightPx=800&maxWidthPx=800`
            }
            alt={gym.name}
            className="absolute inset-0 w-full h-full object-cover block"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 bg-zinc-900">
            <span className="text-xs">No Image</span>
          </div>
        )}

        {/* Floating Save Button */}
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          {gym.distance !== undefined && (
            <span className="text-[10px] font-bold text-black bg-[#6BD85E] px-2 py-0.5 rounded-full shadow-lg">
              {gym.distance.toFixed(1)} mi
            </span>
          )}
        </div>
      </div>

      {/* Main Info - Right Side */}
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <h3 className="font-bold text-xl sm:text-lg leading-tight truncate text-[#6BD85E] group-hover:scale-[1.01] origin-left transition-transform tracking-wide">
              {gym.name}
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate font-light italic">
              <MapPin className="h-3 w-3 shrink-0" />
              {gym.address}
            </p>
            {gym.latestOffer && (
              <div className="mt-1 flex items-center">
                <span className="text-[10px] font-bold text-black bg-[#6BD85E] px-2 py-0.5 rounded-full shadow-sm blink-soft">
                  {gym.latestOffer}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-1">
            {/* Compare Button - Desktop Only */}
            <Button
              variant="ghost"
              size="sm"
              className={`hidden sm:flex h-8 px-3 rounded-full border border-white/5 transition-all text-xs font-bold tracking-tight gap-1.5
                ${isCompared
                  ? "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              onClick={handleCompareClick}
              id={`compare-btn-desktop-${gym.id}`}
            >
              {isCompared ? (
                <>
                  <BookmarkCheck className="h-3.5 w-3.5" />
                  Added
                </>
              ) : (
                <>
                  <div className="text-[9px] font-black border border-current rounded px-0.5 leading-none">VS</div>
                  Compare
                </>
              )}
            </Button>

            {/* Save Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 shrink-0 rounded-full border border-white/5 ${isSaved ? "text-black bg-[#6BD85E] hover:bg-[#6BD85E]/90" : "text-white bg-black/40 hover:bg-black/60"
                }`}
              onClick={handleSaveClick}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} strokeWidth={2} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary border border-white/5">
            <Star className="h-3 w-3 fill-[#6BD85E] text-[#6BD85E]" />
            <span className="text-[11px] font-bold text-white">{gym.rating.toFixed(1)}</span>
            {gym.user_ratings_total !== undefined && (
              <span className="text-[9px] text-slate-500 font-medium">({gym.user_ratings_total})</span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
            {gym.type}
          </span>
        </div>

        <div className="flex flex-col pt-2 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] font-light text-slate-500 uppercase tracking-tighter">
                {(() => {
                  const { isEstimate } = getGymPrice(gym, livePrice);
                  return isEstimate ? "From" : "Verified";
                })()}
              </span>
              <span className={`text-lg font-black ${(() => {
                const { isEstimate } = getGymPrice(gym, livePrice);
                return isEstimate ? "text-white" : "text-[#6BD85E]";
              })()}`}>
                £{(() => {
                  const { monthly } = getGymPrice(gym, livePrice);
                  return monthly.toFixed(2);
                })()}
              </span>
              <span className="text-[10px] text-slate-500 font-light">/mo</span>
              {(() => {
                const { joiningFee } = getGymPrice(gym, livePrice);
                if (joiningFee !== undefined && joiningFee > 0) {
                  return (
                    <span className="text-[9px] text-slate-400 ml-1">
                      + £{joiningFee.toFixed(2)}
                    </span>
                  )
                }
                return null;
              })()}
            </div>

            <div className="flex gap-2">
              {/* Compare Button - Mobile Only */}
              <Button
                variant="ghost"
                size="sm"
                className={`flex sm:hidden h-8 px-3 rounded-full border border-white/5 transition-all text-xs font-bold tracking-tight gap-1.5
                  ${isCompared
                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                onClick={handleCompareClick}
                id={`compare-btn-mobile-${gym.id}`}
              >
                {isCompared ? (
                  <>
                    <BookmarkCheck className="h-3.5 w-3.5" />
                    Added
                  </>
                ) : (
                  <>
                    Compare
                  </>
                )}
              </Button>

              <Button
                variant="default"
                size="sm"
                className="bg-[#6BD85E] hover:bg-[#5bc250] text-black font-black h-8 px-4 rounded-xl shadow-[0_0_15px_rgba(107,216,94,0.3)] hover:shadow-[0_0_20px_rgba(107,216,94,0.5)] transition-all uppercase text-[11px] tracking-tight"
                onClick={handleSignUpClick}
              >
                Sign Up
              </Button>
            </div>
          </div>

          {/* Detailed Pricing Packages (if synced) */}
          {!getGymPrice(gym, livePrice).isEstimate && livePrice?.prices && livePrice.prices.length > 1 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {livePrice.prices.map((p, i) => (
                <span key={i} className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-400">
                  {p.name}: £{p.price.toFixed(2)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
