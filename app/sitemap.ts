import { MetadataRoute } from 'next'

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

    const cities = ['london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'sheffield', 'liverpool', 'edinburgh', 'bristol', 'cardiff']
    const locationRoutes = cities.map((city) => ({
        url: `${baseUrl}/location/${city}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as any,
        priority: 0.9,
    }));

    return [...staticRoutes, ...locationRoutes];
}
