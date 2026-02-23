function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function fetchGyms() {
  const secret = Buffer.from('gymsaver-secure-v1:1').toString('base64');
  const lat = 51.562793;
  const lng = -1.775142;
  const res = await fetch(`http://localhost:3000/api/gyms?lat=${lat}&lng=${lng}&source=firestore&radius=100000`, {
    headers: { "x-gymsaver-app-secret": secret }
  });
  const data = await res.json();
  let results = data.results || [];
  
  // Apply sorting
  results.sort((a, b) => {
      const latA = a.location?.lat !== undefined ? a.location.lat : a.lat;
      const lngA = a.location?.lng !== undefined ? a.location.lng : a.lng;
      const distA = calculateDistance(lat, lng, latA, lngA);

      const latB = b.location?.lat !== undefined ? b.location.lat : b.lat;
      const lngB = b.location?.lng !== undefined ? b.location.lng : b.lng;
      const distB = calculateDistance(lat, lng, latB, lngB);

      return distA - distB;
  });

  const sliced = results.slice(0, 100);
  
  const jd = sliced.filter(g => (g.name||'').toLowerCase().includes('jd gym'));
  const thegym = sliced.filter(g => (g.name||'').toLowerCase().includes('the gym'));
  const anytime = sliced.filter(g => (g.name||'').toLowerCase().includes('anytime fitness'));
  
  console.log(`Sliced Total: ${sliced.length}`);
  console.log(`Sliced JD Gyms: ${jd.length}`);
  console.log(`Sliced The Gym Group: ${thegym.length}`);
  console.log(`Sliced Anytime Fitness: ${anytime.length}`);
}
fetchGyms();
