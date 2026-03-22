"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, Trash2, AlertTriangle, Shield, FileText, Zap } from "lucide-react";
import { deleteUser } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [myBounties, setMyBounties] = useState<any[]>([]);
    const [myOffers, setMyOffers] = useState<any[]>([]);

    useEffect(() => {
        if (!user || !db) return;
        const qBounties = query(collection(db, "bounties"), where("userId", "==", user.uid));
        const unsubscribeBounties = onSnapshot(qBounties, (snapshot) => {
            const fetched: any[] = [];
            snapshot.forEach(doc => fetched.push({ id: doc.id, ...doc.data() }));
            // Most recent first
            fetched.sort((a,b) => b.timestamp - a.timestamp);
            setMyBounties(fetched);
        });

        const qOffers = query(collection(db, "bountyOffers"), where("targetUserId", "==", user.uid));
        const unsubscribeOffers = onSnapshot(qOffers, (snapshot) => {
            const fetched: any[] = [];
            snapshot.forEach(doc => fetched.push({ id: doc.id, ...doc.data() }));
            setMyOffers(fetched);
        });

        return () => {
            unsubscribeBounties();
            unsubscribeOffers();
        };
    }, [user]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login"); // Redirect to login if not authenticated
        }
    }, [user, loading, router]);

    const handleDeleteAccount = async () => {
        if (!user) return;

        setIsDeleting(true);
        try {
            await deleteUser(user);
            router.push("/"); // Redirect home after deletion
        } catch (error: any) {
            console.error("Error deleting account:", error);
            // Re-authentication might be required if the session is old
            if (error.code === 'auth/requires-recent-login') {
                alert("For security, please log out and log back in before deleting your account.");
            } else {
                alert("Failed to delete account: " + error.message);
            }
            setIsDeleting(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-20 sm:pb-8">
            <div className="max-w-xl mx-auto space-y-8">
                <Button
                    variant="ghost"
                    className="pl-0 hover:bg-transparent hover:text-white/80"
                    onClick={() => router.push("/search")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Return to App
                </Button>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
                    <p className="text-muted-foreground">Manage your account and preferences.</p>
                </div>

                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your personal account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Email</span>
                            <span className="text-lg">{user.email}</span>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-muted-foreground">User ID</span>
                            <span className="text-xs font-mono text-muted-foreground">{user.uid}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => logout()}>
                            Log Out
                        </Button>
                    </CardFooter>
                </Card>

                {/* My Gym Bounties Section */}
                <Card className="bg-white/5 border-[#6BD85E]/30 text-white shadow-[0_0_15px_rgba(107,216,94,0.05)]">
                    <CardHeader>
                        <CardTitle className="text-[#6BD85E] flex items-center gap-2">
                            <Zap className="h-5 w-5" fill="currentColor" /> My Gym Bounties
                        </CardTitle>
                        <CardDescription>View your active budget requests and incoming gym offers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {myBounties.length === 0 ? (
                            <div className="text-center py-6 text-gray-400">
                                <Zap className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                                <p>You have no active gym bounties.</p>
                                <Button variant="outline" className="mt-4 border-[#6BD85E]/20 hover:bg-[#6BD85E]/10 text-[#6BD85E]" onClick={() => router.push('/gym-bounty')}>
                                    Post a Bounty
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {myBounties.map((bounty) => {
                                    const relatedOffers = myOffers.filter(o => o.bountyId === bounty.id);
                                    return (
                                        <div key={bounty.id} className="border border-white/10 p-5 rounded-xl bg-black/40">
                                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                                                <div>
                                                    <div className="font-bold text-lg mb-1">Looking for: {bounty.gymType}</div>
                                                    <div className="text-sm text-gray-400">Budget: <span className="text-[#6BD85E] font-bold">£{bounty.budget}/mo</span> • {bounty.location}</div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="bg-[#6BD85E]/10 text-[#6BD85E] px-3 py-1.5 rounded text-xs font-bold uppercase border border-[#6BD85E]/20">{bounty.status}</span>
                                                </div>
                                            </div>

                                            {relatedOffers.length === 0 ? (
                                                <div className="text-sm text-gray-500 italic p-2 bg-white/5 rounded-lg border border-white/5 text-center">No offers received yet. Check back soon!</div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="text-xs font-bold text-[#6BD85E] tracking-wider mb-2">OFFERS RECEIVED ({relatedOffers.length})</div>
                                                    {relatedOffers.map(offer => (
                                                        <div key={offer.id} className="bg-white/5 p-4 rounded-xl border border-white/10">
                                                            <div className="flex justify-between mb-2">
                                                                <span className="font-bold text-white">{offer.gymEmail}</span>
                                                                <span className="text-[#6BD85E] font-extrabold bg-[#6BD85E]/10 px-2 py-0.5 rounded">£{offer.offerAmount}/mo</span>
                                                            </div>
                                                            <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-white/10 pl-3">"{offer.offerMessage}"</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader>
                        <CardTitle>Legal</CardTitle>
                        <CardDescription>Review our policies and terms.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start h-auto py-3 px-0 hover:bg-white/5" onClick={() => router.push('/legal/privacy')}>
                            <Shield className="mr-3 h-5 w-5 text-muted-foreground" />
                            <div className="flex flex-col items-start">
                                <span className="text-base">Privacy Policy</span>
                                <span className="text-xs text-muted-foreground font-normal">How we handle your data</span>
                            </div>
                        </Button>
                        <div className="h-px bg-white/5 w-full my-2" />
                        <Button variant="ghost" className="w-full justify-start h-auto py-3 px-0 hover:bg-white/5" onClick={() => router.push('/legal/terms')}>
                            <FileText className="mr-3 h-5 w-5 text-muted-foreground" />
                            <div className="flex flex-col items-start">
                                <span className="text-base">Terms of Service</span>
                                <span className="text-xs text-muted-foreground font-normal">Rules for using the app</span>
                            </div>
                        </Button>
                    </CardContent>
                </Card>

                <div className="pt-8 border-t border-white/10">
                    <h3 className="text-lg font-semibold text-red-500 mb-4 flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5" /> Danger Zone
                    </h3>
                    <Card className="bg-red-950/20 border-red-900/50 text-white">
                        <CardHeader>
                            <CardTitle className="text-red-400">Delete Account</CardTitle>
                            <CardDescription className="text-red-300/70">
                                Permanently delete your account and remove your operational data from our systems. This action cannot be undone.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-zinc-900 border-white/10 text-white">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-zinc-400">
                                            This action cannot be undone. This will permanently delete your account
                                            and remove your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-white/10 border-transparent hover:bg-white/20 text-white">
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteAccount}
                                            disabled={isDeleting}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
