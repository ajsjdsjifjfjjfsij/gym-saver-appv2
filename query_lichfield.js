const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function main() {
    const gymsRef = db.collection('gyms');
    const snapshot = await gymsRef.get();
    let found = 0;
    snapshot.forEach(doc => {
        const data = doc.data();
        const name = (data.name || '').toLowerCase();
        const city = (data.city || '').toLowerCase();
        const address = (data.address || '').toLowerCase();

        if (name.includes('lichfield') || city.includes('lichfield') || address.includes('lichfield')) {
            found++;
            console.log(`Lichfield Match: ${data.name} (ID: ${doc.id}) - City: ${data.city}`);
        }
    });
    console.log(`Total Lichfield matches: ${found}`);
}
main().catch(console.error);
