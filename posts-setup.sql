-- ============================================================
-- Crydan — Publicações reais do feed (visíveis para todo mundo)
--
-- Antes disso, "Publicações" salvava os posts só dentro dos SEUS
-- próprios dados (tabela saves) — por isso ninguém mais via o que
-- você publicava, e você não via as publicações de mais ninguém.
-- Este arquivo cria uma tabela de posts de verdade, compartilhada
-- entre todas as contas, e uma tabela separada de curtidas (evita
-- duas pessoas curtindo ao mesmo tempo e "roubando" a curtida uma
-- da outra, e evita curtida duplicada da mesma pessoa).
--
-- Rode este arquivo inteiro no SQL Editor do Supabase, uma vez
-- (Supabase → seu projeto → SQL Editor → New query → colar → Run).
-- Pré-requisito: já ter rodado social-setup.sql antes (usa a
-- tabela "profiles" criada por ele para mostrar nome/avatar).
-- ============================================================

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  text text,
  image text,
  created_at timestamptz not null default now(),
  constraint posts_has_content check (coalesce(text, '') <> '' or coalesce(image, '') <> '')
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

drop policy if exists "posts_select_all" on public.posts;
create policy "posts_select_all" on public.posts
  for select using (auth.role() = 'authenticated');

drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts
  for insert with check (author_id = auth.uid());

drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own" on public.posts
  for delete using (author_id = auth.uid());


-- Curtidas: uma linha = uma pessoa curtiu um post. A chave primária
-- composta (post_id, user_id) impede curtida duplicada da mesma
-- pessoa automaticamente, sem precisar de lógica extra no app.
create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

drop policy if exists "post_likes_select_all" on public.post_likes;
create policy "post_likes_select_all" on public.post_likes
  for select using (auth.role() = 'authenticated');

drop policy if exists "post_likes_insert_own" on public.post_likes;
create policy "post_likes_insert_own" on public.post_likes
  for insert with check (user_id = auth.uid());

drop policy if exists "post_likes_delete_own" on public.post_likes;
create policy "post_likes_delete_own" on public.post_likes
  for delete using (user_id = auth.uid());
