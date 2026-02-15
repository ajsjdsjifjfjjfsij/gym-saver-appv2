const fetch = require('node-fetch');

async function checkJDGyms() {
    // Swindon coordinates as a test
    const lat = 51.5558;
    const lng = -1.7797;
    const secret = Buffer.from('gymsaver-secure-v1:' + Math.floor(Date.now() / 1000 / 60)).toString('base64');

    console.log(`Checking gyms near ${lat}, ${lng}...`);
    const url = `http://localhost:3000/api/gyms?lat=${lat}&lng=${lng}&source=firestore&radius=100000`;

    try {
        const res = await fetch(url, {
            headers: {
                'x-gymsaver-app-secret': secret,
                'referer': 'http://localhost:3000/search'
            }
        });

        if (!res.ok) {
            console.error(`Error: ${res.status}`);
            const text = await res.text();
            console.error(text);
            return;
        }

        const data = await res.json();
        const gyms = data.results || [];
        console.log(`Total gyms returned: ${gyms.length}`);

        const jdGyms = gyms.filter(g => (g.name || "").toLowerCase().includes('jd'));
        console.log(`JD Gyms found: ${jdGyms.length}`);

        jdGyms.forEach(g => {
            console.log(`- ${g.name} (Price: ${g.lowest_price}, Lat: ${g.lat}, Lng: ${g.lng})`);
        });

    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}

checkJDGyms();
