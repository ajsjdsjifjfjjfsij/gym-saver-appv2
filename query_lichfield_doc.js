const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function main() {
    const gymsRef = db.collection('gyms');
    const doc = await gymsRef.doc('ChIJvVPGZcoJekgR3CMjbOKWIro').get();
    console.log(doc.data());
}
main().catch(console.error);
