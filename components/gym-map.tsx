"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

import { useToast } from "@/components/ui/use-toast"

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
}

interface GymMapProps {
  gyms: Gym[]
  selectedGym: Gym | null
  onGymSelect: (gym: Gym) => void
  userLocation: { lat: number; lng: number } | null
}

export function GymMap({ gyms, selectedGym, onGymSelect, userLocation }: GymMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const { theme } = useTheme()
  const markersRef = useRef<google.maps.Marker[]>([])
  const { toast } = useToast()

  // Initialize Map
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        if (!map) {
          let MapConstructor;

          if (window.google?.maps?.importLibrary) {
            const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
            MapConstructor = Map;
          } else {
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
            center: userLocation || { lat: 40.7128, lng: -74.006 },
            zoom: 13,
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
      if (window.google?.maps && (window.google.maps.Map || window.google.maps.importLibrary)) {
        initMap();
      } else {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);

        if (!existingScript && apiKey) {
          const script = document.createElement("script");
          // Define global callback for Google Maps
          (window as any).initMap = () => {
            initMap();
            // Cleanup global
            delete (window as any).initMap;
          };

          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=initMap`;
          script.async = true;
          script.defer = true;
          // script.onload handled by callback
          script.onerror = (e) => console.error("Google Maps script failed to load:", e);
          document.head.appendChild(script);
        } else if (existingScript) {
          existingScript.addEventListener('load', initMap);
        }
      }
    }
  }, [userLocation]); // Dependency purely on userLocation might re-run logic, but checks prevent dupes

  // Update Map Style when theme changes
  useEffect(() => {
    if (!map) return;

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

    map.setOptions({
      styles: theme === "dark" ? darkMapStyle : lightMapStyle
    });
  }, [map, theme]);

  // Update Map Center when userLocation changes
  // Update Map Bounds to show User and Gyms
  useEffect(() => {
    if (!map || !userLocation) return

    if (gyms.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      // Add user location
      bounds.extend(userLocation)

      // Add all gym locations
      gyms.forEach(gym => {
        bounds.extend({ lat: Number(gym.lat), lng: Number(gym.lng) })
      })

      map.fitBounds(bounds)

      // Optional: If bounds are too tight (e.g. only 1 result very close), prevent excessive zoom?
      // Google Maps handles this reasonably well usually.
    } else {
      map.panTo(userLocation)
      map.setZoom(14)
    }
  }, [map, userLocation, gyms]) // Trigger when gyms update too

  // Update Markers
  useEffect(() => {
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    const createMarkers = () => {
      console.log('GymMap: Creating markers for', gyms.length, 'gyms');

      // Use standard Marker constructor that is guaranteed to be available after initMap
      const MarkerConstructor = google.maps.Marker;

      // Use custom marker image
      const markerIcon = {
        url: '/gym-location-marker.png',
        scaledSize: new google.maps.Size(40, 53),
        anchor: new google.maps.Point(20, 53),
      };

      gyms.forEach((gym) => {
        try {
          const isSelected = selectedGym?.id === gym.id;
          const marker = new MarkerConstructor({
            map,
            position: { lat: Number(gym.lat), lng: Number(gym.lng) },
            title: gym.name,
            icon: markerIcon,
            zIndex: isSelected ? 999 : 1,
            animation: isSelected ? google.maps.Animation.BOUNCE : null,
          })

          if (isSelected) {
            setTimeout(() => {
              marker.setAnimation(null);
            }, 750);
          }

          marker.addListener("click", () => {
            console.log('Marker clicked:', gym.name);
            onGymSelect(gym)
          })

          markersRef.current.push(marker)
        } catch (e) {
          console.error('Error creating marker for gym:', gym.name, e);
        }
      })
      console.log('GymMap: Markers created:', markersRef.current.length);
    }

    createMarkers()

  }, [map, gyms, selectedGym, onGymSelect])

  return (
    <div className="relative h-full w-full bg-slate-100">
      <div ref={mapRef} className="h-full w-full" />


    </div>
  )
}
