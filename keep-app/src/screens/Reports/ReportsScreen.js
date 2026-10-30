import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import GradientHeader from '../../components/GradientHeader';
import ScreenContainer from '../../components/ScreenContainer';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import * as reportsService from '../../services/reportsService';
import { getPlanRules, planLabel } from '../../utils/permissions';
import { MONTHS_LONG_PT } from '../../utils/date';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

const formatMoney = (value) => `R$${value.toFixed(2).replace('.', ',')}`;

function VerticalBars({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={styles.verticalChart}>
      {data.map((item, index) => (
        <View key={`${item.month}-${index}`} style={styles.verticalColumn}>
          <Text style={styles.barValue}>{item.value}</Text>
          <View style={styles.verticalTrack}>
            <View style={[styles.verticalBar, { height: `${Math.max(4, (item.value / max) * 100)}%` }]} />
          </View>
          <Text style={styles.axisLabel}>{item.month}</Text>
        </View>
      ))}
    </View>
  );
}

function HorizontalBars({ data, labelKey }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View>
      {data.map((item) => (
        <View key={item[labelKey]} style={styles.hRow}>
          <Text style={styles.hLabel} numberOfLines={1}>
            {item[labelKey]}
          </Text>
          <View style={styles.hTrack}>
            <View style={[styles.hBar, { width: `${Math.max(item.value > 0 ? 4 : 0, (item.value / max) * 100)}%` }]} />
          </View>
          <Text style={styles.hValue} numberOfLines={1}>
            {formatMoney(item.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function StatPill({ value, label, color }) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

export default function ReportsScreen({ navigation }) {
  const { user } = useAuth();
  const rules = getPlanRules(user);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  // Recarrega ao entrar na aba: o relatório reflete o que o usuário fez no app (cadastros, descartes, listas).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const data = await reportsService.getSummary(user.id, rules);
          if (active) {
            setSummary(data);
            setError(null);
          }
        } catch (e) {
          if (active) setError(e.message);
        }
      })();
      return () => {
        active = false;
      };
    }, [user.id, rules.reportMonths, rules.reportByCategory])
  );

  if (!summary) {
    return (
      <View style={styles.loading}>
        {error ? <Text style={styles.errorText}>{error}</Text> : <ActivityIndicator color={colors.primary} size="large" />}
      </View>
    );
  }

  const change = summary.monthOverMonthChange;
  const isImproving = change === null || change <= 0;
  const monthName = MONTHS_LONG_PT[new Date().getMonth()];
  const hasAnyLoss = summary.lossHistory.some((h) => h.value > 0) || summary.chart.some((c) => c.value > 0);

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Relatórios"
        subtitle={planLabel(user)}
        showProfile
        onProfilePress={() => navigation.navigate('Account', { screen: 'AccountHome' })}
      />

      <ScreenContainer scroll style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Produtos perdidos por mês (unidades)</Text>
          <VerticalBars data={summary.chart} />
          {!hasAnyLoss ? (
            <Text style={styles.emptyHint}>
              Nenhuma perda registrada ainda. Quando você descartar um produto vencido, ele aparece aqui.
            </Text>
          ) : null}
        </View>

        <View style={styles.pillsRow}>
          <StatPill value={formatMoney(summary.lossValueMonth)} label={`Perdas em ${monthName}`} color={colors.primary} />
          <StatPill value={summary.expiredCount} label="produtos vencidos no mês" color={colors.primary} />
          <StatPill
            value={change === null ? '—' : `${change > 0 ? '+' : ''}${change}%`}
            label="em rel. mês ant."
            color={change === null ? colors.textSecondary : isImproving ? colors.success : colors.danger}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Atividade do mês</Text>
          <View style={styles.statGrid}>
            <StatCard label="Produtos cadastrados" value={summary.activity.registered} />
            <StatCard label="Perto de vencer" value={summary.activity.soon} valueColor={colors.warning} />
          </View>
          <View style={[styles.statGrid, styles.statGridSecond]}>
            <StatCard label="Vencidos na despensa" value={summary.activity.expired} valueColor={colors.danger} />
            <StatCard label="Itens comprados" value={`${summary.activity.bought}/${summary.activity.totalItems}`} />
          </View>
        </View>

        {rules.reportByCategory ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Perdas por Categoria</Text>
            {summary.lossesByCategory.length > 0 ? (
              <HorizontalBars data={summary.lossesByCategory} labelKey="category" />
            ) : (
              <Text style={styles.emptyHint}>Sem perdas no período.</Text>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.lockedCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Account', { screen: 'Plans' })}
          >
            <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
            <Text style={styles.lockedText}>Perdas por categoria estão nos planos Keep Casa e Keep Business. Toque para ver os planos.</Text>
          </TouchableOpacity>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Histórico de perdas (Meses)</Text>
          <HorizontalBars data={summary.lossHistory} labelKey="month" />
          <Text style={styles.footnote}>Informe o preço ao cadastrar um produto para calcular o valor das perdas.</Text>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: spacing.lg },
  errorText: { ...typography.body, color: colors.danger, textAlign: 'center' },
  body: { backgroundColor: 'transparent' },
  bodyContent: { padding: spacing.md, paddingBottom: 120 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: { ...typography.bodySemibold, color: colors.textPrimary, marginBottom: spacing.md },
  emptyHint: { ...typography.small, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  footnote: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  verticalChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 160 },
  verticalColumn: { alignItems: 'center', flex: 1 },
  barValue: { ...typography.caption, color: colors.textSecondary, marginBottom: 2 },
  verticalTrack: { width: 36, height: 110, justifyContent: 'flex-end' },
  verticalBar: { width: '100%', backgroundColor: colors.primarySoft, borderRadius: radius.sm },
  axisLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  pillsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  pill: {
    flex: 1,
    backgroundColor: colors.primaryPale,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  pillValue: { ...typography.h3 },
  pillLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  statGrid: { flexDirection: 'row', gap: spacing.sm },
  statGridSecond: { marginTop: spacing.sm },
  lockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryPale,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  lockedText: { ...typography.small, color: colors.textPrimary, flex: 1 },
  hRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  hLabel: { ...typography.caption, color: colors.textSecondary, width: 68 },
  hTrack: { flex: 1, height: 12, backgroundColor: colors.primaryPale, borderRadius: radius.sm, overflow: 'hidden' },
  hBar: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.sm },
  hValue: { ...typography.caption, color: colors.textPrimary, width: 64, textAlign: 'right' },
});
