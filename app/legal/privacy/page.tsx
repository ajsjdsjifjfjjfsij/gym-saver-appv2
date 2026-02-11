"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black text-white p-6 sm:p-12">
            <div className="max-w-3xl mx-auto space-y-8">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                <h1 className="text-4xl font-bold">Privacy Policy</h1>

                <div className="space-y-4 text-gray-300">
                    <p>Last updated: January 31, 2026</p>

                    <h2 className="text-2xl font-semibold text-white mt-8">1. Introduction</h2>
                    <p>
                        Welcome to GymSaver. We respect your privacy and are committed to protecting your personal data.
                        This privacy policy will inform you as to how we look after your personal data when you visit our app
                        and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">2. Data We Collect</h2>
                    <p>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Identity Data:</strong> includes your email address.</li>
                        <li><strong>Usage Data:</strong> includes information about how you use our app and services.</li>
                        <li><strong>User Content:</strong> includes price submissions and gym information you provide.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-white mt-8">3. How We Use Your Data</h2>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>To register you as a new user.</li>
                        <li>To manage our relationship with you.</li>
                        <li>To improve our website, products/services, marketing or customer relationships.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-white mt-8">4. Data Security</h2>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">5. Account Deletion</h2>
                    <p>
                        You have the right to delete your account at any time. You can do this directly within the mobile application settings page.
                        Upon deletion, your personal identity data will be removed from our systems. Some non-personal contributions (like gym price data) may be retained but anonymized.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">6. Contact Us</h2>
                    <p>
                        If you have any questions about this privacy policy or our privacy practices, please contact us at: support@gymsaverapp.com
                    </p>
                </div>
            </div>
        </div>
    );
}
