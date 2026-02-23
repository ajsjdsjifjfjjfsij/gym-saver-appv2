const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyDJjgQu4D-kt1ON8RwaWnpXqvmeRxwf6do",
    authDomain: "gym-saver-app.firebaseapp.com",
    projectId: "gym-saver-app",
    storageBucket: "gym-saver-app.firebasestorage.app",
    messagingSenderId: "538515004640",
    appId: "1:538515004640:web:c07d0c4f5be400329ac485",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
    const snapshot = await getDocs(collection(db, "gyms"));
    let found = 0;
    snapshot.forEach(doc => {
        const data = doc.data();
        const thename = (data.name || '').toLowerCase();

        // Check if it's ANY JD Gym anywhere near 51.56, -1.77
        const gLat = data.location?.lat !== undefined ? data.location.lat : data.lat;
        const gLng = data.location?.lng !== undefined ? data.location.lng : data.lng;

        if (gLat && gLng) {
            const latDiff = Math.abs(gLat - 51.562793);
            const lngDiff = Math.abs(gLng - -1.775142);
            if (latDiff < 0.1 && lngDiff < 0.1) {
                if (thename.includes('jd') || thename.includes('anytime') || thename.includes('the gym')) {
                    console.log("Found near Swindon:", data.name);
                    found++;
                }
            }
        }
    });
    console.log("Total found near Swindon:", found);
}
test().catch(console.error);
