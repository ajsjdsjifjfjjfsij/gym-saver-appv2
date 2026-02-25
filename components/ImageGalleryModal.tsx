"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel"
import { Gym, getGooglePhotoUrl } from "@/lib/gym-utils"
import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, X, ChevronLeft, ChevronRight } from "lucide-react"

interface ImageGalleryModalProps {
    gym: Gym | null
    isOpen: boolean
    onClose: () => void
}

export function ImageGalleryModal({ gym, isOpen, onClose }: ImageGalleryModalProps) {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        if (!api) return
        setCurrent(api.selectedScrollSnap())
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])

    if (!gym) return null

    const photos: string[] = []

    // 1. Google High-Quality Hero Image
    if (gym.hero_image_url) {
        photos.push(gym.hero_image_url)
    }

    // 2. Gallery Images from Firestore
    if (gym.gallery_image_urls && gym.gallery_image_urls.length > 0) {
        // Filter out the hero image if it's already in the gallery
        const hero = gym.hero_image_url;
        gym.gallery_image_urls.forEach(url => {
            if (url !== hero) photos.push(url);
        });
    }

    // 3. Legacy Photos Array
    if (gym.photos && gym.photos.length > 0) {
        gym.photos.forEach(ref => {
            if (!photos.includes(ref)) photos.push(ref);
        });
    }

    // 4. Single Photo Reference
    if (gym.photo_reference && !photos.includes(gym.photo_reference)) {
        photos.push(gym.photo_reference)
    }

    // If no photos, we can show a placeholder or just return
    // But usually we want to show at least something. 
    // The GymCard handles caching a default Unsplash image if onError, 
    // but here we might want to be explicit.
    const hasPhotos = photos.length > 0

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false} className="max-w-6xl w-[95vw] bg-black/95 backdrop-blur-xl border-white/10 p-0 overflow-hidden rounded-3xl z-[100] h-[85vh] flex flex-col shadow-2xl">
                {/* Custom Header Overlay */}
                <div className="absolute top-0 left-0 right-0 z-[110] p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                    <div className="flex flex-col gap-1 items-start">
                        <DialogTitle className="text-2xl font-bold text-white drop-shadow-md">{gym.name}</DialogTitle>
                        <p className="text-sm text-white/60 flex items-center gap-1 drop-shadow-sm">
                            <MapPin className="h-3 w-3 text-[#6BD85E]" />
                            {gym.address}
                        </p>
                    </div>
                </div>

                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-6 right-6 z-[130] rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 h-10 w-10 transition-all hover:scale-110 active:scale-95"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                >
                    <X className="h-5 w-5" />
                </Button>

                <div
                    className="relative w-full flex-1 bg-black flex items-center justify-center overflow-hidden"
                    onClick={onClose}
                >
                    {hasPhotos ? (
                        <Carousel
                            setApi={setApi}
                            className="w-full h-full"
                            opts={{ loop: true }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <CarouselContent className="-ml-0 h-full">
                                {photos.map((photoRef, index) => (
                                    <CarouselItem key={index} className="pl-0 h-full">
                                        <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
                                            <div
                                                className="relative w-full h-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden bg-slate-900/10"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <img
                                                    src={getGooglePhotoUrl(photoRef)}
                                                    alt={`${gym.name} photo ${index + 1}`}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            {photos.length > 1 && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/40 hover:bg-[#6BD85E] text-white hover:text-black backdrop-blur-md border border-white/10 z-[140] transition-all shadow-xl"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            api?.scrollPrev();
                                        }}
                                    >
                                        <ChevronLeft className="h-8 w-8" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/40 hover:bg-[#6BD85E] text-white hover:text-black backdrop-blur-md border border-white/10 z-[140] transition-all shadow-xl"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            api?.scrollNext();
                                        }}
                                    >
                                        <ChevronRight className="h-8 w-8" />
                                    </Button>
                                </>
                            )}
                        </Carousel>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                            <span className="text-4xl">📷</span>
                            <p>No photos available for this gym.</p>
                        </div>
                    )}
                </div>

                {/* Footer / Counter */}
                {hasPhotos && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm font-medium text-white/90 whitespace-nowrap z-[140] flex items-center gap-3 shadow-lg">
                        <span>{current + 1} / {photos.length}</span>
                        <div className="w-[1px] h-3 bg-white/20" />
                        <span className="text-white/40 text-xs">Swipe to view • Tap backdrop to close</span>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    )
}
