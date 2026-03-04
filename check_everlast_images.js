const admin = require('firebase-admin');
const serviceAccount = require('../../ApiFinderApp/service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkEverlastImages() {
    console.log("Checking Everlast gyms for images...");
    const snapshot = await db.collection("gyms").get();

    let withHero = 0;
    let total = 0;
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.name && data.name.includes("Everlast")) {
            total++;
            if (data.hero_image_url) {
                withHero++;
            } else {
                console.log(`Missing Hero: ${data.name} (ID: ${doc.id})`);
            }
        }
    });
    console.log(`\nTotal Everlast: ${total}`);
    console.log(`With Hero Image: ${withHero}`);
}

checkEverlastImages().catch(console.error);
