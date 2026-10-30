import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AuthHeader from '../../components/AuthHeader';
import Input from '../../components/Input';
import Button from '../../components/Button';
import GoogleButton from '../../components/GoogleButton';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

export default function LoginScreen({ navigation }) {
  const { login, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [email, password, login]);

  const handleGoogle = useCallback(async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e.message);
    } finally {
      setGoogleLoading(false);
    }
  }, [signInWithGoogle]);

  return (
    <View style={styles.container}>
      <AuthHeader title="Bem-Vindo de volta" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" />
            <Input label="Senha" value={password} onChangeText={setPassword} placeholder="Sua senha" secureTextEntry error={error} />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} hitSlop={6} style={styles.forgotLink}>
              <Text style={styles.forgotText}>Esqueceu a senha? Clique aqui</Text>
            </TouchableOpacity>

            <Button title="Entrar" onPress={handleLogin} loading={loading} disabled={!email || !password} style={styles.mainButton} />
            <GoogleButton onPress={handleGoogle} loading={googleLoading} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.signUpLink}>
            <Text style={styles.signUpText}>
              Não tem conta? <Text style={styles.signUpTextBold}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.md, paddingTop: spacing.xl },
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
  forgotLink: { marginBottom: spacing.lg },
  forgotText: { ...typography.caption, color: colors.textMuted },
  mainButton: { marginBottom: spacing.sm },
  signUpLink: { alignItems: 'center', marginTop: spacing.lg },
  signUpText: { ...typography.small, color: colors.textSecondary },
  signUpTextBold: { color: colors.primary, fontFamily: typography.smallSemibold.fontFamily },
});
