import React, { useState, useEffect, useRef } from "react";
import { View, Text, Alert, TouchableOpacity, StyleSheet, FlatList, Modal, Button, Image, Animated } from 'react-native';
import { BarCodeScanner } from "expo-barcode-scanner";
import QRCode from 'react-native-qrcode-svg';
import { auth, db } from "../services/firebase";
import { doc, updateDoc, getDoc, arrayUnion, collection, addDoc } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';  // Using Expo's vector icons

const UserHomeScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [points, setPoints] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [sureName, setSureName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const navigation = useNavigation<any>();
  const [recentActivities, setRecentActivities] = useState<Array<{ id: string, description: string, points: number }>>([]);
  const isDataFetched = useRef(false); // Ref to keep track if data is fetched

  useEffect(() => {
    const fetchUserData = async () => {
      if (isDataFetched.current) {
        return; // If data is already fetched, return
      }
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPoints(userData.points);
          setRecentActivities(userData.recentActivities || []);
          setUserName(userData.username); // Assuming the name field is stored as 'name'
          setSureName(userData.surname);
          setPhone(userData.phone);   // Assuming the phone field is stored as 'phone'
          isDataFetched.current = true; // Mark data as fetched
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


  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  const animatedValue = new Animated.Value(0);

  const animateButton = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animatedScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/logo_Station.png')} style={styles.logo} />
        <Text style={styles.title}>Loyalty Balance</Text>
        <View style={styles.pointsRow}>
          <Text style={styles.points}>{points.toFixed(2)}pts</Text>
          <Text style={styles.subtitle}>1200 points till your next reward</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{sureName} {userName}</Text>
          <Text style={styles.userCard}>{phone}</Text>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <View style={styles.card}>
          <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
            <TouchableOpacity style={styles.cardContent} onPress={() => { setQrModalVisible(true); animateButton(); }}>
              <MaterialCommunityIcons name="qrcode" size={30} color="#fff" />
              <Text style={styles.cardText}>My QR-Code</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        <View style={styles.card}>
          <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
            <TouchableOpacity style={styles.cardContent} onPress={() => { setScannerVisible(true); animateButton(); }}>
              <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" />
              <Text style={styles.cardText}>Scan QR Code</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
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
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('userofscan')}>
          <MaterialCommunityIcons name="gift" size={24} color="#ffffff" />
          <Text style={styles.menuText}>Redeem</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    marginTop: 50,
    backgroundColor: "#6A0DAD",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    width: "90%",
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative', // Allow positioning of logo
  },
  logo: {
    width: 100,
    height: 20,
    position: 'absolute',
    top: 5,
    left: 10,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    textAlign: 'center',
  },
  pointsRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  points: {
    fontSize: 36,
    color: "#FFD700",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  userName: {
    color: "#fff",
    fontSize: 16,
  },
  userCard: {
    color: "#fff",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: "90%",
    alignSelf: 'center',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: '#6A0DAD',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  recentActivities: {
    flex: 1,
    width: "90%",
    alignSelf: 'center',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  closeButton: {
    top: 10,
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
    backgroundColor: '#1E90FF',
    position: 'absolute',
    bottom: 0,
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
