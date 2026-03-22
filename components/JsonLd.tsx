import React from 'react'

export const JsonLd = () => {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "GymSaver",
        "alternateName": ["Gym Saver", "Gym Saver App"],
        "url": "https://www.gymsaverapp.com",
        "logo": "https://www.gymsaverapp.com/images/gymsaver_logo_new.png",
        "description": "Compare gym prices across the UK. One search to find the best gym deals, membership prices, and fitness offers near you.",
        "slogan": "Stop Overpaying for Fitness",
        "foundingDate": "2024",
        "sameAs": [
            "https://twitter.com/gymsaverapp",
            "https://instagram.com/GymsaverHQ"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "url": "https://www.gymsaverapp.com/contact"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "1250"
        }
    }

    const searchActionLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://www.gymsaverapp.com",
        "name": "GymSaver | UK Gym Price Comparison",
        "alternateName": ["Gym Saver", "Gym Saver App"],
        "description": "The UK's leading gym price comparison search engine.",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.gymsaverapp.com/search?query={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    }

    const softwareAppLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Gym Saver App",
        "operatingSystem": "iOS, Android, Web",
        "applicationCategory": "HealthAndFitnessApplication",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "GBP"
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(searchActionLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppLd) }}
            />
        </>
    )
}
