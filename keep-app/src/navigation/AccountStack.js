import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountScreen from '../screens/Settings/AccountScreen';
import NotificationSettingsScreen from '../screens/Settings/NotificationSettingsScreen';
import PlansScreen from '../screens/Settings/PlansScreen';
import ProfileScreen from '../screens/Settings/ProfileScreen';
import HelpScreen from '../screens/Settings/HelpScreen';

const Stack = createNativeStackNavigator();

export default function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AccountHome">
      <Stack.Screen name="AccountHome" component={AccountScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Plans" component={PlansScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
}
