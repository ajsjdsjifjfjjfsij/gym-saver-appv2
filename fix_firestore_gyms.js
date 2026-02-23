const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

const PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY || ''; // Needs to be provided

async function getPlaceDetails(placeId) {
    if (!PLACES_API_KEY) throw new Error("Missing Maps API Key");
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=location,formattedAddress,addressComponents&key=${PLACES_API_KEY}`;
    const res = await fetch(url, {
        headers: {
            'X-Goog-FieldMask': 'location,formattedAddress,addressComponents',
            'Referer': 'https://gymsaverapp.com'
        }
    });
    if (!res.ok) return null;
    return await res.json();
}

async function run() {
    console.log("Starting Firestore location data repair...");
    const snapshot = await db.collection('gyms').get();
    const gyms = [];
    snapshot.forEach(doc => gyms.push({ id: doc.id, data: doc.data() }));

    console.log(`Analyzing ${gyms.length} gyms...`);
    let toFix = 0;

    for (let i = 0; i < gyms.length; i++) {
        const gym = gyms[i];
        const data = gym.data;
        const needsLocation = !data.location || !data.location.lat;
        const needsAddress = !data.address && !data.formatted_address && (!data.location || !data.location.address);

        if (!needsLocation && !needsAddress) continue;

        console.log(`[${i + 1}/${gyms.length}] Fixing ${data.name} (needsLoc: ${needsLocation}, needsAddr: ${needsAddress})`);

        if (gym.id.startsWith("ChIJ")) {
            try {
                const details = await getPlaceDetails(gym.id);
                if (details) {
                    const updates = {};
                    if (needsLocation && details.location) {
                        updates.location = { lat: details.location.latitude, lng: details.location.longitude };
                    }
                    if (needsAddress && details.formattedAddress) {
                        updates.address = details.formattedAddress;

                        // Try to extract city
                        if (details.addressComponents) {
                            const cityComp = details.addressComponents.find(c => c.types.includes('postal_town') || c.types.includes('locality'));
                            if (cityComp) updates.city = cityComp.longText;
                        }
                    }

                    if (Object.keys(updates).length > 0) {
                        await db.collection('gyms').doc(gym.id).update(updates);
                        console.log(`  -> Updated:`, Object.keys(updates).join(', '));
                        toFix++;
                    }
                } else {
                    console.log(`  -> Failed to fetch details for ${gym.id}`);
                }
            } catch (e) {
                console.log(`  -> Error:`, e.message);
            }
        } else {
            console.log(`  -> Skipping non-Places gym object ID: ${gym.id}`);
        }

        // Rate limit protection
        await new Promise(r => setTimeout(r, 100));
    }
    console.log(`Finished fixing ${toFix} gyms.`);
}

if (!PLACES_API_KEY) {
    console.error("Please provide GOOGLE_MAPS_API_KEY as an environment variable.");
} else {
    run().catch(console.error);
}
