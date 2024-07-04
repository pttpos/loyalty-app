// services/userService.ts
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';


export interface UserProfile {
  uid: string;
  email: string;
  role: string;
  emailVerified: boolean;
  otp: string; // Add OTP field
  createdAt: Date;
  points: number;
}

export const createUserProfile = async (user: { uid: string, email: string, role: string }): Promise<void> => {
  try {
    const otp = generateOTP();
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: user.role,
      emailVerified: false,
      otp: otp, // Store OTP in Firestore
      createdAt: new Date(),
      points: 0, // Initialize points to 0
    });
    await sendOTPEmail(user.email, otp); // Send OTP email
  } catch (error) {
    console.error("Error creating user profile: ", error);
  }
};

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
};

const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  // Implement your email sending logic here
  console.log(`Sending OTP ${otp} to email ${email}`);
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

export const verifyOTP = async (uid: string, inputOtp: string): Promise<boolean> => {
  try {
    const userProfile = await getUserProfile(uid);
    if (userProfile && userProfile.otp === inputOtp) {
      await updateUserVerification(uid);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error verifying OTP: ", error);
    return false;
  }
};

const updateUserVerification = async (uid: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), { emailVerified: true, otp: '' }); // Clear OTP after verification
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
