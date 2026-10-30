import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListsScreen from '../screens/Lists/ListsScreen';
import ListDetailScreen from '../screens/Lists/ListDetailScreen';

const Stack = createNativeStackNavigator();

export default function ListsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="ListsHome">
      <Stack.Screen name="ListsHome" component={ListsScreen} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
    </Stack.Navigator>
  );
}
