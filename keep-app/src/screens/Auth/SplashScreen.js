import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import BrandLogo from '../../components/BrandLogo';
import KeepWordmark from '../../components/KeepWordmark';
import colors from '../../theme/colors';
import { spacing } from '../../theme/spacing';

// Tempo que a tela de abertura fica visível antes de ir para as boas-vindas.
export const SPLASH_DURATION_MS = 3000;

export default function SplashScreen({ navigation }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [navigation, opacity, scale]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <BrandLogo size={108} />
        <View style={styles.wordmark}>
          <KeepWordmark size={64} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandOrange },
  content: { alignItems: 'center' },
  wordmark: { marginTop: spacing.lg },
});
