import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import GradientHeader from '../../components/GradientHeader';
import ScreenContainer from '../../components/ScreenContainer';
import { CONTACT } from '../../services/config';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

function ContactRow({ icon, label, value, url }) {
  const handlePress = async () => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Não foi possível abrir o link', url);
    }
  };
  return (
    <TouchableOpacity style={styles.row} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <Ionicons name="open-outline" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function HelpScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <GradientHeader title="Ajuda" showBack onBack={() => navigation.goBack()} />
      <ScreenContainer scroll style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Text style={styles.intro}>Precisa de ajuda ou quer enviar uma sugestão? Fale com a equipe do Keep pelos canais abaixo.</Text>

        <ContactRow icon="mail-outline" label="E-mail da equipe" value={CONTACT.email} url={`mailto:${CONTACT.email}`} />
        <ContactRow icon="logo-github" label="GitHub do projeto" value={CONTACT.github} url={CONTACT.github} />
        <ContactRow icon="logo-instagram" label="Instagram do Keep" value={CONTACT.instagramHandle} url={CONTACT.instagramUrl} />
        <ContactRow icon="link-outline" label="Link do Instagram" value={CONTACT.instagramUrl} url={CONTACT.instagramUrl} />

        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>QR Code do Instagram</Text>
          <View style={styles.qrBox}>
            <QRCode value={CONTACT.instagramUrl} size={160} color={colors.textPrimary} backgroundColor={colors.white} />
          </View>
          <Text style={styles.qrHint}>Aponte a câmera do celular para abrir o perfil do Keep.</Text>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { backgroundColor: 'transparent' },
  bodyContent: { padding: spacing.md, marginTop: -spacing.lg, paddingBottom: 120 },
  intro: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.md, marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowText: { flex: 1, marginRight: spacing.sm },
  rowLabel: { ...typography.smallSemibold, color: colors.textPrimary },
  rowValue: { ...typography.small, color: colors.primary, marginTop: 1 },
  qrCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  qrTitle: { ...typography.bodySemibold, color: colors.textPrimary, marginBottom: spacing.md },
  qrBox: { padding: spacing.sm, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  qrHint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
});
