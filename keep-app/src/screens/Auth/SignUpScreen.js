import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AuthHeader from '../../components/AuthHeader';
import Input from '../../components/Input';
import Button from '../../components/Button';
import GoogleButton from '../../components/GoogleButton';
import Checkbox from '../../components/Checkbox';
import { useAuth } from '../../context/AuthContext';
import { PLANS } from '../../services/plansService';
import { maskPhone, maskDateBR, isValidPhone, isValidEmail } from '../../utils/masks';
import { brToISO, parseISODate } from '../../utils/date';
import colors from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

function PlanOption({ plan, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.planOption, selected && styles.planOptionSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
      <View style={styles.planInfo}>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planDescription}>{plan.description}</Text>
      </View>
      <Text style={styles.planPrice}>{plan.priceLabel}</Text>
    </TouchableOpacity>
  );
}

export default function SignUpScreen({ navigation }) {
  const { signUp, signInWithGoogle } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [plan, setPlan] = useState('freemium');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const birthISO = brToISO(birthDate);
  const birthInvalid =
    birthDate.length > 0 && (!birthISO || parseISODate(birthISO).getTime() > Date.now());
  const phoneInvalid = phone.length > 0 && !isValidPhone(phone);
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const isValid =
    firstName.trim() &&
    lastName.trim() &&
    isValidEmail(email) &&
    password.length >= 8 &&
    password === confirmPassword &&
    !birthInvalid &&
    !phoneInvalid &&
    acceptedTerms;

  const handleSignUp = useCallback(async () => {
    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await signUp({
        firstName,
        lastName,
        email,
        phone,
        birthDate: birthISO,
        password,
        plan,
      });
      if (result.needsConfirmation) {
        Alert.alert(
          'Confirme seu e-mail',
          `Enviamos um link de confirmação para ${email.trim()}. Depois de confirmar, é só entrar.`,
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
      // Sem confirmação de e-mail: a sessão é criada e o app troca de tela sozinho.
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, email, phone, birthISO, password, confirmPassword, plan, signUp, navigation]);

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
      <AuthHeader title="Crie sua conta" subtitle="Antes de ir, cadastre-se e reduza o desperdício" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.half}>
                <Input label="Nome" value={firstName} onChangeText={setFirstName} placeholder="Ex: Maria" autoCapitalize="words" />
              </View>
              <View style={styles.half}>
                <Input label="Sobrenome" value={lastName} onChangeText={setLastName} placeholder="Ex: Silva" autoCapitalize="words" />
              </View>
            </View>

            <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" />
            <Input
              label="Celular"
              value={phone}
              onChangeText={(text) => setPhone(maskPhone(text))}
              placeholder="(11) 90000-0000"
              keyboardType="phone-pad"
              maxLength={15}
              error={phoneInvalid ? 'Informe DDD + número.' : null}
            />
            <Input
              label="Data de nascimento"
              value={birthDate}
              onChangeText={(text) => setBirthDate(maskDateBR(text))}
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
              maxLength={10}
              error={birthInvalid ? 'Data inválida.' : null}
            />
            <Input label="Senha" value={password} onChangeText={setPassword} placeholder="Mín. 8 caracteres" secureTextEntry />
            <Input
              label="Confirmar senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repita a senha"
              secureTextEntry
              error={passwordMismatch ? 'As senhas não conferem.' : null}
            />

            <Text style={styles.label}>Escolha seu plano</Text>
            {PLANS.map((item) => (
              <PlanOption key={item.id} plan={item} selected={plan === item.id} onPress={() => setPlan(item.id)} />
            ))}

            <Checkbox
              label="Li e aceito os Termos de Uso e a Política de Privacidade"
              checked={acceptedTerms}
              onPress={() => setAcceptedTerms((prev) => !prev)}
              style={styles.terms}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button title="Criar Conta" onPress={handleSignUp} loading={loading} disabled={!isValid} style={styles.mainButton} />
            <GoogleButton onPress={handleGoogle} loading={googleLoading} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginText}>
              Já tem conta? <Text style={styles.loginTextBold}>Entre</Text>
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
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
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
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  label: { ...typography.smallSemibold, color: colors.textPrimary, marginBottom: spacing.xs },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  planOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryPale },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  planInfo: { flex: 1, marginRight: spacing.xs },
  planName: { ...typography.smallSemibold, color: colors.textPrimary },
  planDescription: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
  planPrice: { ...typography.smallSemibold, color: colors.primary },
  terms: { marginTop: spacing.md, marginBottom: spacing.md },
  errorText: { ...typography.small, color: colors.danger, marginBottom: spacing.sm },
  mainButton: { marginBottom: spacing.sm },
  loginLink: { alignItems: 'center', marginTop: spacing.md },
  loginText: { ...typography.small, color: colors.textSecondary },
  loginTextBold: { color: colors.primary, fontFamily: typography.smallSemibold.fontFamily },
});
