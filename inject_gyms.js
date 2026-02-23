const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

async function injectMissingGyms() {
    const jdGym = {
        name: "JD Gyms Swindon",
        address: "Kembrey Business Park, Swindon SN2 8UN",
        city: "Swindon",
        location: {
            lat: 51.574,
            lng: -1.776
        },
        lat: 51.574,
        lng: -1.776,
        type: "Gym",
        rating: 4.8,
        user_ratings_total: 120,
        lowest_price: 21.99,
        is_24hr: true,
        website: "https://www.jdgyms.co.uk/gym/swindon/",
        place_id: "manual-jd-swindon-" + Date.now()
    };

    const anytimeFitness = {
        name: "Anytime Fitness Swindon",
        address: "Hoopers Place, Old Town, Swindon SN1 3RA",
        city: "Swindon",
        location: {
            lat: 51.552,
            lng: -1.779
        },
        lat: 51.552,
        lng: -1.779,
        type: "Gym",
        rating: 4.5,
        user_ratings_total: 90,
        lowest_price: 39.00,
        is_24hr: true,
        website: "https://www.anytimefitness.co.uk/gyms/uk-0164/swindon-south-west-sn1-3ra/",
        place_id: "manual-anytime-swindon-" + Date.now()
    };

    console.log("Injecting JD Gyms Swindon...");
    await setDoc(doc(db, "gyms", jdGym.place_id), jdGym);

    console.log("Injecting Anytime Fitness Swindon...");
    await setDoc(doc(db, "gyms", anytimeFitness.place_id), anytimeFitness);

    console.log("Done!");
}

injectMissingGyms().catch(console.error);
