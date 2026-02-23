const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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
    let count = 0;
    snapshot.forEach(doc => {
        const data = doc.data();
        if ((data.name || '').toLowerCase().includes('jd gym')) {
            console.log(`Found JD Gym: ${data.name} | City: ${data.city} | Address: ${data.address} | Lat: ${data.lat} | location.lat: ${data.location?.lat}`);
            count++;
        }
    });
    console.log("Total JD Gyms found in Firestore:", count);
}
test().catch(console.error);
