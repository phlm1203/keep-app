// ─────────────────────────────────────────────────────────────
// Configuração central do Keep.
//
// 1) Supabase: preencha com os dados de Project Settings → API.
//    Pode ser por variáveis de ambiente (.env com EXPO_PUBLIC_*)
//    ou direto nas strings abaixo.
// 2) CONTACT: dados exibidos na tela "Ajuda" (troque pelos oficiais).
// ─────────────────────────────────────────────────────────────
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://gfcobgoszpmfvbsmcpsb.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_7VbO3UnWwmZ4tzB_U4CI_A_eUhLxovK';

export const isSupabaseConfigured =
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY) &&
  /^https:\/\//.test(SUPABASE_URL) &&
  !SUPABASE_URL.includes('seu-projeto') &&
  !SUPABASE_ANON_KEY.includes('sua-anon-key');

// Caminho de retorno do login com Google (precisa estar liberado no Supabase).
export const AUTH_REDIRECT_PATH = 'auth-callback';

// Caminho de retorno do link "esqueci minha senha" (também precisa estar liberado no Supabase).
export const RESET_REDIRECT_PATH = 'reset-password';

// Bucket (público) do Storage onde ficam as fotos dos produtos.
export const PRODUCT_IMAGES_BUCKET = 'product-images';

// TODO: substituir pelos contatos oficiais do Keep.
export const CONTACT = {
  email: 'contato@keep.exemplo',
  github: 'https://github.com/SEU-USUARIO/keep',
  instagramHandle: '@keep.app',
  instagramUrl: 'https://www.instagram.com/SEU_PERFIL/',
};
