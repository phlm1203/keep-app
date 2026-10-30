import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KeepWordmark from '../../components/KeepWordmark';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { continueAsGuest } = useAuth();

  return (
    <View style={styles.container}>
      <View style={[styles.top, { paddingTop: insets.top + 56 }]}>
        <KeepWordmark size={60} />
        <Text style={styles.tagline}>keep it safe</Text>
      </View>

      <View style={[styles.card, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={styles.welcomeText}>Bem-vindo(a) ao keep</Text>

        <Button title="Entrar" onPress={() => navigation.navigate('Login')} style={[styles.button, styles.shadow]} />
        <Button
          title="Cadastre-se"
          variant="outline"
          textColor={colors.primary}
          onPress={() => navigation.navigate('SignUp')}
          style={[styles.button, styles.shadow, styles.secondary]}
        />

        <TouchableOpacity onPress={continueAsGuest} style={styles.guestLink} hitSlop={8}>
          <Text style={styles.guestText}>Continuar sem cadastro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brandOrange },
  top: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  tagline: { ...typography.bodySemibold, fontSize: 18, color: colors.white, marginTop: spacing.md },
  card: {
    minHeight: '46%',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
  },
  welcomeText: { ...typography.h3, color: '#2D1606', textAlign: 'center', marginBottom: spacing.xl },
  button: { marginBottom: spacing.md },
  secondary: { borderWidth: 0, backgroundColor: '#F7F6F3' },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  guestLink: { alignItems: 'center', marginTop: spacing.xs },
  guestText: { ...typography.smallSemibold, color: colors.textSecondary, textDecorationLine: 'underline' },
});
