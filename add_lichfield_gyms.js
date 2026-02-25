require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function main() {
    const gymsRef = db.collection('gyms');

    console.log("1. Updating PureGym Lichfield...");
    await gymsRef.doc('ChIJvVPGZcoJekgR3CMjbOKWIro').update({
        name: "PureGym Lichfield"
    });
    console.log("Updated 'Lichfield' to 'PureGym Lichfield'.");

    console.log("2. Searching Google Places for Jetts Gym Lichfield...");
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error("No Google Maps API key found.");
        return;
    }

    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.websiteUri,places.photos,places.primaryType,places.googleMapsUri,places.regularOpeningHours"
        },
        body: JSON.stringify({
            textQuery: "Jetts Gym Lichfield"
        })
    });

    const data = await response.json();
    if (!data.places || data.places.length === 0) {
        console.error("Could not find Jetts Gym Lichfield in Google Places.");
        return;
    }

    const place = data.places[0];
    console.log(`Found place: ${place.displayName?.text}`);

    const photoResource = place.photos && place.photos.length > 0 ? place.photos[0].name : null;

    const newGymData = {
        place_id: place.id, // Primary key identifier
        name: "Jetts Gym Lichfield",
        address: place.formattedAddress || "Lichfield",
        city: "Lichfield",
        lat: place.location.latitude,
        lng: place.location.longitude,
        location: {
            lat: place.location.latitude,
            lng: place.location.longitude,
        },
        rating: place.rating || 5.0,
        user_ratings_total: place.userRatingCount || 1,
        type: "Gym",
        priceLevel: "££",
        lowest_price: 24.99, // default placeholder, could be updated by scraper
        is_24hr: true,
        website: place.websiteUri || "https://www.jetts.co.uk/",
        googleMapsUri: place.googleMapsUri,
        photo_reference: photoResource,
        photos: place.photos ? place.photos.map(p => p.name).slice(0, 5) : [],
        updatedAt: new Date()
    };

    // Add to Firestore using place_id as document ID
    await gymsRef.doc(place.id).set(newGymData, { merge: true });
    console.log(`Successfully added Jetts Gym Lichfield to Firestore (ID: ${place.id})`);
}

main().catch(console.error);
