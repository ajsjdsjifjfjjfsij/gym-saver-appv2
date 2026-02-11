import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.gymsaverapp.com'

    const routes = [
        '',
        '/search',
        '/affiliate',
        '/download',
        '/legal/privacy',
        '/legal/terms',
    ]

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly' as any,
        priority: route === '' ? 1 : 0.8,
    }))
}
