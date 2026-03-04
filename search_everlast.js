const admin = require('firebase-admin');
const serviceAccount = require('../../ApiFinderApp/service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function searchByName() {
    console.log("Searching for gyms with 'Everlast' in name...");
    const snapshot = await db.collection("gyms").get();

    let count = 0;
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.name && data.name.includes("Everlast")) {
            console.log(`\nMatch: ${data.name}`);
            console.log(`ID: ${doc.id}`);
            console.log(`Provider ID: ${data.provider_id}`);
            count++;
        }
    });
    console.log(`\nTotal matches: ${count}`);
}

searchByName().catch(console.error);
