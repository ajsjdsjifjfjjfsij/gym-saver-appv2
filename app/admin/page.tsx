"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc, setDoc, where, getDocs, addDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, FileText, ImageIcon, DollarSign, Mail, AlertCircle, Star, Send, Zap } from "lucide-react";
import { sendEmailVerification } from "firebase/auth";
import Image from "next/image";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
const ADMIN_EMAIL = "josephbunton@live.co.uk";

interface Submission {
    id: string;
    userId: string;
    userEmail: string;
    gymName?: string;
    gymLocation?: string;
    price?: number;
    note?: string; // Backwards compatibility
    imageUrl: string;
    createdAt: any;
    status?: "pending" | "approved" | "rejected";
}

interface GymListing {
    id: string;
    submission_id?: string;
    submission_source?: string;
    place_id?: string;
    gym_name: string;
    address: string;
    city: string;
    contact_name: string;
    email: string;
    phone: string;
    price_monthly: number;
    featured_request: boolean;
    partner_status?: string;
    partner_updatedAt?: any;
    created_at: any;
    join_link?: string;
    status: "pending" | "matched" | "approved" | "rejected";
    media?: { gymImageUrl?: string; priceImageUrl?: string };
    lat?: number;
    lng?: number;
}

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [gymListings, setGymListings] = useState<GymListing[]>([]);
    const [featuredGyms, setFeaturedGyms] = useState<any[]>([]);
    const [pendingPartners, setPendingPartners] = useState<any[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);

    // Global Broadcast Broadcast State
    const [broadcastSubject, setBroadcastSubject] = useState("");
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    // Featured Gym Input States
    const [featurePlaceId, setFeaturePlaceId] = useState("");
    const [featureFrom, setFeatureFrom] = useState("");
    const [featureUntil, setFeatureUntil] = useState("");
    const [featureLoading, setFeatureLoading] = useState(false);

    // Security Check
    useEffect(() => {
        if (!loading) {
            if (!user || user.email !== ADMIN_EMAIL) {
                console.warn("Unauthorized access attempt by:", user?.email);
                router.push("/");
            }
        }
    }, [user, loading, router]);

    // Fetch Submissions & Listings
    useEffect(() => {
        if (user?.email === ADMIN_EMAIL) {
            setDataLoading(true);
            setError(null);

            // Query Price Submissions
            const qSubs = query(collection(db, "submissions"), orderBy("createdAt", "desc"));
            const unsubSubs = onSnapshot(qSubs,
                (snapshot) => {
                    const subs: Submission[] = [];
                    snapshot.forEach((doc) => subs.push({ id: doc.id, ...doc.data() } as Submission));
                    setSubmissions(subs);
                },
                (err) => handleError(err)
            );

            // Query Gym Listings
            const qListings = query(collection(db, "pending_gym_listings"), orderBy("created_at", "desc"));
            const unsubListings = onSnapshot(qListings,
                (snapshot) => {
                    const listings: GymListing[] = [];
                    snapshot.forEach((doc) => listings.push({ id: doc.id, ...doc.data() } as GymListing));
                    setGymListings(listings);
                },
                (err) => handleError(err)
            );

            // Query Featured Gyms
            const qFeatured = query(collection(db, "gyms"), where("isFeatured", "==", true));
            const unsubFeatured = onSnapshot(qFeatured,
                (snapshot) => {
                    const featured: any[] = [];
                    snapshot.forEach((doc) => featured.push({ id: doc.id, ...doc.data() }));
                    setFeaturedGyms(featured);
                    setDataLoading(false);
                },
                (err) => handleError(err)
            );

            // Query Pending Partners
            const qPartners = query(collection(db, "users"), where("role", "==", "pending_partner"));
            const unsubPartners = onSnapshot(qPartners,
                (snapshot) => {
                    const partners: any[] = [];
                    snapshot.forEach((doc) => partners.push({ id: doc.id, ...doc.data() }));
                    setPendingPartners(partners);
                },
                (err) => handleError(err)
            );

            const handleError = (err: any) => {
                console.error("Firestore error in Admin Console:", err);
                setError(err.message === "Missing or insufficient permissions."
                    ? "Permission Denied. Please ensure your email is verified."
                    : err.message);
                setDataLoading(false);
            };

            return () => {
                unsubSubs();
                unsubListings();
                unsubFeatured();
                unsubPartners();
            };
        }
    }, [user]);

    const handleResendVerification = async () => {
        if (!auth.currentUser) return;
        setVerifying(true);
        try {
            await sendEmailVerification(auth.currentUser);
            alert("Verification email sent! Please check your inbox.");
        } catch (err: any) {
            console.error("Error sending verification:", err);
            alert("Error sending email: " + err.message);
        } finally {
            setVerifying(false);
        }
    };

    // Submissions Handlers
    const handleApprove = async (id: string) => {
        try {
            await updateDoc(doc(db, "submissions", id), { status: "approved" });
            alert("Submission approved!");
        } catch (error) {
            console.error("Error approving:", error);
            alert("Failed to approve.");
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Are you sure you want to reject this submission?")) return;
        try {
            await updateDoc(doc(db, "submissions", id), { status: "rejected" });
        } catch (error) {
            console.error("Error rejecting:", error);
            alert("Failed to reject.");
        }
    };

    // Gym Listings Handlers
    const handleApproveListing = async (listing: GymListing) => {
        if (!listing.place_id || listing.status !== "matched") {
            alert("This listing must be matched to a Place ID before approving.");
            return;
        }

        try {
            const cleanPlaceId = listing.place_id.split('\n')[0].trim();

            // Merge partner data into the main gyms collection
            const gymRef = doc(db, "gyms", cleanPlaceId);
            await setDoc(gymRef, {
                partner_status: listing.partner_status || "Free",
                partner_updatedAt: listing.partner_updatedAt || new Date(),
                submission_id: listing.submission_id || null,
                submission_source: listing.submission_source || null,
                location: {
                    lat: listing.lat || 0,
                    lng: listing.lng || 0,
                    address: listing.address || ""
                },
                memberships: {
                    [listing.gym_name]: {
                        price: listing.price_monthly,
                        url: listing.join_link || "https://gymsaverapp.com/contact"
                    }
                }
            }, { merge: true });

            // Mark pending listing as approved, and save the clean ID just in case it was dirty
            await updateDoc(doc(db, "pending_gym_listings", listing.id), {
                place_id: cleanPlaceId,
                status: "approved"
            });
            alert("Gym Listing successfully merged and approved!");
        } catch (error: any) {
            console.error("Error approving listing:", error);
            alert(`Failed to approve listing: ${error.message || 'Unknown error'}`);
        }
    };

    const handleMatchListing = async (id: string, currentId?: string) => {
        let newId = currentId;
        if (!newId) {
            const promptResult = prompt("No Place ID found. Enter Google Place ID to match this gym:", "");
            if (!promptResult) return; // Cancelled
            newId = promptResult;
        }

        try {
            const safeId = newId.split('\n')[0].trim();
            // Fetch coordinates automatically
            const res = await fetch(`/api/admin/place-details?placeId=${safeId}`);
            const data = await res.json();

            const updates: any = { place_id: safeId, status: "matched" };
            if (data.lat && data.lng) {
                updates.lat = data.lat;
                updates.lng = data.lng;
            }

            await updateDoc(doc(db, "pending_gym_listings", id), updates);
            if (!data.lat) alert("Matched Place ID, but could not fetch coordinates. Please check the Place ID.");
        } catch (error) {
            console.error("Error matching listing:", error);
            alert("Failed to match listing.");
        }
    };

    const handleRejectListing = async (id: string) => {
        if (!confirm("Are you sure you want to reject this gym listing? It will be moved to the Rejected section.")) return;
        try {
            await updateDoc(doc(db, "pending_gym_listings", id), { status: "rejected" });
        } catch (error) {
            console.error("Error rejecting listing:", error);
            alert("Failed to reject listing.");
        }
    };

    const handleUpdatePlaceId = async (id: string, currentId?: string) => {
        const newId = prompt("Enter Google Place ID for this gym:", currentId || "");
        if (newId === null || newId === currentId) return; // cancelled or unchanged
        try {
            const safeId = newId.split('\n')[0].trim();

            // Fetch coordinates automatically
            const res = await fetch(`/api/admin/place-details?placeId=${safeId}`);
            const data = await res.json();

            const updates: any = { place_id: safeId };
            if (data.lat && data.lng) {
                updates.lat = data.lat;
                updates.lng = data.lng;
            }

            await updateDoc(doc(db, "pending_gym_listings", id), updates);
            if (!data.lat) alert("Updated Place ID, but could not fetch coordinates.");
        } catch (error) {
            console.error("Error updating Place ID:", error);
            alert("Failed to update Place ID.");
        }
    };

    // Pending Partner Handlers
    const handleApprovePartner = async (partnerId: string, email: string, gymName: string) => {
        try {
            await updateDoc(doc(db, "users", partnerId), { role: "gym_owner" });
            
            // Dispatch Resend Email
            await fetch("/api/email/approve-partner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetEmail: email, gymName })
            });
            
            alert("Partner approved and email successfully sent!");
        } catch (error) {
            console.error("Error approving partner:", error);
            alert("Failed to approve partner or send email.");
        }
    };

    // Global Broadcast Matrix
    const handleBroadcast = async () => {
        if (!broadcastSubject || !broadcastMessage) {
            alert("Both Subject and Message are strictly required.");
            return;
        }
        setIsBroadcasting(true);
        try {
            // First, effortlessly pool EVERY user from the secure collection
            const snapshot = await getDocs(collection(db, "users"));
            const targetEmails: string[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.email) {
                    targetEmails.push(data.email);
                }
            });

            if (targetEmails.length === 0) {
                alert("No users found natively globally. Ensure users have properly registered under the new system.");
                setIsBroadcasting(false);
                return;
            }

            // Immediately hit the dedicated Resend bulk API
            const res = await fetch("/api/email/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetEmails, subject: broadcastSubject, messageHtml: broadcastMessage })
            });
            const data = await res.json();
            
            if (res.ok) {
                alert(`Broadcast intelligently dispatched to ${data.count || targetEmails.length} global users!`);
                setBroadcastSubject("");
                setBroadcastMessage("");
            } else {
                alert("Failed to hit resend matrix: " + data.error);
            }
        } catch (error) {
            console.error("Error running global matrix calculation:", error);
            alert("Failed to dispatch global message universally.");
        } finally {
            setIsBroadcasting(false);
        }
    };

    // Mock Seeder Handlers
    const handleSeedMocks = async () => {
        try {
            if (!confirm("Are you incredibly sure you want to wipe all active bounties to inject the 2 fresh mocks?")) return;
            
            const bountiesRef = collection(db, "bounties");
            const snapshot = await getDocs(bountiesRef);
            for (const document of snapshot.docs) {
                await deleteDoc(doc(db, "bounties", document.id));
            }
            
            await addDoc(bountiesRef, { userId: "mock1", username: "SarahFit99", gymType: "Boutique / Studio Fitness", budget: 45, location: "Manchester M1", timestamp: new Date(), status: "active", offersCount: 1, expiresInDays: 3 });
            await addDoc(bountiesRef, { userId: "mock2", username: "James_Lifts", gymType: "24-Hour Access", budget: 25, location: "Didsbury M20", timestamp: new Date(Date.now() - 43200000), status: "active", offersCount: 3, expiresInDays: 6 });
            
            alert("Flawlessly deleted legacy bounties and injected 2 professional mocks. Check the Gym Bounties page now!");
        } catch (error) {
            console.error("Seeder Auth Error:", error);
            alert("Error seeding bounties natively. Check permissions.");
        }
    };


    // Featured Gyms Handlers
    const handleSetFeatured = async () => {
        if (!featurePlaceId || !featureFrom || !featureUntil) {
            alert("Please fill out all fields (Place ID, From Date, Until Date).");
            return;
        }

        setFeatureLoading(true);
        try {
            const gymRef = doc(db, "gyms", featurePlaceId);
            const gymSnap = await getDoc(gymRef);

            if (!gymSnap.exists()) {
                alert(`Error: Gym with Place ID ${featurePlaceId} does not exist in the database.`);
                setFeatureLoading(false);
                return;
            }

            await updateDoc(gymRef, {
                isFeatured: true,
                featuredFrom: new Date(featureFrom),
                featuredUntil: new Date(featureUntil)
            });

            alert(`Successfully set Gym ${featurePlaceId} as featured!`);
            setFeaturePlaceId("");
            setFeatureFrom("");
            setFeatureUntil("");
        } catch (error) {
            console.error("Error setting featured gym:", error);
            alert("Failed to set featured gym.");
        } finally {
            setFeatureLoading(false);
        }
    };

    const handleRemoveFeatured = async (id: string) => {
        if (!confirm("Remove featured status from this gym?")) return;
        try {
            await updateDoc(doc(db, "gyms", id), {
                isFeatured: false
            });
        } catch (error) {
            console.error("Error removing featured status:", error);
            alert("Failed to remove featured status.");
        }
    };


    if (loading || (user?.email === ADMIN_EMAIL && dataLoading)) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (user?.email !== ADMIN_EMAIL) {
        return null; // Will redirect in useEffect
    }

    // Email Verification Required State
    if (!user.emailVerified) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                <Card className="max-w-md w-full bg-white/5 border-white/10 text-white">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                            <Mail className="h-6 w-6 text-orange-500" />
                        </div>

                        <CardTitle className="text-xl">Email Verification Required</CardTitle>
                        <CardDescription>
                            Your email <strong>{user.email}</strong> is not verified.
                            Admin access requires a verified email for security.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            className="w-full bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold"
                            onClick={handleResendVerification}
                            disabled={verifying}
                        >
                            {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Resend Verification Email"}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-white/10 text-white"
                            onClick={() => window.location.reload()}
                        >
                            I've verified my email
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Permission Denied State (likely verified but rule mismatch)
    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                <Card className="max-w-md w-full bg-red-500/10 border-red-500/20 text-white">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                            <AlertCircle className="h-6 w-6 text-red-500" />
                        </div>
                        <CardTitle className="text-xl">Access Denied</CardTitle>
                        <CardDescription>
                            {typeof error === "string" ? error : "Access Denied"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button variant="outline" className="border-white/10 text-white" onClick={() => router.push("/")}>
                            Return Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-20 sm:pb-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
                        <p className="text-muted-foreground">Manage gym price submissions and analytics.</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">

                        <Button 
                            onClick={handleSeedMocks}
                            variant="outline" 
                            className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 font-bold"
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            Seed Mock Bounties
                        </Button>
                        <Button variant="secondary" onClick={() => router.push("/admin/analytics")}>Analytics</Button>
                        <Button variant="outline" onClick={() => router.push("/search")}>Back to App</Button>
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{submissions.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-400">
                                {submissions.filter(s => !s.status || s.status === 'pending').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Approved Prices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {submissions.filter(s => s.status === 'approved').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs for Submissions vs Listings */}
                <Tabs defaultValue="gym-listings" className="w-full">
                    <TabsList className="grid w-full mb-6 grid-cols-5 bg-white/5 border border-white/10 rounded-xl p-1">
                        <TabsTrigger value="gym-listings" className="rounded-lg data-[state=active]:bg-[#6BD85E] data-[state=active]:text-black text-white hover:bg-white/10 transition-colors py-2 text-xs sm:text-sm">Gym Listings</TabsTrigger>
                        <TabsTrigger value="partner-approvals" className="rounded-lg data-[state=active]:bg-[#6BD85E] data-[state=active]:text-black text-white hover:bg-white/10 transition-colors py-2 text-xs sm:text-sm">Partner Approvals</TabsTrigger>
                        <TabsTrigger value="price-changes" className="rounded-lg data-[state=active]:bg-[#6BD85E] data-[state=active]:text-black text-white hover:bg-white/10 transition-colors py-2 text-xs sm:text-sm">Price Changes</TabsTrigger>
                        <TabsTrigger value="featured" className="rounded-lg data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-white hover:bg-white/10 transition-colors py-2 text-xs sm:text-sm">Featured Options</TabsTrigger>
                        <TabsTrigger value="broadcast" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white text-white hover:bg-white/10 transition-colors py-2 text-xs sm:text-sm shadow-md">Global Broadcast</TabsTrigger>
                    </TabsList>

                    <TabsContent value="broadcast" className="mt-0">
                        <Card className="bg-white/5 border-white/10 text-white overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.15)] relative">
                            {/* Blue Accent Glow */}
                            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
                            <CardHeader>
                                <CardTitle className="text-blue-400 text-2xl items-center flex gap-2">
                                    <Send className="h-6 w-6" /> Mass Email Broadcast
                                </CardTitle>
                                <CardDescription>Send an announcement instantly to literally every registered GymSaver user via our secure Resend relay.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10">
                                <div className="space-y-3">
                                    <Label className="text-gray-300 font-bold">Subject Line</Label>
                                    <Input 
                                        type="text" 
                                        placeholder="e.g. Huge GymSaver Update Just Dropped!" 
                                        className="bg-black/50 border-white/20 text-white h-12 text-lg focus-visible:ring-blue-500"
                                        value={broadcastSubject}
                                        onChange={(e) => setBroadcastSubject(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-gray-300 font-bold">HTML Message Payload</Label>
                                    <Textarea 
                                        placeholder="<p>Hey everyone, massive news today...</p>" 
                                        className="bg-black/50 border-white/20 text-white min-h-[250px] font-mono whitespace-pre focus-visible:ring-blue-500 text-sm"
                                        value={broadcastMessage}
                                        onChange={(e) => setBroadcastMessage(e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500">You can safely use pure HTML structures (h1, p, br, a, div) inside this payload. Standard inline styles are permitted natively.</p>
                                </div>
                                <Button 
                                    size="lg" 
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 text-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50"
                                    onClick={handleBroadcast}
                                    disabled={isBroadcasting}
                                >
                                    {isBroadcasting ? "Executing Database Query & Hitting Bulk API..." : "Fire Broadcast Matrix Now"}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="partner-approvals" className="mt-0">
                        <Card className="bg-white/5 border-white/10 text-white overflow-hidden shadow-[0_0_15px_rgba(107,216,94,0.1)]">
                            <CardHeader>
                                <CardTitle className="text-[#6BD85E]">Pending Gym Partners</CardTitle>
                                <CardDescription>Gym managers waiting to be security-approved to access the Bounties Board.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border border-white/10 overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-white/5 whitespace-nowrap">
                                            <TableRow className="border-white/10 hover:bg-white/5">
                                                <TableHead className="text-gray-400">Gym Name</TableHead>
                                                <TableHead className="text-gray-400">Email Address</TableHead>
                                                <TableHead className="text-gray-400">Sign Up Date</TableHead>
                                                <TableHead className="text-right text-gray-400">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingPartners.map((partner) => (
                                                <TableRow key={partner.id} className="border-white/10 hover:bg-white/5">
                                                    <TableCell className="font-bold">{partner.gymName}</TableCell>
                                                    <TableCell className="text-gray-300 font-mono text-sm">{partner.email}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {partner.createdAt ? new Date(partner.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button size="sm" variant="ghost" className="bg-[#6BD85E]/20 text-[#6BD85E] hover:bg-[#6BD85E]/40 font-bold border border-[#6BD85E]/30" onClick={() => handleApprovePartner(partner.id, partner.email, partner.gymName)}>
                                                            <Check className="h-4 w-4 mr-1" /> Approve Partner
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {pendingPartners.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                        No pending gym partners at this moment.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="price-changes" className="mt-0">
                        {/* Submissions Table */}
                        <Card className="bg-white/5 border-white/10 text-white overflow-hidden">
                            <CardHeader>
                                <CardTitle>Price Change Submissions</CardTitle>
                                <CardDescription>Review and verify user uploads.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border border-white/10 overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-white/5 whitespace-nowrap">
                                            <TableRow className="border-white/10 hover:bg-white/5">
                                                <TableHead className="text-gray-400">Status</TableHead>
                                                <TableHead className="text-gray-400">Gym Details</TableHead>
                                                <TableHead className="text-gray-400">Price (Submitted)</TableHead>
                                                <TableHead className="text-gray-400">Proof</TableHead>
                                                <TableHead className="text-gray-400">User</TableHead>
                                                <TableHead className="text-gray-400">Date</TableHead>
                                                <TableHead className="text-right text-gray-400">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {submissions.map((submission) => (
                                                <TableRow key={submission.id} className="border-white/10 hover:bg-white/5">
                                                    <TableCell>
                                                        <Badge
                                                            variant={submission.status === 'approved' ? 'default' : submission.status === 'rejected' ? 'destructive' : 'secondary'}
                                                            className={submission.status === 'approved' ? 'bg-primary text-black' : submission.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500/20 text-yellow-500'}
                                                        >
                                                            {submission.status || 'Pending'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold">{submission.gymName || "Unknown Gym"}</span>
                                                            <span className="text-xs text-muted-foreground">{submission.gymLocation || submission.note}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 font-mono">
                                                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                            {submission.price || "N/A"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {submission.imageUrl ? (
                                                            <a href={submission.imageUrl} target="_blank" rel="noopener noreferrer" className="relative block w-10 h-10 rounded overflow-hidden hover:opacity-80 transition-opacity border border-white/20">
                                                                <Image src={submission.imageUrl} alt="Proof" fill className="object-cover" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">No image</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {submission.userEmail}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {submission.createdAt ? new Date(submission.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {(!submission.status || submission.status === 'pending') && (
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => handleReject(submission.id)}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-900/20" onClick={() => handleApprove(submission.id)}>
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {submissions.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                        No submissions found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="gym-listings" className="mt-0 space-y-6">
                        {/* FEATURED LISTINGS */}
                        <Card className="bg-white/5 border-white/10 text-white overflow-hidden shadow-[0_0_15px_rgba(107,216,94,0.1)]">
                            <CardHeader>
                                <CardTitle className="text-[#6BD85E] flex items-center gap-2">Featured Listings (Pending)</CardTitle>
                                <CardDescription>Gyms requesting priority placement in search results.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border border-white/10 overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-white/5 whitespace-nowrap">
                                            <TableRow className="border-white/10 hover:bg-white/5">
                                                <TableHead className="text-gray-400">Gym Name</TableHead>
                                                <TableHead className="text-gray-400">Address / City</TableHead>
                                                <TableHead className="text-gray-400">Contact</TableHead>
                                                <TableHead className="text-gray-400">Price/Mo.</TableHead>
                                                <TableHead className="text-gray-400">Date</TableHead>
                                                <TableHead className="text-right text-gray-400">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {gymListings.map((listing) => {
                                                if (!listing.featured_request || (listing.status !== 'pending' && listing.status !== 'matched' && listing.status !== 'approved')) return null;
                                                return (
                                                    <TableRow key={listing.id} className="border-white/10 hover:bg-white/5">
                                                        <TableCell>
                                                            <div className="font-bold">{listing.gym_name}</div>
                                                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                                <span className="font-mono">PID: {listing.place_id || 'N/A'}</span>
                                                                <button onClick={() => handleUpdatePlaceId(listing.id, listing.place_id)} className="text-[#6BD85E] hover:underline hover:text-white transition-colors ml-1">Edit</button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm">{listing.address}</span>
                                                                <span className="text-xs text-muted-foreground">{listing.city}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm">{listing.contact_name}</span>
                                                                <span className="text-xs text-muted-foreground">{listing.email}</span>
                                                                <span className="text-xs text-muted-foreground">{listing.phone}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-mono text-[#6BD85E]">£{listing.price_monthly}</TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {listing.created_at ? new Date(listing.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2 items-center">
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20" title="Reject" onClick={() => handleRejectListing(listing.id)}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className={`h-8 px-2 text-xs font-bold border ${listing.status === 'matched' ? 'text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black' : 'text-slate-400 border-slate-600 hover:bg-slate-800'}`}
                                                                    onClick={() => handleMatchListing(listing.id, listing.place_id)}
                                                                >
                                                                    {listing.status === ('matched' as GymListing['status']) ? 'MATCHED' : 'MATCH'}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-900/20 disabled:opacity-30 disabled:hover:bg-transparent"
                                                                    title="Approve & Merge"
                                                                    onClick={() => handleApproveListing(listing)}
                                                                    disabled={!listing.place_id || listing.status !== 'matched'}
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                            {gymListings.filter(l => l.featured_request && (l.status === 'pending' || l.status === ('matched' as GymListing['status']))).length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                                        No pending featured listings.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* FREE LISTINGS */}
                        <Card className="bg-white/5 border-white/10 text-white overflow-hidden">
                            <CardHeader>
                                <CardTitle>Free Listings (Pending)</CardTitle>
                                <CardDescription>Gyms opting for standard free placement.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border border-white/10 overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-white/5 whitespace-nowrap">
                                            <TableRow className="border-white/10 hover:bg-white/5">
                                                <TableHead className="text-gray-400">Gym Name</TableHead>
                                                <TableHead className="text-gray-400">Address / City</TableHead>
                                                <TableHead className="text-gray-400">Contact</TableHead>
                                                <TableHead className="text-gray-400">Price/Mo.</TableHead>
                                                <TableHead className="text-gray-400">Date</TableHead>
                                                <TableHead className="text-right text-gray-400">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {gymListings.map((listing) => {
                                                if (listing.featured_request || (listing.status !== 'pending' && listing.status !== 'matched' && listing.status !== 'approved')) return null;
                                                return (
                                                    <TableRow key={listing.id} className="border-white/10 hover:bg-white/5">
                                                        <TableCell>
                                                            <div className="font-bold">{listing.gym_name}</div>
                                                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                                <span className="font-mono">PID: {listing.place_id || 'N/A'}</span>
                                                                <button onClick={() => handleUpdatePlaceId(listing.id, listing.place_id)} className="text-[#6BD85E] hover:underline hover:text-white transition-colors ml-1">Edit</button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm">{listing.address}</span>
                                                                <span className="text-xs text-muted-foreground">{listing.city}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm">{listing.contact_name}</span>
                                                                <span className="text-xs text-muted-foreground">{listing.email}</span>
                                                                <span className="text-xs text-muted-foreground">{listing.phone}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-mono text-white">£{listing.price_monthly}</TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {listing.created_at ? new Date(listing.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2 items-center">
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20" title="Reject" onClick={() => handleRejectListing(listing.id)}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className={`h-8 px-2 text-xs font-bold border ${listing.status === 'matched' ? 'text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black' : listing.status === 'approved' ? 'text-green-400 border-green-400 hover:bg-green-400 hover:text-black' : 'text-slate-400 border-slate-600 hover:bg-slate-800'}`}
                                                                    onClick={() => handleMatchListing(listing.id, listing.place_id)}
                                                                >
                                                                    {listing.status === ('matched' as GymListing['status']) ? 'MATCHED' : listing.status === 'approved' ? 'APPROVED' : 'MATCH'}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-900/20 disabled:opacity-30 disabled:hover:bg-transparent"
                                                                    title="Approve & Merge"
                                                                    onClick={() => handleApproveListing(listing)}
                                                                    disabled={!listing.place_id || (listing.status !== 'matched' && listing.status !== 'approved')}
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                            {gymListings.filter(l => !l.featured_request && (l.status === 'pending' || l.status === 'matched' || l.status === 'approved')).length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                                        No pending free listings.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* REJECTED LISTINGS */}
                        <Card className="bg-red-950/20 border-red-900/40 text-white overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-red-400">Rejected Listings</CardTitle>
                                <CardDescription>Gyms that have been rejected and require further contact.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border border-red-900/40 overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-red-950/40 whitespace-nowrap">
                                            <TableRow className="border-red-900/40 hover:bg-red-900/20">
                                                <TableHead className="text-red-300">Gym Name</TableHead>
                                                <TableHead className="text-red-300">Tracking Info</TableHead>
                                                <TableHead className="text-red-300">Contact</TableHead>
                                                <TableHead className="text-red-300">Price/Mo.</TableHead>
                                                <TableHead className="text-red-300">Date</TableHead>
                                                <TableHead className="text-right text-red-300">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {gymListings.map((listing) => {
                                                if (listing.status !== 'rejected') return null;
                                                return (
                                                    <TableRow key={listing.id} className="border-red-900/40 hover:bg-red-900/20">
                                                        <TableCell className="font-bold">{listing.gym_name}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-xs text-muted-foreground font-mono">ID: {listing.submission_id || 'N/A'}</span>
                                                                <span className="text-xs text-muted-foreground">Source: {listing.submission_source || 'N/A'}</span>
                                                                <span className="text-xs text-muted-foreground">Partner: {listing.partner_status || 'N/A'}</span>
                                                                <div className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                                                                    PID: {listing.place_id || 'N/A'}
                                                                    <button onClick={() => handleUpdatePlaceId(listing.id, listing.place_id)} className="text-red-400 hover:underline hover:text-white transition-colors ml-1">Edit</button>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm">{listing.contact_name}</span>
                                                                <span className="text-xs text-muted-foreground">{listing.email}</span>
                                                                <span className="text-xs text-muted-foreground">{listing.phone}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-mono text-white">£{listing.price_monthly}</TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {listing.created_at ? new Date(listing.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" variant="outline" className="h-8 border-white/10 text-xs" onClick={() => {
                                                                    // Optional feature to re-approve
                                                                    if (confirm('Restore this listing to pending?')) {
                                                                        import("firebase/firestore").then(({ updateDoc, doc }) => {
                                                                            updateDoc(doc(db, "pending_gym_listings", listing.id), { status: "pending" });
                                                                        });
                                                                    }
                                                                }}>
                                                                    Restore
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                            {gymListings.filter(l => l.status === 'rejected').length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                                        No rejected listings.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="featured" className="mt-0 space-y-6">
                        {/* FEATURE A GYM */}
                        <Card className="bg-gradient-to-br from-yellow-900/20 to-black border-yellow-500/20 text-white overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                            <CardHeader>
                                <CardTitle className="text-yellow-500 flex items-center gap-2">
                                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                                    Feature a Gym
                                </CardTitle>
                                <CardDescription>Promote a gym to the top of the search results for its area.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Google Place ID</label>
                                        <input
                                            type="text"
                                            value={featurePlaceId}
                                            onChange={(e) => setFeaturePlaceId(e.target.value)}
                                            placeholder="ChIJ..."
                                            className="w-full bg-black border border-white/10 rounded-md p-2 text-white focus:border-yellow-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Featured From</label>
                                        <input
                                            type="datetime-local"
                                            value={featureFrom}
                                            onChange={(e) => setFeatureFrom(e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-md p-2 text-white focus:border-yellow-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Featured Until</label>
                                        <input
                                            type="datetime-local"
                                            value={featureUntil}
                                            onChange={(e) => setFeatureUntil(e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-md p-2 text-white focus:border-yellow-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold border-none"
                                    onClick={handleSetFeatured}
                                    disabled={featureLoading}
                                >
                                    {featureLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Star className="mr-2 h-4 w-4 fill-black" />}
                                    Set Featured Status
                                </Button>
                            </CardContent>
                        </Card>

                        {/* ACTIVE & EXPIRED FEATURED GYMS */}
                        <Card className="bg-white/5 border-white/10 text-white overflow-hidden">
                            <CardHeader>
                                <CardTitle>Featured Gyms Roster</CardTitle>
                                <CardDescription>Monitor currently active and expired featured placements.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border border-white/10 overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-white/5 whitespace-nowrap">
                                            <TableRow className="border-white/10 hover:bg-white/5">
                                                <TableHead className="text-gray-400">Gym</TableHead>
                                                <TableHead className="text-gray-400">Status</TableHead>
                                                <TableHead className="text-gray-400">Duration</TableHead>
                                                <TableHead className="text-right text-gray-400">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {featuredGyms.map((gym) => {
                                                const now = new Date();
                                                const untilDate = gym.featuredUntil ? new Date(gym.featuredUntil.seconds * 1000) : new Date(0);
                                                const isExpired = now > untilDate;
                                                const fromDate = gym.featuredFrom ? new Date(gym.featuredFrom.seconds * 1000) : new Date();
                                                const isFuture = now < fromDate;

                                                return (
                                                    <TableRow key={gym.id} className={`border-white/10 hover:bg-white/5 ${isExpired ? 'opacity-70' : ''}`}>
                                                        <TableCell>
                                                            <div className="font-bold">{gym.name || 'Unknown Gym'}</div>
                                                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-mono">
                                                                PID: {gym.id}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {isExpired ? (
                                                                <Badge variant="destructive" className="bg-red-500/20 text-red-400 border border-red-500/30">Expired</Badge>
                                                            ) : isFuture ? (
                                                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border border-blue-500/30">Scheduled</Badge>
                                                            ) : (
                                                                <Badge variant="default" className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 font-bold">
                                                                    <Star className="w-3 h-3 mr-1 fill-yellow-500 inline" /> Active
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col text-sm">
                                                                <span className="text-slate-300">From: {fromDate.toLocaleString()}</span>
                                                                <span className={isExpired ? "text-red-400" : "text-slate-300"}>To: {untilDate.toLocaleString()}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button size="sm" variant="ghost" className="h-8 text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => handleRemoveFeatured(gym.id)}>
                                                                Clear Status
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                            {featuredGyms.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                                        No gyms are currently flagged as featured.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
