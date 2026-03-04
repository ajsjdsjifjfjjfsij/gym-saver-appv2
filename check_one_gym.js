const admin = require('firebase-admin');
const serviceAccount = require('../../ApiFinderApp/service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkOneGym() {
    console.log("Checking full structure of one Jetts gym...");
    const snapshot = await db.collection("gyms")
        .where("name", ">=", "Jetts")
        .limit(1)
        .get();

    snapshot.forEach(doc => {
        console.log(`ID: ${doc.id}`);
        console.log("Data:", JSON.stringify(doc.data(), null, 2));
    });
}

checkOneGym().catch(console.error);
