import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { sendEmailVerification } from 'firebase/auth';
import { LogBox } from 'react-native';

const EmailVerificationScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email, uid } = route.params;
  const auth = getAuth();
  const [resending, setResending] = useState(false);

  const rotation = useSharedValue(0);

  useEffect(() => {
    const checkEmailVerified = async () => {
      const user = auth.currentUser;
      if (user) {
        console.log('Reloading user...');
        await user.reload();
        console.log('User email verified:', user.emailVerified);
        if (user.emailVerified) {
          try {
            console.log('Updating Firestore for uid:', uid);
            const userDocRef = doc(db, 'users', uid);
            await updateDoc(userDocRef, { emailVerified: true });
            console.log('Firestore updated');
            navigation.reset({
              index: 0,
              routes: [{ name: 'HomePage' }], // Navigate to HomePage
            });
          } catch (error) {
            console.error('Error updating Firestore:', error);
          }
        }
      }
    };

    const interval = setInterval(checkEmailVerified, 5000); // Check every 5 seconds

    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1
    );

    return () => {
      clearInterval(interval);
      rotation.value = 0;
    };
  }, [auth, navigation, rotation, uid]);

  const handleResendVerificationEmail = async () => {
    setResending(true);
    const user = auth.currentUser;
    if (user) {
      try {
        await sendEmailVerification(user);
        console.log('Verification email resent');
        Alert.alert('Success', 'Verification email resent. Please check your email.');
      } catch (error) {
        console.error('Error resending verification email:', error);
        Alert.alert('Error', 'Failed to resend verification email.');
      }
    }
    setResending(false);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.message}>
        A verification link has been sent to {email}. Please check your email and click the link to verify your account.
      </Text>
      <Animated.View style={[styles.spinner, animatedStyle]}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </Animated.View>
      <TouchableOpacity style={styles.resendButton} onPress={handleResendVerificationEmail} disabled={resending}>
        <Text style={styles.resendButtonText}>{resending ? 'Resending...' : 'Resend Verification Email'}</Text>
      </TouchableOpacity>
    </View>
  );
};

LogBox.ignoreLogs([
  'BarCodeScanner has been deprecated',
  '@firebase/auth',
]);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 32,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
  },
  spinner: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    alignSelf: 'center',
  },
  resendButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default EmailVerificationScreen;
