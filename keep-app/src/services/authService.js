import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';
import { AUTH_REDIRECT_PATH, RESET_REDIRECT_PATH } from './config';
import { assertConfigured, toFriendlyError } from './errors';

WebBrowser.maybeCompleteAuthSession();

const VALID_PLANS = ['freemium', 'casa', 'business'];

const COLUMNS = {
  firstName: 'first_name',
  lastName: 'last_name',
  phone: 'phone',
  birthDate: 'birth_date',
  notificationsEnabled: 'notifications_enabled',
};

// Contas Google trazem só o nome completo em user_metadata.
function namesFromMeta(meta = {}) {
  if (meta.first_name) return { first: meta.first_name, last: meta.last_name || '' };
  const full = (meta.full_name || meta.name || '').trim();
  const [first = '', ...rest] = full.split(/\s+/);
  return { first, last: rest.join(' ') };
}

function rowToUser(row, authUser) {
  const meta = (authUser && authUser.user_metadata) || {};
  const names = namesFromMeta(meta);
  return {
    id: (authUser && authUser.id) || row.id,
    email: (row && row.email) || (authUser && authUser.email) || null,
    firstName: (row && row.first_name) ?? names.first,
    lastName: (row && row.last_name) ?? names.last,
    phone: (row && row.phone) ?? meta.phone ?? null,
    birthDate: (row && row.birth_date) ?? meta.birth_date ?? null,
    plan: VALID_PLANS.includes(row && row.plan) ? row.plan : VALID_PLANS.includes(meta.plan) ? meta.plan : 'freemium',
    notificationsEnabled: row ? row.notifications_enabled : true,
    provider: (authUser && authUser.app_metadata && authUser.app_metadata.provider) || 'email',
    isGuest: false,
    createdAt: (row && row.created_at) || null,
  };
}

function userToRow(user) {
  return {
    id: user.id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    phone: user.phone,
    birth_date: user.birthDate,
    notifications_enabled: user.notificationsEnabled,
  };
}

// Lê o perfil do usuário logado. Se a linha ainda não existir (conta antiga), cria a partir dos metadados.
export async function getProfile(authUser) {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
    if (error) throw error;
    if (data) return rowToUser(data, authUser);

    const fallback = rowToUser(null, authUser);
    const { data: created } = await supabase.from('profiles').insert(userToRow(fallback)).select().maybeSingle();
    return created ? rowToUser(created, authUser) : fallback;
  } catch (e) {
    if (__DEV__) console.warn('Falha ao carregar perfil:', e.message);
    return rowToUser(null, authUser);
  }
}

export async function login(email, password) {
  assertConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw toFriendlyError(error);
  return data.user;
}

// Os dados do cadastro vão em `options.data`; o gatilho handle_new_user (schema.sql)
// cria a linha em `profiles` com eles, mesmo quando o e-mail precisa ser confirmado.
export async function signUp({ firstName, lastName, email, phone, birthDate, password, plan }) {
  assertConfigured();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone || '',
        birth_date: birthDate || '',
        plan: VALID_PLANS.includes(plan) ? plan : 'freemium',
      },
    },
  });
  if (error) throw toFriendlyError(error);

  // Com confirmação de e-mail ligada, e-mail já existente volta sem erro e sem identidades.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error('Este e-mail já está cadastrado.');
  }
  return { needsConfirmation: !data.session };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw toFriendlyError(error);
}

export async function requestPasswordReset(email) {
  assertConfigured();
  const redirectTo = Linking.createURL(RESET_REDIRECT_PATH);
  if (__DEV__) console.log('[Keep] redirectTo da recuperação de senha (libere no Supabase):', redirectTo);
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) throw toFriendlyError(error);
}

// Abre a sessão de recuperação a partir do link recebido por e-mail (keep://reset-password#access_token=...).
export async function handleRecoveryLink(url) {
  const params = parseAuthParams(url);
  if (params.access_token && params.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) throw toFriendlyError(error);
  } else if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw toFriendlyError(error);
  } else {
    throw new Error(params.error_description || 'Link inválido ou expirado. Peça um novo e-mail de recuperação.');
  }
}

export async function setNewPassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw toFriendlyError(error);
}

// O plano só muda por esta função do banco (change_plan), que também confere os limites.
export async function changePlan(plan) {
  if (!VALID_PLANS.includes(plan)) throw new Error('Plano inválido.');
  const { error } = await supabase.rpc('change_plan', { p_plan: plan });
  if (error) throw toFriendlyError(error);
}

function parseAuthParams(url) {
  const hash = url.includes('#') ? url.split('#')[1] : '';
  const query = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
  const params = {};
  new URLSearchParams(hash || query).forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// Login com Google via Supabase OAuth (abre o navegador e volta para o app).
export async function signInWithGoogle() {
  assertConfigured();
  const redirectTo = Linking.createURL(AUTH_REDIRECT_PATH);
  if (__DEV__) console.log('[Keep] redirectTo do login com Google (libere no Supabase):', redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw toFriendlyError(error);

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return { cancelled: true };

  const params = parseAuthParams(result.url);
  if (params.access_token && params.refresh_token) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (sessionError) throw toFriendlyError(sessionError);
  } else if (params.code) {
    const { error: codeError } = await supabase.auth.exchangeCodeForSession(params.code);
    if (codeError) throw toFriendlyError(codeError);
  } else {
    throw new Error(params.error_description || 'Não foi possível concluir o login com o Google.');
  }
  return { cancelled: false };
}

export async function updateProfile(userId, patch) {
  const row = {};
  Object.keys(patch).forEach((key) => {
    if (COLUMNS[key]) row[COLUMNS[key]] = patch[key] === '' ? null : patch[key];
  });
  const { error } = await supabase.from('profiles').update(row).eq('id', userId);
  if (error) throw toFriendlyError(error);
}

// Confirma a senha atual antes de trocar.
export async function changePassword(email, currentPassword, newPassword) {
  const { error: checkError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (checkError) throw new Error('A senha atual está incorreta.');
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw toFriendlyError(error);
}
