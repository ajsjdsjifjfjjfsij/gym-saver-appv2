"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MapPin, Zap, PoundSterling, Dumbbell, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";

// Firebase
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, increment } from "firebase/firestore";

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

export default function PartnerDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [roleLoading, setRoleLoading] = useState(true);

    // Ensure the gym owner is logged in and fetch their exact database role
    useEffect(() => {
        if (!loading && !user) {
            router.push("/partner/signup");
        } else if (user && db) {
            import("firebase/firestore").then(({ doc, getDoc }) => {
                getDoc(doc(db, "users", user.uid)).then((snap) => {
                    if (snap.exists()) {
                        setUserRole(snap.data().role);
                    }
                    setRoleLoading(false);
                }).catch(() => setRoleLoading(false));
            });
        }
    }, [user, loading, router]);

    // State for Live Global Bounties Board
    const [bounties, setBounties] = useState<Bounty[]>([]);

    useEffect(() => {
        if (!db || !user) return;

        // Fetch all active bounties across the platform
        const q = query(
            collection(db, "bounties"),
            where("status", "==", "active")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched: Bounty[] = [];
            snapshot.forEach((d) => {
                fetched.push({ id: d.id, ...d.data() } as Bounty);
            });
            
            // Sort client-side to avoid needing a composite index in Firestore immediately
            fetched.sort((a, b) => {
                const aTime = a.timestamp?.toMillis ? a.timestamp.toMillis() : Date.now();
                const bTime = b.timestamp?.toMillis ? b.timestamp.toMillis() : Date.now();
                return bTime - aTime;
            });

            setBounties(fetched);
        });

        return () => unsubscribe();
    }, [user]);

    // State for Gym Owner Make Offer Dialog
    const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
    const [offerAmount, setOfferAmount] = useState("");
    const [offerMessage, setOfferMessage] = useState("");
    const [isSendingOffer, setIsSendingOffer] = useState(false);
    const [offerSuccess, setOfferSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleMakeOffer = (bounty: Bounty) => {
        setSelectedBounty(bounty);
        setOfferSuccess(false);
        setOfferAmount("");
        setOfferMessage("");
        setErrorMsg("");
    };

    const submitOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user || !db || !selectedBounty) return;
        
        setIsSendingOffer(true);
        setErrorMsg("");

        try {
            // 1. Log the private offer
            await addDoc(collection(db, "bountyOffers"), {
                bountyId: selectedBounty.id,
                targetUserId: selectedBounty.userId,
                gymId: user.uid,
                gymEmail: user.email,
                offerAmount: Number(offerAmount),
                offerMessage,
                timestamp: serverTimestamp()
            });

            // 2. Increment the public counter on the bounty
            const bountyRef = doc(db, "bounties", selectedBounty.id);
            await updateDoc(bountyRef, {
                offersCount: increment(1)
            });

            setIsSendingOffer(false);
            setOfferSuccess(true);
            
            setTimeout(() => {
                setSelectedBounty(null);
            }, 2000);
            
        } catch (error: any) {
            console.error("Failed to append offer:", error);
            setErrorMsg("Failed to send offer. Make sure you are authorised.");
            setIsSendingOffer(false);
        }
    };

    if (loading || roleLoading || !user) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-[#6BD85E] font-bold">Verifying Gym Access...</div>;
    }

    if (userRole === "pending_partner") {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6 font-sans">
                <ShieldCheck className="h-16 w-16 text-yellow-500 mb-6" />
                <h1 className="text-3xl font-bold text-white mb-3">Account Under Review</h1>
                <p className="text-gray-400 max-w-md mx-auto text-lg leading-relaxed">
                    Your Gym Partner account setup is complete. Our administration team is currently verifying your details to ensure the safety of our users. 
                    <br/><br/>
                    Emails are verified within 3 hours but busy periods can take longer. You will receive an email at <strong>{user.email}</strong> as soon as you are verified and can access the live bounties!
                </p>
                <Button variant="outline" className="mt-8 border-white/10 text-white" onClick={() => router.push("/")}>Return Home</Button>
            </div>
        );
    }

    if (userRole !== "gym_owner") {
        return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-bold font-sans">Unauthorized Access. You must be an approved Gym Owner.</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-green-500/30">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                        <ArrowLeft className="h-5 w-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium hidden sm:inline">Back to Home</span>
                        <span className="font-medium sm:hidden">Back</span>
                    </Link>
                    <div className="flex items-center gap-2 text-[#6BD85E] font-bold text-[17px] sm:text-lg tracking-tight">
                        <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                        <span className="whitespace-nowrap">Partner Dashboard</span>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-32 pb-24 px-6">
                <div className="max-w-5xl mx-auto">
                    
                    <div className="mb-8 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                                Live <span className="text-[#6BD85E]">Bounties</span>
                            </h1>
                            <p className="text-gray-400 text-lg max-w-xl">
                                Browse proactive users looking for a membership in your area. Pitch them an exclusive offer directly.
                            </p>
                        </div>
                        <div className="text-sm font-medium text-gray-500 bg-white/5 px-4 py-2 rounded-lg">
                            Logged in as: <span className="text-white">{user.email}</span>
                        </div>
                    </div>

                    {bounties.length === 0 ? (
                        <div className="bg-zinc-950 border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                            <Zap className="h-16 w-16 text-gray-700 mx-auto mb-4 opacity-50" />
                            <h3 className="text-2xl font-bold text-gray-300 mb-2">The board is clear.</h3>
                            <p className="text-gray-500 max-w-md mx-auto">There are no active user budget requests on the market at the moment. We will notify you when new users post!</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {bounties.map((bounty) => (
                                <div key={bounty.id} className="group bg-zinc-950 border border-white/10 hover:border-[#6BD85E]/30 rounded-2xl p-6 hover:shadow-[0_0_20px_rgba(107,216,94,0.05)] transition-all overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                        <Zap className="h-32 w-32 text-[#6BD85E]" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <h3 className="text-xl font-bold">{bounty.username}</h3>
                                                </div>
                                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md mb-2">
                                                    <MapPin className="h-3.5 w-3.5 text-gray-400" /> {bounty.location}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-black text-[#6BD85E]">£{bounty.budget}<span className="text-sm font-bold text-gray-500">/mo</span></div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6 pt-4 border-t border-white/5">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1.5">Looking for</p>
                                                <p className="font-medium text-sm text-gray-200">{bounty.gymType}</p>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0 -mb-1">
                                                {bounty.offersCount > 0 && (
                                                    <span className="text-sm font-medium text-[#6BD85E]">
                                                        {bounty.offersCount} offer{bounty.offersCount !== 1 && 's'} sent
                                                    </span>
                                                )}
                                                <Button 
                                                    onClick={() => handleMakeOffer(bounty)}
                                                    className="bg-[#6BD85E] text-black hover:bg-[#5bc250] font-bold rounded-xl h-11 px-6 shadow-md"
                                                >
                                                    Pitch Offer
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Gym Owner Offer Modal */}
            <Dialog open={!!selectedBounty} onOpenChange={open => !open && setSelectedBounty(null)}>
                <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Zap className="h-5 w-5 text-[#6BD85E]" fill="currentColor" />
                            Submit Offer
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Pitch your membership directly to {selectedBounty?.username}.
                        </DialogDescription>
                    </DialogHeader>

                    {errorMsg && (
                        <div className="p-3 bg-red-900/20 text-red-500 border border-red-900/50 rounded-lg text-sm font-medium">
                            {errorMsg}
                        </div>
                    )}

                    {!offerSuccess ? (
                        <form onSubmit={submitOffer} className="grid gap-5 py-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Your Exclusive Offer Price (£/mo)</label>
                                <div className="relative">
                                    <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6BD85E]" />
                                    <input 
                                        type="number" 
                                        required
                                        value={offerAmount}
                                        onChange={e => setOfferAmount(e.target.value)}
                                        placeholder={`They asked for £${selectedBounty?.budget}`}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#6BD85E]/50 focus:border-[#6BD85E]/50 transition-all font-bold text-lg [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Message / Gym Details</label>
                                <textarea 
                                    required
                                    rows={4}
                                    value={offerMessage}
                                    onChange={e => setOfferMessage(e.target.value)}
                                    placeholder="Hi! We have a gym 5 minutes from there. We'd love to offer you the membership at that price with 24/7 access..."
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#6BD85E]/50 focus:border-[#6BD85E]/50 transition-all resize-none text-sm"
                                />
                            </div>
                            <DialogFooter className="mt-2">
                                <Button 
                                    type="submit" 
                                    className="w-full bg-[#6BD85E] text-black hover:bg-[#5bc250] font-bold h-12 rounded-xl"
                                    disabled={isSendingOffer}
                                >
                                    {isSendingOffer ? "Sending to User..." : "Submit Offer Confidentially"}
                                </Button>
                            </DialogFooter>
                        </form>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="h-16 w-16 bg-[#6BD85E]/20 text-[#6BD85E] rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Offer Delivered!</h3>
                            <p className="text-gray-400 text-sm">{selectedBounty?.username} will see your offer in their dashboard.</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
