const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const envMatches = [...envFile.matchAll(/^([^=]+)=(.*)$/gm)];
const env = {};
envMatches.forEach(match => {
    env[match[1]] = match[2].replace(/['"]/g, '').trim();
});

const firebaseConfig = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkGym() {
    console.log("Fetching all gyms to look for JD Gyms Swindon...");
    const snapshot = await getDocs(collection(db, "gyms"));
    let found = false;
    let jdCount = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        const name = (data.name || "").toLowerCase();
        if (name.includes("jd")) {
            jdCount++;
            if (name.includes("swindon")) {
                console.log("\nFOUND MATCH:");
                console.log(`ID: ${doc.id}`);
                console.log(`Name: ${data.name}`);
                console.log(`Location:`, data.location);
                console.log(`Lat: ${data.lat}, Lng: ${data.lng}`);
                console.log(`Distance Field:`, data.distance);
                console.log(`Type:`, data.type);
                found = true;
            }
        }
    });

    console.log(`\nTotal JD Gyms in db: ${jdCount}`);

    if (!found) {
        console.log("JD Gyms Swindon was NOT found in the database.");
    }
    process.exit();
}

checkGym();
