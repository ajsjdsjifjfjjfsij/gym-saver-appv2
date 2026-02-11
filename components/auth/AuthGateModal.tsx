"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

interface AuthGateModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSignUp: () => void
}

export function AuthGateModal({ open, onOpenChange, onSignUp }: AuthGateModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white shadow-2xl">
                <DialogHeader className="flex flex-col items-center text-center space-y-4 pt-4">
                    <div className="p-4 rounded-full bg-primary/10 mb-2">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold">Unlock the Full Experience</DialogTitle>
                    <DialogDescription className="text-base text-center max-w-[85%] mx-auto">
                        Create a free account to unlock price updates, saving gyms, and deals.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-4">
                    <Button
                        onClick={onSignUp}
                        className="w-full bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold h-12 text-base"
                    >
                        Sign Up
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-muted-foreground"
                    >
                        Maybe Later
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
