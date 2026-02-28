"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { isInAppBrowser, getInAppBrowserType } from "@/lib/bot-detection";

export function InAppBrowserPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [browserType, setBrowserType] = useState<string | null>(null);

    useEffect(() => {
        // Run only on client side
        if (isInAppBrowser()) {
            setShowPrompt(true);
            setBrowserType(getInAppBrowserType());
        }
    }, []);

    if (!showPrompt) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-6 text-center text-white">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="h-16 w-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>

                <h2 className="text-2xl font-bold mb-4">Location Disabled in {browserType || "App"}</h2>

                <p className="text-gray-400 mb-8 whitespace-pre-line leading-relaxed">
                    To show you the best gym deals nearby, GymSaver needs your location.
                    {"\n\n"}
                    The {browserType || "in-app"} browser <strong>blocks</strong> location access.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <ExternalLink className="h-5 w-5 text-[#6BD85E]" />
                        How to fix:
                    </h3>
                    <ol className="list-decimal list-inside space-y-3 text-gray-300">
                        <li>Tap the <strong className="text-white bg-white/10 px-2 py-0.5 rounded">...</strong> menu in the top right corner</li>
                        <li>Select <strong className="text-white">"Open in System Browser"</strong> or <strong className="text-white">"Open in Safari"</strong></li>
                        <li>Allow location access when prompted</li>
                    </ol>
                </div>

                <Button
                    className="w-full h-14 bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(107,216,94,0.3)] transition-all"
                    onClick={() => setShowPrompt(false)}
                >
                    I'll try without location
                </Button>
            </div>
        </div>
    );
}
