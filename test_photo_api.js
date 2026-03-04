const fetch = require('node-fetch');

// Use the key from the user's .env.local
const apiKey = "AIzaSyDJjgQu4D-kt1ON8RwaWnpXqvmeRxwf6do";
const placeId = "ChIJMVOt93NfeUgRR0rtQLlcBhI"; // JD Gyms Leeds South
const referer = "https://www.gymsaverapp.com";

async function test() {
    console.log(`Testing Place ID: ${placeId}`);

    try {
        const res = await fetch(
            `https://places.googleapis.com/v1/places/${placeId}`,
            {
                headers: {
                    "X-Goog-Api-Key": apiKey,
                    "X-Goog-FieldMask": "photos",
                    "Referer": referer,
                }
            }
        );

        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log("Response Data:", JSON.stringify(data, null, 2));

        if (data.photos && data.photos.length > 0) {
            const photoName = data.photos[0].name;
            console.log(`Found Photo Name: ${photoName}`);

            const mediaRes = await fetch(
                `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxHeightPx=400&maxWidthPx=400&skipHttpRedirect=true`,
                {
                    headers: {
                        "Referer": referer,
                    }
                }
            );

            console.log(`Media Status: ${mediaRes.status}`);
            const mediaData = await mediaRes.json();
            console.log("Media Data:", JSON.stringify(mediaData, null, 2));
        } else {
            console.log("No photos found in response.");
        }
    } catch (err) {
        console.error("Test failed:", err);
    }
}

test();
