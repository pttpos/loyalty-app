import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserHomeScreen from '../screens/UserHomeScreen';

const Stack = createNativeStackNavigator();

const UserNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="UserHome" component={UserHomeScreen} />
  </Stack.Navigator>
);

export default UserNavigator;
