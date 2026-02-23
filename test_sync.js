const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const apiKey = "AIzaSyDJjgQu4D-kt1ON8RwaWnpXqvmeRxwf6do";

async function getPhotoUri(photoName, maxWidth = 1200, maxHeight = 800) {
    try {
        const res = await fetch(
            `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}&skipHttpRedirect=true`,
            {
                headers: {
                    "Referer": "https://www.gymsaverapp.com",
                }
            }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data.photoUri;
    } catch (e) {
        console.error(`Error fetching media for ${photoName}:`, e.message);
        return null;
    }
}

function rankPhotos(photos) {
    return photos.map(photo => {
        let score = 0;
        const width = photo.widthPx || 0;
        const height = photo.heightPx || 0;
        const ratio = width / height;

        if (width >= 1000) score += 50;
        else if (width >= 800) score += 30;

        if (ratio >= 1.2 && ratio <= 2.0) score += 40;

        const attribution = (photo.authorAttributions && photo.authorAttributions[0] && photo.authorAttributions[0].displayName) || "";
        const lowerAttr = attribution.toLowerCase();

        if (lowerAttr.includes("gym") || lowerAttr.includes("fitness")) score += 10;
        if (lowerAttr.includes("logo") || lowerAttr.includes("menu")) score -= 20;

        return { ...photo, score };
    }).sort((a, b) => b.score - a.score);
}

async function testSync() {
    const snapshot = await db.collection("gyms").limit(3).get();
    const gyms = [];
    snapshot.forEach(docSnap => {
        gyms.push({ id: docSnap.id, data: docSnap.data() });
    });

    for (let i = 0; i < gyms.length; i++) {
        const gym = gyms[i];
        const placeId = gym.data.place_id || gym.id;
        console.log(`\nTesting ${gym.data.name} (${placeId})`);

        try {
            const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=photos`, {
                headers: {
                    "X-Goog-Api-Key": apiKey,
                    "Referer": "https://www.gymsaverapp.com"
                }
            });
            const data = await res.json();

            if (data.photos && data.photos.length > 0) {
                const ranked = rankPhotos(data.photos);
                console.log(`Found ${data.photos.length} photos. Top 3 scores:`, ranked.slice(0, 3).map(p => p.score));

                const heroUri = await getPhotoUri(ranked[0].name);
                console.log(`Hero Image URI: ${heroUri ? heroUri.substring(0, 50) + "..." : "Failed"}`);
            } else {
                console.log(`No photos found.`);
            }
        } catch (e) {
            console.error(`Error:`, e.message);
        }
    }
}

testSync().then(() => process.exit(0)).catch(console.error);
