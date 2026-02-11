"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, X, Shuffle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface CompareBarProps {
    count: number
    onCompare: () => void
    onClear: () => void
}

export function CompareBar({ count, onCompare, onClear }: CompareBarProps) {
    return (
        <AnimatePresence>
            {count > 0 && (
                <motion.div
                    initial={{ y: "150%", opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: "150%", opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed bottom-8 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none"
                >
                    <div className="
            w-full max-w-lg pointer-events-auto
            bg-black/80 backdrop-blur-xl border border-white/10 
            rounded-3xl p-1.5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]
            flex items-center justify-between gap-3
            ring-1 ring-white/20
          ">
                        {/* Counter & Text */}
                        <div className="flex items-center gap-3 pl-3">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#6BD85E] text-black font-black text-lg shadow-[0_0_20px_rgba(107,216,94,0.4)]">
                                {count}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-sm leading-none mb-0.5">
                                    Compare Gyms
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">
                                    {count < 2 ? "Select one more" : "Ready to compare"}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClear}
                                className="h-10 w-10 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                title="Clear selection"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                            <Button
                                onClick={onCompare}
                                disabled={count < 2}
                                className={`
                  h-10 rounded-2xl font-bold px-5 transition-all duration-300
                  ${count >= 2
                                        ? "bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
                                        : "bg-white/10 text-slate-500 cursor-not-allowed"
                                    }
                `}
                            >
                                <span className="mr-2">Compare</span>
                                <Shuffle className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
