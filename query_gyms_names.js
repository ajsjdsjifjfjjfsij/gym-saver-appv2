const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function main() {
    const gymsRef = db.collection('gyms');
    const snapshot = await gymsRef.get();
    let purelyAreaNames = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        const name = data.name || '';
        if (data.website && data.website.includes('puregym') && !name.toLowerCase().includes('puregym')) {
            purelyAreaNames.push({ name, city: data.city, id: doc.id });
        }
    });
    console.log("PureGyms without 'PureGym' in name:", purelyAreaNames.slice(0, 20));

    let anytimeNames = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        const name = data.name || '';
        if (data.website && data.website.includes('anytimefitness') && !name.toLowerCase().includes('anytime')) {
            anytimeNames.push({ name, city: data.city, id: doc.id });
        }
    });
    console.log("Anytime Fitness without 'Anytime' in name:", anytimeNames.slice(0, 20));

    let jdGymsNames = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        const name = data.name || '';
        if (data.website && data.website.includes('jdgyms') && !name.toLowerCase().includes('jd')) {
            jdGymsNames.push({ name, city: data.city, id: doc.id });
        }
    });
    console.log("JD Gyms without 'JD' in name:", jdGymsNames.slice(0, 20));
}
main().catch(console.error);
