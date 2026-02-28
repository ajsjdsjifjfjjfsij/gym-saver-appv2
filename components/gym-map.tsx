"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

import { useToast } from "@/components/ui/use-toast"
import { Gym, getGymPrice, calculateDistance } from "@/lib/gym-utils"

interface GymMapProps {
  gyms: Gym[]
  selectedGym: Gym | null
  onGymSelect: (gym: Gym) => void
  userLocation: { lat: number; lng: number } | null
  onMapIdle?: (zoom: number, lat: number, lng: number) => void
  allGyms?: Gym[]
  currentZoom?: number
  onZoomChange?: (zoom: number) => void
  recenterToken?: number
}

export function GymMap(props: GymMapProps) {
  const { gyms, selectedGym, onGymSelect, userLocation, allGyms, currentZoom: propsZoom, onZoomChange, recenterToken } = props;
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [heatmap, setHeatmap] = useState<google.maps.visualization.HeatmapLayer | null>(null)
  const { theme } = useTheme()
  const markersRef = useRef<google.maps.Marker[]>([])
  const { toast } = useToast()

  // Ref to prevent excessive idle calls
  const isFirstLoadRef = useRef(true);

  // Initialize Map
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        if (!map) {
          let MapConstructor;

          if (typeof window.google === "object" && typeof window.google.maps === "object" && typeof window.google.maps.importLibrary === "function") {
            const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
            MapConstructor = Map;
          } else if (typeof window.google === "object" && typeof window.google.maps === "object") {
            MapConstructor = google.maps.Map;
          }

          if (!MapConstructor) {
            console.warn("Google Maps API not fully loaded yet.");
            return;
          }

          const darkMapStyle = [
            { elementType: "geometry", stylers: [{ color: "#0E1114" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#0E1114" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
              featureType: "administrative.locality",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi.park",
              elementType: "geometry",
              stylers: [{ color: "#263c3f" }],
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [{ color: "#6b9a76" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#38414e" }],
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#212a37" }],
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#9ca5b3" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [{ color: "#746855" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#1f2835" }],
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.fill",
              stylers: [{ color: "#f3d19c" }],
            },
            {
              featureType: "transit",
              elementType: "geometry",
              stylers: [{ color: "#2f3948" }],
            },
            {
              featureType: "transit.station",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [{ color: "#515c6d" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#17263c" }],
            },
          ];

          const lightMapStyle = [
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }]
            },
            {
              "featureType": "landscape",
              "elementType": "geometry",
              "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry.fill",
              "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry.stroke",
              "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }]
            },
            {
              "featureType": "road.arterial",
              "elementType": "geometry",
              "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }]
            },
            {
              "featureType": "road.local",
              "elementType": "geometry",
              "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }]
            },
            {
              "featureType": "poi",
              "elementType": "geometry",
              "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }]
            },
            {
              "featureType": "poi.park",
              "elementType": "geometry",
              "stylers": [{ "color": "#dedede" }, { "lightness": 21 }]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }]
            },
            {
              "elementType": "labels.icon",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "transit",
              "elementType": "geometry",
              "stylers": [{ "color": "#f2f2f2" }, { "lightness": 19 }]
            },
            {
              "featureType": "administrative",
              "elementType": "geometry.fill",
              "stylers": [{ "color": "#fefefe" }, { "lightness": 20 }]
            },
            {
              "featureType": "administrative",
              "elementType": "geometry.stroke",
              "stylers": [{ "color": "#fefefe" }, { "lightness": 17 }, { "weight": 1.2 }]
            }
          ];

          const mapInstance = new MapConstructor(mapRef.current, {
            center: userLocation || { lat: 51.5074, lng: -0.1278 },
            zoom: 12,
            minZoom: 2,
            maxZoom: 18,
            disableDefaultUI: true,
            keyboardShortcuts: false,
            clickableIcons: false,
            styles: theme === "dark" ? darkMapStyle : lightMapStyle,
          })
          setMap(mapInstance)
        }
      } catch (error) {
        console.error("Error creating map instance:", error);
      }
    };

    if (typeof window !== "undefined") {
      if (typeof window.google === "object" && typeof window.google.maps === "object" && (typeof window.google.maps.Map === "function" || typeof window.google.maps.importLibrary === "function")) {
        initMap();
      } else {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);

        if (!existingScript && apiKey) {
          const script = document.createElement("script");
          (window as any).initMap = () => {
            initMap();
            delete (window as any).initMap;
          };

          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,visualization,marker&loading=async&callback=initMap`;
          script.async = true;
          script.defer = true;
          script.onerror = (e) => console.error("Google Maps script failed to load:", e);
          document.head.appendChild(script);
        } else if (existingScript) {
          existingScript.addEventListener('load', initMap);
        }
      }
    }
  }, [userLocation]);

  // Update Map Style when theme changes
  useEffect(() => {
    if (!map) return;
    const darkMapStyle = [
      { elementType: "geometry", stylers: [{ color: "#0E1114" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#0E1114" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
      { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
      { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
      { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
      { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
      { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
      { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
      { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
      { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
      { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
    ];

    const lightMapStyle = [
      { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }] },
      { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }] },
      { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }] },
      { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }] },
      { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }] },
      { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }] },
      { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }] },
      { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#dedede" }, { "lightness": 21 }] },
      { "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }] },
      { "elementType": "labels.text.fill", "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }] },
      { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
      { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#f2f2f2" }, { "lightness": 19 }] },
      { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#fefefe" }, { "lightness": 20 }] },
      { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#fefefe" }, { "lightness": 17 }, { "weight": 1.2 }] }
    ];

    map.setOptions({
      styles: theme === "dark" ? darkMapStyle : lightMapStyle
    });
  }, [map, theme]);

  // Update Map Center and Zoom only when explicit recenter token changes
  const prevTokenRef = useRef(recenterToken);
  useEffect(() => {
    if (!map || !userLocation || recenterToken === undefined || recenterToken === 0) return;

    if (recenterToken !== prevTokenRef.current) {
      prevTokenRef.current = recenterToken;
      map.panTo(userLocation);
      map.setZoom(12);
    }
  }, [map, userLocation, recenterToken])

  // Map Idle Listener
  useEffect(() => {
    if (!map) return;

    const idleListener = map.addListener('idle', () => {
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
        return;
      }

      if (props.onMapIdle) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        if (center && zoom !== undefined) {
          props.onMapIdle(zoom, center.lat(), center.lng());
        }
      }
    });

    let zoomTimeout: NodeJS.Timeout;
    const zoomListener = map.addListener('zoom_changed', () => {
      if (props.onZoomChange) {
        clearTimeout(zoomTimeout);
        zoomTimeout = setTimeout(() => {
          const zoom = map.getZoom();
          if (zoom !== undefined) {
            props.onZoomChange?.(zoom);
          }
        }, 300); // Debounce to prevent rapid re-renders
      }
    });

    return () => {
      google.maps.event.removeListener(idleListener);
      google.maps.event.removeListener(zoomListener);
      clearTimeout(zoomTimeout);
    };
  }, [map, props.onMapIdle, props.onZoomChange]);

  // Update Markers
  useEffect(() => {
    if (!map) return

    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    const zoomLevel = propsZoom || map.getZoom() || 12;
    if (zoomLevel <= 10) {
      console.log('GymMap: National Mode - Hiding markers');
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      return;
    }

    const createMarkers = async () => {
      const displayGyms = gyms; // Filter or optimize here if needed

      displayGyms.forEach((gym) => {
        try {
          const isSelected = selectedGym?.id === gym.id;
          const priceData = getGymPrice(gym);
          const priceText = priceData && priceData.monthly ? `£${priceData.monthly}` : 'N/A';

          const bgColor = isSelected ? '#6BD85E' : '#222222';
          const textColor = isSelected ? '#000000' : '#ffffff';
          const strokeColor = isSelected ? '#000000' : '#6BD85E';
          const scale = isSelected ? 1.1 : 1.0;

          const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="30" viewBox="0 0 60 30">
              <rect x="2" y="2" width="56" height="26" rx="13" fill="${bgColor}" stroke="${strokeColor}" stroke-width="2"/>
              <text x="30" y="20" font-family="sans-serif" font-weight="bold" font-size="12" fill="${textColor}" text-anchor="middle">${priceText}</text>
            </svg>
          `;

          const svgUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgContent);

          const marker = new google.maps.Marker({
            map,
            position: { lat: Number(gym.lat), lng: Number(gym.lng) },
            title: gym.name,
            icon: {
              url: svgUrl,
              scaledSize: new google.maps.Size(60 * scale, 30 * scale),
              anchor: new google.maps.Point(30 * scale, 15 * scale),
            },
            zIndex: isSelected ? 999 : 1,
          })

          marker.addListener("click", () => {
            onGymSelect(gym)
          })

          markersRef.current.push(marker as any)
        } catch (e) {
          console.error('Error creating marker for gym:', gym?.name, e);
        }
      })
    }

    createMarkers()
  }, [map, gyms, selectedGym?.id, propsZoom])

  // Heatmap Layer Logic
  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps.visualization) return;

    const heatmapData: google.maps.visualization.WeightedLocation[] = [];
    const sourceData = (allGyms && allGyms.length > 0) ? allGyms : gyms;

    let minPrice = Infinity;
    let maxPrice = 0;

    sourceData.forEach(gym => {
      try {
        if (!gym || !gym.name) return;
        const priceData = getGymPrice(gym);
        if (priceData && priceData.monthly && priceData.monthly > 0) {
          const numPrice = priceData.monthly;
          if (numPrice < minPrice) minPrice = numPrice;
          if (numPrice > maxPrice) maxPrice = numPrice;
        }
      } catch (e) {
        console.error("Error parsing min/max price", e);
      }
    });

    if (minPrice === Infinity) {
      minPrice = 15;
      maxPrice = 100;
    }

    const zoomLevel = propsZoom || map.getZoom() || 12;

    // 1. Determine dynamic grid size for "forming" effect
    let gridSize = 0;
    if (zoomLevel <= 5) gridSize = 0.8;
    else if (zoomLevel <= 6) gridSize = 0.6;
    else if (zoomLevel <= 7) gridSize = 0.45;
    else if (zoomLevel <= 8) gridSize = 0.35;
    else if (zoomLevel <= 9) gridSize = 0.18;
    else if (zoomLevel <= 10) gridSize = 0.08;
    else if (zoomLevel <= 11) gridSize = 0.03;

    // 2. Aggregate Data based on current grid resolution or local detail
    if (gridSize > 0) {
      const grid: Record<string, { latSum: number; lngSum: number; weightSum: number; count: number }> = {};

      sourceData.forEach(gym => {
        try {
          const lat = Number(gym.lat);
          const lng = Number(gym.lng);
          if (isNaN(lat) || isNaN(lng)) return;

          const gridX = Math.floor(lat / gridSize);
          const gridY = Math.floor(lng / gridSize);
          const key = `${gridX}_${gridY}`;

          const priceData = getGymPrice(gym);
          let weight = 1.0;
          if (priceData && priceData.monthly && priceData.monthly > 0) {
            const numPrice = priceData.monthly;
            const priceRange = maxPrice - minPrice || 1;
            const normalizedPrice = (numPrice - minPrice) / priceRange;
            weight = 1.0 + (normalizedPrice * 12.0);
          }

          if (!grid[key]) {
            grid[key] = { latSum: 0, lngSum: 0, weightSum: 0, count: 0 };
          }
          grid[key].latSum += lat;
          grid[key].lngSum += lng;
          grid[key].weightSum += weight;
          grid[key].count += 1;
        } catch (e) {
          console.error("Error aggregating regional gym data", e);
        }
      });

      Object.values(grid).forEach(bucket => {
        if (bucket.count > 0) {
          heatmapData.push({
            location: new google.maps.LatLng(bucket.latSum / bucket.count, bucket.lngSum / bucket.count),
            weight: bucket.weightSum / bucket.count
          });
        }
      });
    } else {
      // HIGH DETAIL LOCAL MODE
      sourceData.forEach(gym => {
        try {
          const lat = Number(gym.lat);
          const lng = Number(gym.lng);
          if (isNaN(lat) || isNaN(lng)) return;

          let weight = 1.0;
          const priceData = getGymPrice(gym);
          if (priceData && priceData.monthly && priceData.monthly > 0) {
            const numPrice = priceData.monthly;
            const priceRange = maxPrice - minPrice || 1;
            const normalizedPrice = (numPrice - minPrice) / priceRange;
            weight = 1.0 + (normalizedPrice * 12.0);
          }

          heatmapData.push({
            location: new google.maps.LatLng(lat, lng),
            weight: weight
          });
        } catch (e) {
          console.error("Error creating heatmap point", e);
        }
      });
    }

    // 3. Visual Calibration
    let calculatedRadius = 60;
    const calculatedMax = 12;

    if (zoomLevel <= 5) calculatedRadius = 35;
    else if (zoomLevel <= 6) calculatedRadius = 50;
    else if (zoomLevel <= 7) calculatedRadius = 70;
    else if (zoomLevel <= 8) calculatedRadius = 95;
    else if (zoomLevel <= 9) calculatedRadius = 115;
    else if (zoomLevel <= 10) calculatedRadius = 135;
    else if (zoomLevel <= 11) calculatedRadius = 90;
    else calculatedRadius = 60;

    const heatmapOptions = {
      data: heatmapData,
      map: map,
      radius: calculatedRadius,
      opacity: zoomLevel <= 7 ? 0.8 : 0.6,
      maxIntensity: calculatedMax,
      gradient: [
        'rgba(0, 0, 0, 0)',
        'rgba(57, 255, 20, 1)',   // Neon Green (Cheap)
        'rgba(255, 255, 0, 1)',   // Yellow
        'rgba(255, 165, 0, 1)',   // Orange (Medium)
        'rgba(255, 69, 0, 1)',    // Red-Orange
        'rgba(255, 0, 0, 1)',     // Red (Expensive)
      ]
    };

    if (heatmap) {
      // Update existing heatmap seamlessly
      // Use setData specifically for the most efficient data update
      heatmap.setData(heatmapData);
      heatmap.setOptions({
        radius: heatmapOptions.radius,
        opacity: heatmapOptions.opacity,
        maxIntensity: heatmapOptions.maxIntensity,
        gradient: heatmapOptions.gradient,
        map: map
      });
    } else {
      // Create new heatmap if not exists
      const newHeatmap = new google.maps.visualization.HeatmapLayer(heatmapOptions);
      setHeatmap(newHeatmap);
    }
  }, [map, allGyms, gyms, propsZoom]);

  return (
    <div className="relative h-full w-full bg-[#0e1114] overflow-hidden gym-map-container">
      <div
        ref={mapRef}
        className="h-full w-full [&_.gm-style-cc]:hidden [&_.gmnoprint]:hidden"
        style={{ backgroundColor: '#0e1114' }}
      />
    </div>
  )
}
