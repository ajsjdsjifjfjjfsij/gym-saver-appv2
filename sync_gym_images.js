const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const apiKey = "AIzaSyDJjgQu4D-kt1ON8RwaWnpXqvmeRxwf6do"; // Reusing the key from the old script

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

        // Resolution Score
        if (width >= 1000) score += 50;
        else if (width >= 800) score += 30;
        else if (width >= 400) score += 10;

        // Ratio Score (Landscape 1.2 - 2.0)
        if (ratio >= 1.2 && ratio <= 2.0) score += 40;
        else if (ratio >= 1.0 && ratio < 1.2) score += 20;

        // Content / Keywords (via Attribution)
        const attribution = (photo.authorAttributions && photo.authorAttributions[0] && photo.authorAttributions[0].displayName) || "";
        const lowerAttr = attribution.toLowerCase();

        const gymKeywords = ["gym", "fitness", "workout", "training", "center", "interior", "exterior"];
        const badKeywords = ["logo", "menu", "poster", "text", "sign", "price", "offer", "discount"];

        gymKeywords.forEach(k => {
            if (lowerAttr.includes(k)) score += 10;
        });

        badKeywords.forEach(k => {
            if (lowerAttr.includes(k)) score -= 20;
        });

        // Penalize very small images
        if (width < 300 || height < 300) score -= 50;

        return { ...photo, score };
    }).sort((a, b) => b.score - a.score);
}

async function syncGymImages() {
    const snapshot = await db.collection("gyms").get();
    const gyms = [];
    snapshot.forEach(docSnap => {
        gyms.push({ id: docSnap.id, data: docSnap.data() });
    });

    console.log(`Found ${gyms.length} gyms. Starting high-quality image sync...`);

    let updatedCount = 0;

    // Process gyms in batches or sequentially
    for (let i = 0; i < gyms.length; i++) {
        const gym = gyms[i];
        const placeId = gym.data.place_id || gym.id;

        if (!placeId || placeId.startsWith('manual-') || placeId.startsWith('trap-')) {
            console.log(`[${i + 1}/${gyms.length}] Skipping ${gym.data.name} (Invalid Place ID)`);
            continue;
        }

        try {
            // Step 1: Fetch photos list
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
                // Step 2: Rank photos
                const ranked = rankPhotos(data.photos);

                // Step 3: Fetch Media URIs for top 4
                const topCount = Math.min(ranked.length, 4);
                const imageUrls = [];
                const attributions = [];

                for (let j = 0; j < topCount; j++) {
                    const photo = ranked[j];
                    const uri = await getPhotoUri(photo.name);
                    if (uri) {
                        imageUrls.push(uri);
                        const auth = photo.authorAttributions && photo.authorAttributions[0];
                        attributions.push({
                            author: auth ? auth.displayName : "Google User",
                            authorUrl: auth ? auth.uri : ""
                        });
                    }
                }

                if (imageUrls.length > 0) {
                    const heroImage = imageUrls[0];
                    const galleryImages = imageUrls.slice(1);

                    await db.collection("gyms").doc(gym.id).update({
                        hero_image_url: heroImage,
                        gallery_image_urls: galleryImages,
                        photo_attributions: attributions,
                        images_last_synced_at: admin.firestore.FieldValue.serverTimestamp()
                    });

                    console.log(`[${i + 1}/${gyms.length}] Updated ${gym.data.name} with ${imageUrls.length} photos (Hero: ${heroImage.substring(0, 30)}...)`);
                    updatedCount++;
                } else {
                    console.log(`[${i + 1}/${gyms.length}] No valid photo URIs found for ${gym.data.name}`);
                }
            } else {
                console.log(`[${i + 1}/${gyms.length}] No photos found for ${gym.data.name}`);
            }
        } catch (e) {
            console.error(`[${i + 1}/${gyms.length}] Error processing ${gym.data.name}:`, e.message);
        }

        // Delay to respect API limits
        await new Promise(r => setTimeout(r, 200));
    }

    console.log(`\nSync Complete!`);
    console.log(`Total Gyms: ${gyms.length}`);
    console.log(`Updated: ${updatedCount}`);
}

syncGymImages().catch(console.error);
