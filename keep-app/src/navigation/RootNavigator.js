import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AuthStack from './AuthStack';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import MainTabs from './MainTabs';
import { useAuth } from '../context/AuthContext';
import { PantryProvider } from '../context/PantryContext';
import colors from '../theme/colors';

export default function RootNavigator() {
  const { isAuthenticated, isLoading, user, recovery } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // Veio do link "Redefinir senha": mostra só a tela de nova senha até concluir.
  if (recovery) {
    return <ResetPasswordScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <PantryProvider key={user.id}>
          <MainTabs />
        </PantryProvider>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
