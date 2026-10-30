import React from 'react';
import { useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import PantryStack from './PantryStack';
import ListsStack from './ListsStack';
import RecipesStack from './RecipesStack';
import ReportsStack from './ReportsStack';
import AccountStack from './AccountStack';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();

// Barra compacta: só envolve os 5 ícones, com uma pequena margem, e fica centralizada.
const TAB_COUNT = 5;
const TAB_ITEM_WIDTH = 52;
const TAB_BAR_PADDING = 8;
const TAB_BAR_HEIGHT = 46;
const TAB_BAR_WIDTH = TAB_COUNT * TAB_ITEM_WIDTH + TAB_BAR_PADDING * 2;

const TAB_ICONS = {
  Pantry: { active: 'basket', inactive: 'basket-outline' },
  Lists: { active: 'list', inactive: 'list-outline' },
  Recipes: { active: 'restaurant', inactive: 'restaurant-outline' },
  Reports: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  Account: { active: 'person', inactive: 'person-outline' },
};

function renderTabIcon(routeName) {
  return ({ focused, color }) => {
    const iconSet = TAB_ICONS[routeName];
    const name = focused ? iconSet.active : iconSet.inactive;
    return <Ionicons name={name} size={22} color={color} />;
  };
}

export default function MainTabs() {
  const { width } = useWindowDimensions();
  const sideMargin = Math.max((width - TAB_BAR_WIDTH) / 2, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.65)',
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          borderRadius: TAB_BAR_HEIGHT / 2,
          marginHorizontal: sideMargin,
          marginBottom: 16,
          height: TAB_BAR_HEIGHT,
          paddingTop: 0,
          paddingBottom: 0, // sem folga extra embaixo: os ícones ficam centralizados na barra
          paddingHorizontal: TAB_BAR_PADDING,
          position: 'absolute',
          elevation: 6,
        },
        tabBarItemStyle: { height: TAB_BAR_HEIGHT, paddingVertical: 0, justifyContent: 'center', alignItems: 'center' },
        tabBarShowLabel: false,
        tabBarIcon: renderTabIcon(route.name),
      })}
    >
      <Tab.Screen name="Pantry" component={PantryStack} />
      <Tab.Screen name="Lists" component={ListsStack} />
      <Tab.Screen name="Recipes" component={RecipesStack} />
      <Tab.Screen name="Reports" component={ReportsStack} />
      <Tab.Screen name="Account" component={AccountStack} />
    </Tab.Navigator>
  );
}
