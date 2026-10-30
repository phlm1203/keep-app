import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { radius } from '../theme/spacing';

// Tenta usar o ícone real da marca. Se o asset não estiver disponível no
// ambiente (ex.: Expo Snack sem os binários enviados), cai para um ícone
// vetorial equivalente, sem quebrar a tela.
let logoSource = null;
try {
  logoSource = require('../../assets/logo.png');
} catch (e) {
  logoSource = null;
}

export default function BrandLogo({ size = 96 }) {
  if (logoSource) {
    return <Image source={logoSource} style={{ width: size, height: size }} resizeMode="contain" />;
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size * 0.22 },
      ]}
    >
      <Ionicons name="checkmark-circle" size={size * 0.55} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
});
