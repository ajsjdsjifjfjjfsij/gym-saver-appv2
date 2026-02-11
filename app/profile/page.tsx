"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, Trash2, AlertTriangle, Shield, FileText } from "lucide-react";
import { deleteUser } from "firebase/auth";
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
