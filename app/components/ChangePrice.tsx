import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, FlatList } from 'react-native';
import { getProductPrices, setProductPrices } from '../services/adminService';
import { useNavigation } from '@react-navigation/native';

interface ProductPrice {
  productId: string;
  price: string;
}

const ChangePrice = () => {
  const [productPrices, setProductPricesState] = useState<ProductPrice[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const prices = await getProductPrices();
        if (prices !== null) {
          setProductPricesState(prices.map(({ productId, price }) => ({ productId, price: price.toString() })));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        Alert.alert('Error fetching product prices:', errorMessage);
      }
    };

    fetchPrices();
  }, []);

  const handleSetPrices = async () => {
    const prices = productPrices.map(({ productId, price }) => ({ productId, price: parseFloat(price) }));
    if (prices.some(({ price }) => isNaN(price))) {
      Alert.alert('Error', 'Please enter valid prices');
      return;
    }

    try {
      await setProductPrices(prices);
      Alert.alert('Success', 'Prices updated');
      navigation.goBack();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', errorMessage);
    }
  };

  const handlePriceChange = (productId: string, price: string) => {
    setProductPricesState(prevPrices =>
      prevPrices.map(product => (product.productId === productId ? { ...product, price } : product))
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Prices for Products</Text>
      <FlatList
        data={productPrices}
        keyExtractor={item => item.productId}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <Text style={styles.productName}>Product ID: {item.productId}</Text>
            <TextInput
              style={styles.priceInput}
              keyboardType="numeric"
              value={item.price}
              onChangeText={text => handlePriceChange(item.productId, text)}
            />
          </View>
        )}
      />
      <Button title="Set Prices" onPress={handleSetPrices} />
      <Button title="Cancel" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  productContainer: {
    marginBottom: 20,
  },
  productName: {
    fontSize: 18,
    marginBottom: 10,
  },
  priceInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default ChangePrice;
