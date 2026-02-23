const apiKey = "AIzaSyDJjgQu4D-kt1ON8RwaWnpXqvmeRxwf6do";

async function runText() {
    const endpoint = "https://places.googleapis.com/v1/places:searchText";
    const body = {
        textQuery: "JD Gyms"
    };
    const res = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.id,places.displayName,places.primaryType,places.location"
        },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    const places = data.places || [];
    console.log(`Places found: ${places.length}`);
    console.log(JSON.stringify(places.map(p => p.displayName.text), null, 2));
}
runText();
