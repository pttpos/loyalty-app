// components/QRModals.tsx
import React from 'react';
import { View, Text, Modal, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import QRCode from 'react-native-qrcode-svg';

interface QRModalsProps {
  scannerVisible: boolean;
  setScannerVisible: (visible: boolean) => void;
  qrModalVisible: boolean;
  setQrModalVisible: (visible: boolean) => void;
  scanned: boolean;
  handleBarCodeScanned: ({ data }: { type: string; data: string }) => void;
  userId: string | null;
  setScanned: (scanned: boolean) => void;
}

const QRModals: React.FC<QRModalsProps> = ({ scannerVisible, setScannerVisible, qrModalVisible, setQrModalVisible, scanned, handleBarCodeScanned, userId, setScanned }) => {
  return (
    <>
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
    </>
  );
};

const styles = StyleSheet.create({
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
});

export default QRModals;
