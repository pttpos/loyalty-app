import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, arrayUnion } from 'firebase/firestore';
import { getProductPrice } from '../services/userService'; // Adjust the path as needed

interface Product {
  id: string;
  name: string;
  points: number;
}

interface UserProfile {
  uid: string;
  username: string;
  points: number;
  email: string;
  phone: string;
  birthday: string;
}

const POSScreen = () => {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'URL91', points: 100 },  // Points per liter
    { id: '2', name: 'ULG95', points: 150 },
    { id: '3', name: 'HSD', points: 120 },
  ]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0]);
  const [volume, setVolume] = useState<string>('1');
  const [pricePerLiter, setPricePerLiter] = useState<number>(1); // Default price per liter
  const [availablePoints, setAvailablePoints] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const navigation = useNavigation<any>();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    setScanned(true);
    setModalVisible(false);

    try {
      const userRef = doc(db, 'users', data);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setAvailablePoints(userData.points);
        setUserId(data);
        setUserProfile({
          uid: data,
          username: userData.username,
          points: userData.points,
          email: userData.email,
          phone: userData.phone,
          birthday: userData.birthday,
        });
        Alert.alert('User Scanned', `User: ${userData.username}, Points: ${userData.points}`);
      } else {
        Alert.alert('Error', 'User not found');
        handleClearAll();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user data');
      handleClearAll();
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct || !userId) {
      Alert.alert('Error', 'Please select a product and scan a user QR code');
      return;
    }

    const volumeLiters = parseFloat(volume);
    const totalPoints = selectedProduct.points * volumeLiters;
    const totalPrice = pricePerLiter * volumeLiters;

    if (totalPoints > availablePoints) {
      Alert.alert('Error', 'Insufficient points');
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      const newPoints = availablePoints - totalPoints;

      // Add transaction to the transactions collection
      const transactionData = {
        userId,
        points: -totalPoints,
        description: `Purchased ${volumeLiters} liters of ${selectedProduct.name}`,
        price: totalPrice,
        timestamp: new Date().toISOString()
      };
      await addDoc(collection(db, 'transactions'), transactionData);

      // Update user document
      await updateDoc(userRef, {
        points: newPoints,
        recentActivities: arrayUnion(transactionData)
      });

      setAvailablePoints(newPoints);
      Alert.alert('Success', 'Purchase completed');
      setVolume('1');
      setUserProfile(null);
      setUserId(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete the purchase');
    }
  };

  const handleClearAll = () => {
    setVolume('1');
    setSelectedProduct(products[0]);
    setAvailablePoints(0);
    setUserId(null);
    setUserProfile(null);
    setScanned(false);
  };

  const handleSelectProduct = async (product: Product) => {
    setSelectedProduct(product);
    const price = await getProductPrice(product.id);
    if (price !== null) {
      setPricePerLiter(price);
    }
  };

  const totalPrice = (parseFloat(volume) * pricePerLiter).toFixed(2);

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Point of Sale</Text>
        <TouchableOpacity style={styles.setPriceButton} onPress={() => navigation.navigate('ChangePrice', { product: selectedProduct })}>
          <Text style={styles.setPriceButtonText}>Set Price</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.productItem,
              selectedProduct?.id === item.id && styles.selectedProductItem,
            ]}
            onPress={() => handleSelectProduct(item)}
          >
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPoints}>{item.points} points per liter</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.volumeContainer}>
        <Text style={styles.volumeLabel}>Volume (Liters):</Text>
        <TextInput
          style={styles.volumeInput}
          keyboardType="numeric"
          value={volume}
          onChangeText={setVolume}
        />
      </View>
      <Text style={styles.availablePoints}>Available Points: {availablePoints}</Text>
      <Text style={styles.priceLabel}>Price per Liter: ${pricePerLiter}</Text>
      <Text style={styles.totalPriceLabel}>Total Price: ${totalPrice}</Text>
      <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
        <Text style={styles.purchaseButtonText}>Complete Purchase</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.purchaseButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.purchaseButtonText}>Scan User QR Code</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
        <Text style={styles.clearButtonText}>Clear All</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          {scanned && <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />}
          <Button title="Close Scanner" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>

      {userProfile && (
        <View style={styles.userInfoContainer}>
          <Text style={styles.userInfoTitle}>User Information</Text>
          <Text style={styles.userInfoText}>Name: {userProfile.username}</Text>
          <Text style={styles.userInfoText}>Email: {userProfile.email}</Text>
          <Text style={styles.userInfoText}>Phone: {userProfile.phone}</Text>
          <Text style={styles.userInfoText}>Birthday: {userProfile.birthday}</Text>
          <Text style={styles.userInfoText}>Available Points: {userProfile.points}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  setPriceButton: {
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 5,
  },
  setPriceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  selectedProductItem: {
    backgroundColor: '#d3d3d3',
  },
  productName: {
    fontSize: 18,
  },
  productPoints: {
    fontSize: 14,
    color: '#888',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  volumeLabel: {
    fontSize: 18,
    marginRight: 10,
  },
  volumeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    width: 100,
  },
  availablePoints: {
    fontSize: 18,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  totalPriceLabel: {
     color: '#FF0000',
    fontSize: 18,
    marginBottom: 20,
  },
  purchaseButton: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#ff4500',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  userInfoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userInfoText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default POSScreen;
