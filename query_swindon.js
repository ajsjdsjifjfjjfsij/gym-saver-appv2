const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function main() {
    const gymsRef = db.collection('gyms');
    // Search for Swindon JD Gyms
    const swindonQuery = await gymsRef.where("city", "==", "Swindon").get();
    console.log(`Found ${swindonQuery.size} gyms in Swindon.`);
    swindonQuery.forEach(doc => {
        const g = doc.data();
        if ((g.name || "").toLowerCase().includes("jd") || (g.name || "").toLowerCase().includes("anytime")) {
            console.log(`Found in Swindon: ${g.name} (ID: ${doc.id})`);
        }
    });
}
main().catch(console.error);
