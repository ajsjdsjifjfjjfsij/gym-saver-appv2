import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
// Using Node.js native --env-file loading instead of dotenv

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedBounties() {
    console.log("Starting DB wipe mapping...");
    const bountiesRef = collection(db, "bounties");
    const snapshot = await getDocs(bountiesRef);
    
    for (const document of snapshot.docs) {
        await deleteDoc(doc(db, "bounties", document.id));
        console.log(`Deleted legacy dummy bounty: ${document.id}`);
    }

    console.log("Injecting professional mock bounties into Firestore array...");
    
    // Mock 1
    await addDoc(bountiesRef, {
        userId: "mock_user_1",
        username: "SarahFit99",
        gymType: "Boutique / Studio Fitness",
        budget: 45,
        location: "Manchester City Centre, M1",
        timestamp: new Date(), // Just now
        status: "active",
        offersCount: 2,
        expiresInDays: 3
    });

    // Mock 2
    await addDoc(bountiesRef, {
        userId: "mock_user_2",
        username: "James_Lifts",
        gymType: "24-Hour Access",
        budget: 25,
        location: "Didsbury, M20",
        timestamp: new Date(Date.now() - 43200000), // 12 hours ago
        status: "active",
        offersCount: 0,
        expiresInDays: 6
    });

    console.log("Successfully seeded 2 professional mock bounties!");
    process.exit(0);
}

seedBounties().catch(err => {
    console.error("Critical execution error: ", err);
    process.exit(1);
});
