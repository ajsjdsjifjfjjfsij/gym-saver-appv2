"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsOfService() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black text-white p-6 sm:p-12">
            <div className="max-w-3xl mx-auto space-y-8">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                <h1 className="text-4xl font-bold">Terms of Service</h1>

                <div className="space-y-4 text-gray-300">
                    <p>Last updated: January 31, 2026</p>

                    <h2 className="text-2xl font-semibold text-white mt-8">1. Agreement to Terms</h2>
                    <p>
                        By accessing or using the GymSaver application, you agree to be bound by these Terms of Service and our Privacy Policy.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">2. User Accounts</h2>
                    <p>
                        To access certain features of the application, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">3. User Content</h2>
                    <p>
                        Our application allows you to post gym prices and other information ("User Content"). You retain all rights in, and are solely responsible for, the User Content you post to the application.
                    </p>
                    <p>
                        By posting User Content, you grant us a non-exclusive, transferable, sub-licensable, royalty-free, worldwide license to use, copy, modify, create derivative works based upon, distribute, publicly display, and publicly perform your User Content in connection with operating and providing the Services.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">4. Prohibited Conduct</h2>
                    <p>
                        You agree not to use the application to post false or misleading information, harass other users, or violate any applicable laws. We reserve the right to suspend or terminate your account if you violate these terms.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">5. Disclaimer</h2>
                    <p>
                        The application and services are provided on an "as is" and "as available" basis. We make no warranties that the application will be uninterrupted, secure, or error-free.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">6. Changes to Terms</h2>
                    <p>
                        We may modify these Terms at any time. If we do so, we will post the changes on this page. Your continued use of the application after any such changes constitutes your acceptance of the new Terms.
                    </p>
                </div>
            </div>
        </div>
    );
}
