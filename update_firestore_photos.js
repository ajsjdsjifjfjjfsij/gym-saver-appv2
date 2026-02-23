const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const apiKey = "AIzaSyDJjgQu4D-kt1ON8RwaWnpXqvmeRxwf6do";

async function updateGymPhotos() {
    const snapshot = await db.collection("gyms").get();
    const gyms = [];
    snapshot.forEach(docSnap => {
        gyms.push({ id: docSnap.id, data: docSnap.data() });
    });

    console.log(`Found ${gyms.length} gyms. Checking for missing New API photo references...`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < gyms.length; i++) {
        const gym = gyms[i];
        const ref = gym.data.photo_reference || gym.data.photo || (gym.data.photos && gym.data.photos.length > 0 ? gym.data.photos[0] : null);

        // Skip if it already has a New API format or HTTP URL
        if (ref && (ref.startsWith("places/") || ref.startsWith("http"))) {
            skippedCount++;
            continue;
        }

        const placeId = gym.data.place_id || gym.id;
        if (!placeId || placeId.startsWith('manual-') || placeId.startsWith('trap-')) continue;

        // Fetch from New Places API
        try {
            const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=photos`, {
                headers: {
                    "X-Goog-Api-Key": apiKey,
                    "Referer": "https://www.gymsaverapp.com"
                }
            });
            const data = await res.json();
            if (data.error) {
                console.log(`[${i + 1}/${gyms.length}] API Error for ${gym.data.name}: ${data.error.message}`);
                continue;
            }
            if (data.photos && data.photos.length > 0) {
                const bestPhoto = data.photos[0].name; // e.g. places/ChIJ.../photos/...
                await db.collection("gyms").doc(gym.id).update({ photo_reference: bestPhoto });
                console.log(`[${i + 1}/${gyms.length}] Updated ${gym.data.name} -> ${bestPhoto}`);
                updatedCount++;
            } else {
                console.log(`[${i + 1}/${gyms.length}] No photos found in Google Places for ${gym.data.name}`);
            }
        } catch (e) {
            console.error(`Error processing ${gym.data.name}:`, e.message);
        }

        // Sleep briefly to avoid rate limits
        await new Promise(r => setTimeout(r, 100));
    }

    console.log(`Done! Updated ${updatedCount} gyms. Skipped ${skippedCount} gyms that already had verified valid image links.`);
}

updateGymPhotos().catch(console.error);
