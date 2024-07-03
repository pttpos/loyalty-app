import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, StyleSheet, TextInput, Button, Alert, Keyboard, TouchableWithoutFeedback, Animated, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { BarCodeScanner } from "expo-barcode-scanner";
import { db, auth } from "../services/firebase";
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const AdminHomeScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [email, setEmail] = useState("");
  const [points, setPoints] = useState("");
  const [userPoints, setUserPoints] = useState<number | null>(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation<any>();

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
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setEmail(userData.email);
        setUserPoints(userData.points || 0);
      } else {
        Alert.alert("User not found.");
      }
    } catch (error) {
      Alert.alert('Error retrieving user:', (error as Error).message);
    }
  }, []);

  const addPoints = useCallback(async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const currentPoints = userDoc.data().points || 0;
        await updateDoc(userRef, {
          points: currentPoints + parseInt(points, 10),
        });
        setUserPoints(currentPoints + parseInt(points, 10));
        Alert.alert("Points added successfully!");
      } else {
        Alert.alert("User not found.");
      }
    } catch (error) {
      Alert.alert('Error updating points:', (error as Error).message);
    }
  }, [points]);

  const handleAddPointsByEmail = useCallback(async () => {
    if (!email || !points) {
      Alert.alert("Please enter a valid email and points.");
      return;
    }

    try {
      const userQuery = query(collection(db, 'users'), where('email', '==', email));
      const userQuerySnapshot = await getDocs(userQuery);

      if (!userQuerySnapshot.empty) {
        const userDoc = userQuerySnapshot.docs[0];
        await addPoints(userDoc.id);
        // Clear all fields after adding points
        setEmail("");
        setPoints("");
        setScanned(false);
        setUserPoints(null);
      } else {
        Alert.alert("User not found.");
      }
    } catch (error) {
      Alert.alert('Error updating points:', (error as Error).message);
    }
  }, [email, points, addPoints]);

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, Admin!</Text>

        {scanned && userPoints !== null ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>User Email: {email}</Text>
            <Text style={styles.resultText}>Current Points: {userPoints}</Text>
            <Button title="Add More Points" onPress={handleAddPointsByEmail} />
            <Button title="Scan Again" onPress={() => { setScanned(false); setUserPoints(null); Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }} />
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
            placeholder="User Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Points"
            value={points}
            onChangeText={setPoints}
            keyboardType="numeric"
          />
          <Button title="Add Points by Email" onPress={handleAddPointsByEmail} />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const overlayColor = 'rgba(0,0,0,0.5)'; // Color of the overlay

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    marginBottom: 10,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  input: {
    height: 50,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#333',
    color: '#fff',
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
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AdminHomeScreen;
