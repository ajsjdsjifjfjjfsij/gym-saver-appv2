const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "gym-saver-app"
  });
}
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('gyms').limit(1).get()
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}
run();
