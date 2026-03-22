"use client"

import { useState, useEffect, useRef, memo, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Bookmark, BookmarkCheck, Share2 } from "lucide-react"
import { ShareModal } from "./ShareModal"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthContext"
import { getGymPrice, getGooglePhotoUrl, Gym } from "@/lib/gym-utils"
import { getApiBaseUrl } from "@/lib/api-env"

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
}

function GymCardComponent({ gym, isSelected, isSaved, isCompared, onSelect, onToggleSave, onToggleCompare, onAuthRequired, onOpenGallery }: GymCardProps) {
  const { user, isAnonymous } = useAuth()
  const router = useRouter()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  // Prioritize the high-quality hero_image_url synced from Google Places API (New)
  // Fallback to legacy photo_reference or the first photo in the array
  const initialPhotoUrl = gym.hero_image_url || getGooglePhotoUrl(gym.photo_reference || gym.photos?.[0]);
  // We can show the initialPhotoUrl immediately if it's not the placeholder
  const hasValidStoredPhoto = !!gym.hero_image_url || initialPhotoUrl !== "/placeholder-gym.jpg";

  const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState<string | null>(
    hasValidStoredPhoto ? initialPhotoUrl : null
  );

  useEffect(() => {
    // If we already have a direct hero_image_url, skip fetching fresh one
    // But IF we only have a photo_reference or gallery URL, it's worth trying 
    // to get a fresh, high-quality media URL from the API.
    if (gym.hero_image_url) return;

    const placeId = gym.id; // id is the place_id in Firestore
    const photoReference = gym.photo_reference || gym.photos?.[0];

    if (!placeId || placeId.startsWith('trap-')) return; // Skip honeypot / bad ids

    let queryParam = photoReference && photoReference.startsWith('places/')
      ? `photo_name=${encodeURIComponent(photoReference)}`
      : `place_id=${encodeURIComponent(placeId)}`;

    let cancelled = false;
    const baseUrl = getApiBaseUrl();
    fetch(`${baseUrl}/api/gyms/photo?${queryParam}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.photoUrl) {
          setResolvedPhotoUrl(data.photoUrl);
        }
      })
      .catch(() => { }); // Silently fail — placeholder will show

    return () => { cancelled = true; };
  }, [gym.id, hasValidStoredPhoto]);

  // The image src to display: resolved photo, stored photo, or placeholder
  const imageSrc = resolvedPhotoUrl || "/placeholder-gym.jpg";
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if currently featured
  const now = new Date();
  const isCurrentlyFeatured = gym.isFeatured === true &&
    (!gym.featuredFrom || now >= new Date(gym.featuredFrom.seconds ? gym.featuredFrom.seconds * 1000 : gym.featuredFrom)) &&
    (!gym.featuredUntil || now <= new Date(gym.featuredUntil.seconds ? gym.featuredUntil.seconds * 1000 : gym.featuredUntil));

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user || isAnonymous) {
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

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsShareModalOpen(true)
  }

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    // If we have a direct website, always allow clicking it (even for guests)
    if (gym.website) {
      window.open(gym.website, '_blank')
      return
    }

    // Fallback: If no direct website, require signup/login to see more/book
    if (!user || isAnonymous) {
      if (onAuthRequired) {
        onAuthRequired()
      } else {
        router.push("/signup")
      }
      return
    }
  }

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    // Prevent hover logic on touch devices
    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    if (onOpenGallery && !isTouchDevice) {
      hoverTimeoutRef.current = setTimeout(() => {
        onOpenGallery();
      }, 500);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleGalleryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMouseLeave(); // Clear timeout if user clicks manually
    onOpenGallery?.();
  };

  return (
    <div
      id={`gym-card-${gym.id}`}
      className={`
        group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer flex flex-col sm:flex-row h-auto sm:h-40
        premium-lift
        ${isCurrentlyFeatured
          ? "ring-2 ring-yellow-500 bg-gradient-to-r from-yellow-900/40 to-black shadow-[0_0_20px_rgba(234,179,8,0.2)]"
          : isSelected
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
        className="w-full h-48 sm:h-full sm:w-64 shrink-0 relative bg-slate-900 sm:rounded-l-2xl rounded-t-2xl sm:rounded-tr-none border-b sm:border-r sm:border-b-0 border-white/10 cursor-zoom-in overflow-hidden z-20"
        onClick={handleGalleryClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Shimmer Placeholder behind image */}
        {!imageLoaded && (
          <div className="absolute inset-0 w-full h-full bg-slate-800/80 animate-pulse flex items-center justify-center -z-10">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin opacity-50"></div>
          </div>
        )}
        <img
          src={imageSrc}
          alt={`Inside photo of ${gym.name} in ${gym.city || gym.address || 'the UK'}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover block sm:rounded-l-2xl rounded-t-2xl sm:rounded-tr-none transition-all duration-700 group-hover:scale-110"
          onError={(e) => {
            setImageLoaded(true); // Don't leave pulsing loader forever
            const target = e.target as HTMLImageElement;
            if (!target.src.includes("unsplash")) {
              target.src = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop";
            }
          }}
        />


        {/* Floating Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-2">
          {isCurrentlyFeatured && (
            <span className="text-[10px] font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.6)] border border-yellow-300 uppercase tracking-widest flex items-center gap-1">
              <Star className="w-3 h-3 fill-black" /> Featured
            </span>
          )}
          {gym.distance !== undefined && (
            <span className="text-[10px] font-bold text-black bg-[#6BD85E] px-2 py-0.5 rounded-full shadow-lg">
              {gym.distance.toFixed(1)} miles away
            </span>
          )}
        </div>

        {/* Gallery hint overlay removed to prevent flashing during scroll */}
      </div>

      {/* Main Info - Right Side */}
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-between bg-black/95 sm:rounded-r-2xl rounded-b-2xl sm:rounded-bl-none relative z-10 border-l border-white/5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <h3
              className={`font-bold text-xl sm:text-lg leading-tight truncate group-hover:scale-[1.01] origin-left transition-transform tracking-wide cursor-pointer hover:underline ${isCurrentlyFeatured ? "text-yellow-500" : "text-[#6BD85E]"
                }`}
              onClick={handleGalleryClick}
            >
              {gym.name}
            </h3>
            {gym.address && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate font-light italic">
                <MapPin className="h-3 w-3 shrink-0" />
                {gym.address}
              </p>
            )}
            {gym.latestOffer && typeof gym.latestOffer === "string" && !gym.latestOffer.toLowerCase().includes("coming soon") && (
              <div className="mt-1 flex items-center">
                <span className="text-[10px] font-bold text-black bg-[#6BD85E] px-2 py-0.5 rounded-full shadow-sm">
                  {gym.latestOffer}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-1">
            {/* Share Button - Top Right */}
            <Button
              variant="ghost"
              size="icon"
              className="flex h-8 w-8 shrink-0 rounded-full border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              onClick={handleShareClick}
            >
              <Share2 className="h-4 w-4" />
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
          {gym.user_ratings_total !== undefined && gym.user_ratings_total > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary border border-white/5">
              <Star className="h-3 w-3 fill-[#6BD85E] text-[#6BD85E]" />
              <span className="text-[11px] font-bold text-white">{gym.rating.toFixed(1)}</span>
              <span className="text-[9px] text-slate-500 font-medium">({gym.user_ratings_total})</span>
            </div>
          )}
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
                  const price = getGymPrice(gym);
                  if (price.monthly === undefined) return "Unknown";
                  return price.isEstimate ? "From" : "Verified";
                })()}
              </span>
              <span className={`text-lg font-black ${(() => {
                const price = getGymPrice(gym);
                if (price.monthly === undefined) return "text-slate-500 text-sm";
                return price.isEstimate ? "text-white" : "text-[#6BD85E]";
              })()}`}>
                {(() => {
                  const price = getGymPrice(gym);
                  if (price.monthly === undefined) return "Prices coming soon";
                  return `£${price.monthly.toFixed(2)}`;
                })()}
              </span>
              {(() => {
                const price = getGymPrice(gym);
                if (price.monthly !== undefined) {
                  return <span className="text-[10px] text-slate-500 font-light">/mo</span>
                }
                return null;
              })()}
              {(() => {
                const price = getGymPrice(gym);
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

            <div className="flex gap-1.5">

              {/* Compare Button - Unified Bottom (Green Outline Style) */}
              <Button
                variant="outline"
                size="sm"
                className={`flex h-8 px-2.5 rounded-xl border transition-all text-[11px] font-bold tracking-tight gap-1.5 shadow-[0_0_15px_rgba(107,216,94,0.1)] hover:shadow-[0_0_20px_rgba(107,216,94,0.2)]
                  ${isCompared
                    ? "bg-[#6BD85E] text-black border-[#6BD85E] hover:bg-[#5bc250] shadow-[0_0_15px_rgba(107,216,94,0.4)]"
                    : "bg-black hover:bg-zinc-900 text-[#6BD85E] border-[#6BD85E]/30"
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

              <Button
                variant="default"
                size="sm"
                className="bg-[#6BD85E] hover:bg-[#5bc250] text-black font-black h-8 px-3 rounded-xl shadow-[0_0_15px_rgba(107,216,94,0.3)] hover:shadow-[0_0_20px_rgba(107,216,94,0.5)] transition-all uppercase text-[11px] tracking-tight"
                onClick={handleSignUpClick}
              >
                Join Gym
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ShareModal
        isOpen={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        gym={gym}
      />
    </div >
  )
}

// Custom comparator to prevent unnecessary re-renders during scrolling or map panning
export const GymCard = memo(GymCardComponent, (prev, next) => {
  return (
    prev.gym.id === next.gym.id &&
    prev.isSelected === next.isSelected &&
    prev.isSaved === next.isSaved &&
    prev.isCompared === next.isCompared &&
    // Check key data inside gym that might change without ID changing
    prev.gym.hero_image_url === next.gym.hero_image_url &&
    prev.gym.distance === next.gym.distance &&
    prev.gym.rating === next.gym.rating
  );
});
