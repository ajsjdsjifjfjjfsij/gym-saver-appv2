const admin = require('firebase-admin');
const serviceAccount = require('../../ApiFinderApp/service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function fixGyms() {
    console.log("Starting Firestore cleanup for Everlast and Jetts...");
    const snapshot = await db.collection("gyms").get();

    let updatedCount = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        let needsUpdate = false;
        const updateData = {};

        const name = (data.name || "").toLowerCase();

        // 1. Fix missing/incorrect provider_id
        if (name.includes("everlast") && data.provider_id !== "Everlast Gyms") {
            updateData.provider_id = "Everlast Gyms";
            needsUpdate = true;
        } else if (name.includes("jetts") && data.provider_id !== "Jetts Gyms") {
            updateData.provider_id = "Jetts Gyms";
            needsUpdate = true;
        }

        // 2. Clear expired/stale hero_image_url
        // If it's a googleusercontent URL, it's temporary and should be fetched dynamically
        if (data.hero_image_url && data.hero_image_url.includes("googleusercontent.com")) {
            updateData.hero_image_url = admin.firestore.FieldValue.delete();
            needsUpdate = true;
        }

        if (needsUpdate) {
            await doc.ref.update(updateData);
            console.log(`✅ Updated ${data.name} (${doc.id})`);
            updatedCount++;
        }
    }

    console.log(`\nCleanup Complete! Updated ${updatedCount} gyms.`);
}

fixGyms().catch(console.error);
