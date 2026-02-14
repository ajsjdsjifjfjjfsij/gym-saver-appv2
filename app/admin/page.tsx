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

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
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

    // Fetch Submissions
    useEffect(() => {
        if (user?.email === ADMIN_EMAIL) {
            setDataLoading(true);
            setError(null);

            // Query submissions ordered by date
            const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"));

            const unsubscribe = onSnapshot(q,
                (snapshot) => {
                    const subs: Submission[] = [];
                    snapshot.forEach((doc) => {
                        subs.push({ id: doc.id, ...doc.data() } as Submission);
                    });
                    setSubmissions(subs);
                    setDataLoading(false);
                },
                (err) => {
                    console.error("Firestore error in Admin Console:", err);
                    setError(err.message === "Missing or insufficient permissions."
                        ? "Permission Denied. Please ensure your email is verified."
                        : err.message);
                    setDataLoading(false);
                }
            );

            return () => unsubscribe();
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

    const handleApprove = async (id: string) => {
        try {
            // Here you would eventually update the actual Gym document
            // For now, just mark the submission as approved
            await updateDoc(doc(db, "submissions", id), {
                status: "approved"
            });
            alert("Submission approved!");
        } catch (error) {
            console.error("Error approving:", error);
            alert("Failed to approve.");
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Are you sure you want to reject this submission?")) return;
        try {
            await updateDoc(doc(db, "submissions", id), {
                status: "rejected"
            });
            // Optional: deleteDoc(doc(db, "submissions", id));
        } catch (error) {
            console.error("Error rejecting:", error);
            alert("Failed to reject.");
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

                {/* Submissions Table */}
                <Card className="bg-white/5 border-white/10 text-white overflow-hidden">
                    <CardHeader>
                        <CardTitle>Price Change Submissions</CardTitle>
                        <CardDescription>Review and verify user uploads.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-white/10">
                            <Table>
                                <TableHeader className="bg-white/5">
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
            </div>
        </div>
    );
}
