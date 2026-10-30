# Keep

App de gerenciamento de despensa doméstica/comercial com controle de validade, alertas, receitas, lista de compras e relatórios de perda.

## Stack

- Expo **SDK 55** / React Native 0.83 / React 19
- React Navigation v7 (native-stack + bottom-tabs)
- **Supabase** (Auth, PostgreSQL com RLS e Storage)
- expo-camera (scanner), expo-image-picker (fotos), expo-notifications (avisos de validade),
  expo-web-browser + expo-linking (login com Google e recuperação de senha)
- react-native-qrcode-svg (QR Code da tela Ajuda)

> Este projeto usa o **SDK 55**: o Expo Go do celular precisa ser compatível com o SDK 55 (confira a versão em expo.dev/go).

## 1. Instalar

```bash
npm install
```

(O `.npmrc` já inclui `legacy-peer-deps=true`.) Se mexer nas dependências, rode `npx expo install --fix`.

## 2. Configurar o Supabase

1. Crie um projeto em https://supabase.com.
2. **SQL Editor** → cole e execute **todo** o arquivo [`supabase/schema.sql`](supabase/schema.sql). Pode rodar de novo a qualquer momento (é idempotente). Ele cria tabelas, regras de segurança por usuário, gatilho de perfil, descarte atômico, bucket de fotos **e a proteção dos planos no servidor**.
3. **Project Settings → API**: copie a *Project URL* e a *anon public key* para `src/services/config.js` (ou crie um `.env` a partir do `.env.example`).
4. **Authentication → Providers → Email**: desligue *Confirm email* para testar mais rápido (se deixar ligado, o app avisa o usuário para confirmar) e use *Minimum password length* = 8.
5. **Authentication → URL Configuration → Redirect URLs** — adicione (sem isso, Google e "esqueci a senha" não voltam para o app):
   - `keep://auth-callback` e `keep://reset-password` (build)
   - as URLs `exp://...` que o app imprime no terminal em modo dev (`[Keep] redirectTo ...`), uma para o login com Google e outra para a recuperação de senha
6. **Login com Google** — Authentication → Providers → Google: crie as credenciais OAuth (tipo *Web application*) no Google Cloud Console, use como *Authorized redirect URI* a callback que o Supabase mostra e cole *Client ID* e *Secret* no Supabase.

## 3. Rodar

```bash
npx expo start
```

Escaneie o QR code com o Expo Go ou use `a` / `i` / `w`.

## O que existe de importante

| Recurso | Como funciona |
|---|---|
| **Planos** | Limites do Freemium (30 produtos, 2 listas) validados por *trigger* no banco. A coluna `plan` não pode mais ser alterada direto: só pela função `change_plan()`. **Ainda não há pagamento**: qualquer usuário logado escolhe qualquer plano. Antes de cobrar, apague `change_plan()` e altere `plan` só por webhook (service_role). |
| **Notificações** | Locais (sem servidor): 9h, 3 dias antes e no dia do vencimento de cada produto (até 60 agendadas — limite do iOS). Pedem permissão ao usuário; o switch em Configurações › Notificações liga/desliga. |
| **Recuperação de senha** | O e-mail traz um link que abre o app na tela "Nova senha". Exige as Redirect URLs do passo 5. |
| **Fotos** | Ao descartar um produto, a foto dele é apagada do Storage. |

## Falta preencher antes de apresentar

Em `src/services/config.js`, o objeto `CONTACT` ainda tem dados de exemplo (e-mail, GitHub, Instagram). O QR Code da tela Ajuda aponta para `instagramUrl`.

## Estrutura

```
assets/              ícones e splash
supabase/schema.sql  banco de dados + segurança (executar no Supabase)
src/
  theme/             cores, tipografia (Nunito) e espaçamentos
  services/          config.js, supabase.js e um service por domínio
                     (auth, products, lists, reports, plans, recipes, notifications)
  context/           AuthContext (sessão + perfil) e PantryContext (despensa do usuário)
  components/        componentes reutilizáveis (inclui FixedFooter)
  screens/           Auth, Pantry, Lists, Recipes, Reports, Settings
  navigation/        stacks e tab navigator
  utils/             date, masks, permissions (regras dos planos), recipeMatch, photo
```

Regras dos planos no app: `src/utils/permissions.js` (`PLAN_RULES`). Se mudar um limite lá, mude também no `schema.sql` (`enforce_plan_limit` e `change_plan`).
