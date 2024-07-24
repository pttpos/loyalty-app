import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Modal, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import QRCode from 'react-native-qrcode-svg';
import { UserProfile } from '../services/userService'; // Ensure the import path is correct

interface UserCardProps {
  user: UserProfile;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ImageBackground
      source={require('../../assets/images/Picture1.png')} // Replace with your background image URL
      style={styles.backgroundImage}
    >
      <BlurView intensity={50} style={styles.blurContainer}>
        <View style={styles.card}>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image 
                source={{ uri: user.profileImageUrl }} // Use user's actual profile picture URL
                style={styles.profilePic}
              />
            </TouchableOpacity>
            <View style={styles.qrContainer}>
              <QRCode value={user.uid} size={100} />
            </View>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{user.username} {user.surname}</Text>
            <Text style={styles.field}><Text style={styles.label}>Birth date:</Text> {user.birthday}</Text>
            <Text style={styles.field}><Text style={styles.label}>Phone No.:</Text> {user.phone}</Text>
            <Text style={styles.field}><Text style={styles.label}>Email:</Text> {user.email}</Text>
            <Text style={styles.field}><Text style={styles.label}>Points:</Text> {user.points}</Text>
            <Text style={styles.field}><Text style={styles.label}>Status:</Text> Valid</Text>
            <Text style={styles.field}><Text style={styles.label}>ID No.:</Text> {user.uid}</Text>
          </View>
        </View>
      </BlurView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Image 
            source={{ uri: user.profileImageUrl }} // Use user's actual profile picture URL
            style={styles.modalImage}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  blurContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
    marginVertical: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  qrContainer: {
    padding: 5,
    borderWidth: 2,
    borderColor: '#000', // Change the border color as needed
    borderRadius: 10,
  },
  infoContainer: {
    alignItems: 'flex-start', // Align items to the left
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  field: {
    fontSize: 16,
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default UserCard;
