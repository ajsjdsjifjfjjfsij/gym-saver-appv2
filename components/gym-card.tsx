"use client"

import { Button } from "@/components/ui/button"
import { Star, MapPin, Bookmark, BookmarkCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/components/auth/AuthContext"
import { GymPrice } from "@/hooks/useGymPrices"
import { getGymPrice, getGooglePhotoUrl, Gym } from "@/lib/gym-utils"

interface GymCardProps {
  gym: Gym
  isSelected: boolean
  isSaved: boolean
  isCompared?: boolean
  onSelect: () => void
  onToggleSave: () => void
  onToggleCompare?: () => void
  onAuthRequired?: () => void
  onOpenGallery?: () => void
  livePrice?: GymPrice
}

export function GymCard({ gym, isSelected, isSaved, isCompared, onSelect, onToggleSave, onToggleCompare, onAuthRequired, onOpenGallery, livePrice }: GymCardProps) {
  const { user } = useAuth()
  const router = useRouter()

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

    // If we have a direct website, always allow clicking it (even for guests)
    if (gym.website) {
      window.open(gym.website, '_blank')
      return
    }

    // Fallback: If no direct website, require signup/login to see more/book
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired()
      } else {
        router.push("/signup")
      }
      return
    }
  }

  const handleGalleryClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onOpenGallery) {
      onOpenGallery()
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
    >
      {/* Selection Tick Overlay */}
      {isCompared && (
        <div className="absolute top-0 right-0 z-20 p-1 bg-blue-500 rounded-bl-xl shadow-lg">
          <BookmarkCheck className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Gym Image - Left Side / Top on Mobile */}
      <div
        className="w-full h-48 sm:h-full sm:w-64 shrink-0 relative bg-black/50 overflow-hidden sm:border-r border-b sm:border-b-0 border-white/10 cursor-zoom-in"
        onClick={handleGalleryClick}
      >
        <img
          src={getGooglePhotoUrl(gym.photo_reference || (gym.photos && gym.photos.length > 0 ? gym.photos[0] : undefined))}
          alt={gym.name}
          className="absolute inset-0 w-full h-full object-cover block transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes("unsplash")) {
              target.src = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop";
            }
          }}
        />


        {/* Floating Distance Badge */}
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          {gym.distance !== undefined && (
            <span className="text-[10px] font-bold text-black bg-[#6BD85E] px-2 py-0.5 rounded-full shadow-lg">
              {gym.distance.toFixed(1)} miles away
            </span>
          )}
        </div>

        {/* Gallery Hint Overlay (Desktop Hover) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-bold border border-white/50 px-3 py-1 rounded-full backdrop-blur-md">
            View Photos
          </span>
        </div>
      </div>

      {/* Main Info - Right Side */}
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <h3
              className="font-bold text-xl sm:text-lg leading-tight truncate text-[#6BD85E] group-hover:scale-[1.01] origin-left transition-transform tracking-wide cursor-pointer hover:underline"
              onClick={handleGalleryClick}
            >
              {gym.name}
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate font-light italic">
              <MapPin className="h-3 w-3 shrink-0" />
              {gym.address}
            </p>
            {(gym.latestOffer || livePrice?.latestOffer) && (
              <div className="mt-1 flex items-center">
                <span className="text-[10px] font-bold text-black bg-[#6BD85E] px-2 py-0.5 rounded-full shadow-sm blink-soft">
                  {livePrice?.latestOffer || gym.latestOffer}
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
          {(gym.is_24hr || gym.name.toLowerCase().includes("24") || gym.name.toLowerCase().includes("puregym") || gym.name.toLowerCase().includes("jd gyms") || gym.name.toLowerCase().includes("the gym") || gym.name.toLowerCase().includes("anytime") || gym.name.toLowerCase().includes("snap fitness")) && (
            <span className="text-[10px] font-bold text-black bg-[#6BD85E] px-2 py-0.5 rounded flex items-center gap-1">
              24/7
            </span>
          )}
        </div>

        <div className="flex flex-col pt-2 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] font-light text-slate-500 uppercase tracking-tighter">
                {(() => {
                  const price = getGymPrice(gym, livePrice);
                  if (price.monthly === undefined) return "Unknown";
                  return price.isEstimate ? "From" : "Verified";
                })()}
              </span>
              <span className={`text-lg font-black ${(() => {
                const price = getGymPrice(gym, livePrice);
                if (price.monthly === undefined) return "text-slate-500 text-sm";
                return price.isEstimate ? "text-white" : "text-[#6BD85E]";
              })()}`}>
                {(() => {
                  const price = getGymPrice(gym, livePrice);
                  if (price.monthly === undefined) return "Prices coming soon";
                  return `£${price.monthly.toFixed(2)}`;
                })()}
              </span>
              {(() => {
                const price = getGymPrice(gym, livePrice);
                if (price.monthly !== undefined) {
                  return <span className="text-[10px] text-slate-500 font-light">/mo</span>
                }
                return null;
              })()}
              {(() => {
                const price = getGymPrice(gym, livePrice);
                if (price.monthly !== undefined && price.joiningFee !== undefined && price.joiningFee > 0) {
                  return (
                    <span className="text-[9px] text-slate-400 ml-1">
                      + £{price.joiningFee.toFixed(2)}
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
