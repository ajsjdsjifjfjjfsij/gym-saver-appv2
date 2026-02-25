const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function main() {
    const gymsRef = db.collection('gyms');
    // Just limit to 500 for testing, let's see some samples
    const snapshot = await gymsRef.limit(5000).get();
    console.log("Total gyms:", snapshot.size);
    let noNameCount = 0;
    let jdGymsCount = 0;
    snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.name || data.name.trim() === '') {
            noNameCount++;
            console.log(`No name - ID: ${doc.id}, address: ${data.address}, city: ${data.city}`);
        }
        if ((data.name || '').toLowerCase().includes('jd')) {
            jdGymsCount++;
        }
    });
    console.log(`Gyms with no name: ${noNameCount}`);
    console.log(`JD Gyms total: ${jdGymsCount}`);

    const pendingRef = db.collection('pending_gym_listings');
    const pendingSnap = await pendingRef.get();
    console.log("Pending gyms:", pendingSnap.size);
    pendingSnap.forEach(doc => {
        const data = doc.data();
        console.log(`Pending: ID: ${doc.id}, name: ${data.gym_name}, lat: ${data.lat}, lng: ${data.lng}, status: ${data.status}`);
    });
}
main().catch(console.error);
