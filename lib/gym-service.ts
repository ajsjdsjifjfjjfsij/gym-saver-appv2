import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getGyms() {
  if (!db) {
    console.error("Firestore is not initialized.");
    return [];
  }
  const snapshot = await getDocs(collection(db, "gyms"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
