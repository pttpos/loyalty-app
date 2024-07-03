import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import QRCodeGenerator from "../components/QRCodeGenerator";
import { auth } from "../services/firebase";

const UserHomeScreen = () => {
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, User!</Text>
      <QRCodeGenerator />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default UserHomeScreen;
