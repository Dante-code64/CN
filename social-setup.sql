-- ============================================================
-- Crydan — Recursos sociais reais entre contas
-- (perfis públicos, pedidos de amizade, mensagens diretas,
--  transferências PIX e desafios de PvP)
--
-- Antes disso, essas 4 coisas eram só simulação local: cada
-- conta só mexia nos próprios dados, nada era realmente
-- entregue pra outra pessoa. Este arquivo cria as tabelas,
-- políticas de segurança (RLS) e a função de transferência
-- que fazem essas funcionalidades funcionarem de verdade entre
-- contas diferentes.
--
-- Rode este arquivo inteiro no SQL Editor do Supabase, uma vez
-- (Supabase → seu projeto → SQL Editor → New query → colar → Run).
-- ============================================================

-- 1) PERFIS PÚBLICOS ---------------------------------------------------
-- Cópia enxuta e pública dos dados de cada jogador (nome, classe,
-- nível, atributos de combate). É o que permite buscar um jogador
-- pelo nome e ler as estatísticas dele num desafio de PvP, sem expor
-- o "save" completo (que continua 100% privado, como já era).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar text,
  class text,
  level int not null default 1,
  hp int not null default 100,
  max_hp int not null default 100,
  str int not null default 10,
  dex int not null default 10,
  int_ int not null default 10,
  vit int not null default 10,
  wis int not null default 10,
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_name_unique_idx on public.profiles (lower(name));

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());


-- 2) PEDIDOS DE AMIZADE -------------------------------------------------
create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references auth.users(id) on delete cascade,
  to_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friend_requests_no_self check (from_id <> to_id)
);

-- só pode existir um pedido/uma amizade por par de contas de cada vez
create unique index if not exists friend_requests_pair_idx
  on public.friend_requests (least(from_id, to_id), greatest(from_id, to_id));

alter table public.friend_requests enable row level security;

drop policy if exists "friend_requests_select_own" on public.friend_requests;
create policy "friend_requests_select_own" on public.friend_requests
  for select using (auth.uid() in (from_id, to_id));

drop policy if exists "friend_requests_insert_own" on public.friend_requests;
create policy "friend_requests_insert_own" on public.friend_requests
  for insert with check (from_id = auth.uid());

drop policy if exists "friend_requests_update_participant" on public.friend_requests;
create policy "friend_requests_update_participant" on public.friend_requests
  for update using (auth.uid() in (from_id, to_id));

drop policy if exists "friend_requests_delete_participant" on public.friend_requests;
create policy "friend_requests_delete_participant" on public.friend_requests
  for delete using (auth.uid() in (from_id, to_id));


-- 3) MENSAGENS DIRETAS ---------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references auth.users(id) on delete cascade,
  to_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_conversation_idx
  on public.messages (least(from_id, to_id), greatest(from_id, to_id), created_at);

alter table public.messages enable row level security;

drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant" on public.messages
  for select using (auth.uid() in (from_id, to_id));

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own" on public.messages
  for insert with check (from_id = auth.uid() and from_id <> to_id);

drop policy if exists "messages_update_mark_read" on public.messages;
create policy "messages_update_mark_read" on public.messages
  for update using (to_id = auth.uid());


-- 4) TRANSFERÊNCIAS PIX ---------------------------------------------------
-- A tabela não tem política de INSERT de propósito: o valor só pode
-- ser inserido pela função send_pix() abaixo, que valida o saldo real
-- no banco (não confia num saldo que o navegador diga ter) e move o
-- valor das duas contas na mesma transação — sem isso, dava pra "PIX"
-- um valor que não se tinha, ou o dinheiro simplesmente desaparecia
-- sem chegar em ninguém (era exatamente o que a versão antiga fazia).
create table if not exists public.pix_transfers (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references auth.users(id) on delete cascade,
  to_id uuid not null references auth.users(id) on delete cascade,
  amount int not null check (amount > 0),
  note text,
  created_at timestamptz not null default now()
);

alter table public.pix_transfers enable row level security;

drop policy if exists "pix_transfers_select_participant" on public.pix_transfers;
create policy "pix_transfers_select_participant" on public.pix_transfers
  for select using (auth.uid() in (from_id, to_id));

create or replace function public.send_pix(p_to_id uuid, p_amount int, p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from_id uuid := auth.uid();
  v_from_wallet int;
  v_to_wallet int;
begin
  if v_from_id is null then
    raise exception 'Não autenticado';
  end if;
  if p_to_id = v_from_id then
    raise exception 'Não é possível enviar Cry para você mesmo';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Valor inválido';
  end if;

  -- trava as duas linhas envolvidas (evita corrida / gasto duplicado)
  select coalesce((data->>'wallet')::int, 0) into v_from_wallet
    from public.saves where id = v_from_id for update;
  if not found then
    raise exception 'Conta de origem não encontrada';
  end if;
  if v_from_wallet < p_amount then
    raise exception 'Cry insuficiente';
  end if;

  select coalesce((data->>'wallet')::int, 0) into v_to_wallet
    from public.saves where id = p_to_id for update;
  if not found then
    raise exception 'Destinatário não encontrado';
  end if;

  update public.saves set data = jsonb_set(data, '{wallet}', to_jsonb(v_from_wallet - p_amount))
    where id = v_from_id;
  update public.saves set data = jsonb_set(data, '{wallet}', to_jsonb(v_to_wallet + p_amount))
    where id = p_to_id;

  insert into public.pix_transfers (from_id, to_id, amount, note)
    values (v_from_id, p_to_id, p_amount, p_note);

  return jsonb_build_object('newWallet', v_from_wallet - p_amount);
end;
$$;

grant execute on function public.send_pix(uuid, int, text) to authenticated;


-- 5) DESAFIOS DE PVP ---------------------------------------------------
create table if not exists public.pvp_challenges (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','completed')),
  winner_id uuid,
  summary text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint pvp_no_self check (challenger_id <> target_id)
);

alter table public.pvp_challenges enable row level security;

drop policy if exists "pvp_select_participant" on public.pvp_challenges;
create policy "pvp_select_participant" on public.pvp_challenges
  for select using (auth.uid() in (challenger_id, target_id));

drop policy if exists "pvp_insert_own" on public.pvp_challenges;
create policy "pvp_insert_own" on public.pvp_challenges
  for insert with check (challenger_id = auth.uid());

drop policy if exists "pvp_update_participant" on public.pvp_challenges;
create policy "pvp_update_participant" on public.pvp_challenges
  for update using (auth.uid() in (challenger_id, target_id));
