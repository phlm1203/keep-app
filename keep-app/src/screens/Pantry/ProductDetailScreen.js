import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../components/GradientHeader';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import StatusDot from '../../components/StatusDot';
import { usePantry } from '../../context/PantryContext';
import { useAuth } from '../../context/AuthContext';
import * as productsService from '../../services/productsService';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';
import { formatDateBR, getExpiryStatus } from '../../utils/date';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { user } = useAuth();
  const { products, updateQuantity, discardProduct } = usePantry();
  const [product, setProduct] = useState(() => products.find((p) => p.id === productId) || null);
  const [isLoading, setIsLoading] = useState(!product);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) return;
    (async () => {
      const found = await productsService.getProductById(user.id, productId);
      setProduct(found);
      setIsLoading(false);
    })();
  }, [productId, product, user.id]);

  const status = product ? getExpiryStatus(product.expiryDate) : 'unknown';
  const isExpired = status === 'expired';

  const handleDiscard = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await discardProduct(productId, 'expired');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Não foi possível descartar', e.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [discardProduct, productId, navigation]);

  const handleQuantityChange = useCallback(
    async (nextQuantity) => {
      if (nextQuantity <= 0) return;
      setIsSubmitting(true);
      try {
        const updated = await updateQuantity(productId, nextQuantity);
        if (updated) setProduct(updated);
      } catch (e) {
        Alert.alert('Não foi possível atualizar', e.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateQuantity, productId]
  );

  if (isLoading || !product) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader title={product.name} showBack onBack={() => navigation.goBack()} />
      <ScreenContainer scroll style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.card}>
          <View style={styles.imageWrapper}>
            {product.imageUrl ? (
              <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
            ) : (
              <Ionicons name="cube-outline" size={48} color={colors.primary} />
            )}
            <View style={styles.dotWrapper}>
              <StatusDot status={status} size={14} />
            </View>
          </View>

          <Text style={styles.name}>{product.name}</Text>

          <InfoRow label="Marca" value={product.brand || '—'} />
          <InfoRow label="Categoria" value={product.category} />
          {product.barcode ? <InfoRow label="Código" value={product.barcode} /> : null}
          <InfoRow label="Comprado em" value={formatDateBR(product.purchaseDate)} />
          <InfoRow label="Val" value={formatDateBR(product.expiryDate)} />

          {isExpired && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Este produto está com a validade expirada. Ingeri-lo pode causar intoxicação e/ou outras complicações.
              </Text>
            </View>
          )}

          {isExpired ? (
            <Button title="Descartar e registrar perda" variant="danger" onPress={handleDiscard} loading={isSubmitting} />
          ) : (
            <View style={styles.stepperRow}>
              <Text style={styles.stepperLabel}>Quantidade</Text>
              <View style={styles.stepper}>
                <Button
                  title="–"
                  variant="outline"
                  style={styles.stepperButton}
                  onPress={() => handleQuantityChange(product.quantity - 1)}
                  disabled={isSubmitting || product.quantity <= 1}
                />
                <Text style={styles.quantity}>{product.quantity}</Text>
                <Button
                  title="+"
                  variant="outline"
                  style={styles.stepperButton}
                  onPress={() => handleQuantityChange(product.quantity + 1)}
                  disabled={isSubmitting}
                />
              </View>
            </View>
          )}
        </View>
      </ScreenContainer>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  body: { backgroundColor: 'transparent' },
  bodyContent: { padding: spacing.md, paddingBottom: 140 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: -spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  imageWrapper: {
    height: 140,
    borderRadius: radius.md,
    backgroundColor: colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  dotWrapper: { position: 'absolute', top: spacing.sm, left: spacing.sm },
  name: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { ...typography.body, color: colors.textSecondary },
  infoValue: { ...typography.bodySemibold, color: colors.textPrimary },
  warningBox: { backgroundColor: colors.dangerLight, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  warningText: { ...typography.small, color: colors.danger },
  stepperRow: { marginTop: spacing.lg, alignItems: 'center' },
  stepperLabel: { ...typography.smallSemibold, color: colors.textSecondary, marginBottom: spacing.sm },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepperButton: { width: 48, paddingHorizontal: 0 },
  quantity: { ...typography.h2, color: colors.textPrimary, marginHorizontal: spacing.lg },
});
