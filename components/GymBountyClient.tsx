"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2, User, MapPin, Zap, PoundSterling, Sparkles, Clock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { AuthGateModal } from "@/components/auth/AuthGateModal";

// Firebase imports
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import { logRealActivity } from "@/lib/activityLogger";


// Interfaces
interface Bounty {
    id: string;
    userId: string;
    username: string;
    gymType: string;
    budget: number;
    location: string;
    timestamp: any;
    status: "active" | "fulfilled";
    offersCount: number;
    expiresInDays: number;
}

const GYM_TYPES = [
    "Commercial Gym (PureGym, etc.)",
    "Independent / Local Gym",
    "24-Hour Access",
    "Boutique / Studio Fitness",
    "CrossFit / Functional",
    "Women Only",
    "Martial Arts / Boxing",
    "Luxury / Spa",
    "Any"
];

export default function GymBountyClient() {
    const router = useRouter();
    const { user } = useAuth();

    // State for Submission Form
    const [username, setUsername] = useState("");
    const [gymType, setGymType] = useState("Commercial Gym (PureGym, etc.)");
    const [budget, setBudget] = useState("");
    const [location, setLocation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // State for Live Firestore Bounties Board
    const [bounties, setBounties] = useState<Bounty[]>([]);

    useEffect(() => {
        // Only run if DB is initialized (useful if firebase env vars are missing or delayed)
        if (!db) return;

        const q = query(
            collection(db, "bounties"),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedBounties: Bounty[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.status === "active") {
                    fetchedBounties.push({
                        id: doc.id,
                        ...data
                    } as Bounty);
                }
            });
            setBounties(fetchedBounties);
        }, (error) => {
            console.error("Error fetching bounties:", error);
        });

        return () => unsubscribe();
    }, []);

    const handlePostBounty = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        if (!db) {
            console.error("Firebase DB is not initialized.");
            return;
        }

        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "bounties"), {
                userId: user.uid,
                username: username || user.email?.split("@")[0] || "Anonymous User",
                gymType,
                budget: Number(budget) || 0,
                location,
                timestamp: serverTimestamp(),
                status: "active",
                offersCount: 0,
                expiresInDays: 7
            });

            setSubmitSuccess(true);
            
            // Log real activity
            logRealActivity({
                type: 'bounty',
                city: location,
                brand: gymType
            });
            
            // Reset form
            setUsername("");
            setBudget("");
            setLocation("");
            setGymType("Commercial Gym (PureGym, etc.)");

            setTimeout(() => setSubmitSuccess(false), 5000);
        } catch (error) {
            console.error("Error posting bounty to Firestore:", error);
            alert("There was an issue posting your bounty. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper function to format timestamp safely
    const formatTimestamp = (ts: any) => {
        if (!ts) return "Just now";
        // Handle Firestore Timestamp object or native Date
        if (ts.toDate) {
            return ts.toDate().toLocaleDateString();
        } else if (ts instanceof Date) {
            return ts.toLocaleDateString();
        }
        return new Date(ts).toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-green-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#6BD85E]/5 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] bg-[#6BD85E]/3 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                        <ArrowLeft className="h-5 w-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium hidden sm:inline">Back to Home</span>
                        <span className="font-medium sm:hidden">Back</span>
                    </Link>
                    <div className="flex items-center gap-2 text-[#6BD85E] font-bold text-[17px] sm:text-lg tracking-tight">
                        <Zap className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" fill="currentColor" />
                        <span className="whitespace-nowrap">Gym Bounty</span>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-32 pb-24 px-6">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-[400px_1fr] gap-12 lg:gap-16">
                    
                    {/* Left Column: Post a Bounty */}
                    <div>
                        <div className="sticky top-32">
                            <div className="mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6BD85E]/10 border border-[#6BD85E]/20 text-xs font-bold text-[#6BD85E] mb-6">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>NEW FEATURE</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold leading-tight md:leading-tight mb-4 pb-2">
                                    Set your budget. <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6BD85E] to-[#45a43a] inline-block pb-2">
                                        Let gyms pitch to you.
                                    </span>
                                </h1>
                                <p className="text-gray-400 text-lg">
                                    Don't want to hunt for the best price? Post exactly what you want to pay, and local gym managers will reach out with exclusive offers.
                                </p>
                            </div>

                            {/* Bounty Form */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-[#6BD85E]/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition duration-1000 blur-md pointer-events-none" />
                                <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 relative">
                                    <form onSubmit={handlePostBounty} className="flex flex-col gap-5">
                                        
                                        <div>
                                            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Your Name (or Nickname)</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={username}
                                                    onChange={e => setUsername(e.target.value)}
                                                    placeholder="e.g. FitnessFanatic"
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#6BD85E]/50 focus:border-[#6BD85E]/50 transition-all font-medium truncate"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Location (City or Postcode)</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={location}
                                                    onChange={e => setLocation(e.target.value)}
                                                    placeholder="e.g. Manchester, M1"
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#6BD85E]/50 focus:border-[#6BD85E]/50 transition-all font-medium truncate"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Preferred Gym Type</label>
                                            <div className="relative">
                                                <select 
                                                    value={gymType}
                                                    onChange={e => setGymType(e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-[#6BD85E]/50 focus:border-[#6BD85E]/50 transition-all font-medium appearance-none cursor-pointer truncate"
                                                >
                                                    {GYM_TYPES.map(type => (
                                                        <option key={type} value={type} className="bg-zinc-900">{type}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-gray-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Max Monthly Budget</label>
                                            <div className="relative">
                                                <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6BD85E]" />
                                                <input 
                                                    type="number" 
                                                    required
                                                    min="5"
                                                    value={budget}
                                                    onChange={e => setBudget(e.target.value)}
                                                    placeholder="e.g. 25"
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#6BD85E]/50 focus:border-[#6BD85E]/50 transition-all font-bold text-lg truncate [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            disabled={isSubmitting || submitSuccess}
                                            className={`w-full h-14 mt-2 rounded-xl text-black font-bold text-lg transition-all ${submitSuccess ? 'bg-white hover:bg-white' : 'bg-[#6BD85E] hover:bg-[#5bc250] shadow-[0_0_20px_rgba(107,216,94,0.2)] hover:shadow-[0_0_30px_rgba(107,216,94,0.4)]'}`}
                                        >
                                            {isSubmitting ? (
                                                <div className="h-6 w-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            ) : submitSuccess ? (
                                                <span className="flex items-center gap-2 text-black"><CheckCircle2 className="h-6 w-6" /> Placed on Live Board!</span>
                                            ) : (
                                                <span className="flex items-center gap-2">Post Bounty <Send className="h-5 w-5" /></span>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Bounties Board */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    Active Bounties
                                </h2>
                                <p className="text-gray-400 mt-1">See what other app users are requesting in your city.</p>
                            </div>
                            <Button 
                                variant="outline" 
                                className="shrink-0 border-[#6BD85E]/30 text-[#6BD85E] hover:bg-[#6BD85E]/10"
                                onClick={() => router.push("/partner/signup")}
                            >
                                <LogIn className="h-4 w-4 mr-2" />
                                Gym Login to Bid
                            </Button>
                        </div>

                        {bounties.length === 0 ? (
                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                                <Zap className="h-12 w-12 text-gray-600 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No active bounties yet!</h3>
                                <p className="text-gray-400 max-w-sm">Be the first to post your budget and let local gyms pitch directly to you.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {bounties.map((bounty) => (
                                    <div key={bounty.id} className="group bg-zinc-900 border border-white/5 hover:border-white/10 rounded-2xl p-5 hover:bg-zinc-800/80 transition-all overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                            <Zap className="h-24 w-24 text-[#6BD85E]" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold">{bounty.username}</h3>
                                                        <span className="text-xs text-gray-500">• {formatTimestamp(bounty.timestamp)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="inline-flex items-center gap-1 text-sm text-gray-400 bg-black/40 px-2 py-1 rounded-md">
                                                            <MapPin className="h-3 w-3" /> {bounty.location}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md">
                                                            <Clock className="h-3 w-3" /> Expires in {bounty.expiresInDays}d
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-2xl font-black text-[#6BD85E]">£{bounty.budget}<span className="text-sm font-medium text-gray-500">/mo</span></div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6 pt-4 border-t border-white/5">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Looking for</p>
                                                    <p className="font-medium text-sm text-gray-300 truncate max-w-[200px]">{bounty.gymType}</p>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    {bounty.offersCount > 0 && (
                                                        <span className="text-sm font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                                                            {bounty.offersCount} offer{bounty.offersCount !== 1 && 's'} made
                                                        </span>
                                                    )}
                                                    <Button 
                                                        onClick={() => router.push("/partner/signup")}
                                                        className="bg-[#6BD85E] text-black hover:bg-[#5bc250] shadow-[0_0_15px_rgba(107,216,94,0.2)] font-bold rounded-xl"
                                                    >
                                                        Gym Sign Up to Bid
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showAuthModal && (
                <AuthGateModal
                    open={showAuthModal}
                    onOpenChange={setShowAuthModal}
                    onSignUp={() => router.push("/signup")}
                />
            )}
        </div>
    );
}
