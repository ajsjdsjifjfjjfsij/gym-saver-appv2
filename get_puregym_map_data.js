const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const serviceAccount = require('../service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function extractCity(address) {
    if (!address) return "UK";
    const parts = address.split(',').map(s => s.trim());
    if (parts.length >= 2) {
        let cityZip = parts[parts.length - 2];
        return cityZip.replace(/[A-Z0-9\s]+$/, '').trim() || cityZip;
    }
    return address;
}

async function main() {
    console.log("Fetching PureGym map data...");
    const gymsRef = db.collection('gyms');
    const snapshot = await gymsRef.get();

    let gyms = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.website && data.website.includes('puregym.com')) {
            let cityName = data.city;
            if (!cityName || cityName === 'Unknown') {
                cityName = extractCity(data.address);
            }
            if (data.lowest_price && data.location && data.location.lat && data.location.lng) {
                // To keep the file small, just export what we need
                gyms.push({
                    name: data.name,
                    city: cityName,
                    price: data.lowest_price,
                    lat: data.location.lat,
                    lng: data.location.lng
                });
            }
        }
    });

    console.log(`Found ${gyms.length} PureGym locations with prices and coordinates.`);

    // Sort by price
    gyms.sort((a, b) => a.price - b.price);

    const outPath = 'public/puregym_map_data.json';
    fs.writeFileSync(outPath, JSON.stringify(gyms, null, 2));
    console.log(`Data written to ${outPath}`);
}

main().catch(console.error);
