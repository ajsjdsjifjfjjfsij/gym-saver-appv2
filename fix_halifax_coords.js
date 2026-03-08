const { initializeApp, getApps, getApp } = require("firebase/app");
const { getFirestore, doc, updateDoc } = require("firebase/firestore");
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

async function fixHalifax() {
    const docId = "2EquZSBEScpIIrEjaaln";
    // PureGym Halifax Coordinates from Google: 53.7225, -1.8611
    console.log(`Fixing Halifax Gym: ${docId}...`);
    const gymRef = doc(db, "pending_gym_listings", docId);
    await updateDoc(gymRef, {
        lat: 53.7225,
        lng: -1.8611
    });
    console.log("Successfully updated Halifax gym coordinates!");
}

fixHalifax().catch(console.error);
