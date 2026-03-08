const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clean() {
    console.log("Checking pending_gym_listings...");
    const snap = await getDocs(collection(db, "pending_gym_listings"));
    for (const d of snap.docs) {
        const data = d.data();
        if (data.gym_name.toLowerCase().includes("halifax")) {
            console.log(`[Pending] ID: ${d.id} | Name: ${data.gym_name} | PlaceId: "${data.place_id}" | Status: ${data.status}`);
        }
    }

    console.log("Checking main gyms collection...");
    const gymsSnap = await getDocs(collection(db, "gyms"));
    for (const d of gymsSnap.docs) {
        const docId = d.id;
        if (docId.toLowerCase().includes("halifax")) {
            console.log(`[Gyms] ID: "${docId}"`);
            const gymData = d.data();
            console.log(gymData);
        }
    }

    console.log("Done.");
    process.exit(0);
}

clean().catch(e => {
    console.error(e);
    process.exit(1);
});
