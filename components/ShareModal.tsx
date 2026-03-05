"use client"

import React, { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Share2, Download, Check, Loader2, Instagram } from "lucide-react"
import { toast } from "sonner"
import { toPng } from "html-to-image"
import { Gym } from "@/lib/gym-utils"
import { ShareableGymCard } from "./ShareableGymCard"
import { getApiBaseUrl } from "@/lib/api-env"

interface ShareModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    gym: Gym
}

export function ShareModal({ isOpen, onOpenChange, gym }: ShareModalProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState<string>("")
    const [isImageReady, setIsImageReady] = useState(false)
    const [isFetchingPhotoUrl, setIsFetchingPhotoUrl] = useState(true)
    const [hasFailed, setHasFailed] = useState(false)

    // Fetch the high res photo when modal opens
    useEffect(() => {
        if (isOpen) {
            setGeneratedImage(null); // Reset on new open
            setIsImageReady(false); // Reset image ready state
            setIsFetchingPhotoUrl(true);
            setHasFailed(false);

            const photoRef = gym.hero_image_url || gym.photo_reference || gym.photos?.[0];
            if (gym.hero_image_url) {
                setResolvedPhotoUrl(gym.hero_image_url);
                setIsFetchingPhotoUrl(false);
                return;
            }

            if (!photoRef && !gym.id) {
                setResolvedPhotoUrl("");
                setIsFetchingPhotoUrl(false);
                return;
            }

            let queryParam = photoRef && photoRef.startsWith('places/')
                ? `photo_name=${encodeURIComponent(photoRef)}`
                : `place_id=${encodeURIComponent(gym.id)}`;

            const baseUrl = getApiBaseUrl();
            fetch(`${baseUrl}/api/gyms/photo?${queryParam}`)
                .then(r => r.json())
                .then(data => {
                    if (data.photoUrl) setResolvedPhotoUrl(data.photoUrl);
                    else setResolvedPhotoUrl("");
                }).catch(() => {
                    setResolvedPhotoUrl("");
                }).finally(() => {
                    setIsFetchingPhotoUrl(false);
                });
        }
    }, [isOpen, gym]);

    const generateImage = async () => {
        if (!cardRef.current) return null;
        try {
            setIsGenerating(true)

            // Reverting back to html-to-image since it correctly handles Tailwind CSS4 okLCH DOM values without crashing.
            // We use the base64 proxy pattern to avoid its CORS limitations.
            let dataUrl: string | null = null;
            let attempts = 0;
            const maxAttempts = 3;

            while (!dataUrl && attempts < maxAttempts) {
                try {
                    attempts++;
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Image generation timed out')), 20000)
                    );

                    dataUrl = await Promise.race([
                        toPng(cardRef.current, {
                            quality: 1.0,
                            pixelRatio: 2, // Retina scaling
                            skipFonts: true, // Prevents hanging on font loads
                        }),
                        timeoutPromise
                    ]) as string;
                } catch (err) {
                    if (attempts === maxAttempts) throw err;
                    console.log(`Retrying generation, attempt ${attempts}...`);
                    await new Promise(resolve => setTimeout(resolve, 800));
                }
            }

            setGeneratedImage(dataUrl);
            return dataUrl;
        } catch (err) {
            console.error("Error generating image:", err)
            toast.error("Failed to generate shareable image")
            setHasFailed(true);
            return null
        } finally {
            setIsGenerating(false)
        }
    }

    // Auto-generate preview when data is ready
    useEffect(() => {
        if (isOpen && cardRef.current && isImageReady && !generatedImage && !isGenerating && !isFetchingPhotoUrl) {
            // Small delay to ensure the DOM is fully painted with the new base64 image
            const timer = setTimeout(() => {
                generateImage();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isImageReady, generatedImage, isGenerating, isFetchingPhotoUrl]);


    const handleDownload = async () => {
        let imgData = generatedImage;
        if (!imgData) {
            imgData = await generateImage();
        }
        if (!imgData) return;

        try {
            const link = document.createElement("a")
            link.download = `gymsaver-${gym.name.toLowerCase().replace(/\s+/g, '-')}.png`
            link.href = imgData
            link.click()
            toast.success("Image downloaded successfully!")
        } catch (err) {
            toast.error("Failed to download image")
        }
    }

    const handleNativeShare = async () => {
        let imgData = generatedImage;
        if (!imgData) {
            imgData = await generateImage();
        }
        if (!imgData) return;

        try {
            // Convert base64 to File object for native sharing
            const blob = await (await fetch(imgData)).blob()
            const file = new File([blob], `gymsaver-${gym.id}.png`, { type: "image/png" })

            const shareData = {
                title: `Check out ${gym.name} on GymSaver`,
                text: `I found a great deal for ${gym.name} on GymSaver!\nFollow @GymsaverHQ: https://www.instagram.com/gymsaverhq`,
                files: [file]
            };

            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else if (navigator.share) {
                // Fallback to text/link if files are not supported by the OS
                await navigator.share({
                    title: `Check out ${gym.name} on GymSaver`,
                    text: `I found a great deal for ${gym.name} on GymSaver!\nFollow @GymsaverHQ: https://www.instagram.com/gymsaverhq\nhttps://www.gymsaverapp.com`,
                });
                // Also download the image so they still get it
                handleDownload();
                toast.success("Link shared! Card image downloaded.");
            } else {
                handleDownload();
            }
        } catch (err: any) {
            console.log("Error natively sharing:", err)
            // If it failed for a reason other than the user clicking 'cancel' (AbortError), fallback to download
            if (err.name !== 'AbortError') {
                handleDownload();
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl bg-black/95 border-white/10 backdrop-blur-2xl text-white rounded-[2.5rem] overflow-hidden shadow-2xl p-6 sm:p-10">
                {/* Ambient branded background glows */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none rounded-[2.5rem]">
                    <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#6BD85E] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse-slow"></div>
                    <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-[#6BD85E] rounded-full mix-blend-screen filter blur-[120px] opacity-5"></div>
                </div>
                <DialogHeader className="flex flex-col items-center pb-0">
                    <DialogTitle className="sr-only">Share Gym Card</DialogTitle>
                    <div
                        className="w-full sm:max-w-[360px] -mb-4 z-10"
                        style={{ transform: 'translateX(-16px)' }}
                    >
                        <img
                            src="/images/gymsaver_header_logo.png"
                            alt="GymSaver App"
                            className="w-full h-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] relative"
                        />
                    </div>
                </DialogHeader>

                <div
                    className="flex flex-col items-center gap-2 pb-2"
                    style={{ marginTop: '-24px' }}
                >
                    {/* The Hidden Template */}
                    {/* html-to-image requires fixed positioning off-screen to calculate bounds correctly */}
                    <div style={{ position: "fixed", left: "-9999px", top: "-9999px", opacity: 0 }}>
                        <ShareableGymCard
                            ref={cardRef}
                            gym={gym}
                            resolvedPhotoUrl={resolvedPhotoUrl}
                            isFetchingPhotoUrl={isFetchingPhotoUrl}
                            onImageLoaded={() => setIsImageReady(true)}
                        />
                    </div>

                    {/* The Visual Preview - Square */}
                    <div className="w-full max-w-[320px] sm:max-w-[400px] aspect-square bg-zinc-900 rounded-3xl border border-[#6BD85E]/50 overflow-hidden relative shadow-[0_0_100px_rgba(107,216,94,0.4)] flex flex-col items-center justify-center p-4 text-center ring-4 ring-black z-20">
                        {hasFailed ? (
                            <div className="flex flex-col items-center gap-4">
                                <span className="text-sm text-red-500 font-bold uppercase tracking-widest">Generation Failed</span>
                                <Button variant="outline" onClick={generateImage} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                                    Try Again
                                </Button>
                            </div>
                        ) : generatedImage ? (
                            <img src={generatedImage} alt="Share Preview" className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-500" />
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-12 w-12 text-[#6BD85E] animate-spin" />
                                <span className="text-sm text-slate-400 font-bold animate-pulse tracking-widest uppercase">
                                    {isFetchingPhotoUrl ? "Fetching Photo..." : isGenerating ? "Rendering..." : "Preparing..."}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4 w-full mt-2">
                        <Button
                            variant="outline"
                            className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2 rounded-2xl h-14 text-lg font-bold"
                            onClick={handleDownload}
                            disabled={isGenerating}
                        >
                            <Download className="h-5 w-5" />
                            Save Image
                        </Button>
                        <Button
                            className="bg-[#6BD85E] hover:bg-[#5bc250] text-black font-black h-14 rounded-2xl shadow-[0_0_20px_rgba(107,216,94,0.3)] transition-all gap-2 text-lg tracking-wide"
                            onClick={handleNativeShare}
                            disabled={isGenerating}
                        >
                            <Share2 className="h-5 w-5" />
                            Share Now
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
