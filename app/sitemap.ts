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
        'aberdeen', 'acton', 'balham', 'barking', 'barnet', 'basildon', 'basingstoke', 'bath', 'battersea', 'bedford', 'belfast', 'bexley', 'birmingham', 'blackburn', 'blackpool', 'bolton', 'bournemouth', 'bow', 'bradford', 'brent', 'brentford', 'brighton', 'bristol', 'brixton', 'bromley', 'cambridge', 'camden', 'camden-town', 'canary-wharf', 'canterbury', 'cardiff', 'catford', 'cheam', 'chelmsford', 'chelsea', 'cheltenham', 'chester', 'chiswick', 'clapham', 'coulsdon', 'covent-garden', 'coventry', 'croydon', 'crystal-palace', 'dalston', 'dartford', 'derby', 'dulwich', 'dundee', 'ealing', 'edgware', 'edinburgh', 'edmonton', 'eltham', 'enfield', 'exeter', 'farnham', 'feltham', 'finchley', 'fulham', 'gateshead', 'gillingham', 'glasgow', 'gloucester', 'golders-green', 'greenwich', 'guildford', 'hackney', 'hackney-wick', 'halifax', 'hammersmith', 'hampstead', 'hampton', 'hanwell', 'haringey', 'harrogate', 'harrow', 'hartlepool', 'havering', 'hayes', 'hendon', 'hereford', 'highgate', 'hillingdon', 'hornsey', 'hounslow', 'hull', 'isleworth', 'islington', 'kensington', 'kingston', 'kingston-upon-thames', 'lambeth', 'leeds', 'leicester', 'lewisham', 'liverpool', 'london', 'luton', 'maidstone', 'manchester', 'mayfair', 'merton', 'mill-hill', 'milton-keynes', 'mitcham', 'morden', 'new-malden', 'newcastle', 'newham', 'newport', 'northampton', 'norwood', 'notting-hill', 'nottingham', 'oxford', 'palmers-green', 'peckham', 'peterborough', 'pinner', 'plymouth', 'poplar', 'portsmouth', 'preston', 'purley', 'putney', 'raynes-park', 'reading', 'redbridge', 'richmond', 'rotherham', 'ruislip', 'scunthorpe', 'sheffield', 'shoreditch', 'shrewsbury', 'slough', 'soho', 'solihull', 'southall', 'southampton', 'southgate', 'southwark', 'st-albans', 'stafford', 'stanmore', 'stevenage', 'stockport', 'stoke-newington', 'stoke-on-trent', 'stratford', 'stratford-upon-avon', 'streatham', 'sunderland', 'surbiton', 'sutton', 'swansea', 'swindon', 'sydenham', 'taunton', 'teddington', 'tooting', 'tottenham', 'twickenham', 'uxbridge', 'waltham-forest', 'walthamstow', 'wandsworth', 'warrington', 'watford', 'weymouth', 'whitechapel', 'wimbledon', 'woking', 'wolverhampton', 'wood-green', 'woolwich', 'worcester', 'york'
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
