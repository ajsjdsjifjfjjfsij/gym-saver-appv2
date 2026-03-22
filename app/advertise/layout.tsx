import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Advertise Your Gym & Reach Local Audiences | GymSaver",
    description: "Promote your business, brand, or services to thousands of active gym-goers across the UK with GymSaver's highly targeted local advertisement placements.",
    keywords: [
        "local advertising", "hyper-local marketing", "advertise my business", "brand promotion",
        "small business advertising", "local business marketing", "uk advertising space", 
        "gym advertising", "fitness marketing", "local gym ads", "promote your gym",
        "targeted ads", "digital out of home", "local brand awareness"
    ],
    alternates: {
        canonical: "/advertise",
    },
};

export default function AdvertiseLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
