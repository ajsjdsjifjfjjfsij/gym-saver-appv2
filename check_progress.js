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

async function check() {
  const snapshot = await getDocs(collection(db, "gyms"));
  let updatedCount = 0;
  snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const ref = data.photo_reference;
      if (ref && ref.startsWith("places/")) {
          updatedCount++;
      }
  });
  console.log(`Current New API photo_references in DB: ${updatedCount}`);
}
check();
