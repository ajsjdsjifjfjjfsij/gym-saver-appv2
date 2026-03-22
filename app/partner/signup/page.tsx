"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Lock, Building2, CheckCircle2, ShieldCheck, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Firebase
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function PartnerSignupPage() {
    const router = useRouter();
    const [gymName, setGymName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!auth || !db) {
            setErrorMsg("Firebase is not fully initialized.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Create native Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Assign the 'pending_partner' role in Firestore explicitly
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: "pending_partner",
                gymName: gymName,
                createdAt: serverTimestamp()
            });

            setIsSubmitting(false);
            setIsSuccess(true);
            
            setTimeout(() => {
                router.push("/partner/dashboard");
            }, 2000);

        } catch (error: any) {
            console.error("Error creating partner account:", error);
            let msg = error.message || "Failed to create account. Please check your details.";
            if (msg.includes("email-already-in-use")) msg = "Error: This email address is already in use.";
            else if (msg.includes("weak-password")) msg = "Error: Password must be at least 6 characters.";
            else if (msg.includes("invalid-email")) msg = "Error: Please provide a valid email address.";
            else msg = msg.replace("Firebase: Error ", "").replace(/\(auth\/[^)]+\)\.?/g, "").trim();
            setErrorMsg(msg);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-green-500/30">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                        <ArrowLeft className="h-5 w-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium hidden sm:inline">Back to Home</span>
                        <span className="font-medium sm:hidden">Back</span>
                    </Link>
                    <div className="flex items-center gap-2 text-[#6BD85E] font-bold text-[17px] sm:text-lg tracking-tight">
                        <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                        <span className="whitespace-nowrap">Gym Partner Portal</span>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-32 pb-24 px-6 flex items-center justify-center min-h-screen">
                <div className="w-full max-w-md relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-[#6BD85E]/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition duration-1000 blur-md pointer-events-none" />
                    <div className="bg-zinc-950 border border-white/10 rounded-2xl p-8 relative">
                        <div className="text-center mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-[#6BD85E]/10 flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="h-6 w-6 text-[#6BD85E]" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Create Partner Account</h1>
                            <p className="text-gray-400 text-sm">Join the GymSaver network to start bidding on local user memberships.</p>
                        </div>

                        {errorMsg && (
                            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                                {errorMsg}
                            </div>
                        )}

                        {!isSuccess ? (
                            <form onSubmit={handleSignup} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-1.5 block">Official Gym Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                        <input 
                                            type="text" 
                                            required
                                            value={gymName}
                                            onChange={e => setGymName(e.target.value)}
                                            placeholder="e.g. Iron Palace Gym"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#6BD85E]/50 focus:border-[#6BD85E]/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-1.5 block">Business Work Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                        <input 
                                            type="email" 
                                            required
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="admin@ironpalace.com"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#6BD85E]/50 focus:border-[#6BD85E]/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-1.5 block">Secure Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                        <input 
                                            type="password" 
                                            required
                                            minLength={8}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#6BD85E]/50 focus:border-[#6BD85E]/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full h-12 mt-4 rounded-xl font-bold bg-[#6BD85E] text-black hover:bg-[#5bc250]"
                                >
                                    {isSubmitting ? "Verifying..." : "Sign Up as Gym Owner"}
                                </Button>
                            </form>
                        ) : (
                            <div className="py-8 flex flex-col items-center justify-center text-center">
                                <div className="h-16 w-16 bg-[#6BD85E]/20 text-[#6BD85E] rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Account Created!</h3>
                                <p className="text-gray-400 text-sm">Redirecting you to your exclusive Gym Dashboard...</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
