import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RecipesScreen from '../screens/Recipes/RecipesScreen';
import RecipeDetailScreen from '../screens/Recipes/RecipeDetailScreen';

const Stack = createNativeStackNavigator();

export default function RecipesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="RecipesHome">
      <Stack.Screen name="RecipesHome" component={RecipesScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
}
