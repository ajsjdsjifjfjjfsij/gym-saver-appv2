const lat = 51.562793;
const lng = -1.775142;

async function runPlaces() {
    const secret = Buffer.from('gymsaver-secure-v1:1').toString('base64');
    console.log("Fetching from API (Places)...");

    const res = await fetch(`http://localhost:3000/api/gyms?lat=${lat}&lng=${lng}&source=places&radius=20000`, {
        headers: { "x-gymsaver-app-secret": secret }
    });
    const data = await res.json();
    let results = data.results || [];

    console.log(`Total Places gyms fetched: ${results.length}`);
    const jd = results.filter(g => (g.name || '').toLowerCase().includes('jd'));
    console.log(`JD Gyms in Places:`, jd.map(g => g.name));

    const anytime = results.filter(g => (g.name || '').toLowerCase().includes('anytime'));
    console.log(`Anytime Fitness in Places:`, anytime.map(g => g.name));

    const theGym = results.filter(g => (g.name || '').toLowerCase().includes('the gym'));
    console.log(`The Gym Group in Places:`, theGym.map(g => g.name));

    results.forEach(g => console.log(g.name));
}
runPlaces();
