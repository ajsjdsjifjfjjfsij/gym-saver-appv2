const admin = require('firebase-admin');
const serviceAccount = require('../../ApiFinderApp/service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function searchJetts() {
    console.log("Searching for gyms with 'Jetts' in name and checking provider_id...");
    const snapshot = await db.collection("gyms").get();

    let count = 0;
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.name && data.name.includes("Jetts")) {
            console.log(`\nMatch: ${data.name}`);
            console.log(`ID: ${doc.id}`);
            console.log(`Provider ID: ${data.provider_id}`);
            console.log(`Photo Reference: ${data.photo_reference}`);
            console.log(`Hero Image URL: ${data.hero_image_url}`);
            count++;
        }
    });
    console.log(`\nTotal matches: ${count}`);
}

searchJetts().catch(console.error);
