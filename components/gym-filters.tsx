"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, Dumbbell, MapPin, PoundSterling, Star } from "lucide-react"

interface GymFiltersProps {
  filters: {
    type: string
    distance: string
    price: string
    rating: string
  }
  onFilterChange: (key: string, value: string) => void
}

export function GymFilters({ filters, onFilterChange }: GymFiltersProps) {
  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
      {/* Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`rounded-full border transition-all ${filters.type !== "all" ? "bg-black/60 backdrop-blur-md border-[#6BD85E]/50 text-[#6BD85E] shadow-[0_0_15px_rgba(107,216,94,0.2)]" : "bg-black/40 backdrop-blur-md border-white/10 text-slate-300 hover:bg-black/60 hover:text-white"}`}>
            {filters.type === "all" ? "All Types" :
              filters.type === "gyms" ? "Gyms" :
                filters.type === "24hr" ? "24hr gyms" :
                  filters.type === "pilates" ? "Pilates (Soon)" : filters.type}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-[#06110D]/95 backdrop-blur-xl border-white/10 text-slate-200">
          <DropdownMenuItem onClick={() => onFilterChange("type", "all")}>All Types</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("type", "gyms")}>Gyms</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("type", "24hr")}>24hr gyms</DropdownMenuItem>
          <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed">Pilates (Coming Soon)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Distance Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`rounded-full border transition-all ${filters.distance !== "all" ? "bg-black/60 backdrop-blur-md border-[#6BD85E]/50 text-[#6BD85E] shadow-[0_0_15px_rgba(107,216,94,0.2)]" : "bg-black/40 backdrop-blur-md border-white/10 text-slate-300 hover:bg-black/60 hover:text-white"}`}>
            {filters.distance === "all" ? "Any Distance" : `< ${filters.distance} mi`}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-[#06110D]/95 backdrop-blur-xl border-white/10 text-slate-200">
          <DropdownMenuItem onClick={() => onFilterChange("distance", "all")}>Any Distance</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("distance", "1")}>&lt; 1 mile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("distance", "3")}>&lt; 3 miles</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("distance", "5")}>&lt; 5 miles</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("distance", "10")}>&lt; 10 miles</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Price Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`rounded-full border transition-all ${filters.price !== "all" ? "bg-black/60 backdrop-blur-md border-[#6BD85E]/50 text-[#6BD85E] shadow-[0_0_15px_rgba(107,216,94,0.2)]" : "bg-black/40 backdrop-blur-md border-white/10 text-slate-300 hover:bg-black/60 hover:text-white"}`}>
            {filters.price === "all" ? "Any Price" : filters.price}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-[#06110D]/95 backdrop-blur-xl border-white/10 text-slate-200">
          <DropdownMenuItem onClick={() => onFilterChange("price", "all")}>Any Price</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("price", "£")}>£ (Budget)</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("price", "££")}>££ (Standard)</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("price", "£££")}>£££ (Premium)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rating Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`rounded-full border transition-all ${filters.rating !== "all" ? "bg-black/60 backdrop-blur-md border-[#6BD85E]/50 text-[#6BD85E] shadow-[0_0_15px_rgba(107,216,94,0.2)]" : "bg-black/40 backdrop-blur-md border-white/10 text-slate-300 hover:bg-black/60 hover:text-white"}`}>
            {filters.rating === "all" ? "Any Rating" : `${filters.rating}+ Stars`}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-[#06110D] border-white/10 text-slate-200">
          <DropdownMenuItem onClick={() => onFilterChange("rating", "all")}>Any Rating</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("rating", "3")}>3+ Stars</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("rating", "4")}>4+ Stars</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("rating", "4.5")}>4.5+ Stars</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
