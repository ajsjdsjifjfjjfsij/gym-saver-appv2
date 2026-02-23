const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

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
    const snapshot = await getDocs(query(collection(db, "gyms"), limit(100)));
    let photoRefs = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        let ref = data.photo_reference || data.photo || (data.photos && data.photos.length > 0 ? data.photos[0] : null);

        if (!ref) photoRefs.push("MISSING");
        else if (ref.startsWith("places/")) photoRefs.push("NEW_API");
        else if (ref.length > 50 && !ref.startsWith("ChIJ")) photoRefs.push("LEGACY_API");
        else if (ref.startsWith("http")) photoRefs.push("HTTP");
        else photoRefs.push("PLACE_ID_OR_OTHER: " + ref);
    });

    const counts = photoRefs.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
    }, {});

    console.log("Photo counts:", counts);
}
test();
