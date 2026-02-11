import React from 'react'

export const JsonLd = () => {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "GymSaver",
        "url": "https://www.gymsaverapp.com",
        "logo": "https://www.gymsaverapp.com/images/gymsaver_logo_new.png",
        "description": "Compare gym prices across the UK. One search to find the best gym deals, membership prices, and fitness offers near you.",
        "sameAs": [
            "https://twitter.com/gymsaverapp"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "url": "https://www.gymsaverapp.com/contact"
        }
    }

    const searchActionLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://www.gymsaverapp.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.gymsaverapp.com/search?query={search_term_string}",
            "query-input": "required name=search_term_string"
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
        </>
    )
}
