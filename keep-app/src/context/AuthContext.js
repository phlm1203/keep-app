import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
import * as authService from '../services/authService';
import { supabase } from '../services/supabase';
import { GUEST_ID, resetGuestStore } from '../services/guestStore';
import { cancelExpiryNotifications } from '../services/notificationsService';
import { RESET_REDIRECT_PATH } from '../services/config';

const AuthContext = createContext(null);

const GUEST_USER = {
  id: GUEST_ID,
  firstName: 'Visitante',
  lastName: '',
  email: null,
  phone: null,
  birthDate: null,
  plan: 'guest',
  isGuest: true,
  notificationsEnabled: false,
  createdAt: null,
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [guest, setGuest] = useState(false);
  const [error, setError] = useState(null);
  const [recovery, setRecovery] = useState(false); // true enquanto o usuário define a nova senha

  // Sessão do Supabase (persistida no aparelho): restaura ao abrir e acompanha login/logout.
  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setSessionChecked(true);
      })
      .catch(() => active && setSessionChecked(true));

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setSessionChecked(true);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Link "Redefinir senha" do e-mail: abre o app, cria a sessão de recuperação e mostra a tela de nova senha.
  useEffect(() => {
    const handleUrl = async (url) => {
      if (!url || !url.includes(RESET_REDIRECT_PATH)) return;
      try {
        await authService.handleRecoveryLink(url);
        setRecovery(true);
      } catch (e) {
        Alert.alert('Não foi possível redefinir a senha', e.message);
      }
    };
    Linking.getInitialURL().then(handleUrl).catch(() => {});
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);

  // Carrega o perfil (nome, plano, preferências) sempre que o usuário logado muda.
  const userId = session?.user?.id ?? null;
  useEffect(() => {
    if (!sessionChecked) return undefined;
    if (!userId) {
      setProfile(null);
      setProfileLoading(false);
      return undefined;
    }
    let active = true;
    setProfileLoading(true);
    authService
      .getProfile(session.user)
      .then((loaded) => active && setProfile(loaded))
      .finally(() => active && setProfileLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionChecked, userId]);

  const user = guest ? GUEST_USER : userId && profile && profile.id === userId ? profile : null;
  const isLoading = !sessionChecked || (!!userId && profileLoading);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      await authService.login(email, password);
      resetGuestStore();
      setGuest(false);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const signUp = useCallback(async (payload) => {
    setError(null);
    try {
      const result = await authService.signUp(payload);
      if (!result.needsConfirmation) {
        resetGuestStore();
        setGuest(false);
      }
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const result = await authService.signInWithGoogle();
      if (!result.cancelled) {
        resetGuestStore();
        setGuest(false);
      }
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    cancelExpiryNotifications();
    if (guest) {
      // Visitante nunca fez login de verdade: só descarta os dados em memória.
      resetGuestStore();
      setGuest(false);
      return;
    }
    await authService.logout();
    setProfile(null);
  }, [guest]);

  const requestPasswordReset = useCallback((email) => authService.requestPasswordReset(email), []);

  const continueAsGuest = useCallback(() => {
    setError(null);
    resetGuestStore();
    setGuest(true);
  }, []);

  // patch em camelCase: firstName, lastName, phone, birthDate, plan, notificationsEnabled
  const updateUser = useCallback(
    async (patch) => {
      if (!user || user.isGuest) return;
      await authService.updateProfile(user.id, patch);
      setProfile((prev) => ({ ...prev, ...patch }));
    },
    [user]
  );

  // O plano muda pelo banco (função change_plan), que valida os limites; depois atualiza o perfil local.
  const changePlan = useCallback(
    async (plan) => {
      if (!user || user.isGuest) return;
      await authService.changePlan(plan);
      setProfile((prev) => ({ ...prev, plan }));
    },
    [user]
  );

  const completePasswordReset = useCallback(async (newPassword) => {
    await authService.setNewPassword(newPassword);
    setRecovery(false);
  }, []);

  const cancelPasswordReset = useCallback(async () => {
    setRecovery(false);
    await authService.logout().catch(() => {});
    setProfile(null);
  }, []);

  const changePassword = useCallback(
    (currentPassword, newPassword) => authService.changePassword(user.email, currentPassword, newPassword),
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isGuest: !!user?.isGuest,
      isLoading,
      error,
      recovery,
      login,
      signUp,
      signInWithGoogle,
      logout,
      requestPasswordReset,
      updateUser,
      changePlan,
      changePassword,
      completePasswordReset,
      cancelPasswordReset,
      continueAsGuest,
    }),
    [
      user,
      isLoading,
      error,
      recovery,
      login,
      signUp,
      signInWithGoogle,
      logout,
      requestPasswordReset,
      updateUser,
      changePlan,
      changePassword,
      completePasswordReset,
      cancelPasswordReset,
      continueAsGuest,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}

export default AuthContext;
