import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity, Modal } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import QRCodeGenerator from "../components/QRCodeGenerator";
import { auth, db } from "../services/firebase";
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const UserHomeScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [points, setPoints] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setPoints(userDoc.data().points);
        }
      }
    };

    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    fetchUserData();
    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    setScanned(true);
    setScannerVisible(false);
    try {
      const qrCodeRef = doc(db, 'qrcodes', data);
      const qrCodeDoc = await getDoc(qrCodeRef);
      if (qrCodeDoc.exists()) {
        const qrCodeData = qrCodeDoc.data();
        if (!qrCodeData.used) {
          await updateDoc(qrCodeRef, { used: true });
          const userRef = doc(db, 'users', userId!);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const currentPoints = userDoc.data().points || 0;
            const scannedCodes = userDoc.data().scannedCodes || [];
            if (!scannedCodes.includes(data)) {
              await updateDoc(userRef, { 
                points: currentPoints + qrCodeData.points,
                scannedCodes: arrayUnion(data)
              });
              setPoints(currentPoints + qrCodeData.points);
              Alert.alert("Success", `You've received ${qrCodeData.points} points!`);
            } else {
              Alert.alert("Error", "This QR code has already been used.");
            }
          }
        } else {
          Alert.alert("Error", "This QR code has already been used.");
        }
      } else {
        Alert.alert("Error", "Invalid QR code.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to scan QR code.");
    }
    setScanned(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, User!</Text>
      <Text style={styles.points}>Your Points: {points}</Text>
      <QRCodeGenerator />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.scanButton} onPress={() => setScannerVisible(true)}>
        <Text style={styles.scanButtonText}>Scan QR Code</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={false}
        visible={scannerVisible}
        onRequestClose={() => {
          setScannerVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          {scanned && <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />}
          <Button title="Close Scanner" onPress={() => setScannerVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  points: {
    fontSize: 18,
    marginBottom: 20,
    color: "#fff",
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  scanButton: {
    marginTop: 20,
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UserHomeScreen;
