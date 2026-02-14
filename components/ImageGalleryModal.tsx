"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Gym, getGooglePhotoUrl } from "@/lib/gym-utils"
import Image from "next/image"
import { MapPin } from "lucide-react"

interface ImageGalleryModalProps {
    gym: Gym | null
    isOpen: boolean
    onClose: () => void
}

export function ImageGalleryModal({ gym, isOpen, onClose }: ImageGalleryModalProps) {
    if (!gym) return null

    // Collect all available photos
    const photos = []

    // 1. Google Photos Array (v1/v2 API)
    if (gym.photos && gym.photos.length > 0) {
        photos.push(...gym.photos)
    }
    // 2. Single Photo Reference (Legacy / Falback)
    else if (gym.photo_reference) {
        photos.push(gym.photo_reference)
    }

    // If no photos, we can show a placeholder or just return
    // But usually we want to show at least something. 
    // The GymCard handles caching a default Unsplash image if onError, 
    // but here we might want to be explicit.
    const hasPhotos = photos.length > 0

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl w-full bg-black border-none p-0 overflow-hidden sm:rounded-3xl z-[100] h-[90vh] flex flex-col">
                <DialogHeader className="p-4 bg-black/80 backdrop-blur-md absolute top-0 left-0 right-0 z-[110] border-b border-white/10">
                    <div className="flex flex-col gap-1 items-start pr-12">
                        <DialogTitle className="text-xl font-bold text-white">{gym.name}</DialogTitle>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {gym.address}
                        </p>
                    </div>
                </DialogHeader>

                <div className="relative w-full flex-1 bg-black flex items-center justify-center overflow-hidden">
                    {hasPhotos ? (
                        <Carousel className="w-full h-full" opts={{ loop: true }}>
                            <CarouselContent className="-ml-0 h-full">
                                {photos.map((photoRef, index) => (
                                    <CarouselItem key={index} className="pl-0 relative h-full flex items-center justify-center">
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <img
                                                src={getGooglePhotoUrl(photoRef)}
                                                alt={`${gym.name} photo ${index + 1}`}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            {photos.length > 1 && (
                                <>
                                    <CarouselPrevious className="left-4 bg-black/50 border-white/20 text-white hover:bg-[#6BD85E] hover:text-black hover:border-[#6BD85E] z-[120]" />
                                    <CarouselNext className="right-4 bg-black/50 border-white/20 text-white hover:bg-[#6BD85E] hover:text-black hover:border-[#6BD85E] z-[120]" />
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
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-white/80">
                        Swipe to view photos
                    </div>
                )}

            </DialogContent>
        </Dialog>
    )
}
