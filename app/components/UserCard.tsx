import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
import QRCode from 'react-native-qrcode-svg';
import { UserProfile } from '../services/userService'; // Ensure the import path is correct

interface UserCardProps {
  user: UserProfile;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <ImageBackground
      source={require('../../assets/images/Picture1.png')} // Replace with your background image URL
      style={styles.backgroundImage}
    >
      <BlurView intensity={50} style={styles.blurContainer}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Image 
              source={{ uri: 'https://example.com/path/to/profile-pic.jpg' }} // Replace with user's actual profile picture URL
              style={styles.profilePic}
            />
            <QRCode value={user.uid} size={100} />
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
});

export default UserCard;
