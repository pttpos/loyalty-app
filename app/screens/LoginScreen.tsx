import React, { useState } from 'react';
import { View, TextInput, Text, Alert, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../services/firebase';
import { createUserProfile, getUserProfile } from '../services/userService';
import { LogBox } from 'react-native';

const LoginScreen = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !username)) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (user) {
          const userProfile = await getUserProfile(user.uid);
          if (userProfile) {
            if (!user.emailVerified) {
              await sendEmailVerification(user); // Resend email verification
              navigation.navigate('EmailVerification', { email: user.email, uid: user.uid });
              return;
            }

            if (userProfile.role === 'admin') {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Admin' }],
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'HomePage' }],
              });
            }
          } else {
            Alert.alert('Error', 'Failed to fetch user profile');
          }
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (user.email) {
          await createUserProfile({ uid: user.uid, email: user.email, role: 'user' });
          await sendEmailVerification(user);
          navigation.navigate('EmailVerification', { email: user.email, uid: user.uid });
        } else {
          Alert.alert('Error', 'Email is missing');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Create an account'}</Text>
      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="#1E90FF" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Register'}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchButtonText}>
          {isLogin ? 'Create an account' : 'Already have an account? Login'}
        </Text>
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
    marginBottom: 40,
  },
  input: {
    height: 50,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#333',
    color: '#fff',
  },
  button: {
    height: 50,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  switchButton: {
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#1E90FF',
  },
});

export default LoginScreen;
