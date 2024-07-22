import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Button } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface UserProfileProps {
  profile: {
    profileImageUrl?: string;
    phone: string;
    surname: string;
    username: string;
    gender?: string;
    birthday: string;
    email: string;
  };
  onSaveProfile: (updatedProfile: any) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ profile, onSaveProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState(profile);

  const handleInputChange = (field: string, value: string) => {
    setUpdatedProfile({ ...updatedProfile, [field]: value });
  };

  const handleSave = () => {
    onSaveProfile(updatedProfile);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="crown" size={60} color="gold" style={styles.crownIcon} />
        <Image source={profile.profileImageUrl ? { uri: profile.profileImageUrl } : require('../../assets/images/favicon.png')} style={styles.profileImage} />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>My mobile number</Text>
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
        <Text style={styles.label}>My full name</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={`${updatedProfile.surname} ${updatedProfile.username}`}
            onChangeText={(value) => {
              const [surname, username] = value.split(' ');
              handleInputChange('surname', surname || '');
              handleInputChange('username', username || '');
            }}
          />
        ) : (
          <Text style={styles.value}>{`${profile.surname} ${profile.username}`}</Text>
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

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email address</Text>
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

      {isEditing ? (
        <View style={styles.buttonContainer}>
          <Button title="Save" onPress={handleSave} />
          <Button title="Cancel" onPress={() => setIsEditing(false)} />
        </View>
      ) : (
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    top: 60,
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    top: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  crownIcon: {
    bottom: 80,
    position: 'absolute',
  },
  fieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  editableValue: {
    fontSize: 16,
    color: 'red',
  },
  input: {
    fontSize: 16,
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 4,
    width: '50%',
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 5,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default UserProfile;
