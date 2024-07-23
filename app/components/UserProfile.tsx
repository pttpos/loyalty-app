import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import moment from 'moment';
import { auth, storage } from '../services/firebase';
import { getUserProfile, updateUserProfile } from '../services/userService';

interface UserProfileProps {
  profile: {
    uid: string;
    profileImageUrl?: string;
    phone: string;
    surname: string;
    username: string;
    gender?: string;
    birthday: string;
    email: string;
    createdAt?: any;
  };
  onSaveProfile: (updatedProfile: any) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ profile, onSaveProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState(profile);
  const [joinDate, setJoinDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile.createdAt) {
      const formattedJoinDate = moment(
        profile.createdAt instanceof Date
          ? profile.createdAt
          : profile.createdAt.toDate()
      ).format('MMMM DD, YYYY');
      setJoinDate(formattedJoinDate);
    }
  }, [profile.createdAt]);

  const handleInputChange = (field: string, value: string) => {
    setUpdatedProfile({ ...updatedProfile, [field]: value });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      uploadImage(uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const user = auth.currentUser;

      if (!user) {
        console.error('User is not authenticated.');
        Alert.alert('Error', 'User is not authenticated.');
        setLoading(false);
        return;
      }

      const userId = user.uid;
      const imageRef = ref(storage, `profileImages/${userId}.jpg`);
      console.log('Uploading image to:', imageRef.fullPath);

      uploadBytes(imageRef, blob).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadURL) => {
          console.log('Image uploaded. Download URL:', downloadURL);
          handleInputChange('profileImageUrl', downloadURL);
          setLoading(false);
        }).catch((error) => {
          console.error('Error getting download URL:', error);
          setLoading(false);
        });
      }).catch((error) => {
        console.error('Error uploading image:', error);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error in uploadImage:', error);
      Alert.alert('Error', 'Failed to upload image');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSaveProfile(updatedProfile);
      const user = auth.currentUser;
      if (user) {
        await updateUserProfile(user.uid, updatedProfile);
      }
      setLoading(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image source={updatedProfile.profileImageUrl ? { uri: updatedProfile.profileImageUrl } : require('../../assets/images/favicon.png')} style={styles.profileImage} />
          {isEditing && (
            <TouchableOpacity style={styles.cameraIconContainer} onPress={pickImage}>
              <MaterialCommunityIcons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.username}>{`${profile.surname} ${profile.username}`}</Text>
        <Text style={styles.joinDate}>Joined {joinDate}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.fieldContainer}>
          <MaterialCommunityIcons name="phone" size={20} color="#888" style={styles.icon} />
          <Text style={styles.label}>Phone Number</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={updatedProfile.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>{profile.phone}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <MaterialCommunityIcons name="email" size={20} color="#888" style={styles.icon} />
          <Text style={styles.label}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={updatedProfile.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
            />
          ) : (
            <Text style={styles.value}>{profile.email}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <MaterialCommunityIcons name="gender-male-female" size={20} color="#888" style={styles.icon} />
          <Text style={styles.label}>Gender</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={updatedProfile.gender}
              onChangeText={(value) => handleInputChange('gender', value)}
            />
          ) : (
            <Text style={styles.value}>{profile.gender || 'Male'}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <MaterialCommunityIcons name="calendar" size={20} color="#888" style={styles.icon} />
          <Text style={styles.label}>Birthday</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={updatedProfile.birthday}
              onChangeText={(value) => handleInputChange('birthday', value)}
            />
          ) : (
            <Text style={styles.value}>{profile.birthday}</Text>
          )}
        </View>
      </View>

      {isEditing ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)} disabled={loading}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    top:30,
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#1E90FF',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#1E90FF',
    padding: 8,
    borderRadius: 50,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  joinDate: {
    fontSize: 14,
    color: '#888',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    flex: 2,
  },
  input: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 5,
    flex: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  saveButton: {
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 30,
    alignItems: 'center',
    width: '40%',
  },
  cancelButton: {
    padding: 15,
    backgroundColor: '#dc3545',
    borderRadius: 30,
    alignItems: 'center',
    width: '40%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 15,
    backgroundColor: '#1E90FF',
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserProfile;
