// components/QRCodeButtons.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface QRCodeButtonsProps {
  setQrModalVisible: (visible: boolean) => void;
  setScannerVisible: (visible: boolean) => void;
  animatedScale: Animated.AnimatedInterpolation<number>; // Specify the type argument
  animateButton: () => void;
}

const QRCodeButtons: React.FC<QRCodeButtonsProps> = ({ setQrModalVisible, setScannerVisible, animatedScale, animateButton }) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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
});

export default QRCodeButtons;
