import React, { useState } from 'react';
import { View, TextInput, Text, Alert, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../services/firebase';
import { createUserProfile, getUserProfile } from '../services/userService';
import { LogBox } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

const LoginScreen = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [surname, setSurname] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const navigation = useNavigation<any>();

  const handleConfirm = (date: Date) => {
    setBirthday(moment(date).format('YYYY-MM-DD'));
    setDatePickerVisibility(false);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^(0[1-9])[0-9]{7,8}$/;
    return phoneRegex.test(phone);
  };

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && (!username || !surname || !phone || !birthday))) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    if (!isLogin && !validatePhoneNumber(phone)) {
      Alert.alert('Error', 'Please enter a valid Cambodian phone number');
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
          await createUserProfile({ 
            uid: user.uid, 
            email: user.email, 
            role: 'user', 
            username, 
            surname, 
            phone, 
            birthday 
          });
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
        <>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Surname"
            value={surname}
            onChangeText={setSurname}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.datePickerButton}>
            <Text style={styles.datePickerButtonText}>{birthday ? birthday : 'Select Birthday'}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={() => setDatePickerVisibility(false)}
          />
        </>
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
  datePickerButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#333',
    marginBottom: 20,
  },
  datePickerButtonText: {
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
