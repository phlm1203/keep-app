import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import AuthHeader from '../../components/AuthHeader';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

// Aparece quando o usuário abre o link "Redefinir senha" recebido por e-mail.
export default function ResetPasswordScreen() {
  const { completePasswordReset, cancelPasswordReset } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (password.length < 8) {
      setError('A nova senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não conferem.');
      return;
    }
    setLoading(true);
    try {
      await completePasswordReset(password);
      Alert.alert('Senha redefinida', 'Sua senha foi atualizada com sucesso!');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [password, confirm, completePasswordReset]);

  return (
    <View style={styles.container}>
      <AuthHeader title="Nova senha" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Defina sua nova senha</Text>
          <Text style={styles.cardSubtitle}>Use pelo menos 8 caracteres.</Text>
          <Input label="Nova senha" value={password} onChangeText={setPassword} placeholder="Nova senha" secureTextEntry />
          <Input label="Confirmar senha" value={confirm} onChangeText={setConfirm} placeholder="Repita a senha" secureTextEntry error={error} />
          <Button title="Salvar nova senha" onPress={handleSubmit} loading={loading} disabled={!password || !confirm} />
          <Button title="Cancelar" variant="outline" onPress={cancelPasswordReset} style={styles.cancel} />
        </View>
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
  cancel: { marginTop: spacing.sm },
});
