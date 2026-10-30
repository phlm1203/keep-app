import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PantryScreen from '../screens/Pantry/PantryScreen';
import ProductDetailScreen from '../screens/Pantry/ProductDetailScreen';
import AddProductChoiceScreen from '../screens/Pantry/AddProductChoiceScreen';
import AddProductScanScreen from '../screens/Pantry/AddProductScanScreen';
import AddProductManualScreen from '../screens/Pantry/AddProductManualScreen';
import AddProductSuccessScreen from '../screens/Pantry/AddProductSuccessScreen';

const Stack = createNativeStackNavigator();

export default function PantryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="PantryHome">
      <Stack.Screen name="PantryHome" component={PantryScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="AddProductChoice" component={AddProductChoiceScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AddProductScan" component={AddProductScanScreen} />
      <Stack.Screen name="AddProductManual" component={AddProductManualScreen} />
      <Stack.Screen name="AddProductSuccess" component={AddProductSuccessScreen} />
    </Stack.Navigator>
  );
}
