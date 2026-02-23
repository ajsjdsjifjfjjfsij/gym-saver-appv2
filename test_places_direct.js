const lat = 51.562793;
const lng = -1.775142;
const apiKey = "AIzaSyDJjgQu4D-kt1ON8RwaWnpXqvmeRxwf6do";

async function runDir() {
    const endpoint = "https://places.googleapis.com/v1/places:searchNearby";
    const body = {
        locationRestriction: {
            circle: {
                center: { latitude: lat, longitude: lng },
                radius: 50000
            }
        },
        includedPrimaryTypes: ["gym", "fitness_center", "sports_club"]
    };
    const res = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.id,places.displayName,places.primaryType"
        },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    const places = data.places || [];
    console.log(`Places found: ${places.length}`);
    const jd = places.filter(p => (p.displayName.text || '').toLowerCase().includes('jd'));
    console.log("JD Places:", JSON.stringify(jd, null, 2));
}
runDir();
