import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type ActivityType = 'search' | 'view' | 'bounty' | 'save' | 'trending' | 'join';

export interface ActivityPayload {
  type: ActivityType;
  city?: string;
  brand?: string;
}

export const logRealActivity = async (payload: ActivityPayload) => {
  if (!db) return; // Silent fail if Firebase is not initialized
  
  try {
    const activitiesRef = collection(db, 'recent_activities');
    await addDoc(activitiesRef, {
      ...payload,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
