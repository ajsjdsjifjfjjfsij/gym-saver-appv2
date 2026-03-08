import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Compare Gym Prices Side-by-Side | GymSaver',
    description: 'Compare gym prices, facilities, and reviews side-by-side to find the best deal for your fitness goals.',
    alternates: {
        canonical: '/compare',
    },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
