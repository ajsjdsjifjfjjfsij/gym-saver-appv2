import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'List Your Gym | Partner with GymSaver',
    description: 'List your gym on GymSaver to reach thousands of users actively looking for memberships in your area.',
    alternates: {
        canonical: '/list-your-gym',
    },
};

export default function ListYourGymLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
