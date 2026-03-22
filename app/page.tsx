import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
    title: "Find Cheap Gym Memberships & Compare Prices | GymSaver (Gym Saver App)",
    description: "Search, compare, and save on gym memberships across the UK. Discover cheap gyms, 24-hour fitness centers, and exclusive deals near you with the Gym Saver app.",
    keywords: ["24hr gym near me", "cheap gyms near me", "gym prices", "compare gyms", "fitness deals", "uk gyms", "gym saver", "gym saver app", "gymsaver app"],
    alternates: {
        canonical: '/',
    },
};

export default function Page() {
    return <LandingPage />;
}
