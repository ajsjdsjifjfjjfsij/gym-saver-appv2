const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkData() {
    console.log("Checking first 5 gyms in Firestore...");
    const snapshot = await db.collection("gyms").limit(5).get();

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`\nGym: ${data.name}`);
        console.log(`ID: ${doc.id}`);
        console.log(`Photo Reference: ${data.photo_reference}`);
        console.log(`Photos Array: ${JSON.stringify(data.photos)}`);
    });
}

checkData().catch(console.error);
