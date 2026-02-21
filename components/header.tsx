"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Search, Bookmark, LogOut, PlusCircle, Sun, Moon, ChevronDown } from "lucide-react"
import { useAuth } from "@/components/auth/AuthContext"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  savedCount: number
  onToggleSavedView: () => void
  showSavedOnly: boolean
  onAuthRequired: () => void
  variant?: "default" | "app"
}

export function Header({
  searchQuery,
  onSearchChange,
  savedCount,
  onToggleSavedView,
  showSavedOnly,
  onAuthRequired,
  variant = "default",
}: HeaderProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Header Logo Editor State
  const [logoSize, setLogoSize] = useState(280);
  const [logoX, setLogoX] = useState(0);
  const [logoY, setLogoY] = useState(13);
  const [showControls, setShowControls] = useState(false);

  // Initial Load - Check for Saved Settings
  useEffect(() => {
    const savedSize = localStorage.getItem('headerLogoSize');
    const savedX = localStorage.getItem('headerLogoX');
    const savedY = localStorage.getItem('headerLogoY');

    if (savedSize) setLogoSize(parseInt(savedSize));
    if (savedX) setLogoX(parseInt(savedX));
    if (savedY) setLogoY(parseInt(savedY));
  }, []);

  // Save Settings on Change
  const updateSettings = (size: number, x: number, y: number) => {
    setLogoSize(size);
    setLogoX(x);
    setLogoY(y);
    localStorage.setItem('headerLogoSize', size.toString());
    localStorage.setItem('headerLogoX', x.toString());
    localStorage.setItem('headerLogoY', y.toString());
  };

  const isAppMode = variant === "app";

  return (
    <>
      <header className={`${isAppMode ? "w-full glass-premium sticky top-0 z-50 text-foreground" : "glass px-4 py-4 sticky top-0 z-50 border-b-0 rounded-b-2xl mx-2 mt-2"}`}>
        <div className={`mx-auto flex items-center justify-between gap-4 ${isAppMode ? "max-w-7xl w-full px-6 py-2" : "max-w-7xl flex-col"}`}>

          {/* Logo Section */}
          <Link href="/search" className={`${isAppMode ? "flex items-center shrink-0 hover:opacity-80 transition-opacity" : "w-full flex justify-center mt-0 mb-2"}`}>
            {isAppMode ? (
              <div
                className="relative flex items-center justify-start overflow-visible transition-all duration-300"
                style={{
                  width: `${logoSize}px`,
                  height: '40px'
                }}
              >
                <div
                  className="absolute left-0 top-1/2 flex items-center justify-center transition-all duration-300"
                  style={{
                    width: `${logoSize}px`,
                    transform: `translate(${logoX}px, calc(-50% + ${logoY}px))`
                  }}
                >
                  <Image
                    src="/images/gymsaver_header_logo.png"
                    alt="GymSaver"
                    width={600}
                    height={160}
                    className="w-full h-auto object-contain"
                    priority
                  />
                </div>
              </div>
            ) : (
              // Even larger centered logo for Default Mode
              <div className="relative hover:scale-105 transition-transform duration-500">
                <Image
                  src="/images/gymsaver_logo_new.png"
                  alt="Gym Saver App"
                  width={1080}
                  height={432}
                  className="h-56 sm:h-64 md:h-80 w-auto max-w-full object-contain relative drop-shadow-[0_0_35px_rgba(77,132,68,0.5)]"
                  priority
                />
              </div>
            )}
          </Link>

          {/* Utility Buttons (Right Side) */}
          <div className={`flex items-center gap-3 ${isAppMode ? "" : "absolute top-2 right-4 w-full justify-end"}`}>

            <div className="hidden md:flex items-center gap-2 mr-4 border-r border-white/10 pr-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="bg-[#6BD85E]/90 hover:bg-[#5bc250] text-black border-0 px-4 rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(107,216,94,0.2)] hover:shadow-[0_0_30px_rgba(107,216,94,0.3)] transition-all duration-300 font-bold gap-1">
                    Gym Owners
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-black/90 border-white/10 backdrop-blur-xl rounded-xl p-2 text-white">
                  <DropdownMenuItem asChild className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10 focus:bg-white/10 transition-colors">
                    <Link href="/list-your-gym" className="w-full">List your gym</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10 focus:bg-white/10 transition-colors">
                    <Link href="/contact" className="w-full">Contact us</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="bg-[#6BD85E]/90 hover:bg-[#5bc250] text-black border-0 px-4 rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(107,216,94,0.2)] hover:shadow-[0_0_30px_rgba(107,216,94,0.3)] transition-all duration-300 font-bold gap-1">
                    Gym Users
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-black/90 border-white/10 backdrop-blur-xl rounded-xl p-2 text-white">
                  <DropdownMenuItem asChild className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10 focus:bg-white/10 transition-colors">
                    <Link href="/submit" className="w-full">Gym price update</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10 focus:bg-white/10 transition-colors">
                    <Link href="/contact" className="w-full">Contact us</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10 focus:bg-white/10 transition-colors">
                    <Link href="/affiliate" className="w-full">Partner with us</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Admin Console Button (Visible only to Admin) */}
            {user?.email === "josephbunton@live.co.uk" && (
              <Button
                variant="ghost"
                className="h-8 px-3 text-xs font-bold bg-green-600 text-white hover:bg-green-700 hover:text-white rounded-xl border-0 shadow-sm"
                asChild
              >
                <Link href="/admin">
                  Admin Console
                </Link>
              </Button>
            )}

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 border-r pr-4 border-white/10 mr-2 h-8">
              {loading ? (
                <div className="w-10 h-10 rounded-full bg-secondary animate-pulse" />
              ) : user ? (
                <>
                  <Button variant="ghost" size="icon" onClick={() => router.push("/profile")} title="Profile" className="h-8 w-8">
                    <span className="sr-only">Profile</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-4 w-4 text-muted-foreground hover:text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout" className="h-8 w-8">
                    <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground hover:bg-secondary/20 h-8 px-3 text-xs">
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 h-8 px-4 text-xs font-bold">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => router.push("/saved")}
              className="h-8 px-3 flex items-center gap-2 rounded-xl font-medium shadow-sm transition-all border-0 bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Bookmark className={`h-3.5 w-3.5 ${showSavedOnly ? "fill-current" : ""}`} />
              <span className="hidden sm:inline text-xs">Saved</span>
              {savedCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${showSavedOnly ? "bg-black/20 text-black" : "bg-primary/20 text-primary"
                  }`}>
                  {savedCount}
                </span>
              )}
            </Button>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="glass-tab p-1.5 flex items-center gap-2 rounded-full border border-white/20 h-8 w-8 justify-center ml-2 relative"
              title="Toggle Theme"
            >
              <div className={`p-1.5 rounded-full transition-all duration-300 absolute inset-0 m-1 ${mounted && theme === 'light' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
                <Sun className="h-4 w-4 text-orange-500" />
              </div>
              <div className={`p-1.5 rounded-full transition-all duration-300 absolute inset-0 m-1 ${mounted && theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
                <Moon className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="sr-only">Toggle theme</span>
            </button>
          </div>
        </div>
      </header >

      {/* HEADER LOGO EDITOR - BOTTOM LEFT CONTROLS */}
      {isAppMode && showControls && (
        <div className="fixed bottom-4 left-4 z-[9999] bg-black/90 border border-white/10 p-4 rounded-xl shadow-2xl w-[300px] text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-[#6BD85E]">Header Logo Editor</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-white/10"
              onClick={() => setShowControls(false)}
            >
              <span className="sr-only">Close</span>
              ×
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Size (Width)</span>
                <span>{logoSize}px</span>
              </div>
              <input
                type="range"
                min="100"
                max="600"
                value={logoSize}
                onChange={(e) => updateSettings(parseInt(e.target.value), logoX, logoY)}
                className="w-full accent-[#6BD85E]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Horizontal Offset (X)</span>
                <span>{logoX}px</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={logoX}
                onChange={(e) => updateSettings(logoSize, parseInt(e.target.value), logoY)}
                className="w-full accent-[#6BD85E]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Vertical Offset (Y)</span>
                <span>{logoY}px</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={logoY}
                onChange={(e) => updateSettings(logoSize, logoX, parseInt(e.target.value))}
                className="w-full accent-[#6BD85E]"
              />
            </div>

            <div className="pt-2 text-[10px] text-slate-500 text-center">
              Changes are saved to local storage
            </div>
          </div>
        </div>
      )}

      {/* Hidden Trigger to reopen controls (Click 'H' key or invisible pixel) */}
      {!showControls && isAppMode && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed bottom-0 left-0 w-4 h-4 z-[9999] opacity-0 hover:opacity-100 bg-red-500/20"
          title="Show Header Editor"
        />
      )}
    </>
  )
}
