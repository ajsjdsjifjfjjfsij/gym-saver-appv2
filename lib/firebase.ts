import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let rtdb: any = null;

if (firebaseConfig.apiKey) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);

        // Initialize secondary app for Realtime Database
        const dbConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_DB_API_KEY,
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
        };

        let dbApp;
        try {
            dbApp = getApp("gymSaverDB");
        } catch {
            dbApp = initializeApp(dbConfig, "gymSaverDB");
        }

        if (dbConfig.databaseURL) {
            rtdb = getDatabase(dbApp, dbConfig.databaseURL);
        } else {
            console.warn("Database URL missing in config");
        }

    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
} else {
    console.warn("Firebase configuration missing. Auth and DB features will be disabled.");
}

export { app, auth, db, storage, rtdb };
