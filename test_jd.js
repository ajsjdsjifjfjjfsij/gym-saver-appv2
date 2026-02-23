const lat = 51.562793;
const lng = -1.775142;

async function testJd() {
  const secret = Buffer.from('gymsaver-secure-v1:1').toString('base64');
  console.log("Fetching from API...");
  const res = await fetch(`http://localhost:3000/api/gyms?lat=${lat}&lng=${lng}&source=firestore&radius=100000`, {
    headers: { "x-gymsaver-app-secret": secret }
  });
  const data = await res.json();
  let results = data.results || [];
  
  console.log(`Total fetched: ${results.length}`);
  const jd = results.filter(g => (g.name||'').toLowerCase().includes('jd gym'));
  console.log(`JD Gyms returned by API: ${jd.length}`);
  
  jd.forEach(g => {
    const gLat = g.location?.lat !== undefined ? g.location.lat : g.lat;
    const gLng = g.location?.lng !== undefined ? g.location.lng : g.lng;
    
    // approximate distance formula match 
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (gLat - lat) * Math.PI / 180;
    const dLon = (gLng - lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(gLat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    
    console.log(`- ${g.name} (Dist: ${dist.toFixed(2)} miles, Type: ${g.type}, Reviews: ${g.user_ratings_total})`);
  });
}
testJd();
