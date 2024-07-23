import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import UserProfile from './UserProfile';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface UserProfileScreenProps {
  profile: any;
  onClose: () => void;
  onSaveProfile: (updatedProfile: any) => void;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ profile, onClose, onSaveProfile }) => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    const auth = getAuth();
    setLoading(true);
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose} disabled={loading}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          <Text style={styles.backButtonText}>Back to home</Text>
        </TouchableOpacity>
      </View>
      <UserProfile profile={profile} onSaveProfile={onSaveProfile} />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    top: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
  },
  logoutButton: {
    padding: 15,
    backgroundColor: '#dc3545',
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 10,
  },
  logoutButtonText: {
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

export default UserProfileScreen;
