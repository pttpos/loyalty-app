import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import UserHomeScreen from './screens/UserHomeScreen';
import AdminHomeScreen from './screens/AdminHomeScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import AdminBannerScreen from './screens/AdminBannerScreen';
import DetailBannerPage from './screens/DetailBannerPage';
import DetailHorizontalBannerPage from './screens/DetailHorizontalBannerPage';
import HomePage from './screens/HomePage';
import POSScreen from './screens/POSScreen';
import HorizontalBannerAdminScreen from './screens/HorizontalBannerAdminScreen';
import CustomDrawerContent from './components/CustomDrawerContent';
import { LogBox } from 'react-native';
import ChangePrice from './components/ChangePrice'; // Adjust the path as needed
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
import './index.css';
const AdminDrawerNavigator = () => (
  <Drawer.Navigator
    initialRouteName="AdminHomeScreen"
    drawerContent={(props) => <CustomDrawerContent {...props} />}
  >
    <Drawer.Screen name="AdminHomeScreen" component={AdminHomeScreen} />
    <Drawer.Screen name="AdminBannerScreen" component={AdminBannerScreen} />
    <Drawer.Screen name="POSScreen" component={POSScreen} />
    <Drawer.Screen name="HorizontalBannerAdminScreen" component={HorizontalBannerAdminScreen} />
  </Drawer.Navigator>
);

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="UserHomeScreen" component={UserHomeScreen} />
        <Stack.Screen name="Admin" component={AdminDrawerNavigator} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        <Stack.Screen name="HomePage" component={HomePage} />
        <Stack.Screen name="DetailBannerPage" component={DetailBannerPage} />
        <Stack.Screen name="DetailHorizontalBannerPage" component={DetailHorizontalBannerPage} />
        <Stack.Screen name="ChangePrice" component={ChangePrice} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

LogBox.ignoreLogs([
  'BarCodeScanner has been deprecated',
  '@firebase/auth',
]);

export default App;
