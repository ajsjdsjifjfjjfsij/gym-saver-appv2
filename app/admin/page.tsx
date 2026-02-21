"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, FileText, ImageIcon, DollarSign, Mail, AlertCircle } from "lucide-react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
    status: "pending" | "matched" | "approved" | "rejected";
    media?: { gymImageUrl?: string; priceImageUrl?: string };
}

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [gymListings, setGymListings] = useState<GymListing[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);

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
                    setDataLoading(false);
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
            // Merge partner data into the main gyms collection
            const gymRef = doc(db, "gyms", listing.place_id);
            await setDoc(gymRef, {
                partner_status: listing.partner_status || "Free",
                partner_updatedAt: listing.partner_updatedAt || new Date(),
                submission_id: listing.submission_id || null,
                submission_source: listing.submission_source || null,
                memberships: {
                    [listing.gym_name]: {
                        price: listing.price_monthly,
                        url: listing.join_link || "https://gymsaverapp.com/contact"
                    }
                }
            }, { merge: true });

            // Mark pending listing as approved
            await updateDoc(doc(db, "pending_gym_listings", listing.id), { status: "approved" });
            alert("Gym Listing successfully merged and approved!");
        } catch (error) {
            console.error("Error approving listing:", error);
            alert("Failed to approve listing.");
        }
    };

    const handleMatchListing = async (id: string, currentId?: string) => {
        let newId = currentId;
        if (!newId) {
            newId = prompt("No Place ID found. Enter Google Place ID to match this gym:", "");
            if (!newId) return; // Cancelled
        }

        try {
            await updateDoc(doc(db, "pending_gym_listings", id), { place_id: newId, status: "matched" });
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
            await updateDoc(doc(db, "pending_gym_listings", id), { place_id: newId });
        } catch (error) {
            console.error("Error updating Place ID:", error);
            alert("Failed to update Place ID.");
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
                            {error}
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
                    <div className="flex gap-2">
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
                    <TabsList className="grid w-full mb-6 grid-cols-2 bg-white/5 border border-white/10 rounded-xl p-1">
                        <TabsTrigger value="gym-listings" className="rounded-lg data-[state=active]:bg-[#6BD85E] data-[state=active]:text-black text-white hover:bg-white/10 transition-colors py-2">Gym Listings</TabsTrigger>
                        <TabsTrigger value="price-changes" className="rounded-lg data-[state=active]:bg-[#6BD85E] data-[state=active]:text-black text-white hover:bg-white/10 transition-colors py-2">Price Changes</TabsTrigger>
                    </TabsList>

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
                                                if (!listing.featured_request || listing.status !== 'pending') return null;
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
                                                                    {listing.status === 'matched' ? 'MATCHED' : 'MATCH'}
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
                                            {gymListings.filter(l => l.featured_request && (l.status === 'pending' || l.status === 'matched')).length === 0 && (
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
                                                if (listing.featured_request || listing.status !== 'pending') return null;
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
                                                                    className={`h-8 px-2 text-xs font-bold border ${listing.status === 'matched' ? 'text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black' : 'text-slate-400 border-slate-600 hover:bg-slate-800'}`}
                                                                    onClick={() => handleMatchListing(listing.id, listing.place_id)}
                                                                >
                                                                    {listing.status === 'matched' ? 'MATCHED' : 'MATCH'}
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
                                            {gymListings.filter(l => !l.featured_request && (l.status === 'pending' || l.status === 'matched')).length === 0 && (
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
                </Tabs>
            </div>
        </div>
    );
}
