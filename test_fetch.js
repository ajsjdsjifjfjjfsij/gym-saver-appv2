async function fetchGyms() {
  const secret = Buffer.from('gymsaver-secure-v1:1').toString('base64');
  const res = await fetch("http://localhost:3000/api/gyms?lat=51.5&lng=-0.1&source=firestore&radius=100000", {
    headers: { "x-gymsaver-app-secret": secret }
  });
  const data = await res.json();
  const results = data.results || [];
  
  const jd = results.filter(g => (g.name||'').toLowerCase().includes('jd gym'));
  const thegym = results.filter(g => (g.name||'').toLowerCase().includes('the gym'));
  const anytime = results.filter(g => (g.name||'').toLowerCase().includes('anytime fitness'));
  
  console.log(`Total: ${results.length}`);
  console.log(`JD Gyms: ${jd.length}`);
  console.log(`The Gym Group: ${thegym.length}`);
  console.log(`Anytime Fitness: ${anytime.length}`);
}
fetchGyms();
