import React from 'react';
import { View, StyleSheet, ActivityIndicator, Button } from 'react-native';
import UserProfile from './UserProfile';

const UserProfileScreen = ({ profile, onClose, onSaveProfile }: { profile: any, onClose: () => void, onSaveProfile: (updatedProfile: any) => void }) => {
  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UserProfile profile={profile} onSaveProfile={onSaveProfile} />
      <Button title="Close" onPress={onClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserProfileScreen;
