import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getUserProfile } from '../services/userService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HorizontalScrollBanner from '../components/HorizontalScrollBanner';

const HomePage = () => {
  const navigation = useNavigation<any>();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [horizontalBanners, setHorizontalBanners] = useState<any[]>([]);
  const [greeting, setGreeting] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const bannersSnapshot = await getDocs(collection(db, 'banners'));
        const bannersList = bannersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBanners(bannersList);
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchHorizontalBanners = async () => {
      try {
        const horizontalBannersSnapshot = await getDocs(collection(db, 'banner_horizontal'));
        const horizontalBannersList = horizontalBannersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHorizontalBanners(horizontalBannersList);
      } catch (error) {
        console.error('Error fetching horizontal banners:', error);
      }
    };

    fetchBanners();
    fetchHorizontalBanners();
  }, []);

  const handleBannerPress = (bannerId: string) => {
    navigation.navigate('DetailBannerPage', { bannerId });
  };

  const handleHorizontalBannerPress = (bannerId: string) => {
    navigation.navigate('DetailHorizontalBannerPage', { bannerId });
  };

  const updateTimeAndGreeting = () => {
    const now = new Date();
    const hours = now.getUTCHours() + 7; // Cambodia is UTC+7
    const adjustedHours = hours % 24;

    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${adjustedHours}:${minutes}`;

    if (adjustedHours >= 5 && adjustedHours < 12) {
      setGreeting('Good Morning!');
    } else if (adjustedHours >= 12 && adjustedHours < 17) {
      setGreeting('Good Afternoon!');
    } else if (adjustedHours >= 17 && adjustedHours < 21) {
      setGreeting('Good Evening!');
    } else {
      setGreeting('Good Night!');
    }

    return timeString;
  };

  useEffect(() => {
    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greeting}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.userInfo}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="star" size={18} color="#ffffff" />
              <Text style={styles.points}>{userProfile ? `${userProfile.points} points` : '0 points'}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="ticket" size={18} color="#ffffff" />
              <Text style={styles.vouchers}>0 vouchers</Text>
            </View>
          </View>
          <Image source={require('../../assets/images/favicon.png')} style={styles.profileImage} />
        </View>
      </View>

      <ScrollView style={styles.contentContainer}>
        <HorizontalScrollBanner banners={horizontalBanners} onBannerPress={handleHorizontalBannerPress} />
        <View style={styles.bannerContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#1E90FF" />
          ) : (
            banners.map(banner => (
              <TouchableOpacity key={banner.id} onPress={() => handleBannerPress(banner.id)} style={styles.bannerWrapper}>
                <Image source={{ uri: banner.imageUrl }} style={styles.banner} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="home" size={24} color="#ffffff" />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="credit-card" size={24} color="#ffffff" />
          <Text style={styles.menuText}>Card</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('UserHomeScreen')}>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#ffffff" />
          <Text style={styles.menuText}>QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="gift" size={24} color="#ffffff" />
          <Text style={styles.menuText}>Redeem</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 10,
    backgroundColor: '#ff0000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 100,
    zIndex: 1,
    position: 'absolute',
    top: 0,
  },
  headerLeft: {
    top: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    top: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    color: '#ffffff',
    fontSize: 18,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  userInfo: {
    flexDirection: 'column',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  points: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 5,
  },
  vouchers: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 5,
  },
  contentContainer: {
    flex: 1,
    marginTop: 110,
    marginBottom: 70,
  },
  bannerContainer: {
    padding: 10,
  },
  bannerWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  banner: {
    width: '100%',
    height: 250,
    borderRadius: 10,
  },
  bannerDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 5,
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#ff0000',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 75,
    alignItems: 'center',
  },
  menuItem: {
    alignItems: 'center',
  },
  menuText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default HomePage;
