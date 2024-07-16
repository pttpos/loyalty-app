import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Alert, Button } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import QRCode from 'react-native-qrcode-svg';
import { auth, db } from "../services/firebase";
import { doc, updateDoc, getDoc, arrayUnion, collection, addDoc } from "firebase/firestore";
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';  // Using Expo's vector icons

const UserHomeScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [points, setPoints] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const navigation = useNavigation<any>();
  const [recentActivities, setRecentActivities] = useState<Array<{ id: string, description: string, points: number }>>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setPoints(userDoc.data().points);
          setRecentActivities(userDoc.data().recentActivities || []);
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
              const newPoints = currentPoints + qrCodeData.points;
              const transactionData = {
                userId,
                points: qrCodeData.points,
                qrCodeId: data,
                timestamp: new Date().toISOString()
              };

              // Add transaction to the transactions collection
              await addDoc(collection(db, 'transactions'), transactionData);

              // Update user document
              await updateDoc(userRef, {
                points: newPoints,
                scannedCodes: arrayUnion(data),
                recentActivities: arrayUnion({
                  id: data,
                  description: `Scanned QR code for ${qrCodeData.points} points`,
                  points: qrCodeData.points
                })
              });

              setPoints(newPoints);
              setRecentActivities(prevActivities => [...prevActivities, {
                id: data,
                description: `Scanned QR code for ${qrCodeData.points} points`,
                points: qrCodeData.points
              }]);
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
      <View style={styles.header}>
        <Text style={styles.title}>Loyalty Balance</Text>
        <Text style={styles.points}>{points.toFixed(2)}pts</Text>
        <Text style={styles.subtitle}>1200 points till your next reward</Text>
      </View>
      <TouchableOpacity style={styles.inviteButton} onPress={() => setQrModalVisible(true)}>
        <MaterialCommunityIcons name="qrcode" size={30} color="#fff" style={styles.inviteIcon} />
        <Text style={styles.inviteButtonText}>My QR-Code</Text>
      </TouchableOpacity>

      <View style={styles.recentActivities}>
        <Text style={styles.recentActivitiesTitle}>Recent Activity</Text>
        <FlatList
          data={recentActivities}
          renderItem={({ item }) => (
            <View style={styles.activityItem}>
              <Text style={styles.activityDescription}>{item.description}</Text>
              <Text style={styles.activityPoints}>+{item.points}</Text>
            </View>
          )}
          keyExtractor={item => item.id}
        />
      </View>
      <TouchableOpacity style={styles.scanButton} onPress={() => setScannerVisible(true)}>
        <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" style={styles.scanIcon} />
        <Text style={styles.scanButtonText}>Scan QR Code</Text>
      </TouchableOpacity>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HomePage')}>
          <MaterialCommunityIcons name="home" size={24} color="#ffffff" />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="credit-card" size={24} color="#ffffff" />
          <Text style={styles.menuText}>Card</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('UserHomeScreen')}>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#ffffff" />
          <Text style={styles.menuText}>QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="gift" size={24} color="#ffffff" />
          <Text style={styles.menuText}>Redeem</Text>
        </TouchableOpacity>
      </View>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={qrModalVisible}
        onRequestClose={() => {
          setQrModalVisible(false);
        }}
      >
        <View style={styles.qrModalContainer}>
          <View style={styles.qrModal}>
            <Text style={styles.modalTitle}>QR Code</Text>
            {userId && (
              <QRCode value={userId} size={200} />
            )}
            <TouchableOpacity onPress={() => setQrModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
    justifyContent: 'space-between', // Ensures the footer stays at the bottom
  },
  scanButton: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row', // Added to arrange items in a row
    marginBottom: 20,
  },
  scanIcon: {
    marginRight: 10, // Spacing between icon and text
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    backgroundColor: "#1F1B24",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  points: {
    fontSize: 36,
    color: "#FFD700",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
  },
  inviteButton: {
    backgroundColor: "#6A0DAD",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  inviteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  inviteIcon: {
    marginRight: 10, // Spacing between icon and text
  },
  recentActivities: {
    flex: 1,
  },
  recentActivitiesTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1F1B24",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  activityDescription: {
    color: "#fff",
  },
  activityPoints: {
    color: "#FFD700",
  },
  logoutButton: {
    backgroundColor: '#FF4500',
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  qrModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  qrModal: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  qrContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  printButton: {
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  printButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ff6347',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#ff0000',
    width: '100%',
    height: 75,
    alignItems: 'center',
  },
  menuItem: {
    alignItems: 'center',
  },
  menuText: {
    color: '#ffffff',
    fontSize: 16,
  },

});


export default UserHomeScreen;
