const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function main() {
    const gymsRef = db.collection('gyms');
    // Since we know the database is around 1800 records, we can grab them all
    const snapshot = await gymsRef.get();
    let jettsCount = 0;
    snapshot.forEach(doc => {
        const data = doc.data();
        const name = data.name || '';
        const website = data.website || '';

        if (name.toLowerCase().includes('jetts') || website.toLowerCase().includes('jetts')) {
            jettsCount++;
            console.log(`Jetts Found: ${name} (ID: ${doc.id}) - City: ${data.city}`);
        }
    });
    console.log(`Total Jetts Gyms in Firestore: ${jettsCount}`);
}
main().catch(console.error);
