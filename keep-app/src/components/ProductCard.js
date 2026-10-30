import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import StatusDot from './StatusDot';
import { formatDateBR, getExpiryStatus, daysUntil } from '../utils/date';

function ProductCard({ product, onPress, onIncrement, onDecrement }) {
  const status = getExpiryStatus(product.expiryDate);
  const days = daysUntil(product.expiryDate);
  const expiryLabel = formatDateBR(product.expiryDate);
  const isExpired = status === 'expired';

  let statusLabel = '';
  let statusTextColor = colors.textSecondary;

  if (status === 'expired') {
    statusLabel = 'Vencido';
    statusTextColor = colors.danger;
  } else if (status === 'soon') {
    statusLabel = days === 0 ? 'Vence hoje' : `Vence em ${days} dia${days === 1 ? '' : 's'}`;
    statusTextColor = colors.warning;
  }

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <Ionicons name="cube-outline" size={32} color={colors.primary} />
        )}
        <View style={styles.dotWrapper}>
          <StatusDot status={status} />
        </View>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.dateLabel}>Val: {expiryLabel}</Text>
      <Text style={[styles.status, { color: statusTextColor }]}>{statusLabel}</Text>

      {onIncrement && onDecrement && (
        <View style={styles.stepper}>
          <TouchableOpacity style={styles.stepperButton} onPress={onDecrement} disabled={isExpired} hitSlop={4}>
            <Ionicons name="remove" size={16} color={isExpired ? colors.disabled : colors.primary} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{product.quantity}</Text>
          <TouchableOpacity style={styles.stepperButton} onPress={onIncrement} disabled={isExpired} hitSlop={4}>
            <Ionicons name="add" size={16} color={isExpired ? colors.disabled : colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default React.memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imageWrapper: {
    height: 90,
    borderRadius: radius.md,
    backgroundColor: colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  dotWrapper: { position: 'absolute', top: 8, left: 8 },
  name: { ...typography.bodySemibold, color: colors.textPrimary },
  dateLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  status: { ...typography.smallSemibold, marginTop: 2, minHeight: 16 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  stepperButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: { ...typography.bodySemibold, color: colors.textPrimary },
});
