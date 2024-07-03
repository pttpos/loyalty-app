// services/pointsService.ts
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const addPoints = async (userId: string, points: number) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    points: points,
  });
};
