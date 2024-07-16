import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, FlatList, TextInput, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { getAuth } from 'firebase/auth';
import { db, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { LogBox } from 'react-native';

interface Banner {
  id: string;
  imageUrl: string;
  description: string;
  endTime?: string | null;
}

const AdminBannerScreen = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      const bannersSnapshot = await getDocs(collection(db, 'banners'));
      const bannersList = bannersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
      setBanners(bannersList);
    };

    fetchBanners();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,  // Change this to false to avoid cropping
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  const handleImageUpload = async (uri: string) => {
    setUploading(true);
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const storageRef = ref(storage, `promotion/${filename}`);

    try {
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      const newBanner: Banner = {
        id: '', // Temporary ID, will be set by Firestore
        imageUrl: downloadURL,
        description: newDescription,
        endTime: newEndTime || null,
      };

      setPreviewBanner(newBanner);
      setModalVisible(true);
      setUploading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
      setUploading(false);
    }
  };

  const confirmBannerUpload = async () => {
    try {
      if (!previewBanner) return;

      const bannerRef = doc(collection(db, 'banners'));
      await setDoc(bannerRef, { ...previewBanner, id: bannerRef.id });

      setBanners([...banners, { ...previewBanner, id: bannerRef.id }]);
      setNewDescription('');
      setNewEndTime('');
      setPreviewBanner(null);
      setModalVisible(false);
      Alert.alert('Success', 'Banner uploaded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save banner');
    }
  };

  const confirmDeleteBanner = (banner: Banner) => {
    setBannerToDelete(banner);
    setDeleteConfirmVisible(true);
  };

  const deleteBanner = async () => {
    if (!bannerToDelete) return;

    try {
      // Delete banner from Firestore
      await deleteDoc(doc(db, 'banners', bannerToDelete.id));
      
      // Extract the path from the image URL
      const path = bannerToDelete.imageUrl.split('/o/')[1].split('?')[0];
      const imageRef = ref(storage, decodeURIComponent(path));

      // Delete image from Firebase Storage
      await deleteObject(imageRef);

      setBanners(banners.filter(banner => banner.id !== bannerToDelete.id));
      setDeleteConfirmVisible(false);
      Alert.alert('Success', 'Banner deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete banner');
    }
  };

  const renderBannerItem = ({ item }: { item: Banner }) => (
    <View style={styles.bannerItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} />
      <Text style={styles.bannerDescription}>{item.description}</Text>
      {item.endTime && (
        <Text style={styles.bannerEndTime}>{`Ends on: ${new Date(item.endTime).toLocaleString()}`}</Text>
      )}
      <TouchableOpacity onPress={() => confirmDeleteBanner(item)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    setNewEndTime(moment(date).format('YYYY-MM-DD HH:mm:ss'));
    hideDatePicker();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin - Manage Banners</Text>
      <FlatList
        data={banners}
        renderItem={renderBannerItem}
        keyExtractor={(item) => item.id}
        style={styles.bannerList}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={newDescription}
        onChangeText={setNewDescription}
      />
      <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
        <Text style={styles.datePickerButtonText}>
          {newEndTime ? `End Time: ${newEndTime}` : 'Select End Time'}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={uploading}>
        <Text style={styles.uploadButtonText}>{uploading ? 'Uploading...' : 'Upload New Banner'}</Text>
      </TouchableOpacity>

      {previewBanner && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Confirm Banner</Text>
              <Image source={{ uri: previewBanner.imageUrl }} style={styles.previewImage} />
              <Text style={styles.previewDescription}>{previewBanner.description}</Text>
              {previewBanner.endTime && (
                <Text style={styles.previewEndTime}>{`Ends on: ${new Date(previewBanner.endTime).toLocaleString()}`}</Text>
              )}
              <TouchableOpacity style={styles.confirmButton} onPress={confirmBannerUpload}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteConfirmVisible}
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={styles.modalMessage}>Are you sure you want to delete this banner?</Text>
            <TouchableOpacity style={styles.confirmButton} onPress={deleteBanner}>
              <Text style={styles.buttonText}>Yes, Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, styles.cancelButton]}
              onPress={() => setDeleteConfirmVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  bannerList: {
    marginBottom: 20,
  },
  bannerItem: {
    marginBottom: 10,
  },
  bannerImage: {
    width: '100%',
    height: 150,
  },
  bannerDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  bannerEndTime: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  datePickerButton: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerButtonText: {
    color: '#888',
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#FF4500',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  previewImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  previewDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  previewEndTime: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  cancelButton: {
    backgroundColor: '#FF4500',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
});
// Ignore specific log notifications
LogBox.ignoreLogs([
  'Warning: Unknown: Support for defaultProps will be removed from memo components in a future major release.'
]);

export default AdminBannerScreen;
