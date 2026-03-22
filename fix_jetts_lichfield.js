require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

const serviceAccount = require('../service-account.json');
if (!admin.apps.length) {
    initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function main() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.photos",
            "Referer": "http://localhost:3000",
            "Origin": "http://localhost:3000"
        },
        body: JSON.stringify({textQuery: "Jetts 247 Fitness Lichfield"})
    });
    const data = await res.json();
    const place = data.places && data.places[0];
    
    if (!place) {
        console.error("Place not found in API response");
        console.log(data);
        return;
    }
    
    console.log("Found place:", place.displayName, place.id);
    console.log("Photos found:", place.photos?.length || 0);
    
    const gymsRef = db.collection('gyms');
    const oldDocRef = gymsRef.doc("manual-jetts-lichfield-1772051733172");
    const oldDoc = await oldDocRef.get();
    
    if (!oldDoc.exists) {
        console.error("Old doc not found. Perhaps it was already migrated?");
        return;
    }
    
    let gymData = oldDoc.data();
    gymData.place_id = place.id;
    gymData.provider_id = "Jetts"; // standardizing provider_id based on search_jetts.js
    
    if (place.photos && place.photos.length > 0) {
        gymData.photo_reference = place.photos[0].name;
        gymData.photos = place.photos.map(p => ({
            photo_reference: p.name,
            height: p.heightPx,
            width: p.widthPx
        }));
    }
    gymData.updatedAt = new Date();
    
    // Save to new document with Google Place ID
    await gymsRef.doc(place.id).set(gymData, { merge: true });
    console.log("Created new document for Jetts Lichfield with Google ID: " + place.id);
    
    // Delete the old document
    await oldDocRef.delete();
    console.log("Deleted old document: manual-jetts-lichfield-1772051733172");
}

main().catch(console.error);
