import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Button } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';

interface UserProfileProps {
  profile: {
    profileImageUrl?: string;
    phone: string;
    surname: string;
    username: string;
    gender?: string;
    birthday: string;
    email: string;
    createdAt?: any; // Ensure the createdAt field is optional
  };
  onSaveProfile: (updatedProfile: any) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ profile, onSaveProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState(profile);
  const [joinDate, setJoinDate] = useState('');

  useEffect(() => {
    if (profile.createdAt) {
      const formattedJoinDate = moment(profile.createdAt.toDate()).format('MMMM DD, YYYY');
      setJoinDate(formattedJoinDate);
    }
  }, [profile.createdAt]);

  const handleInputChange = (field: string, value: string) => {
    setUpdatedProfile({ ...updatedProfile, [field]: value });
  };

  const handleSave = () => {
    onSaveProfile(updatedProfile);
    setIsEditing(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image source={profile.profileImageUrl ? { uri: profile.profileImageUrl } : require('../../assets/images/favicon.png')} style={styles.profileImage} />
          {isEditing && (
            <TouchableOpacity style={styles.cameraIconContainer}>
              <MaterialCommunityIcons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.username}>{`${profile.surname} ${profile.username}`}</Text>
        <Text style={styles.joinDate}>Joined {joinDate}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Phone Number</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={updatedProfile.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
            />
          ) : (
            <Text style={styles.value}>{profile.phone}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={updatedProfile.email}
              onChangeText={(value) => handleInputChange('email', value)}
            />
          ) : (
            <Text style={styles.value}>{profile.email}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
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
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,

    padding: 10,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  input: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 5,
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
  
});

export default UserProfile;
