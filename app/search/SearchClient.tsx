"use client"
// Deployment trigger: 2026-02-11T02:12:00Z - Sync after email update

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { GymMap } from "@/components/gym-map"
import { GymFilters } from "@/components/gym-filters"
import { GymCard } from "@/components/gym-card"
import { HoneypotGym } from "@/components/HoneypotGym"
import { AdBanner } from "@/components/ad-banner"
import { CompareBar } from "@/components/compare-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2, BookmarkCheck, Search, Mail } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthContext"
import { useRouter } from "next/navigation"
import { AuthGateModal } from "@/components/auth/AuthGateModal"
import { useGymPrices } from "@/hooks/useGymPrices"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  weekday_text?: string[]
  website?: string
  photos?: string[]
  latestOffer?: string
  user_ratings_total?: number
  googleMapsUri?: string
}

// ... lines 25-115 ... (Sample Data needs updating? Optional but good for mock)

// ...


// Sample gym data
// Sample gym data (UK Default)
const sampleGyms: Gym[] = []

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function GymSaverApp({ initialBotLocation }: { initialBotLocation?: { lat: number; lng: number } | null }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // No longer blocking guests - they can browse freely



  const handleAuthRequired = () => {
    setShowAuthModal(true)
  }

  const handleSignUp = () => {
    router.push("/signup")
  }
  const [filters, setFilters] = useState({
    type: "all",
    distance: "all",
    price: "all",
    rating: "all",
  })
  const [savedGyms, setSavedGyms] = useState<Gym[]>([])
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null)
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(initialBotLocation || null)
  const [isLocating, setIsLocating] = useState(false)

  // Diagnostic Logging
  useEffect(() => {
    console.log("🔍 Search Page Mounted", { authLoading, user: user?.uid || "guest" })
  }, [authLoading, user])

  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Comparison State
  const [comparedGyms, setComparedGyms] = useState<Gym[]>([])
  const [showCompareTooltip, setShowCompareTooltip] = useState(false)

  // Live Firebase Prices
  const { prices: livePrices, loading: firebaseLoading, error: firebaseError } = useGymPrices()

  // Check for first-time user tooltip
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem("hasSeenCompareTooltip")
    if (!hasSeenTooltip) {
      // Delay slightly to let UI settle
      const timeout = setTimeout(() => {
        setShowCompareTooltip(true)
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [])

  const handleTooltipDismiss = () => {
    setShowCompareTooltip(false)
    localStorage.setItem("hasSeenCompareTooltip", "true")
  }

  const toggleCompare = (gym: Gym) => {
    setComparedGyms((prev) => {
      const exists = prev.find((g) => g.id === gym.id);
      if (exists) {
        return prev.filter((g) => g.id !== gym.id); // Remove
      } else {
        // Check if user is authenticated
        const maxComparisons = user ? 3 : 1;

        if (prev.length >= maxComparisons) {
          // Guest trying to compare more than 1 gym - show auth modal
          if (!user) {
            setShowAuthModal(true);
            return prev;
          }
          // Authenticated user at limit (3 gyms)
          return prev;
        }

        // If this is the user's first interaction, dismiss the tooltip permanently
        if (showCompareTooltip) {
          handleTooltipDismiss()
        }

        return [...prev, gym]; // Add
      }
    });
  };

  const clearComparison = () => {
    setComparedGyms([]);
  };




  // Fetch gyms from API
  const fetchGyms = async (lat: number, lng: number, query?: string, type?: string) => {
    setLoading(true)
    setError(null)

    // Determine keyword based on type filter if no explicit query
    let effectiveQuery = query;
    if (!effectiveQuery) {
      if (type === 'pilates') effectiveQuery = 'pilates';
      else if (type === '24hr') effectiveQuery = '24 hour gym';
      else if (type === 'spa') effectiveQuery = 'hotel with gym spa wellness';
      else effectiveQuery = 'gym';
    }

    const fetchClientSide = () => {
      return new Promise<void>((resolve) => {
        if (typeof window !== "undefined" && window.google?.maps?.places) {
          console.log("Attempting client-side Places fetch for:", effectiveQuery);
          const service = new google.maps.places.PlacesService(document.createElement('div'));
          const request = {
            location: { lat, lng },
            radius: 5000,
            type: 'gym',
            keyword: effectiveQuery // this executes the actual specialized search
          };

          service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              console.log("Client-side fetch success:", results.length, "results");
              const mappedGyms: Gym[] = results.map(place => ({
                id: place.place_id || Math.random().toString(),
                name: place.name || "Unknown Gym",
                address: place.vicinity || "Unknown Address",
                rating: place.rating || 0,
                type: "Gym", // Places API doesn't give a simple type string easily in this view
                priceLevel: place.price_level ? "£".repeat(place.price_level) : "££",
                lat: place.geometry?.location?.lat() || lat,
                lng: place.geometry?.location?.lng() || lng,
                distance: calculateDistance(lat, lng, place.geometry?.location?.lat() || lat, place.geometry?.location?.lng() || lng),
                photo_reference: place.photos?.[0]?.getUrl(),
                // open_now: place.opening_hours?.isOpen(), // Removed as not in Gym interface or update interface
                photos: place.photos?.map(p => p.getUrl() || '') || [],
                user_ratings_total: place.user_ratings_total,
                googleMapsUri: place.url
              }));
              setGyms(mappedGyms);
              resolve();
            } else {
              console.warn("Client-side fetch failed or empty:", status);
              useSampleData();
              resolve();
            }
          });
        } else {
          console.warn("Google Maps SDK not ready for client-side fetch");
          useSampleData();
          resolve();
        }
      });
    }

    const useSampleData = () => {
      console.warn("Using sample data fallback.");
      const gymsWithDistance = sampleGyms.map(gym => ({
        ...gym,
        distance: calculateDistance(lat, lng, gym.lat, gym.lng)
      }));
      setGyms(gymsWithDistance)
    }

    try {
      // First try Server API
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
      })
      if (effectiveQuery) params.append("query", effectiveQuery)

      const ts = Math.floor(Date.now() / 1000 / 60) // Current minute
      const baseSecret = process.env.NEXT_PUBLIC_APP_SECRET || "gymsaver-secure-v1"
      const dynamicToken = btoa(`${baseSecret}:${ts}`)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const res = await fetch(`${apiUrl}/api/gyms?${params.toString()}`, {
        headers: {
          "x-gymsaver-app-secret": dynamicToken
        }
      })
      const data = await res.json()

      if (data.results && data.results.length > 0) {
        setGyms(data.results)
      } else {
        // Fallback to client-side if server returns empty (e.g. mock mode warning)
        await fetchClientSide();
      }
    } catch (err) {
      console.error("Failed to fetch gyms from server", err)
      // Fallback to client-side
      await fetchClientSide();
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch using default location or user location if available
  useEffect(() => {
    // If we have a user location, fetch nearby
    if (userLocation) {
      fetchGyms(userLocation.lat, userLocation.lng, searchQuery, filters.type)
    }
    // Else do nothing until location is provided
  }, [userLocation, searchQuery, filters.type]) // Re-fetch when location, search OR TYPE changes

  // Calculate distances
  const gymsWithDistance = useMemo(() => {
    if (!userLocation) return gyms
    return gyms.map((gym) => ({
      ...gym,
      distance: calculateDistance(userLocation.lat, userLocation.lng, gym.lat, gym.lng),
    }))
  }, [userLocation, gyms])

  // Filter gyms based on all criteria
  const filteredGyms = useMemo(() => {
    return gymsWithDistance.filter((gym) => {
      // Search filter
      // Search filter - STRICT NAME ONLY
      if (
        searchQuery &&
        !gym.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Sync Filter: Only show gyms that have synced data in Firebase (synced from APIFinder)
      // We check both the direct key match and a secondary search in values to be robust against ID mismatches
      const directMatch = livePrices[gym.id];
      const hasLivePrice = !!directMatch || Object.values(livePrices).some(lp =>
        (lp as any).placeid === gym.id ||
        ((lp as any).gymname && (lp as any).gymname.toLowerCase() === gym.name.toLowerCase())
      );

      if (!hasLivePrice) {
        return false
      }

      // Saved filter
      if (showSavedOnly && !savedGyms.some(g => g.id === gym.id)) {
        return false
      }

      // Type filter
      if (filters.type !== "all") {
        const type = filters.type;
        const gymType = gym.type.toLowerCase();
        const gymName = gym.name.toLowerCase();



        if (type === "gyms") {
          // Exclude Gymnastics, Boxing, Kickboxing, and Training Grounds explicitly
          if (gymType.includes("gymnastics") || gymName.includes("gymnastics") ||
            gymType.includes("boxing") || gymName.includes("boxing") ||
            gymType.includes("kickboxing") || gymName.includes("kickboxing") ||
            gymType.includes("training ground") || gymName.includes("training ground")) return false;

          // Broad match for "Gyms"
          return gymType.includes("fitness") || gymType.includes("gym") || gymType.includes("crossfit") || gymType.includes("climbing");
        }
        if (type === "24hr") {
          // We already fetched with "24 hour gym", so trust the results mostly.
          // Optional: check 'open_now' if we want to be strict about "Right Now", but 24hr usually implies always open.
          // If we have weekday_text, we can double check, but don't filter out if missing.
          return true;
        }
        if (type === "pilates") {
          // We fetched with "pilates" keyword, so these are valid.
          return true;
        }
        if (type === "spa") {
          // Allow hotels, spas, wellness centers
          return true;
        }
      }

      // Distance filter
      if (filters.distance !== "all" && gym.distance !== undefined) {
        if (gym.distance > parseFloat(filters.distance)) return false
      }

      // Price filter
      if (filters.price !== "all" && gym.priceLevel !== filters.price) {
        return false
      }

      // Rating filter
      if (filters.rating !== "all" && gym.rating < parseFloat(filters.rating)) {
        return false
      }

      return true
    })
  }, [gymsWithDistance, searchQuery, filters, savedGyms, showSavedOnly])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const toggleSaveGym = (gym: Gym) => {
    // Require authentication to save gyms
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setSavedGyms((prev) => {
      const isSaved = prev.some(g => g.id === gym.id);
      return isSaved ? prev.filter((g) => g.id !== gym.id) : [...prev, gym]
    })
  }

  const getUserLocation = () => {
    setIsLocating(true)
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location found:", position.coords);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsLocating(false)
        },
        (error) => {
          console.error("Location error:", error);
          // Error or denied - Do NOT set default location, keep "Allow Location" UI
          alert("Could not get your location. Please enable location permissions to use the map.");
          setIsLocating(false)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false)
    }
  }

  // Load saved gyms from localStorage on mount
  useEffect(() => {
    if (!userLocation) {
      getUserLocation()
    }

    const saved = localStorage.getItem("savedGyms")
    if (saved) {
      setSavedGyms(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage when savedGyms changes
  useEffect(() => {
    localStorage.setItem("savedGyms", JSON.stringify(savedGyms))
  }, [savedGyms])

  // Save comparedGyms to localStorage so /compare page can read it
  useEffect(() => {
    localStorage.setItem("comparedGyms", JSON.stringify(comparedGyms))
  }, [comparedGyms])

  const handleCompareAction = () => {
    console.log("Comparing:", comparedGyms);
    if (comparedGyms.length < 2) return;
    router.push("/compare");
  };

  // Mobile view state
  const [activeView, setActiveView] = useState<"map" | "list">("list")

  // Show loading only during initial auth/price check
  if (authLoading || firebaseLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 text-[#6BD85E] animate-spin" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
        {/* Header */}
        {/* Header - Full Width App Mode */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          savedCount={savedGyms.length}
          onToggleSavedView={() => setShowSavedOnly(!showSavedOnly)}
          showSavedOnly={showSavedOnly}
          onAuthRequired={handleAuthRequired}
          variant="app"
        />

        {/* Action Bar (Contact & Price Upload) - Mobile Only now (since desktop is in header) */}
        <div className="md:hidden w-full max-w-7xl mx-auto px-4 py-2 flex gap-2 shrink-0 z-20">
          <Button
            variant="default"
            className="flex-1 bg-[#6BD85E]/90 hover:bg-[#5bc250] text-black font-bold h-10 px-4 rounded-xl flex items-center justify-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(107,216,94,0.2)] hover:shadow-[0_0_30px_rgba(107,216,94,0.3)] transition-all duration-300"
            onClick={() => {
              if (!user) {
                handleAuthRequired();
              } else {
                router.push("/submit");
              }
            }}
          >
            <span>Price Upload</span>
          </Button>

          <Button
            variant="default"
            className="flex-1 bg-[#6BD85E]/90 hover:bg-[#5bc250] text-black font-bold h-10 px-4 rounded-xl flex items-center justify-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(107,216,94,0.2)] hover:shadow-[0_0_30px_rgba(107,216,94,0.3)] transition-all duration-300"
            asChild
          >
            <Link href="/contact">
              <Mail className="h-4 w-4" />
              <span>Contact</span>
            </Link>
          </Button>
        </div>

        {/* NEW: Full-Width Search & Filters Header (Sticky) */}
        <div className="sticky top-0 z-30 glass-premium p-4 md:p-6 space-y-4 w-full">
          {/* Search Bar (Priority Position) */}
          <div className="max-w-7xl mx-auto relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search gyms by name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-black/40 border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus:bg-black/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all w-full tracking-tight shadow-inner"
            />
          </div>

          {/* Filters Row */}
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <GymFilters filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Mobile View Toggle & Results Count (Only visible on Mobile) */}
          <div className="md:hidden flex items-center justify-between h-9">
            <div className="flex items-center gap-2">
              {showSavedOnly && (
                <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                  Saved
                </h2>
              )}
              <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                {filteredGyms.length} results
              </span>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
              <div className="flex bg-secondary/50 rounded-xl p-1 border border-white/10 min-w-[180px]">
                <button
                  onClick={() => setActiveView("list")}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeView === "list" ? "bg-[#6BD85E] text-black shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                  List
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      handleAuthRequired();
                      return;
                    }
                    setActiveView("map");
                  }}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeView === "map" ? "bg-[#6BD85E] text-black shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Map
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Split Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          {!userLocation ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
              <div className="bg-[#153255]/50 border border-[#6BD85E]/30 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(107,216,94,0.1)]">
                <div className="bg-[#4D8444]/20 w-20 h-20 mx-auto rounded-full flex items-center justify-center border border-[#6BD85E]/50 shadow-inner">
                  <MapPin className="h-10 w-10 text-[#6BD85E] animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Location Required</h3>
                  <p className="text-slate-400">
                    GymSaver needs your location to find the best gyms and offers near you. Please enable location access to continue.
                  </p>
                </div>
                <Button
                  onClick={getUserLocation}
                  disabled={isLocating}
                  className="w-full bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold h-12 rounded-xl text-lg shadow-[0_0_20px_rgba(107,216,94,0.3)] hover:shadow-[0_0_30px_rgba(107,216,94,0.5)] transition-all duration-300"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Locating...
                    </>
                  ) : (
                    "Enable Location"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Left Panel: Gym List (Scrollable) */}
              <div className={`
                flex flex-col bg-background z-10 transition-transform duration-300 ease-in-out
                w-full md:w-[60%] shrink-0 border-r border-white/5
                ${activeView === "list" ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                absolute inset-0 md:relative md:transform-none
              `}>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide pb-24">
                  {filteredGyms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-2xl bg-secondary/20">
                      <p className="text-muted-foreground mb-2">
                        {showSavedOnly ? "No saved gyms found." : "No gyms match your filters."}
                      </p>
                      <Button
                        variant="link"
                        className="text-primary hover:text-primary/80"
                        onClick={() => {
                          setFilters({ type: "all", distance: "all", price: "all", rating: "all" })
                          setSearchQuery("")
                        }}
                      >
                        Clear all filters
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {filteredGyms.map((gym, index) => {
                        const isFirst = index === 0;
                        return (
                          <Tooltip key={gym.id} open={isFirst && showCompareTooltip}>
                            <TooltipTrigger asChild>
                              <div>
                                <GymCard
                                  gym={gym}
                                  isSelected={selectedGym?.id === gym.id}
                                  isSaved={savedGyms.some(g => g.id === gym.id)}
                                  isCompared={comparedGyms.some(g => g.id === gym.id)}
                                  onSelect={() => {
                                    setSelectedGym(gym)
                                  }}
                                  onToggleSave={() => toggleSaveGym(gym)}
                                  onToggleCompare={() => toggleCompare(gym)}
                                  onAuthRequired={handleAuthRequired}
                                  livePrice={livePrices[gym.id]}
                                />
                              </div>
                            </TooltipTrigger>
                            {isFirst && (
                              <TooltipContent
                                side="top"
                                align="end"
                                className="bg-[#6BD85E] text-black font-bold border-0"
                                onPointerDownOutside={handleTooltipDismiss}
                              >
                                <p>Select two gyms to compare them side by side!</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Map */}
              <div className={`
                flex flex-col bg-background z-10 transition-transform duration-300 ease-in-out
                w-full md:flex-1 p-1 md:p-2
                ${activeView === "map" ? "translate-x-0" : "translate-x-full md:translate-x-0"}
                absolute inset-0 md:relative md:transform-none
              `}>

                <div className="flex-1 relative w-full h-full overflow-hidden border border-white/5 rounded-2xl shadow-2xl bg-black neon-glow-card">
                  {userLocation ? (
                    <div className="w-full h-full relative">
                      <GymMap
                        gyms={filteredGyms}
                        selectedGym={selectedGym}
                        onGymSelect={(gym) => {
                          setSelectedGym(gym);
                          if (window.innerWidth < 768) {
                            // Mobile logic remains
                          }
                        }}
                        userLocation={userLocation}
                      />
                      {/* Map Overlay Gradient */}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/20" />

                      {/* Mobile Floating Back to List Button */}
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:hidden z-10 pointer-events-none">
                        <Button
                          onClick={() => setActiveView("list")}
                          className="pointer-events-auto shadow-lg bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold rounded-full px-6"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                          Back to List
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sticky Compare Bar */}
        <CompareBar
          count={comparedGyms.length}
          onCompare={handleCompareAction}
          onClear={clearComparison}
        />

        <AuthGateModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          onSignUp={handleSignUp}
        />
      </div>
    </TooltipProvider>
  )
}
