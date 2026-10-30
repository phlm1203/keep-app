-- ============================================================
-- Keep — esquema do banco de dados (Supabase / PostgreSQL)
-- Execute TODO este arquivo em: Supabase → SQL Editor → New query → Run
-- É seguro rodar mais de uma vez.
-- ============================================================

-- ---------- Tabelas ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  phone text,
  birth_date date,
  plan text not null default 'freemium' check (plan in ('freemium', 'casa', 'business')),
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text,
  category text not null default 'Outros',
  barcode text,
  purchase_date date not null,
  expiry_date date not null,
  quantity integer not null default 1 check (quantity > 0),
  storage text,
  image_url text,
  price numeric(10, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_user_idx on public.products (user_id, expiry_date);

create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index if not exists shopping_lists_user_idx on public.shopping_lists (user_id);

create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists(id) on delete cascade, -- excluir a lista leva os itens junto
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  quantity integer not null default 1 check (quantity > 0),
  bought boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists shopping_list_items_list_idx on public.shopping_list_items (list_id);

-- Histórico de perdas (produtos descartados) — alimenta o relatório mensal.
create table if not exists public.loss_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  category text,
  quantity integer not null default 1,
  loss_value numeric(10, 2) not null default 0,
  reason text not null default 'expired',
  created_at timestamptz not null default now()
);
create index if not exists loss_events_user_idx on public.loss_events (user_id, created_at);

-- ---------- updated_at automático ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------- Cria o perfil automaticamente quando a conta é criada ----------
-- Lê os dados enviados no cadastro (user_metadata). Funciona também no login com Google.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  full_name text := coalesce(meta->>'full_name', meta->>'name', '');
  birth text := nullif(meta->>'birth_date', '');
begin
  insert into public.profiles (id, email, first_name, last_name, phone, birth_date, plan)
  values (
    new.id,
    new.email,
    coalesce(nullif(meta->>'first_name', ''), split_part(full_name, ' ', 1)),
    coalesce(nullif(meta->>'last_name', ''), nullif(regexp_replace(full_name, '^\S+\s*', ''), '')),
    nullif(meta->>'phone', ''),
    case when birth ~ '^\d{4}-\d{2}-\d{2}$' then birth::date else null end,
    case when meta->>'plan' in ('freemium', 'casa', 'business') then meta->>'plan' else 'freemium' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Descartar produto vencido + registrar a perda (atômico) ----------
create or replace function public.discard_product(p_id uuid, p_reason text default 'expired')
returns void
language plpgsql
security invoker
as $$
declare
  p public.products%rowtype;
begin
  select * into p from public.products where id = p_id and user_id = auth.uid();
  if not found then
    raise exception 'Produto não encontrado';
  end if;

  insert into public.loss_events (user_id, product_name, category, quantity, loss_value, reason)
  values (auth.uid(), p.name, p.category, p.quantity, coalesce(p.price, 0) * p.quantity, p_reason);

  delete from public.products where id = p_id and user_id = auth.uid();
end;
$$;

-- ---------- Segurança: cada usuário só enxerga e altera os PRÓPRIOS dados (RLS) ----------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.loss_events enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "products_own" on public.products;
create policy "products_own" on public.products for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "shopping_lists_own" on public.shopping_lists;
create policy "shopping_lists_own" on public.shopping_lists for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "shopping_list_items_own" on public.shopping_list_items;
create policy "shopping_list_items_own" on public.shopping_list_items for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.shopping_lists l where l.id = list_id and l.user_id = auth.uid())
  );

drop policy if exists "loss_events_own" on public.loss_events;
create policy "loss_events_own" on public.loss_events for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Storage: fotos dos produtos (bucket público; cada um escreve na própria pasta) ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_insert" on storage.objects;
drop policy if exists "product_images_update" on storage.objects;
drop policy if exists "product_images_delete" on storage.objects;
create policy "product_images_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "product_images_update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "product_images_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- PLANO PROTEGIDO NO SERVIDOR (a regra deixa de depender só do app)
-- Limites do Freemium: 30 produtos e 2 listas. Mantenha iguais a src/utils/permissions.js.
-- ============================================================

-- 1) O usuário não pode mais alterar a coluna `plan` direto na tabela profiles.
--    Só as colunas abaixo podem ser escritas pelo app; o plano muda via change_plan().
revoke insert, update on public.profiles from authenticated, anon;
grant insert (id, email, first_name, last_name, phone, birth_date, notifications_enabled)
  on public.profiles to authenticated;
grant update (first_name, last_name, phone, birth_date, notifications_enabled)
  on public.profiles to authenticated;

-- 2) Limite de produtos e listas do Freemium, validado no banco.
create or replace function public.enforce_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_plan text;
  total integer;
  max_allowed integer;
begin
  select plan into user_plan from public.profiles where id = new.user_id;
  if coalesce(user_plan, 'freemium') <> 'freemium' then
    return new;
  end if;

  if tg_table_name = 'products' then
    max_allowed := 30;
    select count(*) into total from public.products where user_id = new.user_id;
    if total >= max_allowed then
      raise exception 'O plano Keep Freemium permite até % produtos. Mude de plano em Configurações › Planos para cadastrar mais.', max_allowed;
    end if;
  else
    max_allowed := 2;
    select count(*) into total from public.shopping_lists where user_id = new.user_id;
    if total >= max_allowed then
      raise exception 'O plano Keep Freemium permite até % listas. Mude de plano em Configurações › Planos para criar mais.', max_allowed;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists products_plan_limit on public.products;
create trigger products_plan_limit before insert on public.products
  for each row execute function public.enforce_plan_limit();

drop trigger if exists shopping_lists_plan_limit on public.shopping_lists;
create trigger shopping_lists_plan_limit before insert on public.shopping_lists
  for each row execute function public.enforce_plan_limit();

-- 3) Troca de plano: valida os limites ao reduzir de plano.
--    ATENÇÃO: sem pagamento integrado, qualquer usuário logado pode escolher qualquer plano.
--    Antes de cobrar de verdade, remova esta função e altere `plan` só por webhook (service_role).
create or replace function public.change_plan(p_plan text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  product_total integer;
  list_total integer;
begin
  if auth.uid() is null then
    raise exception 'Faça login para mudar de plano.';
  end if;
  if p_plan not in ('freemium', 'casa', 'business') then
    raise exception 'Plano inválido.';
  end if;

  if p_plan = 'freemium' then
    select count(*) into product_total from public.products where user_id = auth.uid();
    select count(*) into list_total from public.shopping_lists where user_id = auth.uid();
    if product_total > 30 then
      raise exception 'Você tem % produtos cadastrados e o Keep Freemium permite até 30. Remova produtos para mudar de plano.', product_total;
    end if;
    if list_total > 2 then
      raise exception 'Você tem % listas e o Keep Freemium permite até 2. Exclua listas para mudar de plano.', list_total;
    end if;
  end if;

  update public.profiles set plan = p_plan where id = auth.uid();
end;
$$;

revoke all on function public.change_plan(text) from public, anon;
grant execute on function public.change_plan(text) to authenticated;

-- 4) Contas criadas antes do gatilho handle_new_user ganham a linha de perfil que faltava.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;
