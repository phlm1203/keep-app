import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

function MenuRow({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={icon} size={18} color={colors.textPrimary} style={styles.menuIcon} />
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function AccountScreen({ navigation }) {
  const { user, isGuest, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(() => {
    Alert.alert(
      isGuest ? 'Sair do modo visitante' : 'Sair da conta',
      isGuest
        ? 'Seus dados desta sessão não foram salvos em nenhuma conta. Deseja sair mesmo assim?'
        : 'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  }, [logout, isGuest]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={styles.avatar}>
          <Ionicons name={isGuest ? 'person-outline' : 'person'} size={34} color={colors.white} />
        </View>
      </View>

      <ScreenContainer scroll style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Text style={styles.name}>{isGuest ? 'Visitante' : `${user?.firstName} ${user?.lastName}`}</Text>
        <Text style={styles.email}>{isGuest ? 'Navegando sem cadastro' : user?.email}</Text>

        {isGuest ? (
          <View style={styles.guestBanner}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.guestBannerText}>
              Você está usando o Keep sem cadastro. Seus produtos e listas somem ao sair. Crie uma conta para
              salvar seus dados.
            </Text>
            <Button
              title="Criar conta"
              variant="outline"
              textColor={colors.primary}
              onPress={logout}
              style={styles.guestBannerButton}
            />
          </View>
        ) : (
          <View style={styles.menu}>
            <MenuRow icon="person-outline" label="Meu perfil" onPress={() => navigation.navigate('Profile')} />
            <MenuRow icon="notifications-outline" label="Notificações" onPress={() => navigation.navigate('NotificationSettings')} />
            <MenuRow icon="help-circle-outline" label="Ajuda" onPress={() => navigation.navigate('Help')} />
            <MenuRow icon="ribbon-outline" label="Planos" onPress={() => navigation.navigate('Plans')} />
          </View>
        )}

        <Button
          title={isGuest ? 'Sair do modo visitante' : 'Sair da conta'}
          variant="outline"
          onPress={handleLogout}
          loading={isLoggingOut}
        />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerTitle: { ...typography.h3, color: colors.white, marginBottom: spacing.md },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -spacing.xxl,
  },
  body: { backgroundColor: 'transparent' },
  bodyContent: { padding: spacing.md, paddingTop: spacing.xxl, paddingBottom: 120 },
  name: { ...typography.h3, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.sm },
  email: { ...typography.small, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  menu: { marginBottom: spacing.xl },
  guestBanner: {
    backgroundColor: colors.primaryPale,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  guestBannerText: {
    ...typography.small,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  guestBannerButton: { alignSelf: 'stretch' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  menuIcon: { marginRight: spacing.md },
  menuLabel: { flex: 1, ...typography.body, color: colors.textPrimary },
});
