import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | GymSaver',
    description: 'Read the GymSaver Privacy Policy to understand how we collect, use, and protect your personal data.',
    alternates: {
        canonical: '/legal/privacy',
    },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
