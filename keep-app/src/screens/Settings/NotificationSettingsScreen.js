import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert, Linking } from 'react-native';
import GradientHeader from '../../components/GradientHeader';
import ScreenContainer from '../../components/ScreenContainer';
import { useAuth } from '../../context/AuthContext';
import { requestNotificationPermission, hasNotificationPermission } from '../../services/notificationsService';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

export default function NotificationSettingsScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [enabled, setEnabled] = useState(user?.notificationsEnabled ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const isGuest = !!user?.isGuest;

  const handleToggle = useCallback(
    async (value) => {
      setIsSaving(true);
      try {
        if (value) {
          const allowed = (await hasNotificationPermission()) || (await requestNotificationPermission());
          if (!allowed) {
            Alert.alert(
              'Permissão necessária',
              'Permita as notificações do Keep nas configurações do aparelho para receber os avisos de validade.',
              [
                { text: 'Agora não', style: 'cancel' },
                { text: 'Abrir configurações', onPress: () => Linking.openSettings?.() },
              ]
            );
            return;
          }
        }
        setEnabled(value);
        await updateUser({ notificationsEnabled: value });
      } catch (e) {
        setEnabled(!value);
        Alert.alert('Não foi possível salvar', e.message);
      } finally {
        setIsSaving(false);
      }
    },
    [updateUser]
  );

  return (
    <View style={styles.container}>
      <GradientHeader title="Notificações" showBack onBack={() => navigation.goBack()} />
      <ScreenContainer style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Alertas de validade</Text>
            <Text style={styles.rowDescription}>
              {isGuest
                ? 'Crie uma conta para receber avisos quando um produto estiver perto de vencer.'
                : 'Receba um aviso às 9h, 3 dias antes e no dia em que cada produto vencer.'}
            </Text>
          </View>
          <Switch
            value={enabled && !isGuest}
            onValueChange={handleToggle}
            disabled={isSaving || isGuest}
            trackColor={{ false: colors.disabled, true: colors.primarySoft }}
            thumbColor={enabled ? colors.primary : colors.white}
          />
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { backgroundColor: 'transparent' },
  bodyContent: { padding: spacing.md, marginTop: -spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  rowText: { flex: 1, marginRight: spacing.md },
  rowTitle: { ...typography.bodySemibold, color: colors.textPrimary },
  rowDescription: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
});
