const lat = 51.562793;
const lng = -1.775142;

async function searchSwindon() {
    const secret = Buffer.from('gymsaver-secure-v1:1').toString('base64');
    console.log("Fetching from API...");
    // We will search across a huge radius, or use places
    const res = await fetch(`http://localhost:3000/api/gyms?lat=${lat}&lng=${lng}&source=firestore&query=swindon&radius=100000`, {
        headers: { "x-gymsaver-app-secret": secret }
    });
    const data = await res.json();
    let results = data.results || [];

    console.log(`Total Swindon gyms fetched: ${results.length}`);
    const jd = results.filter(g => (g.name || '').toLowerCase().includes('jd'));
    console.log(`JD Gyms in Swindon:`, jd.map(g => g.name));

    // also try just fetching EVERYTHING again without query and look for Swindon
    const res2 = await fetch(`http://localhost:3000/api/gyms?lat=${lat}&lng=${lng}&source=firestore&radius=100000`, {
        headers: { "x-gymsaver-app-secret": secret }
    });
    const data2 = await res2.json();
    let results2 = data2.results || [];
    const allJd = results2.filter(g => (g.name || '').toLowerCase().includes('jd'));
    console.log(`All JD Gyms in 100km: ${allJd.length}`);
    allJd.forEach(g => {
        if ((g.name || '').toLowerCase().includes('swindon')) {
            console.log("Found JD Swindon!", g);
        }
    });
}
searchSwindon();
