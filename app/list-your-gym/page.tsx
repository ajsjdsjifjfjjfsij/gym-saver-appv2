"use client";

import ListYourGymForm from "@/components/submissions/ListYourGymForm";
import { Header } from "@/components/header";
import { useState } from "react";
import { AuthGateModal } from "@/components/auth/AuthGateModal";
import { useRouter } from "next/navigation";

export default function ListYourGymPage() {
    const router = useRouter();
    // We reuse the header's states here to keep the navigation functional
    const [searchQuery, setSearchQuery] = useState("");
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Stub functions for the header
    const handleSearchChange = (q: string) => setSearchQuery(q);
    const handleAuthRequired = () => setShowAuthModal(true);
    const handleToggleSavedView = () => { };

    return (
        <div className="flex flex-col min-h-screen bg-black">
            <Header
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                savedCount={0}
                onToggleSavedView={handleToggleSavedView}
                showSavedOnly={false}
                onAuthRequired={handleAuthRequired}
                variant="app"
            />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-12 pb-24">
                <div className="mb-8 pl-2">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Partner with us.</h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        List your gym on GymSaver to reach thousands of users actively looking for memberships in your area.
                        Fill out the details below and our team will review your submission.
                    </p>
                </div>

                <ListYourGymForm />
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
