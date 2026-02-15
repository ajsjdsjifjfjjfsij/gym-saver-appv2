import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
    alternates: {
        canonical: "https://www.gymsaverapp.com",
    },
};

export default function Page() {
    return <LandingPage />;
}
