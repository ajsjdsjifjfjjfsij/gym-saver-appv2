const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, limit, query } = require("firebase/firestore");
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const q = query(collection(db, 'gyms'), limit(5));
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(doc.id, '=>', {
            name: data.name,
            rating: data.rating,
            user_ratings_total: data.user_ratings_total,
            reviewsCount: data.reviewsCount,
            userRatingCount: data.userRatingCount,
            reviews: data.reviews ? data.reviews.length : 0
        });
    });
    process.exit(0);
}
run().catch(console.error);
