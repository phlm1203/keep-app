import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReportsScreen from '../screens/Reports/ReportsScreen';

const Stack = createNativeStackNavigator();

export default function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="ReportsHome">
      <Stack.Screen name="ReportsHome" component={ReportsScreen} />
    </Stack.Navigator>
  );
}
