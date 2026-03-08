import { MetadataRoute } from 'next'
import { UK_CITIES } from '@/lib/uk-cities'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.gymsaverapp.com'

    const staticRoutes = [
        '',
        '/search',
        '/compare',
        '/list-your-gym',
        '/contact',
        '/affiliate',
        '/download',
        '/legal/privacy',
        '/legal/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly' as any,
        priority: route === '' ? 1 : 0.8,
    }));

    // Import our expanded 200+ top UK towns and cities for mass programmatic SEO coverage
    const cities = Array.from(new Set(UK_CITIES)); // Ensure uniqueness
    const locationRoutes = cities.map((city) => ({
        url: `${baseUrl}/location/${city}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as any,
        priority: 0.9,
    }));

    const chains = [
        'puregym', 'the-gym-group', 'jd-gyms', 'david-lloyd', 'virgin-active',
        'nuffield-health', 'anytime-fitness', 'snap-fitness', 'everlast-fitness',
        'bannatyne', 'easygym', 'third-space', 'equinox'
    ];
    const chainRoutes = chains.map((chain) => ({
        url: `${baseUrl}/gym-chain/${chain}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as any,
        priority: 0.8,
    }));

    return [...staticRoutes, ...locationRoutes, ...chainRoutes];
}
