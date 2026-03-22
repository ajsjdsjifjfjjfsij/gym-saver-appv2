import { Metadata } from "next";
import GymBountyClient from "@/components/GymBountyClient";

export const metadata: Metadata = {
    title: "Gym Bounty | Let Gyms Compete for You | GymSaver",
    description: "Post a gym bounty with your budget and location, and let local gyms and fitness brands submit their best offers directly to you.",
};

export default function GymBountyPage() {
    return <GymBountyClient />;
}
