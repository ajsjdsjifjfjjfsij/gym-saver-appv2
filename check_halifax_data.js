const { initializeApp, getApps, getApp } = require("firebase/app");
const { getFirestore, collection, query, where, getDocs } = require("firebase/firestore");
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function checkHalifax() {
    console.log("Checking pending_gym_listings for Halifax...");
    const q = query(collection(db, "pending_gym_listings"), where("status", "==", "approved"));
    const snap = await getDocs(q);

    snap.forEach(doc => {
        const data = doc.data();
        if (data.gym_name && data.gym_name.toLowerCase().includes("halifax")) {
            console.log("Found Halifax Gym:", doc.id);
            console.log("Name:", data.gym_name);
            console.log("Status:", data.status);
            console.log("Lat:", data.lat);
            console.log("Lng:", data.lng);
            console.log("Place ID:", data.place_id);
            console.log("-------------------");
        }
    });

    if (snap.empty) {
        console.log("No approved listings found at all.");
    }
}

checkHalifax().catch(console.error);
