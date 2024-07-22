// app/screens/MapScreen.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import BottomMenu from '../components/BottomMenu';

const MapScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.webviewContainer}>
        <WebView
          source={{ uri: 'https://pttpos.github.io/PTT_STATION_MAP/' }}
          style={styles.webview}
        />
      </View>
      <View style={styles.bottomMenuContainer}>
        <BottomMenu />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webviewContainer: {
    flex: 1, // Take up all available space except for the bottom menu
  },
  bottomMenuContainer: {
    height: 75, // Adjust the height based on your BottomMenu component
  },
  webview: {
    flex: 1,
  },
});

export default MapScreen;
