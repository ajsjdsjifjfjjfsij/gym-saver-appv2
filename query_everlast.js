const admin = require('firebase-admin');
const serviceAccount = require('../../ApiFinderApp/service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function queryEverlast() {
    console.log("Querying Everlast gyms in Firestore...");
    const snapshot = await db.collection("gyms")
        .where("provider_id", "==", "Everlast Gyms")
        .get();

    console.log(`Found ${snapshot.size} Everlast gyms.`);
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`\nGym: ${data.name}`);
        console.log(`ID: ${doc.id}`);
        console.log(`Place ID Field: ${data.place_id}`);
        console.log(`Photo Reference: ${data.photo_reference}`);
        console.log(`Hero Image URL: ${data.hero_image_url}`);
    });
}

queryEverlast().catch(console.error);
