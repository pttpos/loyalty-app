import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, Alert, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from "expo-barcode-scanner";
import { auth, db } from "../services/firebase";
import { doc, updateDoc, getDoc, arrayUnion, collection, addDoc } from "firebase/firestore";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LogBox } from 'react-native';
import * as Notifications from 'expo-notifications';
import UserHeader from '../components/UserHeader';
import QRCodeButtons from '../components/QRCodeButtons';
import RecentActivities from '../components/RecentActivities';
import QRModals from '../components/QRModals';
import BottomMenu from '../components/BottomMenu';

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
  const [recentActivities, setRecentActivities] = useState<Array<{ id: string, description: string, points: number, timestamp: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const isDataFetched = useRef(false);
  const navigation = useNavigation<any>();

  // Function to handle notifications
  const sendNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null,
    });
  };

  const fetchUserData = useCallback(async () => {
    try {
      if (isDataFetched.current) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPoints(userData.points);
          setRecentActivities(userData.recentActivities || []);
          setUserName(userData.username);
          setSureName(userData.surname);
          setPhone(userData.phone);
          isDataFetched.current = true;
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      return () => {
        setLoading(false);
      };
    }, [fetchUserData])
  );

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  // Polling to check for updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.points !== points || userData.recentActivities.length !== recentActivities.length) {
            setPoints(userData.points);
            setRecentActivities(userData.recentActivities || []);
            sendNotification("Data Updated", "Your points or activities have been updated.");
          }
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [points, recentActivities]);

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
                  points: qrCodeData.points,
                  timestamp: transactionData.timestamp
                })
              });

              setPoints(newPoints);
              setRecentActivities(prevActivities => [...prevActivities, {
                id: data,
                description: `Scanned QR code for ${qrCodeData.points} points`,
                points: qrCodeData.points,
                timestamp: transactionData.timestamp
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
      {loading ? (
        <ActivityIndicator size="large" color="#FF6347" style={styles.loading} />
      ) : (
        <>
          <UserHeader points={points} userName={userName} sureName={sureName} phone={phone} />
          <QRCodeButtons setQrModalVisible={setQrModalVisible} setScannerVisible={setScannerVisible} animatedScale={animatedScale} animateButton={animateButton} />
          <RecentActivities recentActivities={recentActivities} />
          <QRModals scannerVisible={scannerVisible} setScannerVisible={setScannerVisible} qrModalVisible={qrModalVisible} setQrModalVisible={setQrModalVisible} scanned={scanned} handleBarCodeScanned={handleBarCodeScanned} userId={userId} setScanned={setScanned} />
          <BottomMenu />
        </>
      )}
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
    backgroundColor: "#121212",
  },
  loading: {
    marginTop: 100,
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
