const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  const snapshot = await getDocs(collection(db, "gyms"));
  let count = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if ((data.name||'').toLowerCase().includes('jd')) {
      if ((data.name||'').toLowerCase().includes('swindon')) {
         console.log("Found:", data.name);
         console.log("has root lat:", data.lat !== undefined);
         console.log("has location.lat:", data.location && data.location.lat !== undefined);
      }
      count++;
    }
  });
  console.log("Total JD Gyms:", count);
}
test();
