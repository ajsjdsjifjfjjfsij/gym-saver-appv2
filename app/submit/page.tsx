"use client";

import SubmissionForm from "@/components/submissions/SubmissionForm";
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function SubmitPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/signup");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative">
            <Button
                variant="ghost"
                className="absolute top-4 left-4 text-slate-400 hover:text-white hover:bg-white/10"
                onClick={() => router.push('/')}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Home
            </Button>
            <div className="w-full max-w-md">
                <SubmissionForm />
            </div>
        </div>
    );
}
