import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

export default function StatCard({ label, value, valueColor, backgroundColor }) {
  return (
    <View style={[styles.card, backgroundColor && { backgroundColor }]}>
      <Text style={[styles.value, valueColor && { color: valueColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.primaryPale,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs / 2,
  },
  value: { ...typography.h2, color: colors.primary },
  label: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
});
