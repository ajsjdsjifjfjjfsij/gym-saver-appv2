require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function main() {
    const gymsRef = db.collection('gyms');

    const newGymData = {
        place_id: "manual-jetts-lichfield-" + Date.now(), // Generate a unique ID
        name: "Jetts Gym Lichfield",
        address: "14 Gresley Row, Lichfield WS13 6JF",
        city: "Lichfield",
        lat: 52.682643,
        lng: -1.826725,
        location: {
            lat: 52.682643,
            lng: -1.826725,
        },
        rating: 5.0,
        user_ratings_total: 10,
        type: "Gym",
        priceLevel: "££",
        lowest_price: 24.99, // Assumption based on their typical model
        is_24hr: true,
        website: "https://www.jetts.co.uk/gyms/jetts-lichfield/",
        googleMapsUri: "https://maps.app.goo.gl/JettsLichfieldPlaceholder",
        photo_reference: null,
        photos: [],
        updatedAt: new Date()
    };

    // Add to Firestore using generated place_id
    await gymsRef.doc(newGymData.place_id).set(newGymData, { merge: true });
    console.log(`Successfully added Jetts Gym Lichfield to Firestore (ID: ${newGymData.place_id})`);
}

main().catch(console.error);
