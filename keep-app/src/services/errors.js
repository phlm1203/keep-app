import { isSupabaseConfigured } from './config';

const MESSAGES = [
  [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
  [/user already registered|already been registered/i, 'Este e-mail já está cadastrado.'],
  [/email not confirmed/i, 'Confirme seu e-mail antes de entrar (veja a caixa de entrada e o Spam).'],
  [/password should be at least/i, 'A senha é muito curta. Use pelo menos 8 caracteres.'],
  [/same password|different from the old/i, 'A nova senha precisa ser diferente da atual.'],
  [/rate limit|too many requests|security purposes/i, 'Muitas tentativas. Aguarde um pouco e tente novamente.'],
  [/network request failed|failed to fetch|network error/i, 'Sem conexão com o servidor. Verifique sua internet.'],
  [/row-level security|violates row|permission denied/i, 'Você não tem permissão para realizar esta operação.'],
  [/could not find the function|schema cache/i, 'O banco ainda não tem a atualização mais recente. Rode o arquivo supabase/schema.sql no Supabase.'],
  [/invalid email|unable to validate email/i, 'E-mail inválido.'],
];

export function friendlyMessage(error) {
  const raw = (error && error.message) || (typeof error === 'string' ? error : '');
  const hit = MESSAGES.find(([regex]) => regex.test(raw));
  return hit ? hit[1] : raw || 'Algo deu errado. Tente novamente.';
}

// Converte qualquer erro (Supabase, rede...) em Error com mensagem amigável em português.
export function toFriendlyError(error) {
  if (error && error.code === 'PLAN_LIMIT') return error;
  const friendly = new Error(friendlyMessage(error));
  friendly.original = error;
  return friendly;
}

export function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado. Preencha SUPABASE_URL e SUPABASE_ANON_KEY em src/services/config.js.');
  }
}
