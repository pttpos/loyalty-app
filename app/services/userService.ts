import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
  points: number;
}

export const createUserProfile = async (user: { uid: string, email: string, role: string }): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: user.role,
      emailVerified: false,
      createdAt: new Date(),
      points: 0,
    });
  } catch (error) {
    console.error("Error creating user profile: ", error);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
  } catch (error) {
    console.error("Error fetching user profile: ", error);
    return null;
  }
};

export const updateUserVerification = async (uid: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), { emailVerified: true });
    console.log('User verification updated in Firestore');
  } catch (error) {
    console.error("Error updating user verification: ", error);
  }
};

export const updateUserPoints = async (uid: string, points: number): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), { points });
  } catch (error) {
    console.error("Error updating user points: ", error);
  }
};
