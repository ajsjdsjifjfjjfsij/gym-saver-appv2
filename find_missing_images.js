const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkData() {
    console.log("Checking gyms in Firestore for missing images...");
    const snapshot = await db.collection("gyms").get();

    let missingCount = 0;
    let totalCount = 0;

    snapshot.forEach(doc => {
        totalCount++;
        const data = doc.data();

        const hasPhotoRef = data.photo_reference && data.photo_reference.trim() !== "";
        const hasPhotosArray = data.photos && Array.isArray(data.photos) && data.photos.length > 0;

        if (!hasPhotoRef && !hasPhotosArray) {
            missingCount++;
            console.log(`Missing Image -> Gym: ${data.name} | ID: ${doc.id}`);
        }
    });

    console.log(`\nTotal gyms checked: ${totalCount}`);
    console.log(`Total gyms missing images: ${missingCount}`);
    process.exit(0);
}

checkData().catch(err => {
    console.error(err);
    process.exit(1);
});
