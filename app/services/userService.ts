import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: any; // Timestamp or Date
  points: number;
  username: string;
  surname: string;
  phone: string;
  birthday: string;
}

export const createUserProfile = async (user: { uid: string, email: string, role: string, username: string, surname: string, phone: string, birthday: string }): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: user.role,
      emailVerified: false,
      createdAt: new Date(),
      points: 0,
      username: user.username,
      surname: user.surname,
      phone: user.phone,
      birthday: user.birthday,
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

export const updateUserProfile = async (uid: string, profile: Partial<UserProfile>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), profile);
  } catch (error) {
    console.error("Error updating user profile: ", error);
    throw error;
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

export const setProductPrice = async (productId: string, price: number): Promise<void> => {
  try {
    await setDoc(doc(db, 'prices', productId), { price });
    console.log('Product price updated in Firestore');
  } catch (error) {
    console.error("Error updating product price: ", error);
  }
};

export const getProductPrice = async (productId: string): Promise<number | null> => {
  try {
    const priceDoc = await getDoc(doc(db, 'prices', productId));
    return priceDoc.exists() ? priceDoc.data().price : null;
  } catch (error) {
    console.error("Error fetching product price: ", error);
    return null;
  }
};
