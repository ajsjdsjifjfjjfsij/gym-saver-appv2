import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
    title: "Find Cheap Gym Memberships & Compare Prices | GymSaver",
    description: "Search, compare, and save on gym memberships across the UK. Discover cheap gyms, 24-hour fitness centers, and exclusive deals near you.",
    alternates: {
        canonical: "https://www.gymsaverapp.com",
    },
};

export default function Page() {
    return <LandingPage />;
}
