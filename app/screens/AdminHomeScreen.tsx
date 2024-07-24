import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Keyboard, TouchableWithoutFeedback, Animated, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { db } from '../services/firebase';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import UserCard from '../components/UserCard'; // Ensure the import path is correct
import { UserProfile } from '../services/userService'; // Ensure the import path is correct

const AdminHomeScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [email, setEmail] = useState('');
  const [points, setPoints] = useState('');
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null); // Store the selected user
  const [modalVisible, setModalVisible] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = useCallback(async ({ data }: { type: string; data: string }) => {
    setScanned(true);
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 500,
      useNativeDriver: true,
    }).start();
    await fillEmailAndPointsFromUID(data);
    Keyboard.dismiss();
  }, []);

  const fillEmailAndPointsFromUID = useCallback(async (uid: string) => {
    try {
      console.log(`Attempting to retrieve user with UID: ${uid}`);
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userProfile: UserProfile = {
          uid: uid,
          email: userData.email,
          role: userData.role,
          emailVerified: userData.emailVerified,
          createdAt: userData.createdAt,
          points: userData.points || 0,
          username: userData.username,
          surname: userData.surname,
          phone: userData.phone,
          birthday: userData.birthday,
          profileImageUrl: userData.profileImageUrl, // Include profileImageUrl
        };
        setEmail(userData.email);
        setUserPoints(userData.points || 0);
        setSelectedUser(userProfile); // Store the user data in the state
        console.log(`Retrieved user data: ${JSON.stringify(userData)}`);
      } else {
        Alert.alert('User not found.');
        clearState();
        console.log('User not found.');
      }
    } catch (error) {
      Alert.alert('Error retrieving user:', (error as Error).message);
      clearState();
      console.error('Error retrieving user:', error);
    }
  }, []);

  const clearState = () => {
    setEmail('');
    setPoints('');
    setScanned(false);
    setUserPoints(null);
    setSelectedUser(null);
  };

  const addPoints = useCallback(async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const currentPoints = userDoc.data()?.points || 0;
        await updateDoc(userRef, {
          points: currentPoints + parseInt(points, 10),
        });
        setUserPoints(currentPoints + parseInt(points, 10));
        Alert.alert('Points added successfully!');
      } else {
        Alert.alert('User not found.');
        clearState();
      }
    } catch (error) {
      Alert.alert('Error updating points:', (error as Error).message);
      clearState();
    }
  }, [points]);

  const handleAddPointsByEmail = useCallback(async () => {
    if (!email || !points) {
      Alert.alert('Please enter a valid email and points.');
      return;
    }

    try {
      const userQuery = query(collection(db, 'users'), where('email', '==', email));
      const userQuerySnapshot = await getDocs(userQuery);

      if (!userQuerySnapshot.empty) {
        const userDoc = userQuerySnapshot.docs[0];
        await addPoints(userDoc.id);
        // Clear all fields after adding points
        clearState();
      } else {
        Alert.alert('User not found.');
        clearState();
      }
    } catch (error) {
      Alert.alert('Error updating points:', (error as Error).message);
      clearState();
    }
  }, [email, points, addPoints]);

  const handleGenerateQRCode = async () => {
    if (!points) {
      Alert.alert('Please enter points');
      return;
    }

    try {
      setLoading(true);
      setModalVisible(true); // Display the modal first

      const qrCodeRef = await addDoc(collection(db, 'qrcodes'), {
        points: parseInt(points, 10),
        used: false,
        createdAt: new Date(),
      });

      setQrCodeValue(qrCodeRef.id);
      setLoading(false); // Hide the loading indicator after generating the QR code
    } catch (error) {
      Alert.alert('Error generating QR code:', (error as Error).message);
      setLoading(false); // Hide the loading indicator if there's an error
      setModalVisible(false); // Hide the modal if there's an error
    }
  };

  const handlePrintQRCode = () => {
    // Add your print QR code logic here
    alert('Print QR Code');
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome, Admin!</Text>
        </View>

        {scanned && userPoints !== null ? (
          <View style={styles.resultContainer}>
            {selectedUser && <UserCard user={selectedUser} />}
            <TouchableOpacity style={styles.button} onPress={() => { setScanned(false); setUserPoints(null); setSelectedUser(null); Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }}>
              <Text style={styles.buttonText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View style={[styles.scannerContainer, { transform: [{ scale: scaleAnim }] }]}>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.scannerOverlay}>
              <View style={styles.topOverlay} />
              <View style={styles.middleOverlay}>
                <View style={styles.sideOverlay} />
                <View style={styles.focused} />
                <View style={styles.sideOverlay} />
              </View>
              <View style={styles.bottomOverlay} />
            </View>
          </Animated.View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder='User Email'
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
            autoCapitalize='none'
            placeholderTextColor='#888'
          />
          <TextInput
            style={styles.input}
            placeholder='Points'
            value={points}
            onChangeText={setPoints}
            keyboardType='numeric'
            placeholderTextColor='#888'
          />
          <TouchableOpacity style={styles.button} onPress={handleAddPointsByEmail}>
            <Text style={styles.buttonText}>Add Points by Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleGenerateQRCode}>
            <Text style={styles.buttonText}>Generate QR Code</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType='slide'
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>QR Code</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#1E90FF" />
              ) : (
                qrCodeValue && (
                  <View style={styles.qrContainer}>
                    <QRCode value={qrCodeValue} size={200} />
                  </View>
                )
              )}
              <TouchableOpacity style={styles.button} onPress={handlePrintQRCode}>
                <Text style={styles.buttonText}>Print QR Code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const overlayColor = 'rgba(0,0,0,0.5)'; // Color of the overlay

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultContainer: {
    top:10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#333',
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  middleOverlay: {
    flexDirection: 'row',
    flex: 1.5,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  focused: {
    flex: 10,
    borderColor: 'white',
    borderWidth: 2,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  button: {
    top: 20,
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  qrContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: '#ff6347',
  },
});

export default AdminHomeScreen;
