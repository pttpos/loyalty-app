// CustomDrawerContent.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps, DrawerNavigationProp } from '@react-navigation/drawer';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  logoutContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 20,
  },
  logoutButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CustomDrawerContent;
