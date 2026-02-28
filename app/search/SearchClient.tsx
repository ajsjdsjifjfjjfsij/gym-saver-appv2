"use client"
// Deployment trigger: 2026-02-12T21:50:00Z - Switch to Firestore-only search

import { useState, useEffect, useMemo, useRef } from "react"
import { Header } from "@/components/header"
import { GymMap } from "@/components/gym-map"
import { GymFilters } from "@/components/gym-filters"
import { GymCard } from "@/components/gym-card"
import { HoneypotGym } from "@/components/HoneypotGym"
import { CompareBar } from "@/components/compare-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2, BookmarkCheck, Search, Mail, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthContext"
import { useRouter } from "next/navigation"
import { AuthGateModal } from "@/components/auth/AuthGateModal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { isBot, getDynamicSecret, isInAppBrowser } from "@/lib/bot-detection"
import { calculateDistance, Gym, getGymPrice } from "@/lib/gym-utils"
import { ImageGalleryModal } from "@/components/ImageGalleryModal"

export async function fetchGymsFromFirestore(centerLat: number, centerLng: number, searchTerm?: string, radiusMs = 8000) {
  // 1. Bot Check
  if (isBot()) {
    console.warn("🛡️ Bot detected. Proxying request through bot-trap.");
    // We'll let the API handle the poison pill
  }

  const secret = getDynamicSecret();
  // Add a timestamp for cache busting
  const ts = Date.now();
  const url = `/api/gyms?lat=${centerLat}&lng=${centerLng}&source=firestore${searchTerm ? `&query=${encodeURIComponent(searchTerm)}` : ''}&radius=${radiusMs}&_ts=${ts}`;
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


export default function GymSaverApp({ initialBotLocation, initialSearchQuery }: { initialBotLocation?: { lat: number; lng: number } | null, initialSearchQuery?: string }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "")

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
  const [originalUserLocation, setOriginalUserLocation] = useState<{ lat: number; lng: number } | null>(initialBotLocation || null)
  const [isLocating, setIsLocating] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [lastGeocodedQuery, setLastGeocodedQuery] = useState("")
  const [recenterToken, setRecenterToken] = useState(0)
  const lastFetchRef = useRef({ lat: 0, lng: 0, radius: 0 })

  // Diagnostic Logging
  useEffect(() => {
    console.log("🔍 Search Page Mounted", { authLoading, user: user?.uid || "guest" })
  }, [authLoading, user])

  const [gyms, setGyms] = useState<Gym[]>([])
  const [allGyms, setAllGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentZoom, setCurrentZoom] = useState<number>(12)

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
  const fetchGyms = async (lat: number, lng: number, query?: string, type?: string, radius?: number) => {
    // Only show spinner if we aren't in national heatmap mode
    if (currentZoom > 10) {
      setLoading(true)
    }
    setError(null)

    try {
      console.log(`Fetching gyms near ${lat}, ${lng} with query: ${query || 'none'} and radius: ${radius || 8000}...`)
      // Pass coordinates and query to the geo-query function
      let rawData;
      try {
        rawData = await fetchGymsFromFirestore(lat, lng, query, radius || 8000);
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
          console.warn("Log failed:", e);
        }
      }

      let filteredData = firestoreGymsData;

      // 1. Client-side Longitude Filter (Approximate bounding box completion)
      // The longitude delta should scale linearly with the radius to prevent hiding gyms.
      // E.g. at 8000m radius -> ~0.15 delta. At 500,000m => ~9.0 delta.
      const currentRadius = radius || 8000;
      const lngDelta = (currentRadius / 8000) * 0.15;
      filteredData = filteredData.filter((g: any) => {
        const docLng = g.location?.lng !== undefined ? g.location.lng : g.lng;
        if (docLng === undefined || docLng === 0) return true; // Show it if we don't know, don't hide it
        return docLng >= (lng - lngDelta) && docLng <= (lng + lngDelta);
      });
      console.log(`[Diagnostic] After longitude filter (delta ${lngDelta.toFixed(2)}): ${filteredData.length} documents.`);

      // Determine effective query based on type if no explicit query
      // REMOVED: Auto-setting query for types (e.g. "24 hour gym") causes strict string matching
      // which hides valid gyms like "JD Gyms". We rely on client-side filteredGyms logic instead.
      let effectiveQuery = query;


      // 2. Filter by: city == <searchTerm> OR name contains <searchTerm>
      // (Keep existing text search logic if user types something)
      if (effectiveQuery && effectiveQuery.trim().length > 0) {
        const lowerQuery = effectiveQuery.toLowerCase().trim();
        // If the query is generic like "gym" or "gyms", don't strictly filter
        if (lowerQuery !== "gym" && lowerQuery !== "gyms" && lowerQuery !== "fitness") {
          filteredData = filteredData.filter((g: any) => {
            const name = (g.name || "").toLowerCase();
            const city = (g.city || "").toLowerCase();
            const address = (g.address || "").toLowerCase();

            const cityMatch = city.includes(lowerQuery) || lowerQuery.includes(city);
            const nameMatch = name.includes(lowerQuery) || lowerQuery.includes(name);
            const addressMatch = address.includes(lowerQuery);

            return cityMatch || nameMatch || addressMatch;
          });
        }
      }
      // 2b. Implicit City Filter - REMOVED
      // We want to show all gyms within the radius, sorted by distance.
      // The previous logic restricted results to the "closest city", hiding nearby gyms in other towns.
      /*
      else if (!query && lat && lng) {
        // ... (removed restrictive logic)
      }
      */

      // 2c. Price Filter: We now want to show ALL gyms, even if they don't have known prices yet.
      // (They will display 'Prices coming soon')
      // (Skipping aggressive filtering here)

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
        // We will now ONLY filter it out if we are SURE it's a duplicate/unlinked entry.
        // For JD Gyms, Anytime Fitness, and The Gym Group, we are explicitly skipping this filter.
        const isMajorBrand = ["puregym", "the gym", "anytime fitness", "david lloyd", "nuffield health", "everlast gym", "jd gyms", "jd gym"].some(brand => gymNameLower.includes(brand));

        if (ratings === 0 && isMajorBrand) {
          if (!address || address === city || address === "swindon" || address === "unknown") {
            // EXCEPTION: Never filter out JD Gyms, Anytime Fitness, or The Gym Group by quality check
            if (gymNameLower.includes("jd gym") || gymNameLower.includes("anytime") || gymNameLower.includes("the gym")) return true;

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

      // 4. Map ALL data for the Heatmap before slicing for the list
      const mappedFirestoreGyms: Gym[] = filteredData.map((g: any) => {
        // Robust coordinate extraction
        const gymLat = g.location?.lat !== undefined ? g.location.lat : g.lat;
        const gymLng = g.location?.lng !== undefined ? g.location.lng : g.lng;

        // Standardize Name
        let gymName = g.name || "Unknown Gym";
        if (gymName === "Swindon Stratton") gymName = "PureGym Swindon Stratton";

        const websiteLower = (g.website || "").toLowerCase();

        // Brand Normalisation (Consolidated)
        if (gymName.toLowerCase().includes("puregym")) gymName = gymName.replace(/puregym/i, "PureGym");
        else if (websiteLower.includes("puregym") && !gymName.toLowerCase().includes("puregym")) gymName = `PureGym ${gymName}`;

        if (gymName.toLowerCase().includes("jd gym")) gymName = gymName.replace(/jd\s?gyms?/i, "JD Gyms");
        else if (websiteLower.includes("jdgyms") && !gymName.toLowerCase().includes("jd")) gymName = `JD Gyms ${gymName}`;

        if (gymName.toLowerCase().includes("the gym")) {
          if (!gymName.includes("The Gym Group")) gymName = gymName.replace(/the\s?gym/i, "The Gym Group");
        } else if (websiteLower.includes("thegymgroup") && !gymName.toLowerCase().includes("the gym")) gymName = `The Gym Group ${gymName}`;

        // Address logic
        let gymAddress = "";
        if (g.address && g.address !== "Unknown" && g.address !== "undefined") gymAddress = g.address;
        else if (g.city && g.city !== "Unknown" && g.city !== "undefined") gymAddress = g.city;
        else if (g.location?.address && g.location.address !== "Unknown") gymAddress = g.location.address;

        return {
          id: g.place_id || g.id,
          name: gymName,
          address: gymAddress,
          rating: g.rating || 0,
          type: g.type || "Gym",
          priceLevel: "££",
          lat: gymLat !== undefined ? gymLat : lat,
          lng: gymLng !== undefined ? gymLng : lng,
          distance: 0,
          location: typeof g.location === 'object' ? g.location : { lat: gymLat, lng: gymLng, address: gymAddress },
          lowest_price: g.lowest_price,
          memberships: g.memberships,
          user_ratings_total: g.user_ratings_total,
          hero_image_url: g.hero_image_url,
          gallery_image_urls: g.gallery_image_urls,
          photo_reference: (() => {
            const ref = g.photo_reference || g.photo;
            if (ref && (ref.startsWith('places/') || ref.startsWith('http'))) return ref;
            return g.photos && g.photos.length > 0 ? g.photos[0] : undefined;
          })(),
          photos: g.photos || [],
          website: g.website,
        };
      });

      console.log(`Setting heatmap data: ${mappedFirestoreGyms.length} gyms.`);
      setAllGyms(mappedFirestoreGyms);

      // 5. Limit cards list to top 50
      const listGyms = mappedFirestoreGyms.slice(0, 50);
      console.log(`Loaded ${listGyms.length} gyms into result list.`);
      setGyms(listGyms);

    } catch (err) {
      console.error("Critical error in fetchGyms (Firestore Only)", err)
      setError("Failed to load gyms. Please try again later.")
      setGyms([]);
      setAllGyms([]);
    }
    finally {
      setLoading(false)
    }
  }

  // REMOVED Redundant useEffect (Merged into the one below at line 626)

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

      // OPTION B FIX: If the current search query is exactly what we just geocoded,
      // bypass this strict local filter. This ensures when you search "London", 
      // you see ALL London gyms, rather than just gyms with "London" literally in the name/address.
      if (searchQuery && searchQuery !== lastGeocodedQuery) {
        if (
          !gym.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !gym.address.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false
        }
      }

      // STRICT PRICE FILTER: Removed so all gyms can be displayed.
      // Gyms without prices will elegantly show "Prices coming soon" on their cards.

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
      // 3. Sorting with Featured Override
      const now = new Date();

      const isAFeatured = a.isFeatured === true &&
        (!a.featuredFrom || now >= new Date(a.featuredFrom.seconds ? a.featuredFrom.seconds * 1000 : a.featuredFrom)) &&
        (!a.featuredUntil || now <= new Date(a.featuredUntil.seconds ? a.featuredUntil.seconds * 1000 : a.featuredUntil));

      const isBFeatured = b.isFeatured === true &&
        (!b.featuredFrom || now >= new Date(b.featuredFrom.seconds ? b.featuredFrom.seconds * 1000 : b.featuredFrom)) &&
        (!b.featuredUntil || now <= new Date(b.featuredUntil.seconds ? b.featuredUntil.seconds * 1000 : b.featuredUntil));

      // Featured items always go to the top. If both are featured (or neither are), sort by regular criteria.
      if (isAFeatured && !isBFeatured) return -1;
      if (!isAFeatured && isBFeatured) return 1;

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

  const handleLocationDetection = () => {
    setIsLocating(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLastGeocodedQuery("Current Location")
        setUserLocation({ lat: latitude, lng: longitude })
        setOriginalUserLocation({ lat: latitude, lng: longitude })
        setRecenterToken(t => t + 1)
        lastFetchRef.current = { lat: latitude, lng: longitude, radius: 8000 }
        fetchGyms(latitude, longitude, searchQuery, "all", 8000)
        setIsLocating(false)
      },
      (error) => {
        console.warn(`Geolocation error (${error.code}): ${error.message || 'Unknown error'}`)
        setError("Unable to retrieve your location. Please enter a town or postcode.")
        setIsLocating(false)
      },
      // Require high accuracy and give it 10 seconds to respond, otherwise fail faster
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // Handle map interaction (panning and bounding box expansion)
  const handleMapIdle = (zoom: number, mapLat: number, mapLng: number) => {
    // Determine the ideal radius based on the zoom level
    // Zoom 12 (default local) ~ 8000m (8km)
    // Zoom 10 (city/county level) ~ 30000m (30km)
    // Zoom 8 (region level) ~ 150000m (150km)
    // Zoom 5 (country level) ~ 1000000m (1000km)
    let dynamicRadius = 8000;

    if (zoom <= 6) {
      dynamicRadius = 800000; // Whole country
    } else if (zoom <= 8) {
      dynamicRadius = 200000; // Multiple counties
    } else if (zoom <= 10) {
      dynamicRadius = 45000; // Large county
    } else if (zoom <= 12) {
      dynamicRadius = 15000; // Large city area
    } else {
      dynamicRadius = 8000; // Tight local
    }

    // Only trigger a new fetch if the user panned far enough away from the last search center
    // OR if they zoomed out significantly exposing a larger radius
    if (!userLocation) return;

    // Always update zoom state for UI mode switching
    setCurrentZoom(zoom);

    // Track the distance from the last known fetch center, not the "userLocation" which might have drifted
    const fetchDistance = lastFetchRef.current.lat === 0 ? 0 : calculateDistance(lastFetchRef.current.lat, lastFetchRef.current.lng, mapLat, mapLng);

    // Only fetch if we moved significantly from the last fetch center, 
    // OR if we zoomed out requiring a dynamically larger radius than our last fetch
    if (fetchDistance > (dynamicRadius * 0.4) || dynamicRadius > lastFetchRef.current.radius) {
      console.log(`[Map Event] User panned/zoomed to new area. Zoom: ${zoom}, Radius: ${dynamicRadius}m. Fetching...`);
      lastFetchRef.current = { lat: mapLat, lng: mapLng, radius: dynamicRadius };
      setUserLocation({ lat: mapLat, lng: mapLng });
      fetchGyms(mapLat, mapLng, searchQuery, "all", dynamicRadius);
    }
  }

  const handleSearchClick = () => {
    // If the user wants to search a specific town manually while currently browsing the heatmap
    if (searchQuery.trim().length > 0) {
      handleGeocodeSearch(new Event("submit") as any)
    } else if (userLocation) {
      fetchGyms(userLocation.lat, userLocation.lng, searchQuery, "all", 8000)
    }
  }

  const handleRecenter = () => {
    if (originalUserLocation) {
      setUserLocation(originalUserLocation);
      setRecenterToken(t => t + 1);
      fetchGyms(originalUserLocation.lat, originalUserLocation.lng, searchQuery, "all", 8000);
    } else {
      handleLocationDetection();
    }
  };

  // Debounced Auto-Geocode Effect
  useEffect(() => {
    // Only trigger auto-geocode if there's actually a substantial change 
    // and it's not empty (empty is handled by the regular onChange cleanup)
    if (!searchQuery.trim() || searchQuery === lastGeocodedQuery) {
      return;
    }

    const timer = setTimeout(() => {
      handleGeocodeSearch();
    }, 300); // 300ms so it feels "instant" but prevents spamming the API on every single keystroke

    return () => clearTimeout(timer);
  }, [searchQuery, lastGeocodedQuery]);

  const handleGeocodeSearch = async (e?: React.KeyboardEvent<HTMLInputElement> | React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // If the input is empty, return to the original user location
    if (!searchQuery.trim()) {
      if (originalUserLocation) {
        setUserLocation(originalUserLocation);
        fetchGyms(originalUserLocation.lat, originalUserLocation.lng, "", "all", 8000);
      }
      return;
    }

    setIsGeocoding(true);
    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (response.ok && data.lat && data.lng) {
        // Update userLocation to the searched location.
        // The existing useEffect will automatically trigger fetchGyms for this new location.
        setUserLocation({
          lat: data.lat,
          lng: data.lng
        });
        setRecenterToken(t => t + 1);
        lastFetchRef.current = { lat: data.lat, lng: data.lng, radius: 8000 }

        // Option B: Keep the text in the search bar, but mark it as the active geocoded query
        // so the local text filter knows to ignore it and show all fetched gyms.
        setLastGeocodedQuery(searchQuery);

        // Optionally log or store the formatted full address of the searched area
        console.log(`Geocoded to: ${data.formattedAddress}`);
      } else {
        // Handle no results - alert or error state.
        alert(data.error || "Could not find that location. Please try a different search.");
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      alert("An error occurred while searching for that location. Please try again.");
    } finally {
      setIsGeocoding(false);
    }
  };

  // Initial fetch using default location or user location if available
  useEffect(() => {
    // If we have a user location (e.g. from bot or Geocode), fetch nearby immediately
    // BUT skip this if we are currently zoomed out in National Heatmap Mode
    // to prevent redundant "local" 8km searches from clearing the heatmap.
    if (userLocation && currentZoom > 10) {
      fetchGyms(userLocation.lat, userLocation.lng, searchQuery, filters.type, 8000)
    } else if (!userLocation && !isLocating) {
      // If we have an initial query (e.g. from SEO Location page) but no location, trigger geocode
      if (initialSearchQuery) {
        handleGeocodeSearch(new Event("submit") as any);
      } else if (!isInAppBrowser()) {
        // Fallback: Try to get location again if not set, but don't block
        // Only do this automatically if we are NOT in an in-app browser
        handleLocationDetection();
      }
    }
  }, [userLocation?.lat, userLocation?.lng, searchQuery, filters.type, currentZoom, initialSearchQuery]) // Deep compare location props

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

        {/* Action Bar (Mobile Only - Replicating Desktop Header Nav) */}
        <div className="md:hidden w-full px-4 py-2 flex justify-between gap-3 shrink-0 z-[9500] relative">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="w-1/2 bg-[#6BD85E]/90 hover:bg-[#5bc250] text-black font-bold h-10 px-2 sm:px-4 rounded-xl flex items-center justify-center gap-1 sm:gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(107,216,94,0.2)] hover:shadow-[0_0_30px_rgba(107,216,94,0.3)] transition-all duration-300">
                <span className="truncate text-xs sm:text-sm">Gym Owners</span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[calc(50vw-16px)] bg-black/95 border-white/10 backdrop-blur-xl rounded-xl p-2 text-white z-50">
              <DropdownMenuItem asChild className="flex cursor-pointer items-center rounded-lg px-2 py-3 text-sm font-bold hover:bg-white/10 focus:bg-white/10 transition-colors">
                <Link href="/list-your-gym" className="w-full">List your gym</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="flex cursor-pointer items-center rounded-lg px-2 py-3 text-sm font-bold hover:bg-white/10 focus:bg-white/10 transition-colors">
                <Link href="/contact" className="w-full">Contact us</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="w-1/2 bg-[#6BD85E]/90 hover:bg-[#5bc250] text-black font-bold h-10 px-2 sm:px-4 rounded-xl flex items-center justify-center gap-1 sm:gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(107,216,94,0.2)] hover:shadow-[0_0_30px_rgba(107,216,94,0.3)] transition-all duration-300">
                <span className="truncate text-xs sm:text-sm">Gym Users</span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[calc(50vw-16px)] bg-black/95 border-white/10 backdrop-blur-xl rounded-xl p-2 text-white z-50">
              <DropdownMenuItem asChild className="flex cursor-pointer items-center rounded-lg px-2 py-3 text-sm font-bold hover:bg-white/10 focus:bg-white/10 transition-colors">
                <Link href="/submit" className="w-full">Gym price update</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="flex cursor-pointer items-center rounded-lg px-2 py-3 text-sm font-bold hover:bg-white/10 focus:bg-white/10 transition-colors">
                <Link href="/contact" className="w-full">Contact us</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="flex cursor-pointer items-center rounded-lg px-2 py-3 text-sm font-bold hover:bg-white/10 focus:bg-white/10 transition-colors">
                <Link href="/affiliate" className="w-full">Partner with us</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* NEW: Full-Width Search & Filters Header (Sticky) */}
        <div className="sticky top-0 z-30 glass-premium p-4 md:p-6 space-y-4 w-full border-b dark:border-white/10">
          {/* Search Bar (Priority Position) */}
          <div className="max-w-7xl mx-auto relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <form onSubmit={handleGeocodeSearch} className="w-full relative">
              <Input
                type="search"
                placeholder="Search by name, or type a city and press Enter..."
                value={searchQuery}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGeocodeSearch(e);
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  // If they completely clear the search bar, automatically return to original location
                  if (value.trim() === '' && originalUserLocation) {
                    setUserLocation(originalUserLocation);
                    fetchGyms(originalUserLocation.lat, originalUserLocation.lng, "", "all", 8000);
                  }
                }}
                className="pl-12 h-14 text-lg bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-foreground dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl focus:bg-white dark:focus:bg-black/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all w-full tracking-tight shadow-sm"
              />
              {isGeocoding && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                </div>
              )}
            </form>
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
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Sorting by Distance
                </div>
                {/* Recenter Button (Mobile) */}
                <button onClick={handleRecenter} className="text-muted-foreground hover:text-white transition-colors bg-white/5 p-1.5 rounded-full" title="Recenter to my location">
                  <MapPin className="w-3.5 h-3.5" />
                </button>
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
                  onClick={handleLocationDetection}
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
                  {currentZoom <= 10 ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col items-center justify-center py-24 text-center border border-[#6BD85E]/20 rounded-3xl bg-[#6BD85E]/5 backdrop-blur-sm px-8 space-y-4">
                        <div className="w-20 h-20 bg-[#6BD85E]/10 rounded-full flex items-center justify-center border border-[#6BD85E]/30 mb-2">
                          <MapPin className="h-10 w-10 text-[#6BD85E] animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-white tracking-tight">National Heatmap Mode</h3>
                          <p className="text-slate-400 text-sm max-w-[300px] leading-relaxed">
                            You are currently viewing a wide area. Please zoom in or return to a specific location to see detailed gym results here.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#6BD85E]/30 text-[#6BD85E] hover:bg-[#6BD85E]/10 rounded-full px-6"
                          onClick={handleRecenter}
                        >
                          Return to my location
                        </Button>
                      </div>
                    </div>
                  ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="h-10 w-10 text-[#6BD85E] animate-spin mb-4" />
                      <p className="text-slate-400 animate-pulse">Finding the best gyms near you...</p>
                    </div>
                  ) : filteredGyms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-secondary/10 backdrop-blur-sm px-6">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                        <Search className="h-8 w-8 text-muted-foreground opacity-20" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No gyms found nearby</h3>
                      <p className="text-muted-foreground text-sm max-w-[280px] mb-6">
                        {showSavedOnly
                          ? "You haven't saved any gyms yet. Tap the bookmark icon on any gym to see it here."
                          : "We couldn't find any gyms matching your filters. Try broadening your search or clearing filters."}
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
                              fetchGyms(51.5074, -0.1278, "", "all", 8000)
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
                        allGyms={allGyms}
                        selectedGym={selectedGym}
                        onGymSelect={(gym) => {
                          setSelectedGym(gym);
                          if (window.innerWidth < 768) {
                            // Mobile logic remains
                          }
                        }}
                        userLocation={userLocation}
                        onMapIdle={handleMapIdle}
                        currentZoom={currentZoom}
                        onZoomChange={(zoom) => setCurrentZoom(zoom)}
                        recenterToken={recenterToken}
                      />
                      {/* Map Overlay Gradient */}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/20" />

                      {/* Mobile Floating Back to List Button & Recenter */}
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center gap-3">
                        <Button
                          onClick={() => setActiveView("list")}
                          className="pointer-events-auto md:hidden shadow-lg bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold rounded-full px-6"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                          Back to List
                        </Button>
                        <Button
                          size="icon"
                          onClick={handleRecenter}
                          className="pointer-events-auto shadow-lg bg-black/80 hover:bg-black text-white border border-white/20 rounded-full h-10 w-10 backdrop-blur-md"
                          title="Recenter Map"
                        >
                          <MapPin className="h-5 w-5" />
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
