import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../../components/GradientHeader';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import FixedFooter, { FOOTER_SPACE } from '../../components/FixedFooter';
import { useAuth } from '../../context/AuthContext';
import { usePantry } from '../../context/PantryContext';
import * as plansService from '../../services/plansService';
import * as listsService from '../../services/listsService';
import { checkPlanChange } from '../../utils/permissions';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

function ComparisonValue({ value }) {
  if (value === true) return <Ionicons name="checkmark" size={14} color={colors.success} />;
  if (value === false) return <Ionicons name="close" size={14} color={colors.danger} />;
  return <Text style={styles.tableValueText}>{value}</Text>;
}

export default function PlansScreen({ navigation }) {
  const { user, changePlan } = useAuth();
  const { products } = usePantry();
  const currentPlan = user?.isGuest ? null : user?.plan;
  const [activeId, setActiveId] = useState(currentPlan || 'freemium');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const plans = plansService.PLANS;

  useEffect(() => {
    if (currentPlan) setActiveId(currentPlan);
  }, [currentPlan]);

  const activePlan = useMemo(() => plans.find((p) => p.id === activeId) || plans[0], [plans, activeId]);
  const isCurrent = activePlan.id === currentPlan;
  const canChange = !!currentPlan; // visitante não tem conta para trocar de plano

  const handleSubscribe = useCallback(async () => {
    setIsSubscribing(true);
    try {
      // Ao reduzir de plano, confere se os produtos/listas cabem nos limites do novo plano.
      const lists = await listsService.getLists(user.id);
      const check = checkPlanChange(activePlan.id, { productCount: products.length, listCount: lists.length });
      if (!check.ok) {
        Alert.alert('Não foi possível mudar de plano', check.message);
        return;
      }
      await changePlan(activePlan.id);
      Alert.alert('Plano atualizado', `Agora você está no ${activePlan.name}.`);
    } catch (e) {
      Alert.alert('Não foi possível mudar de plano', e.message);
    } finally {
      setIsSubscribing(false);
    }
  }, [activePlan, products.length, changePlan, user.id]);

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Escolha seu plano"
        showBack
        onBack={() => navigation.goBack()}
        showProfile
        onProfilePress={() => navigation.navigate('AccountHome')}
      />
      <ScreenContainer scroll style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.tabs}>
          {plans.map((plan) => {
            const isActive = plan.id === activeId;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveId(plan.id)}
                activeOpacity={0.85}
              >
                <Ionicons name={plan.icon} size={14} color={isActive ? colors.primary : colors.textSecondary} />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]} numberOfLines={1}>
                  {plan.name.replace('Keep ', '')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name={activePlan.icon} size={22} color={colors.primary} />
            <Text style={styles.planName}>{activePlan.name}</Text>
            {isCurrent ? (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Plano atual</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.planDescription}>{activePlan.description}</Text>
          <Text style={styles.price}>{activePlan.priceLabel}</Text>
          <Text style={styles.annual}>{activePlan.annualLabel}</Text>

          {activePlan.features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.tableTitle}>Comparativo</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableCellFeature, styles.tableHeaderText]}>Recurso</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Free</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Casa</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Business</Text>
          </View>
          {plansService.PLAN_COMPARISON.map(([feature, free, casa, business]) => (
            <View key={feature} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellFeature]} numberOfLines={2}>
                {feature}
              </Text>
              <View style={styles.tableCell}>
                <ComparisonValue value={free} />
              </View>
              <View style={styles.tableCell}>
                <ComparisonValue value={casa} />
              </View>
              <View style={styles.tableCell}>
                <ComparisonValue value={business} />
              </View>
            </View>
          ))}
        </View>
      </ScreenContainer>

      {/* Botão sempre visível: fica fixo acima da barra de abas (antes ficava escondido no fim da rolagem). */}
      <FixedFooter>
        <Button
          title={isCurrent ? 'Plano atual' : activePlan.ctaLabel}
          onPress={handleSubscribe}
          loading={isSubscribing}
          disabled={isCurrent || !canChange}
        />
        {!canChange ? <Text style={styles.guestNote}>Crie uma conta para escolher um plano.</Text> : null}
      </FixedFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { backgroundColor: 'transparent' },
  bodyContent: { padding: spacing.md, marginTop: -spacing.lg, paddingBottom: FOOTER_SPACE },
  tabs: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: 8,
  },
  tabActive: { borderColor: colors.primary, backgroundColor: colors.primaryPale },
  tabText: { ...typography.caption, color: colors.textSecondary },
  tabTextActive: { color: colors.primary, fontFamily: typography.smallSemibold.fontFamily },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  planName: { ...typography.h3, color: colors.textPrimary, flex: 1 },
  currentBadge: { backgroundColor: colors.successLight, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  currentBadgeText: { ...typography.caption, color: colors.success },
  planDescription: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  price: { ...typography.h2, color: colors.primary, marginTop: spacing.sm },
  annual: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  featureText: { ...typography.small, color: colors.textPrimary, flex: 1 },
  tableTitle: { ...typography.bodySemibold, color: colors.textPrimary, marginBottom: spacing.sm },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primaryPale,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tableCellFeature: { flex: 2, alignItems: 'flex-start', ...typography.caption, color: colors.textPrimary },
  tableHeaderText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  tableValueText: { ...typography.caption, color: colors.textPrimary, textAlign: 'center' },
  guestNote: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
});
