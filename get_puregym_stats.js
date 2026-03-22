const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function extractCity(address) {
    if (!address) return "UK";
    const parts = address.split(',').map(s => s.trim());
    // usually UK addresses in places API end with "UK" or a postcode, e.g. "Southend-on-Sea SS2 4DQ, UK"
    // So the second to last part often contains the city and postcode.
    if (parts.length >= 2) {
        let cityZip = parts[parts.length - 2];
        return cityZip.replace(/[A-Z0-9\s]+$/, '').trim() || cityZip;
    }
    return address;
}

async function main() {
    console.log("Fetching PureGym data...");
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
            if (data.lowest_price) {
                gyms.push({ name: data.name, city: cityName, price: data.lowest_price });
            }
        }
    });

    console.log(`Found ${gyms.length} PureGym locations with prices.`);

    gyms.sort((a, b) => a.price - b.price);

    if (gyms.length === 0) {
        console.log("No puregyms found with prices.");
        return;
    }

    const cheapest = gyms.slice(0, 5);
    const expensive = gyms.slice(-5).reverse();

    console.log("\n--- CHEAPEST ---");
    console.table(cheapest);
    console.log("\n--- MOST EXPENSIVE ---");
    console.table(expensive);

    const out = {
        cheapest,
        mostExpensive: expensive
    };

    require('fs').writeFileSync('puregym_data.json', JSON.stringify(out, null, 2));
    console.log("Data written to puregym_data.json");
}

main().catch(console.error);
