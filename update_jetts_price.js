const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function main() {
    const gymsRef = db.collection('gyms');

    // We need to find the document with the manual place ID we assigned earlier
    const query = await gymsRef.where("name", "==", "Jetts Gym Lichfield").get();

    if (query.empty) {
        console.error("Could not find Jetts Gym Lichfield in DB.");
        return;
    }

    const doc = query.docs[0];
    console.log(`Found Jetts Gym (ID: ${doc.id}). Updating price to £39.95...`);

    await gymsRef.doc(doc.id).update({
        lowest_price: 39.95
    });

    console.log("Price updated successfully!");
}

main().catch(console.error);
