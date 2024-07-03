// components/QRCodeScanner.tsx
import React, { useState, useEffect } from "react";
import { View, Button, TextInput, Alert, Text, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { db } from "../services/firebase";
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const QRCodeScanner = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [email, setEmail] = useState("");
  const [points, setPoints] = useState("");

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    await addPoints(data);
  };

  const addPoints = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const currentPoints = userDoc.data().points || 0;
        await updateDoc(userRef, {
          points: currentPoints + parseInt(points, 10),
        });
        Alert.alert("Points added successfully!");
      } else {
        Alert.alert("User not found.");
      }
    } catch (error) {
      Alert.alert('Error updating points:', (error as Error).message);
    }
  };

  const handleAddPointsByEmail = async () => {
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
      } else {
        Alert.alert("User not found.");
      }
    } catch (error) {
      Alert.alert('Error updating points:', (error as Error).message);
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
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginTop: 20,
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
});

export default QRCodeScanner;
