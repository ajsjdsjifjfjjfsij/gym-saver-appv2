"use client"
// Deployment trigger: 2026-02-12T21:50:00Z - Switch to Firestore-only search

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { GymMap } from "@/components/gym-map"
import { GymFilters } from "@/components/gym-filters"
import { GymCard } from "@/components/gym-card"
import { HoneypotGym } from "@/components/HoneypotGym"
import { CompareBar } from "@/components/compare-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2, BookmarkCheck, Search, Mail } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthContext"
import { useRouter } from "next/navigation"
import { AuthGateModal } from "@/components/auth/AuthGateModal"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { isBot, getDynamicSecret } from "@/lib/bot-detection"
import { calculateDistance, Gym, getGymPrice } from "@/lib/gym-utils"
import { ImageGalleryModal } from "@/components/ImageGalleryModal"

export async function fetchGymsFromFirestore(centerLat: number, centerLng: number, searchTerm?: string) {
  // 1. Bot Check
  if (isBot()) {
    console.warn("🛡️ Bot detected. Proxying request through bot-trap.");
    // We'll let the API handle the poison pill
  }

  const secret = getDynamicSecret();
  // Add a timestamp for cache busting
  const ts = Date.now();
  const radius = 100000; // Increase to 100km for better coverage
  const url = `/api/gyms?lat=${centerLat}&lng=${centerLng}&source=firestore${searchTerm ? `&query=${encodeURIComponent(searchTerm)}` : ''}&radius=${radius}&_ts=${ts}`;
  console.log(`[Diagnostic] Fetching: ${url}`);

  try {
    const res = await fetch(url, {
      headers: {
        "x-gymsaver-app-secret": secret
      }
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("Proxied Firestore query failed:", err);
    return [];
  }
}


export default function GymSaverApp({ initialBotLocation }: { initialBotLocation?: { lat: number; lng: number } | null }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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
    sortBy: "distance_asc",
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

  // Gallery State
  const [galleryGym, setGalleryGym] = useState<Gym | null>(null)

  // Check for first-time user tooltip
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem("hasSeenCompareTooltip")
    if (!hasSeenTooltip) {
      // Delay slightly to let UI settle
      const timeout = setTimeout(() => {
        setShowCompareTooltip(true)
      }, 0)
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

  // Fetch gyms from Firestore ONLY
  const fetchGyms = async (lat: number, lng: number, query?: string, type?: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log(`Fetching gyms near ${lat}, ${lng} with query: ${query || 'none'}...`)
      // Pass coordinates and query to the geo-query function
      let rawData;
      try {
        rawData = await fetchGymsFromFirestore(lat, lng, query);
      } catch (fError) {
        console.error("fetchGymsFromFirestore crashed:", fError);
        rawData = [];
      }

      // CRITICAL: Ensure rawData is an array to prevent "filter is not a function" crash
      const firestoreGymsData = Array.isArray(rawData) ? rawData : [];

      console.log(`[Diagnostic] Firestore returned ${firestoreGymsData.length} total documents.`);

      if (firestoreGymsData.length > 0) {
        try {
          const jdCheck = firestoreGymsData.filter((g: any) => g && (g.name || "").toLowerCase().includes("jd"));
          console.log(`[Diagnostic] JD Gyms in RAW firestore response: ${jdCheck.length}`);
        } catch (e) {
          console.warn("JD Check log failed:", e);
        }
      }

      let filteredData = firestoreGymsData;

      // 1. Client-side Longitude Filter (Approximate bounding box completion)
      // Broadening this to +/- 3.0 for better coverage
      const lngDelta = 3.0;
      filteredData = filteredData.filter((g: any) => {
        const docLng = g.location?.lng !== undefined ? g.location.lng : g.lng;
        if (docLng === undefined || docLng === 0) return true; // Show it if we don't know, don't hide it
        return docLng >= (lng - lngDelta) && docLng <= (lng + lngDelta);
      });
      console.log(`[Diagnostic] After longitude filter: ${filteredData.length} documents.`);

      // Determine effective query based on type if no explicit query
      // REMOVED: Auto-setting query for types (e.g. "24 hour gym") causes strict string matching
      // which hides valid gyms like "JD Gyms". We rely on client-side filteredGyms logic instead.
      let effectiveQuery = query;


      // 2. Filter by: city == <searchTerm> OR name contains <searchTerm>
      // (Keep existing text search logic if user types something)
      if (effectiveQuery && effectiveQuery.trim().length > 0) {
        const lowerQuery = effectiveQuery.toLowerCase().trim();
        filteredData = filteredData.filter((g: any) => {
          const name = (g.name || "").toLowerCase();
          const city = (g.city || "").toLowerCase();
          const cityMatch = city === lowerQuery;
          const nameMatch = name.includes(lowerQuery);
          return cityMatch || nameMatch;
        });
      }
      // 2b. Implicit City Filter - REMOVED
      // We want to show all gyms within the radius, sorted by distance.
      // The previous logic restricted results to the "closest city", hiding nearby gyms in other towns.
      /*
      else if (!query && lat && lng) {
        // ... (removed restrictive logic)
      }
      */

      // 2c. Price Filter: Relaxed to allow gyms with hardcoded fallbacks
      filteredData = filteredData.filter((g: any) => {
        let price = g.lowest_price;
        const name = (g.name || "").toLowerCase();

        // If lowest_price is missing or 0, check if it's a major chain that has a fallback in getGymPrice
        if (price === undefined || price === null || price === 0) {
          const hasFallback = [
            "puregym", "pure gym", "the gym", "anytime", "david lloyd",
            "nuffield", "everlast", "jd gym", "snap fitness", "snap",
            "fitness first", "bannatyne", "virgin active", "harbour club",
            "third space", "equinox", "easygym", "easy gym"
          ].some(brand => name.includes(brand));

          if (hasFallback) return true;

          // Otherwise check memberships
          if (g.memberships && Array.isArray(g.memberships) && g.memberships.length > 0) {
            const validPrices = g.memberships
              .map((m: any) => m.price)
              .filter((p: any) => typeof p === 'number' && p > 0);

            if (validPrices.length > 0) {
              price = Math.min(...validPrices);
            }
          }
        }

        const keep = (typeof price === 'number' && price > 0);
        if (!keep && name.includes("jd")) {
          console.log(`[Diagnostic] Filtering out JD Gym by price: ${name} (Price: ${price})`);
        }
        return keep;
      });

      // 2d. Provider Exclusion: Hide "Better" (GLL) gyms completely
      // Also exclude strict blacklist terms for non-gym venues
      const unwantedTerms = [
        "better ", "better gym", // Provider: Better (GLL)
        "tennis", "hydro", "recreation", "online only", // Non-gym identifiers
        "school", "college", "university", // Educational institutions
        "croft sports", "haydon center" // Specific user-reported venues
      ];

      filteredData = filteredData.filter((g: any) => {
        const name = (g.name || "").toLowerCase();

        // Check blacklist
        if (unwantedTerms.some(term => name.includes(term))) {
          return false;
        }

        // 2e. Quality Filter: Remove "unlinked" or incomplete listings
        // Rule: If user_ratings_total is missing/0 AND address/city is too generic
        const ratings = g.user_ratings_total || 0;
        const address = (g.address || "").toLowerCase();
        const city = (g.city || "").toLowerCase();
        const gymNameLower = name.toLowerCase();

        // Target: "PureGym Swindon" with no specific address and 0 reviews
        // If it's a major brand but has 0 reviews and an address identical to the city
        const isMajorBrand = ["puregym", "the gym", "anytime fitness", "david lloyd", "nuffield health", "everlast gym", "jd gyms", "jd gym"].some(brand => gymNameLower.includes(brand));

        if (ratings === 0 && isMajorBrand) {
          // If the address is just the city name (or empty), it's likely a generic unlinked placeholder
          if (!address || address === city || address === "swindon" || address === "unknown") {
            // EXCEPTION: Never filter out JD Gyms by quality check
            if (gymNameLower.includes("jd gym")) return true;

            console.log(`Filtering out unlinked gym: ${g.name}`);
            return false;
          }
        }

        return true;
      });

      // Fix Naming Issues (e.g. Swindon Stratton -> PureGym Swindon Stratton)
      filteredData.forEach((g: any) => {
        if (g.name === "Swindon Stratton") {
          g.name = "PureGym Swindon Stratton";
        }
      });

      // 3. Sort by Distance (Primary) and Price (Secondary)
      filteredData.sort((a: any, b: any) => {
        // Calculate distances
        const latA = a.location?.lat !== undefined ? a.location.lat : a.lat;
        const lngA = a.location?.lng !== undefined ? a.location.lng : a.lng;
        const distA = calculateDistance(lat, lng, latA, lngA);

        const latB = b.location?.lat !== undefined ? b.location.lat : b.lat;
        const lngB = b.location?.lng !== undefined ? b.location.lng : b.lng;
        const distB = calculateDistance(lat, lng, latB, lngB);

        // Sort by distance (ASC)
        if (Math.abs(distA - distB) > 0.1) { // 0.1 mile buffer
          return distA - distB;
        }

        // Secondary: Sort by Price
        let priceA = a.lowest_price;
        if (priceA === undefined && a.memberships && Array.isArray(a.memberships) && a.memberships.length > 0) {
          priceA = Math.min(...a.memberships.map((m: any) => m.price));
        }
        if (priceA === undefined) priceA = Number.MAX_VALUE;

        let priceB = b.lowest_price;
        if (priceB === undefined && b.memberships && Array.isArray(b.memberships) && b.memberships.length > 0) {
          priceB = Math.min(...b.memberships.map((m: any) => m.price));
        }
        if (priceB === undefined) priceB = Number.MAX_VALUE;

        return priceA - priceB;
      });

      // 4. Limit results to 100 (Increased for local coverage)
      filteredData = filteredData.slice(0, 100);

      if (!filteredData || filteredData.length === 0) {
        console.log("No gyms found in Firestore matching query.");
        setGyms([]);
        return;
      }

      const firestoreGyms: Gym[] = filteredData.map((g: any) => {
        // Robust coordinate extraction
        const gymLat = g.location?.lat !== undefined ? g.location.lat : g.lat;
        const gymLng = g.location?.lng !== undefined ? g.location.lng : g.lng;

        // Standardize Name
        let gymName = g.name || "Unknown Gym";

        // Specific Fixes
        if (gymName === "Swindon Stratton") gymName = "PureGym Swindon Stratton";

        // Brand Standardisation
        if (gymName.toLowerCase().includes("puregym")) {
          gymName = gymName.replace(/puregym/i, "PureGym");
        } else if (gymName.toLowerCase().includes("jd gym")) {
          gymName = gymName.replace(/jd\s?gyms?/i, "JD Gyms");
        } else if (gymName.toLowerCase().includes("the gym")) {
          // Only replace if it doesn't already look like "The Gym Group"
          if (!gymName.includes("The Gym Group")) {
            gymName = gymName.replace(/the\s?gym/i, "The Gym Group");
          }
        } else if (gymName.toLowerCase().includes("anytime fitness")) {
          gymName = gymName.replace(/anytime\s?fitness/i, "Anytime Fitness");
        } else if (gymName.toLowerCase().includes("nuffield health")) {
          gymName = gymName.replace(/nuffield\s?health/i, "Nuffield Health");
        } else if (gymName.toLowerCase().includes("david lloyd")) {
          gymName = gymName.replace(/david\s?lloyd/i, "David Lloyd");
        } else if (gymName.toLowerCase().includes("everlast gym")) {
          gymName = gymName.replace(/everlast\s?gyms?/i, "Everlast Gyms");
        }

        // Robust address extraction
        let gymAddress = "Unknown";
        if (g.city && g.city !== "Unknown") {
          gymAddress = g.city;
        } else if (g.address && g.address !== "Unknown") {
          gymAddress = g.address;
        } else if (g.location?.address && g.location.address !== "Unknown") {
          gymAddress = g.location.address;
        } else if (typeof g.location === 'string' && g.location !== "Unknown") {
          gymAddress = g.location;
        }

        // If still unknown, use empty string or a cleaner fallback
        if (gymAddress === "Unknown" || gymAddress === "Unknown Address") {
          gymAddress = g.city || "";
        }

        return {
          id: g.place_id || g.id,
          name: gymName,
          address: gymAddress,
          rating: g.rating || 0,
          type: g.type || "Gym",
          priceLevel: g.memberships && g.memberships.length > 0 ? "££" : "££",
          lat: gymLat !== undefined ? gymLat : lat,
          lng: gymLng !== undefined ? gymLng : lng,
          distance: 0,
          latestOffer: g.offers,
          location: typeof g.location === 'object' ? g.location : { lat: gymLat, lng: gymLng, address: gymAddress },
          lowest_price: g.lowest_price, // Essential for getGymPrice
          memberships: g.memberships, // Essential for detailed pricing if needed
          user_ratings_total: g.user_ratings_total,
          googleMapsUri: g.googleMapsUri,
          photo_reference: g.photo_reference || g.photo || (g.photos && g.photos.length > 0 ? g.photos[0] : undefined),
          photos: g.photos || (g.photo_reference ? [g.photo_reference] : []),
          website: g.website,
        };
      });

      console.log(`Loaded ${firestoreGyms.length} gyms from Firestore after filter.`);
      setGyms(firestoreGyms);

    } catch (err) {
      console.error("Critical error in fetchGyms (Firestore Only)", err)
      setError("Failed to load gyms. Please try again later.")
      setGyms([]);
    }
    finally {
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
      // Search filter - Name OR Address
      // Since fetchGyms already filters, this is mostly for immediate feedback or strictness.
      // We align it with fetchGyms logic: Name contains OR Address/City contains
      if (
        searchQuery &&
        !gym.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !gym.address.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // STRICT PRICE FILTER: Ensure the gym has a valid display price.
      // This prevents "Prices coming soon" from appearing.
      // We check what the UI would actually display.
      const displayPrice = getGymPrice(gym);
      if (displayPrice.monthly === undefined) {
        // Only hide if we don't have a monthly price AND it's not a mystery/coming soon state we want to show
        // Actually, for Search we want to show everything that has SOME price (estimate or real)
        return false;
      }

      // PERF FIX: We no longer depend on 'livePrices' (global Firestore subscription) for filtering.
      // The 'fetchGyms' API already returns the necessary price data in the 'gym' object.
      // This removes a massive performance bottleneck where the UI would wait for or re-render
      // based on a 2MB+ background download.

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
          // Use authoritative 24hr flag if available, otherwise fallback to name heuristics
          if (gym.is_24hr) return true;

          // Fallback Heuristics
          const nameLower = gym.name.toLowerCase();
          return nameLower.includes("24") || nameLower.includes("puregym") || nameLower.includes("anytime") || nameLower.includes("the gym") || nameLower.includes("snap fitness") || nameLower.includes("jd gyms");
        }
        if (type === "pilates") {
          // We fetched with "pilates" keyword, so these are valid.
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
    }).sort((a, b) => {
      // 3. Sorting
      switch (filters.sortBy || "distance_asc") { // Default to distance
        case "price_asc":
          const priceA = getGymPrice(a).monthly || 1000;
          const priceB = getGymPrice(b).monthly || 1000;
          return priceA - priceB;
        case "price_desc":
          const priceA_desc = getGymPrice(a).monthly || 0;
          const priceB_desc = getGymPrice(b).monthly || 0;
          return priceB_desc - priceA_desc;
        case "rating_desc":
          return b.rating - a.rating;
        case "distance_asc":
        default:
          if (userLocation) {
            return (a.distance || 0) - (b.distance || 0)
          }
          return 0;
      }
    })
  }, [gymsWithDistance, searchQuery, filters, savedGyms, showSavedOnly, userLocation])

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

  // Initial fetch using default location or user location if available
  useEffect(() => {
    // If we have a user location, fetch nearby immediately
    if (userLocation) {
      fetchGyms(userLocation.lat, userLocation.lng, searchQuery, filters.type)
    } else {
      // Fallback: Try to get location again if not set, but don't block
      getUserLocation();
    }
  }, [userLocation?.lat, userLocation?.lng, searchQuery, filters.type]) // Deep compare location props

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

  // Show loading only during initial auth check
  // We no longer block on firebaseLoading to ensure the app structure appears immediately
  if (authLoading) {
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

            {userLocation && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Sorting by Distance
              </div>
            )}
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
                flex flex-col bg-background z-20 transition-transform duration-300 ease-in-out
                w-full md:w-[60%] shrink-0 border-r border-white/5
                ${activeView === "list" ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                absolute inset-0 md:relative md:transform-none
              `}>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide pb-24">
                  {filteredGyms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-secondary/10 backdrop-blur-sm px-6">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                        <Search className="h-8 w-8 text-muted-foreground opacity-20" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No gyms found nearby</h3>
                      <p className="text-muted-foreground text-sm max-w-[280px] mb-6">
                        {showSavedOnly
                          ? "You haven't saved any gyms yet. Tap the bookmark icon on any gym to see it here."
                          : "We couldn't find any gyms matching your filters in this area. Try broadening your search or clearing filters."}
                      </p>

                      <div className="flex flex-col gap-3 w-full max-w-[240px]">
                        <Button
                          variant="outline"
                          className="w-full border-white/10 hover:bg-white/5 text-white h-11 rounded-xl"
                          onClick={() => {
                            setFilters({ type: "all", distance: "all", price: "all", rating: "all", sortBy: "distance_asc" })
                            setSearchQuery("")
                            setShowSavedOnly(false)
                          }}
                        >
                          Clear All Filters
                        </Button>

                        {!showSavedOnly && (
                          <Button
                            variant="default"
                            className="w-full bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold h-11 rounded-xl shadow-[0_0_20px_rgba(107,216,94,0.1)]"
                            onClick={() => {
                              // Re-fetch with a massive radius or just show first few
                              fetchGyms(51.5074, -0.1278, "", "all") // Default to London search
                            }}
                          >
                            Explore UK Gyms
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {filteredGyms.map((gym, index) => {
                        const isFirst = index === 0;
                        return (
                          <div key={gym.id} className="flex flex-col gap-4">

                            <Tooltip open={isFirst && showCompareTooltip}>
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
                                    onOpenGallery={() => setGalleryGym(gym)}
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
                          </div>
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
        {/* Gallery Modal */}
        <ImageGalleryModal
          gym={galleryGym}
          isOpen={!!galleryGym}
          onClose={() => setGalleryGym(null)}
        />
      </div>
    </TooltipProvider>
  )
}
