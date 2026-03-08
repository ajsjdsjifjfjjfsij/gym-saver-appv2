const admin = require('firebase-admin');
const serviceAccount = require('../../ApiFinderApp/service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function repairHalifax() {
    console.log("Starting Halifax data repair...");

    const gymId = "ChIJnQpOQf7ne0gRG7Ji4854M80";
    const pendingId = "2EquZSBEScpIIrEjaaln";
    const lat = 53.725;
    const lng = -1.860;
    const correctName = "PureGym Halifax";

    // 1. Update gyms collection
    console.log(`Updating gym record ${gymId}...`);
    await db.collection("gyms").doc(gymId).update({
        name: correctName,
        "location.lat": lat,
        "location.lng": lng
    });

    // 2. Update pending_gym_listings collection
    console.log(`Updating pending listing ${pendingId}...`);
    await db.collection("pending_gym_listings").doc(pendingId).update({
        gym_name: correctName,
        lat: lat,
        lng: lng
    });

    console.log("Halifax data repair completed successfully!");
}

repairHalifax().catch(console.error);
