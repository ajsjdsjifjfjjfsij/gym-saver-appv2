const admin = require('firebase-admin');
const serviceAccount = require('../../ApiFinderApp/service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkSwindon() {
    console.log("Checking Everlast Gyms Swindon...");
    const doc = await db.collection("gyms").doc("ChIJJWbb3LpGcUgRI0ORUrT1RBg").get();
    if (doc.exists) {
        console.log("Data:", JSON.stringify(doc.data(), null, 2));
    } else {
        console.log("Not found!");
    }
}

checkSwindon().catch(console.error);
