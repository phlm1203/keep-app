import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AuthHeader from '../../components/AuthHeader';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

export default function ForgotPasswordScreen({ navigation }) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [email, requestPasswordReset]);

  return (
    <View style={styles.container}>
      <AuthHeader title="Recuperar conta" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {sent ? (
          <View style={styles.card}>
            <Text style={styles.sentTitle}>E-mail enviado!</Text>
            <Text style={styles.sentText}>Verifique sua caixa de entrada e o Spam!</Text>
            <Button title="Voltar ao login" onPress={() => navigation.navigate('Login')} />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recuperar conta</Text>
            <Text style={styles.cardSubtitle}>Informe o e-mail para qual deseja redefinir a senha</Text>
            <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" error={error} />
            <Button title="Enviar link" variant="outline" onPress={handleSubmit} loading={loading} disabled={!email} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingTop: spacing.xxl },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  cardSubtitle: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.lg },
  sentTitle: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  sentText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
});
