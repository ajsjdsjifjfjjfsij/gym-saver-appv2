const apiKey = "AIzaSyDJjgQu4D-kt1ON8RwaWnpXqvmeRxwf6do";

async function testPlaceFetch(placeId) {
    console.log(`Fetching place: ${placeId}`);
    try {
        const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=name,photos`, {
            headers: {
                "X-Goog-Api-Key": apiKey
            }
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response Text:", text);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

testPlaceFetch("ChIJw-1z_J1bdkgR3uBq-0Isc38");
