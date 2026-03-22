import { MetadataRoute } from 'next'
import { CITIES_WITH_GYMS } from '@/lib/cities-with-gyms'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.gymsaverapp.com'

    const staticRoutes = [
        '',
        '/search',
        '/compare',
        '/list-your-gym',
        '/advertise',
        '/contact',
        '/affiliate',
        '/download',
        '/legal/privacy',
        '/legal/terms',
        '/press'
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly' as any,
        priority: route === '' ? 1 : 0.8,
    }));

    // Use our filtered list of cities that actually have gyms to avoid soft 404s
    const locationRoutes = CITIES_WITH_GYMS.map((city) => ({
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
