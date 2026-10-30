import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import Button from './Button';

function PlanCard({ plan, onSubscribe, loading }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Ionicons name={plan.icon} size={28} color={colors.primary} />
      </View>
      <Text style={styles.name}>{plan.name}</Text>
      <Text style={styles.description}>{plan.description}</Text>
      <Text style={styles.price}>{plan.priceLabel}</Text>
      <Text style={styles.annual}>{plan.annualLabel}</Text>

      <View style={styles.features}>
        {plan.features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <Button title={plan.ctaLabel} onPress={() => onSubscribe(plan.id)} loading={loading} />
    </View>
  );
}

export default React.memo(PlanCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  name: { ...typography.h3, color: colors.textPrimary },
  description: { ...typography.body, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.sm },
  price: { ...typography.h2, color: colors.primary },
  annual: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
  features: { marginBottom: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  featureText: { ...typography.small, color: colors.textPrimary, marginLeft: spacing.xs, flex: 1 },
});
