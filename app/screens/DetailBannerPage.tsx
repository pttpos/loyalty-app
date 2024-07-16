import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type RootStackParamList = {
  DetailBannerPage: { bannerId: string };
};

type DetailBannerPageRouteProp = RouteProp<RootStackParamList, 'DetailBannerPage'>;

const DetailBannerPage = () => {
  const route = useRoute<DetailBannerPageRouteProp>();
  const { bannerId } = route.params;
  const [banner, setBanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const bannerRef = doc(db, 'banners', bannerId);
        const bannerDoc = await getDoc(bannerRef);
        if (bannerDoc.exists()) {
          setBanner(bannerDoc.data());
        } else {
          console.error('Banner not found');
        }
      } catch (error) {
        console.error('Error fetching banner:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [bannerId]);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  if (!banner) {
    return <Text style={styles.errorText}>Banner not found</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Banner Details</Text>
      </View>
      <TouchableOpacity onPress={toggleModal}>
        <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.description}>{banner.description}</Text>
        {banner.endTime && (
          <Text style={styles.endTime}>Ends on: {new Date(banner.endTime).toLocaleString()}</Text>
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
            <MaterialCommunityIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: banner.imageUrl }} style={styles.fullscreenImage} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E90FF',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  backButton: {
    top: 10,
    marginRight: 10,
  },
  headerTitle: {
    top: 10,
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  bannerImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 18,
    marginBottom: 10,
  },
  endTime: {
    fontSize: 14,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
});

export default DetailBannerPage;
