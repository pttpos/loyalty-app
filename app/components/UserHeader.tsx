// components/UserHeader.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface UserHeaderProps {
  points: number;
  userName: string | null;
  sureName: string | null;
  phone: string | null;
}

const UserHeader: React.FC<UserHeaderProps> = ({ points, userName, sureName, phone }) => {
  return (
    <View style={styles.header}>
      <Image source={require('../../assets/images/logo_Station.png')} style={styles.logo} />
      <Text style={styles.title}>Loyalty Balance</Text>
      <View style={styles.pointsRow}>
        <Text style={styles.points}>{points.toFixed(2)}pts</Text>
        <Text style={styles.subtitle}>1200 points till your next reward</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{sureName} {userName}</Text>
        <Text style={styles.userCard}>{phone}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 50,
    backgroundColor: "#6A0DAD",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    width: "90%",
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative', // Allow positioning of logo
  },
  logo: {
    width: 100,
    height: 20,
    position: 'absolute',
    top: 5,
    left: 10,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    textAlign: 'center',
  },
  pointsRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  points: {
    fontSize: 36,
    color: "#FFD700",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  userName: {
    color: "#fff",
    fontSize: 16,
  },
  userCard: {
    color: "#fff",
    fontSize: 16,
  },
});

export default UserHeader;
