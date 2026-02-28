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

    // Top ~100 UK towns and cities for search volume coverage
    const cities = [
        'london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'sheffield', 'liverpool', 'edinburgh', 'bristol', 'cardiff',
        'leicester', 'coventry', 'nottingham', 'bradford', 'newcastle', 'belfast', 'brighton', 'hull', 'plymouth', 'wolverhampton',
        'derby', 'swansea', 'southampton', 'salford', 'aberdeen', 'portsmouth', 'york', 'sunderland', 'dundee', 'bournemouth',
        'reading', 'middlesbrough', 'bolton', 'blackpool', 'milton-keynes', 'peterborough', 'swindon', 'slough', 'oxford', 'cambridge',
        'gloucester', 'newport', 'preston', 'exeter', 'rotherham', 'cheltenham', 'basingstoke', 'maidstone', 'worcester', 'chelmsford',
        'cheltenham', 'stockport', 'watford', 'woking', 'guildford', 'harrogate', 'farnham', 'west-bridgford', 'gillingham', 'hornchurch',
        'shrewsbury', 'stratford-upon-avon', 'hartlepool', 'northampton', 'scunthorpe', 'gateshead', 'bedford', 'basildon', 'warrington', 'canterbury',
        'stevenage', 'dartford', 'solihull', 'st-albans', 'chester', 'halifax', 'blackburn', 'weymouth', 'taunton', 'hereford', 'bath', 'stafford'
    ];
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
