const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query } = require("firebase/firestore");
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function extractCity(data) {
    if (data.city && data.city !== 'Unknown') return data.city;
    if (data.name && data.name.includes('London')) return 'London';
    if (data.address) {
        // try to get city from address (naively, part before the postcode or just the second to last part)
        const parts = data.address.split(',').map(s => s.trim());
        if (parts.length >= 2) {
            let possibleCity = parts[parts.length - 2];
            // remove postcodes
            possibleCity = possibleCity.replace(/[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}/gi, '').trim();
            if (possibleCity.length > 2) return possibleCity;
        }
    }
    return "Unknown";
}

async function run() {
    const q = query(collection(db, 'gyms'));
    const snapshot = await getDocs(q);

    const cityData = {};

    snapshot.forEach(doc => {
        const data = doc.data();

        let price = data.lowest_price;
        if (price === undefined && data.memberships && data.memberships.length > 0) {
            price = data.memberships[0].price;
        }

        if (price !== undefined && !isNaN(parseFloat(price))) {
            const p = parseFloat(price);
            let cityName = extractCity(data);

            // normalize London
            if (cityName.toLowerCase().includes('london')) {
                cityName = 'London';
            }

            if (cityName !== 'Unknown') {
                if (!cityData[cityName]) {
                    cityData[cityName] = { count: 0, total_price: 0 };
                }
                cityData[cityName].count++;
                cityData[cityName].total_price += p;
            }
        }
    });

    const cityAvgs = [];
    for (const [city, stats] of Object.entries(cityData)) {
        if (stats.count >= 3) { // Require at least 3 gyms to compute a meaningful average
            cityAvgs.push({
                city,
                count: stats.count,
                avgPrice: parseFloat((stats.total_price / stats.count).toFixed(2))
            });
        }
    }

    cityAvgs.sort((a, b) => b.avgPrice - a.avgPrice);

    console.log("=== Top 10 Most Expensive Cities ===");
    cityAvgs.slice(0, 10).forEach(c => console.log(`${c.city}: £${c.avgPrice} (${c.count} gyms)`));

    console.log("\n=== Top 10 Cheapest Cities ===");
    cityAvgs.slice(-10).reverse().forEach(c => console.log(`${c.city}: £${c.avgPrice} (${c.count} gyms)`));

    // See where London sits
    const londonData = cityAvgs.find(c => c.city === 'London');
    if (londonData) {
        console.log(`\nLondon Average: £${londonData.avgPrice} (${londonData.count} gyms) - Rank: ${cityAvgs.findIndex(c => c.city === 'London') + 1}/${cityAvgs.length}`);
    }

    process.exit(0);
}
run().catch(console.error);
