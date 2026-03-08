import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Partner with GymSaver | Affiliate Program',
    description: 'Join our partnership network and help us build the future of fitness discovery in the UK. We are looking for strategic partners to grow and earn together.',
    alternates: {
        canonical: '/affiliate',
    },
};

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
