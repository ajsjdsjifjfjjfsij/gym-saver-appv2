"use client"
// Deployment trigger: 2026-02-12T21:50:00Z - Switch to Firestore-only search

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Header } from "@/components/header"
import { GymMap } from "@/components/gym-map"
import { GymFilters } from "@/components/gym-filters"
import { GymCard } from "@/components/gym-card"
import { HoneypotGym } from "@/components/HoneypotGym"
import { CompareBar } from "@/components/compare-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2, BookmarkCheck, Search, Mail, ChevronDown, Zap } from "lucide-react"
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
import { getApiBaseUrl } from "@/lib/api-env"
import { logRealActivity } from "@/lib/activityLogger"

export async function fetchGymsFromFirestore(centerLat: number, centerLng: number, searchTerm?: string, radiusMs = 8000) {
  // 1. Bot Check
  if (isBot()) {
    console.warn("🛡️ Bot detected. Proxying request through bot-trap.");
    // We'll let the API handle the poison pill
  }

  const secret = getDynamicSecret();
  // Add a timestamp for cache busting
  const ts = Date.now();
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/gyms?lat=${centerLat}&lng=${centerLng}&source=firestore${searchTerm ? `&query=${encodeURIComponent(searchTerm)}` : ''}&radius=${radiusMs}&_ts=${ts}`;
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
  const [stableUserLocation, setStableUserLocation] = useState<{ lat: number; lng: number } | null>(initialBotLocation || null);

  useEffect(() => {
    if (!userLocation) return;
    if (!stableUserLocation) {
      setStableUserLocation(userLocation);
      return;
    }

    const dist = calculateDistance(userLocation.lat, userLocation.lng, stableUserLocation.lat, stableUserLocation.lng);
    // Only update stable location if moved more than 30 meters (approx 0.02 miles)
    if (dist > 0.02) {
      setStableUserLocation(userLocation);
    }
  }, [userLocation, stableUserLocation]);
  const [originalUserLocation, setOriginalUserLocation] = useState<{ lat: number; lng: number } | null>(initialBotLocation || null)
  const [isLocating, setIsLocating] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [lastGeocodedQuery, setLastGeocodedQuery] = useState("")
  const [recenterToken, setRecenterToken] = useState(0)
  const lastFetchRef = useRef({ lat: 0, lng: 0, radius: 0 })
  const hasAttemptedLocatingRef = useRef(false)
  const isInitialMountRef = useRef(true)

  // Diagnostic Logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 Search Page Mounted", { authLoading, user: user?.uid || "guest" })
    }
  }, [authLoading, user])

  // Helper to detect if a query is primarily searching for a gym brand
  const isBrandQuery = useCallback((query: string) => {
    const normalized = query.toLowerCase().replace(/\s/g, "");
    return (
      normalized.includes("puregym") ||
      normalized.includes("jdgym") ||
      normalized.includes("thegym") ||
      normalized.includes("nuffield") ||
      normalized.includes("bannatyne") ||
      normalized.includes("anytimefitness") ||
      normalized.includes("jetts") ||
      normalized.includes("jettsgym")
    );
  }, []);

  // Fetch gyms from Firestore ONLY
  const fetchGyms = async (lat: number, lng: number, query?: string, type?: string, radius?: number, forceSkipFilter?: boolean) => {
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

      if (firestoreGymsData.length > 0 && process.env.NODE_ENV === 'development') {
        try {
          const jdCheck = firestoreGymsData.filter((g: any) => g && (g.name || "").toLowerCase().includes("jd"));
          console.log(`[Diagnostic] JD Gyms in RAW firestore response: ${jdCheck.length}`);
        } catch (e) {
          // ignore
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
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Diagnostic] After longitude filter (delta ${lngDelta.toFixed(2)}): ${filteredData.length} documents.`);
      }

      // Determine effective query based on type if no explicit query
      // REMOVED: Auto-setting query for types (e.g. "24 hour gym") causes strict string matching
      // which hides valid gyms like "JD Gyms". We rely on client-side filteredGyms logic instead.
      let effectiveQuery = query;

      // 2. Filter by: city == <searchTerm> OR name contains <searchTerm>
      // (Keep existing text search logic if user types something)
      if (effectiveQuery && effectiveQuery.trim().length > 0) {
        const lowerQuery = effectiveQuery.toLowerCase().trim();
        // BRAND NORMALIZATION: If user searches for "Pure Gym", they should find "PureGym"
        const normalizedQuery = lowerQuery.replace(/\s/g, "");

        // Detect brand-intent
        const isBrand = normalizedQuery.includes("puregym") ||
          normalizedQuery.includes("jdgym") ||
          normalizedQuery.includes("thegym") ||
          normalizedQuery.includes("nuffield") ||
          normalizedQuery.includes("bannatyne") ||
          normalizedQuery.includes("anytimefitness") ||
          normalizedQuery.includes("jetts");

        // If the query is exactly what we just geocoded (a location search), 
        // don't strictly filter the results by name/city text UNLESS it's a brand search.
        const matchesGeocode = (forceSkipFilter || lowerQuery === lastGeocodedQuery.toLowerCase().trim()) && !isBrand;

        // If the query is generic like "gym" or "gyms", don't strictly filter
        if (lowerQuery !== "gym" && lowerQuery !== "gyms" && lowerQuery !== "fitness" && !matchesGeocode) {
          filteredData = filteredData.filter((g: any) => {
            const name = (g.name || "").toLowerCase();
            const normalizedName = name.replace(/\s/g, "");
            const website = (g.website || "").toLowerCase();
            const city = (g.city || "").toLowerCase();
            const address = (g.address || "").toLowerCase();

            const cityMatch = city.includes(lowerQuery) || lowerQuery.includes(city);
            const nameMatch = name.includes(lowerQuery) || lowerQuery.includes(name) || normalizedName.includes(normalizedQuery);
            const addressMatch = address.includes(lowerQuery);
            const brandMatch =
              (normalizedQuery.includes("puregym") && (website.includes("puregym") || normalizedName.includes("puregym"))) ||
              (normalizedQuery.includes("jdgym") && (website.includes("jdgym") || normalizedName.includes("jdgym"))) ||
              (normalizedQuery.includes("thegym") && (website.includes("thegymgroup") || normalizedName.includes("thegym"))) ||
              (normalizedQuery.includes("nuffield") && (website.includes("nuffield") || normalizedName.includes("nuffield"))) ||
              (normalizedQuery.includes("bannatyne") && (website.includes("bannatyne") || normalizedName.includes("bannatyne"))) ||
              (normalizedQuery.includes("anytimefitness") && (website.includes("anytimefitness") || normalizedName.includes("anytime"))) ||
              (normalizedQuery.includes("jetts") && (website.includes("jetts") || normalizedName.includes("jetts")));

            // If it's a brand search, it overrides other strict filters
            if (isBrand && brandMatch) return true;

            return cityMatch || nameMatch || addressMatch;
          });
        }
      }

      // 2d. Provider Exclusion: Hide "Better" (GLL) gyms completely
      // Also exclude strict blacklist terms for non-gym venues
      const unwantedTerms = [
        "better ", "better gym", // Provider: Better (GLL)
        "david lloyd", "village gym", // Blacklisted providers
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
        const gymNameNormalized = gymNameLower.replace(/\s/g, "");
        const majorBrandsNormalized = ["puregym", "thegym", "anytimefitness", "everlastgym", "jdgym", "snapfitness"];

        const isMajorBrand = majorBrandsNormalized.some(brand => gymNameNormalized.includes(brand));

        if (ratings === 0) {
          const hasImage = g.hero_image_url || (g.photos && g.photos.length > 0) || g.photo_reference || g.photo;
          const isGenericAddress = !address || address === city || address === "swindon" || address === "unknown" || address.trim().toLowerCase() === city.trim().toLowerCase();

          if (isGenericAddress && !hasImage) {
            console.log(`Filtering out incomplete gym entry: ${g.name}`);
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

        // Clean potentially malformed Place IDs (e.g. trailing newlines/addresses)
        const rawId = g.place_id || g.id || "";
        const safeId = typeof rawId === 'string' ? rawId.split('\n')[0].trim() : String(rawId);

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

        if (gymName.toLowerCase().includes("jetts")) {
          if (!gymName.includes("Jetts Gym")) gymName = gymName.replace(/jetts\s?gym?/i, "Jetts Gym");
        } else if (websiteLower.includes("jetts.co.uk") && !gymName.toLowerCase().includes("jetts")) gymName = `Jetts Gym ${gymName}`;

        // Address logic
        let gymAddress = "";
        if (g.address && g.address !== "Unknown" && g.address !== "undefined") gymAddress = g.address;
        else if (g.city && g.city !== "Unknown" && g.city !== "undefined") gymAddress = g.city;
        else if (g.location?.address && g.location.address !== "Unknown") gymAddress = g.location.address;

        // Dynamic Price Level calculation
        const gymStubForPrice = { name: gymName, lowest_price: g.lowest_price };
        const priceInfo = getGymPrice(gymStubForPrice as any);
        let calculatedPriceLevel = "££";
        if (priceInfo.monthly) {
          if (priceInfo.monthly < 30) calculatedPriceLevel = "£";
          else if (priceInfo.monthly <= 60) calculatedPriceLevel = "££";
          else calculatedPriceLevel = "£££";
        }

        return {
          id: safeId,
          name: gymName,
          address: gymAddress,
          rating: g.rating || 0,
          type: g.type || "Gym",
          priceLevel: calculatedPriceLevel,
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
          city: g.city,
        };
      });

      setAllGyms(mappedFirestoreGyms);

      // 5. Limit cards list to top 50 (or up to 400 for brand searches to show all)
      const isBrandFetch = effectiveQuery && isBrandQuery(effectiveQuery);
      const listLimit = isBrandFetch ? 400 : 50;
      const listGyms = mappedFirestoreGyms.slice(0, listLimit);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Loaded ${listGyms.length} gyms into result list.`);
      }
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

  const handleGeocodeSearch = useCallback(async (e?: React.KeyboardEvent<HTMLInputElement> | React.FormEvent, silent = false) => {
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





    // BRAND SEARCH BYPASS: If someone searches "Pure Gym" or "JD Gyms"
    // Search nationwide instead of geocoding a specific city.
    if (isBrandQuery(searchQuery)) {
      console.log(`[Brand Search] Bypassing geocode for "${searchQuery}" - searching nationwide.`);
      const center = userLocation || { lat: 54.5, lng: -2.5 }; // UK Center fallback
      
      if (!userLocation) {
        setUserLocation(center);
        setRecenterToken(t => t + 1);
      }
      
      lastFetchRef.current = { lat: center.lat, lng: center.lng, radius: 800000 };
      fetchGyms(center.lat, center.lng, searchQuery, "all", 800000, true);
      setLastGeocodedQuery(searchQuery);
      return;
    }

    setIsGeocoding(true);
    try {
      const secret = getDynamicSecret();
      const ts = Date.now();
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(searchQuery)}&_ts=${ts}`, {
        headers: {
          "x-gymsaver-app-secret": secret
        }
      });
      const data = await response.json();

      if (response.ok && data.lat && data.lng) {
        setUserLocation({
          lat: data.lat,
          lng: data.lng
        });
        setRecenterToken(t => t + 1);
        lastFetchRef.current = { lat: data.lat, lng: data.lng, radius: 15000 }

        // Trigger explicit fetch for the geocoded location
        // We use a larger radius (15km) for explicit searches to ensure brand coverage
        fetchGyms(data.lat, data.lng, searchQuery, "all", 15000, true);

        setLastGeocodedQuery(searchQuery);
        console.log(`Geocoded to: ${data.formattedAddress}`);
        
        // Log real activity
        const cityOrTown = data.formattedAddress?.split(',')[0] || searchQuery;
        logRealActivity({
          type: 'trending',
          city: cityOrTown
        });
      } else {
        if (!silent) {
          alert(data.error || "Could not find that location. Please try a different search.");
        }
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      if (!silent) {
        alert("An error occurred while searching for that location. Please try again.");
      }
    } finally {
      setIsGeocoding(false);
    }
  }, [searchQuery, originalUserLocation, userLocation, isBrandQuery])

  // Debounced auto-search
  useEffect(() => {
    // Don't auto-search if query is empty, too short, or matches the last successful search
    if (!searchQuery.trim() || searchQuery.length < 3 || searchQuery === lastGeocodedQuery) {
      return;
    }

    const timer = setTimeout(() => {
      console.log(`[Auto-Search] Triggering for "${searchQuery}"`);
      handleGeocodeSearch(undefined, true); // true = silent mode
    }, 1000); // 1-second delay to ensure they've finished typing

    return () => clearTimeout(timer);
  }, [searchQuery, handleGeocodeSearch, lastGeocodedQuery]);

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
    let hasSeenTooltip = false;
    try {
      hasSeenTooltip = !!localStorage.getItem("hasSeenCompareTooltip");
    } catch (e) {
      console.warn("localStorage access denied:", e);
    }

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
    try {
      localStorage.setItem("hasSeenCompareTooltip", "true")
    } catch (e) {
      console.warn("localStorage setItem failed:", e);
    }
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


  // Calculate distances
  const gymsWithDistance = useMemo(() => {
    if (!stableUserLocation) return gyms
    return gyms.map((gym) => ({
      ...gym,
      distance: calculateDistance(stableUserLocation.lat, stableUserLocation.lng, gym.lat, gym.lng),
    }))
  }, [stableUserLocation, gyms])

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
      const lowerSearchQuery = (searchQuery || "").toLowerCase().trim();
      const lastGeocodedLower = (lastGeocodedQuery || "").toLowerCase().trim();
      const normalizedQuery = lowerSearchQuery.replace(/\s/g, "");

      // Detect brand-intent
      const isBrand = normalizedQuery.includes("puregym") ||
        normalizedQuery.includes("jdgym") ||
        normalizedQuery.includes("thegym") ||
        normalizedQuery.includes("jetts");

      // Don't filter if: 
      // 1. Query is too short (to prevent jumpy results while typing)
      // 2. Query matches geocoded location (unless it's a brand search)
      // 3. Query is generic ("gym", "fitness")
      const shouldFilter = lowerSearchQuery.length >= 4 &&
        (lowerSearchQuery !== lastGeocodedLower || isBrand) &&
        lowerSearchQuery !== "gym" &&
        lowerSearchQuery !== "fitness";

      if (shouldFilter) {
        const name = (gym.name || "").toLowerCase();
        const normalizedName = name.replace(/\s/g, "");
        const website = (gym.website || "").toLowerCase();
        const city = (gym.city || "").toLowerCase();
        const address = (gym.address || "").toLowerCase();

        const nameMatch = name.includes(lowerSearchQuery) || normalizedName.includes(normalizedQuery);
        const cityMatch = city.includes(lowerSearchQuery);
        const addressMatch = address.includes(lowerSearchQuery);
        const brandMatch = (normalizedQuery.includes("puregym") && (website.includes("puregym") || normalizedName.includes("puregym"))) ||
          (normalizedQuery.includes("jdgym") && (website.includes("jdgym") || normalizedName.includes("jdgym"))) ||
          (normalizedQuery.includes("thegym") && (website.includes("thegymgroup") || normalizedName.includes("thegym"))) ||
          (normalizedQuery.includes("jetts") && (website.includes("jetts") || normalizedName.includes("jetts")));

        if (!nameMatch && !cityMatch && !addressMatch && !brandMatch) {
          return false;
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
  }, [gymsWithDistance, searchQuery, filters, savedGyms, showSavedOnly, stableUserLocation])

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

  const handleLocationDetection = useCallback(() => {
    setIsLocating(true)
    setError(null)
    hasAttemptedLocatingRef.current = true

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
  }, [searchQuery])

  // Handle map interaction (panning and bounding box expansion)
  const handleMapIdle = useCallback((zoom: number, mapLat: number, mapLng: number) => {
    // Determine the ideal radius based on the zoom level
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
    if (!userLocation) return;

    // Always update zoom state for UI mode switching
    setCurrentZoom(zoom);

    // Track the distance from the last known fetch center
    const fetchDistance = lastFetchRef.current.lat === 0 ? 0 : calculateDistance(lastFetchRef.current.lat, lastFetchRef.current.lng, mapLat, mapLng);

    // Only fetch if we moved significantly or zoomed out
    if (fetchDistance > (dynamicRadius * 0.4) || dynamicRadius > lastFetchRef.current.radius) {
      console.log(`[Map Event] User panned/zoomed to new area. Zoom: ${zoom}, Radius: ${dynamicRadius}m. Fetching...`);
      lastFetchRef.current = { lat: mapLat, lng: mapLng, radius: dynamicRadius };
      setUserLocation({ lat: mapLat, lng: mapLng });
      fetchGyms(mapLat, mapLng, searchQuery, "all", dynamicRadius);
    }
  }, [userLocation, searchQuery])

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






  // Initial fetch using default location or user location if available
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;

      if (userLocation && currentZoom > 10) {
        fetchGyms(userLocation.lat, userLocation.lng, searchQuery, filters.type, 8000)
      } else if (!userLocation && !isLocating && !hasAttemptedLocatingRef.current) {
        if (initialSearchQuery) {
          handleGeocodeSearch();
        } else if (!isInAppBrowser()) {
          handleLocationDetection();
        }
      }
    }
  }, [userLocation, searchQuery, filters.type, currentZoom, initialSearchQuery, isLocating, handleGeocodeSearch, handleLocationDetection])

  // Save to localStorage when savedGyms changes
  useEffect(() => {
    try {
      localStorage.setItem("savedGyms", JSON.stringify(savedGyms))
    } catch (e) {
      console.warn("localStorage save failed for savedGyms:", e);
    }
  }, [savedGyms])

  // Save comparedGyms to localStorage so /compare page can read it
  useEffect(() => {
    try {
      localStorage.setItem("comparedGyms", JSON.stringify(comparedGyms))
    } catch (e) {
      console.warn("localStorage save failed for comparedGyms:", e);
    }
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
      <div className="flex flex-col h-dvh w-full overflow-hidden bg-background text-foreground touch-manipulation">
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
        <div className="md:hidden w-full px-2 sm:px-4 py-2 grid grid-cols-3 gap-1.5 sm:gap-2 shrink-0 z-[40] relative">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="w-full bg-white/10 hover:bg-white/20 text-white font-bold h-10 px-1 sm:px-2 rounded-xl flex items-center justify-center gap-1 backdrop-blur-md transition-all duration-300">
                <span className="truncate text-[10px] sm:text-xs">Owners</span>
                <ChevronDown className="h-3 w-3 shrink-0" />
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
              <Button variant="default" className="w-full bg-white/10 hover:bg-white/20 text-white font-bold h-10 px-1 sm:px-2 rounded-xl flex items-center justify-center gap-1 backdrop-blur-md transition-all duration-300">
                <span className="truncate text-[10px] sm:text-xs">Users</span>
                <ChevronDown className="h-3 w-3 shrink-0" />
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
          <Button 
            variant="default" 
            onClick={() => router.push("/gym-bounty")}
            className="w-full bg-[#6BD85E]/90 hover:bg-[#5bc250] text-black font-bold h-10 px-1 sm:px-2 rounded-xl flex items-center justify-center gap-1 backdrop-blur-md shadow-[0_0_15px_rgba(107,216,94,0.2)] transition-all duration-300"
          >
            <Zap className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-[10px] sm:text-xs">Bounties</span>
          </Button>
        </div>

        {/* Search & Filters Header (Sticky) */}
        <div className="sticky top-0 z-30 glass-premium p-4 md:p-6 space-y-4 w-full border-b dark:border-white/10">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Row 1: Search Input */}
            <div className="w-full">
              <form onSubmit={handleGeocodeSearch} className="w-full relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground search-icon-overlay z-10 pointer-events-none" />
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
                    if (value.trim() === '' && originalUserLocation) {
                      setUserLocation(originalUserLocation);
                      fetchGyms(originalUserLocation.lat, originalUserLocation.lng, "", "all", 8000);
                    }
                  }}
                  className="pl-12 h-14 text-lg bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-foreground dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl focus:bg-white dark:focus:bg-black/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all w-full tracking-tight shadow-sm relative z-0"
                />
                {isGeocoding && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                  </div>
                )}
              </form>
            </div>

            {/* Row 2: Filters */}
            <div className="w-full overflow-hidden">
              <GymFilters filters={filters} onFilterChange={handleFilterChange} />
            </div>

            {/* Row 3: Action Bar (Count, Toggle, Buttons) */}
            <div className="flex items-center justify-between gap-4 relative py-1 px-1">
              {/* Left: Results Count */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  {showSavedOnly && (
                    <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                      <BookmarkCheck className="h-5 w-5 text-primary" />
                      Saved
                    </h2>
                  )}
                  <span className="text-[10px] sm:text-xs font-bold text-muted-foreground bg-secondary/80 dark:bg-white/5 border border-white/5 px-2 py-1 rounded-lg whitespace-nowrap flex items-center gap-1.5">
                    {filteredGyms.length} results
                    {(loading || isGeocoding) && <Loader2 className="h-3 w-3 animate-spin opacity-50" />}
                  </span>
                </div>
                {userLocation && (
                  <div className="flex items-center gap-1 text-[8px] sm:text-[10px] font-bold text-primary uppercase tracking-wider animate-pulse whitespace-nowrap">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    Sorting by Distance
                  </div>
                )}
              </div>

              {/* Center: View Toggle */}
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
                <div className="flex bg-secondary/50 dark:bg-black/40 rounded-xl p-1 border border-white/10 min-w-[140px] sm:min-w-[180px] shadow-inner backdrop-blur-md">
                  <button
                    onClick={() => setActiveView("list")}
                    className={`flex-1 px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${activeView === "list" ? "bg-[#6BD85E] text-black shadow-[0_2px_10px_rgba(107,216,94,0.3)]" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                    Gyms
                  </button>
                  <button
                    onClick={() => {
                      if (!user) {
                        handleAuthRequired();
                        return;
                      }
                      setActiveView("map");
                    }}
                    className={`flex-1 px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${activeView === "map" ? "bg-[#6BD85E] text-black shadow-[0_2px_10px_rgba(107,216,94,0.3)]" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Map
                  </button>
                </div>
              </div>

              {/* Right: Recenter Tool */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleRecenter}
                  className="text-muted-foreground hover:text-primary transition-all bg-secondary/50 dark:bg-white/5 p-2 rounded-xl border border-white/5 shadow-sm active:scale-95"
                  title="Recenter to my location"
                >
                  <MapPin className="w-4 h-4" />
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
              {/* Left Panel: Gym List */}
              <div className={`
                flex flex-col bg-background z-20 transition-transform duration-300 ease-in-out
                w-full md:w-[60%] shrink-0 border-r border-white/5
                ${activeView === "list" ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                absolute inset-0 md:relative md:transform-none
              `}>
                <div className={`flex-1 overflow-y-auto overflow-x-hidden pb-32 pb-safe ${activeView === 'list' ? 'block' : 'hidden md:block'}`}>
                  <div className="p-4 space-y-4 max-w-2xl mx-auto">
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
                    ) : (loading || isGeocoding) && filteredGyms.length === 0 ? (
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
                        }}
                        userLocation={userLocation}
                        onMapIdle={handleMapIdle}
                        currentZoom={currentZoom}
                        onZoomChange={(zoom) => setCurrentZoom(zoom)}
                        recenterToken={recenterToken}
                      />
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/20" />

                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center gap-3">
                        <Button
                          onClick={() => setActiveView("list")}
                          className="pointer-events-auto md:hidden shadow-lg bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold rounded-full px-6"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                          Back to Gyms
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
        <ImageGalleryModal
          gym={galleryGym}
          isOpen={!!galleryGym}
          onClose={() => setGalleryGym(null)}
        />
      </div >
    </TooltipProvider >
  )
}
