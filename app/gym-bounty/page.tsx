import { Metadata } from "next";
import GymBountyClient from "@/components/GymBountyClient";

export const metadata: Metadata = {
    title: "Gym Bounty | Let Gyms Compete for You | GymSaver",
    description: "Post a gym bounty with your budget and location, and let local gyms and fitness brands submit their best offers directly to you.",
    keywords: ["gym membership deals", "cheap gyms near me", "gym price comparison", "negotiate gym price", "gym saver", "uk gyms", "gym bounty", "fitness deals"],
    openGraph: {
        title: "Gym Bounty | Let Gyms Compete for You",
        description: "Post a gym bounty with your budget and location, and let local gyms and fitness brands submit their best offers directly to you.",
        url: "https://gymsaverapp.com/gym-bounty",
        siteName: "GymSaver",
        images: [
            {
                url: "https://gymsaverapp.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "GymSaver Gym Bounty - Let Gyms Compete for You",
            },
        ],
        locale: "en_GB",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Gym Bounty | Let Gyms Compete for You | GymSaver",
        description: "Post your budget and location, and let local gyms pitch their best memberships directly to you.",
        images: ["https://gymsaverapp.com/og-image.png"],
    },
    alternates: {
        canonical: "https://gymsaverapp.com/gym-bounty",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function GymBountyPage() {
    return <GymBountyClient />;
}
