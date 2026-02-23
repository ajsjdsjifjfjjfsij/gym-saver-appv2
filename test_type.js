async function test() {
  const secret = Buffer.from('gymsaver-secure-v1:1').toString('base64');
  const lat = 51.562793;
  const lng = -1.775142;
  const res = await fetch(`http://localhost:3000/api/gyms?lat=${lat}&lng=${lng}&source=firestore&radius=100000`, {
    headers: { "x-gymsaver-app-secret": secret }
  });
  const data = await res.json();
  let results = data.results || [];
  const jd = results.find(g => (g.name||'').toLowerCase().includes('jd gym'));
  if (jd) {
    console.log(`JD Gym Name: ${jd.name}`);
    console.log(`JD Gym Type: ${jd.type}`);
  }
}
test();
