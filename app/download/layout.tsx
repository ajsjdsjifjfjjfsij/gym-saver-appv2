import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Download the Gym Saver App | GymSaver',
    description: 'Get the Gym Saver app on iOS and Android to find the best gym deals, compare prices, and save money on fitness near you.',
    alternates: {
        canonical: '/download',
    },
};

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
