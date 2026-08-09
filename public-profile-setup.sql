-- ============================================================
-- Crydan — @usuário único (estilo Instagram) + perfil público completo
--
-- Isso adiciona um "nome de usuário" (@handle) separado do nome de
-- exibição do personagem — igual Instagram: único em toda a
-- plataforma, só letras minúsculas/números/ponto/underline, pode
-- ser trocado depois. Também guarda moldura, banner e bio na tabela
-- pública "profiles", pra outra pessoa conseguir ver seu perfil
-- exatamente como você configurou, sem precisar ser seu amigo.
--
-- Pré-requisito: já ter rodado social-setup.sql antes (esta tabela
-- só ALTERA a tabela "profiles" que ele cria).
--
-- Rode este arquivo inteiro no SQL Editor do Supabase, uma vez.
-- ============================================================

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists avatar_photo text;
alter table public.profiles add column if not exists avatar_frame text;
alter table public.profiles add column if not exists banner_preset text;
alter table public.profiles add column if not exists banner_image text;
alter table public.profiles add column if not exists banner_anim text;
alter table public.profiles add column if not exists wallet int not null default 0;
alter table public.profiles add column if not exists bank int not null default 0;
alter table public.profiles add column if not exists battles int not null default 0;
alter table public.profiles add column if not exists quests_completed int not null default 0;

-- Mesmas regras de nome de usuário do Instagram: 1–30 caracteres,
-- letras minúsculas, números, ponto e underline; não pode começar
-- nem terminar com ponto; não pode ter ponto duplo seguido.
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format
  check (username is null or (
    username ~ '^[a-z0-9_](?:[a-z0-9_.]{0,28}[a-z0-9_])?$'
    and username !~ '\.\.'
  ));

create unique index if not exists profiles_username_unique_idx
  on public.profiles (username) where username is not null;
