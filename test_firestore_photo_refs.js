const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

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
  const snapshot = await getDocs(query(collection(db, "gyms"), limit(50)));
  let photoRefs = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.photo_reference) photoRefs.push(data.photo_reference);
    else if (data.photo) photoRefs.push(data.photo);
    else if (data.photos && data.photos.length > 0) photoRefs.push(data.photos[0]);
    else photoRefs.push("NONE");
  });
  console.log("Sample photo_refs:\n" + photoRefs.join("\n"));
}
test();
