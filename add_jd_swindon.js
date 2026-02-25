const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const https = require('https');

const envFile = fs.readFileSync('.env.local', 'utf8');
const envMatches = [...envFile.matchAll(/^([^=]+)=(.*)$/gm)];
const env = {};
envMatches.forEach(match => {
    env[match[1]] = match[2].replace(/['"]/g, '').trim();
});

const serviceAccount = require('../service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const PLACES_API_KEY = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function searchPlaces(query) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            textQuery: query
        });

        const options = {
            hostname: 'places.googleapis.com',
            path: '/v1/places:searchText',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': PLACES_API_KEY,
                'Referer': 'https://www.gymsaverapp.com',
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.photos,places.internationalPhoneNumber,places.regularOpeningHours'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(body));
                } else {
                    reject(new Error(`API Error ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function addJDGymsSwindon() {
    console.log("Searching for 'JD Gyms Swindon'...");
    try {
        const response = await searchPlaces("JD Gyms Swindon");
        if (!response.places || response.places.length === 0) {
            console.log("No places found for JD Gyms Swindon on Google Maps.");
            process.exit(1);
        }

        const place = response.places[0];
        console.log(`Found: ${place.displayName.text} (${place.id})`);

        const gymData = {
            id: place.id,
            name: place.displayName?.text || "JD Gyms Swindon",
            address: place.formattedAddress || "",
            lat: place.location?.latitude || 0,
            lng: place.location?.longitude || 0,
            location: {
                lat: place.location?.latitude || 0,
                lng: place.location?.longitude || 0,
                address: place.formattedAddress || ""
            },
            type: "Gym",
            rating: place.rating || 0,
            user_ratings_total: place.userRatingCount || 0,
            website: place.websiteUri || "",
            phone: place.internationalPhoneNumber || "",
            is_24hr: place.regularOpeningHours?.periods?.length === 1 && place.regularOpeningHours.periods[0].open?.day === 0 && place.regularOpeningHours.periods[0].open?.time === "0000" && !place.regularOpeningHours.periods[0].close,
            photo_reference: place.photos && place.photos.length > 0 ? place.photos[0].name : "",
            images_last_synced_at: new Date(),
            source: "google_places_api",
            created_at: new Date()
        };

        console.log("Inserting into Firestore...");
        await db.collection("gyms").doc(place.id).set(gymData, { merge: true });
        console.log(`Successfully added/updated JD Gyms Swindon with Place ID ${place.id}!`);
        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

addJDGymsSwindon();
