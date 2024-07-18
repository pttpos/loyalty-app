import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, Image, TouchableOpacity, Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

interface Banner {
  id: string;
  imageUrl: string;
}

interface HorizontalScrollBannerProps {
  banners: Banner[];
  onBannerPress: (bannerId: string) => void;
}

const HorizontalScrollBanner: React.FC<HorizontalScrollBannerProps> = ({ banners, onBannerPress }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [throttledIndex, setThrottledIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, banners.length]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setThrottledIndex(currentIndex);
    }, 200); // Throttle state update to every 200ms

    return () => clearTimeout(timeout);
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {banners.map((banner) => (
          <TouchableOpacity key={banner.id} onPress={() => onBannerPress(banner.id)} style={styles.bannerWrapper}>
            <Image source={{ uri: banner.imageUrl }} style={styles.banner} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.indicatorContainer}>
        {banners.map((_, index) => (
          <View key={index} style={[styles.indicator, throttledIndex === index && styles.activeIndicator]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10, // Adjust the margin as needed
  },
  scrollView: {
    borderRadius: 10,
  },
  bannerWrapper: {
    width: width - 40, // Adjust the width as needed
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: 150, // Adjust the height to make the banner smaller
    borderRadius: 10,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  indicator: {
    width: 6, // Adjust the width of the indicators
    height: 6, // Adjust the height of the indicators
    borderRadius: 3,
    backgroundColor: '#888',
    marginHorizontal: 3, // Adjust the margin between indicators
  },
  activeIndicator: {
    backgroundColor: '#000',
  },
});

export default HorizontalScrollBanner;
