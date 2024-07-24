import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import QRCode from 'react-native-qrcode-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';

interface QrCode {
  id: string;
  points: number;
  used: boolean;
  createdAt: any; // Timestamp
}

const AdminQrHistoryScreen: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState('');
  const [filterUsed, setFilterUsed] = useState<'all' | 'used' | 'unused'>('all');
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState<QrCode | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const qrCodeRef = useRef<View>(null);

  useEffect(() => {
    const qrCodeCollection = collection(db, 'qrcodes');
    const qrCodeQuery = query(qrCodeCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(qrCodeQuery, (snapshot) => {
      const qrCodeList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as QrCode[];
      setQrCodes(qrCodeList);
    }, (error) => {
      console.error('Error fetching QR codes:', error);
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleGenerateQRCode = async () => {
    if (!points) {
      Alert.alert('Please enter points');
      return;
    }

    setLoading(true);
    try {
      const qrCodeRef = await addDoc(collection(db, 'qrcodes'), {
        points: parseInt(points, 10),
        used: false,
        createdAt: new Date(),
      });
      Alert.alert('QR code generated successfully!', `QR Code ID: ${qrCodeRef.id}`);
      setPoints('');
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Error generating QR code:', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintQrCode = async () => {
    if (qrCodeRef.current) {
      try {
        const uri = await captureRef(qrCodeRef.current, {
          format: 'png',
          quality: 1,
        });
        const htmlContent = `
          <html>
            <body>
              <div style="text-align: center;">
                <h1>QR Code Preview</h1>
                <img src="${uri}" style="width: 200px; height: 200px;" />
                <p><strong>QR Code ID:</strong> ${selectedQrCode?.id}</p>
                <p><strong>Points:</strong> ${selectedQrCode?.points}</p>
                <p><strong>Used:</strong> ${selectedQrCode?.used ? 'Yes' : 'No'}</p>
                <p><strong>Created At:</strong> ${new Date(selectedQrCode?.createdAt.seconds * 1000).toLocaleString()}</p>
              </div>
            </body>
          </html>
        `;
        const { uri: pdfUri } = await Print.printToFileAsync({ html: htmlContent });
        await FileSystem.moveAsync({
          from: pdfUri,
          to: `${FileSystem.documentDirectory}qr-code.pdf`,
        });
        Alert.alert('Print file created at:', `${FileSystem.documentDirectory}qr-code.pdf`);
      } catch (error) {
        console.error('Error printing QR code:', error);
      }
    }
  };

  const clearFilters = () => {
    setFilterUsed('all');
    setFilterStartDate(null);
    setFilterEndDate(null);
  };

  const filterQrCodes = () => {
    return qrCodes.filter(qrCode => {
      const qrDate = new Date(qrCode.createdAt.seconds * 1000);
      const isUsedFilter = filterUsed === 'all' || (filterUsed === 'used' && qrCode.used) || (filterUsed === 'unused' && !qrCode.used);
      const isStartDateFilter = !filterStartDate || qrDate.setHours(0, 0, 0, 0) >= filterStartDate.setHours(0, 0, 0, 0);
      const isEndDateFilter = !filterEndDate || qrDate.setHours(0, 0, 0, 0) <= filterEndDate.setHours(0, 0, 0, 0);
      return isUsedFilter && isStartDateFilter && isEndDateFilter;
    });
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined, setDate: (date: Date | null) => void) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#1E90FF" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Code History</Text>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Used Status:</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, filterUsed === 'all' && styles.filterButtonSelected]}
            onPress={() => setFilterUsed('all')}
          >
            <Text style={styles.filterButtonText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterUsed === 'used' && styles.filterButtonSelected]}
            onPress={() => setFilterUsed('used')}
          >
            <Text style={styles.filterButtonText}>Used</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterUsed === 'unused' && styles.filterButtonSelected]}
            onPress={() => setFilterUsed('unused')}
          >
            <Text style={styles.filterButtonText}>Unused</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.filterLabel}>Filter by Date Range:</Text>
        <View style={styles.datePickerContainer}>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.datePickerButton}>
            <Text style={styles.datePickerText}>
              Start Date: {filterStartDate ? filterStartDate.toDateString() : 'Select'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.datePickerButton}>
            <Text style={styles.datePickerText}>
              End Date: {filterEndDate ? filterEndDate.toDateString() : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>
        {showStartDatePicker && (
          <DateTimePicker
            value={filterStartDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, setFilterStartDate)}
          />
        )}
        {showEndDatePicker && (
          <DateTimePicker
            value={filterEndDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, setFilterEndDate)}
          />
        )}
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filterQrCodes()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.qrCodeContainer} onPress={() => { setSelectedQrCode(item); setModalVisible(true); }}>
            <Text style={styles.field}><Text style={styles.label}>QR Code ID:</Text> {item.id}</Text>
            <Text style={styles.field}><Text style={styles.label}>Points:</Text> {item.points}</Text>
            <Text style={styles.field}><Text style={styles.label}>Used:</Text> {item.used ? 'Yes' : 'No'}</Text>
            <Text style={styles.field}><Text style={styles.label}>Created At:</Text> {new Date(item.createdAt.seconds * 1000).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      />
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedQrCode && (
              <>
                <Text style={styles.modalTitle}>QR Code Preview</Text>
                <View ref={qrCodeRef} style={styles.qrCodeWrapper}>
                  <QRCode value={selectedQrCode.id} size={200} color="black" />
                </View>
                <Text style={styles.modalField}><Text style={styles.modalLabel}>QR Code ID:</Text> {selectedQrCode.id}</Text>
                <Text style={styles.modalField}><Text style={styles.modalLabel}>Points:</Text> {selectedQrCode.points}</Text>
                <Text style={styles.modalField}><Text style={styles.modalLabel}>Used:</Text> {selectedQrCode.used ? 'Yes' : 'No'}</Text>
                <Text style={styles.modalField}><Text style={styles.modalLabel}>Created At:</Text> {new Date(selectedQrCode.createdAt.seconds * 1000).toLocaleString()}</Text>
              </>
            )}
            <TouchableOpacity style={styles.printButton} onPress={handlePrintQrCode}>
              <Text style={styles.printButtonText}>Print QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
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
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  qrCodeContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  field: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  generateContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#333',
  },
  generateButton: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#ff6347',
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
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: '#1e90ff',
    borderWidth: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  filterButtonSelected: {
    backgroundColor: '#1e90ff',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalField: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  modalLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  qrCodeWrapper: {
    marginBottom: 15,
  },
  printButton: {
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  printButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ff6347',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AdminQrHistoryScreen;
