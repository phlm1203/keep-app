import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

export default function GradientHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  showProfile = false,
  onProfilePress,
  rightElement,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, Platform.OS === 'web' ? spacing.lg : 0) + spacing.sm }]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.sideButton} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.sideButton} />
        )}

        <View style={styles.titleWrapper}>
          <Text style={[typography.h2, styles.title]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        {showProfile ? (
          <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
            <Ionicons name="person" size={18} color={colors.white} />
          </TouchableOpacity>
        ) : rightElement ? (
          rightElement
        ) : (
          <View style={styles.sideButton} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: { flex: 1, alignItems: 'center' },
  title: { color: colors.white, textAlign: 'center' },
  subtitle: { ...typography.small, color: colors.primaryPale, marginTop: 2 },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
