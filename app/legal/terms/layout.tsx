import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | GymSaver',
    description: 'Read the GymSaver Terms of Service carefully before using our application.',
    alternates: {
        canonical: '/legal/terms',
    },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
