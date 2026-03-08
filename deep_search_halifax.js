const { initializeApp, getApps, getApp } = require("firebase/app");
const { getFirestore, collection, query, where, getDocs, getDoc, doc } = require("firebase/firestore");
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

async function deepSearchHalifax() {
    console.log("--- Deep Searching for 'Halifax' in Firestore ---");

    // 1. Search pending_gym_listings
    console.log("\nChecking 'pending_gym_listings'...");
    const pendingSnap = await getDocs(collection(db, "pending_gym_listings"));
    pendingSnap.forEach(doc => {
        const data = doc.data();
        if (JSON.stringify(data).toLowerCase().includes("halifax")) {
            console.log(`[pending_gym_listings] Found: ${doc.id}`);
            console.log(`  Name: ${data.gym_name}`);
            console.log(`  Status: ${data.status}`);
            console.log(`  Place ID: ${data.place_id}`);
            console.log(`  Coords: ${data.lat}, ${data.lng}`);
        }
    });

    // 2. Search gyms
    console.log("\nChecking 'gyms'...");
    const gymsSnap = await getDocs(collection(db, "gyms"));
    gymsSnap.forEach(doc => {
        const data = doc.data();
        // Check ID, name, or address
        if (doc.id.toLowerCase().includes("halifax") ||
            (data.name && data.name.toLowerCase().includes("halifax")) ||
            (data.address && data.address.toLowerCase().includes("halifax")) ||
            JSON.stringify(data).toLowerCase().includes("halifax")) {
            console.log(`[gyms] Found: ${doc.id}`);
            console.log(`  Name: ${data.name}`);
            console.log(`  Address: ${data.address}`);
            console.log(`  Location:`, data.location);
        }
    });
}

deepSearchHalifax().catch(console.error);
