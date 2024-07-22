// components/BottomMenu.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BottomMenu = () => {
  const navigation = useNavigation<any>();

  return (
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
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MapScreen')}>
        <MaterialCommunityIcons name="map" size={24} color="#ffffff" />
        <Text style={styles.menuText}>Map</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#ff0000',
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

export default BottomMenu;
