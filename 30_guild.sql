-- Snapshot extraído de produção em 30/08/2026. Não é uma migração — não altera o banco.
-- Nota: essas funções dependem de guild_role_of(), guild_wallet_of(), guild_add_wallet(),
-- guild_add_xp(), guild_check_achievements() e guild_ensure_active_mission(), que também
-- existem no banco mas não foram pedidas nesta lista de 39 chamadas do cliente — exportar
-- em um passo seguinte se forem tocadas.

CREATE OR REPLACE FUNCTION public.guild_change_role(p_guild_id uuid, p_target_user uuid, p_new_role text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_caller_role text := public.guild_role_of(p_guild_id);
  v_target_role text;
begin
  if v_caller_role is null then raise exception 'Você não é membro dessa guilda.'; end if;
  if p_new_role not in ('vice_leader','officer','member') then
    raise exception 'Cargo inválido. Use guild_transfer_leadership para transferir liderança.';
  end if;
  if v_caller_role not in ('leader','vice_leader') then raise exception 'Sem permissão para alterar cargos.'; end if;

  select role into v_target_role from public.guild_members where guild_id = p_guild_id and user_id = p_target_user;
  if v_target_role is null then raise exception 'Membro não encontrado.'; end if;
  if v_target_role = 'leader' then raise exception 'Não é possível alterar o cargo do líder.'; end if;

  if v_caller_role = 'vice_leader' then
    if p_new_role = 'vice_leader' then raise exception 'Só o líder pode promover a Vice-líder.'; end if;
    if v_target_role = 'vice_leader' then raise exception 'Sem permissão para alterar outro Vice-líder.'; end if;
  end if;

  update public.guild_members set role = p_new_role where guild_id = p_guild_id and user_id = p_target_user;
end;
$function$;

CREATE OR REPLACE FUNCTION public.guild_contribute_mission(p_guild_id uuid, p_amount integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_me uuid := auth.uid();
  v_mission record;
  v_new_current int;
begin
  if v_me is null then raise exception 'Não autenticado'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Valor inválido.'; end if;
  if not exists (select 1 from public.guild_members where guild_id = p_guild_id and user_id = v_me) then
    raise exception 'Você não é membro dessa guilda.';
  end if;
  if public.guild_wallet_of(v_me) < p_amount then raise exception 'Cry insuficiente.'; end if;

  perform public.guild_ensure_active_mission(p_guild_id);
  select * into v_mission from public.guild_missions where guild_id = p_guild_id and status = 'active' limit 1;
  if not found then raise exception 'Nenhuma missão ativa no momento.'; end if;

  perform public.guild_add_wallet(v_me, -p_amount);
  update public.guild_members set contribution = contribution + p_amount where guild_id = p_guild_id and user_id = v_me;
  v_new_current := least(v_mission.target, v_mission.current + p_amount);
  update public.guild_missions set current = v_new_current where id = v_mission.id;

  if v_new_current >= v_mission.target then
    update public.guild_missions set status = 'completed' where id = v_mission.id;
    perform public.guild_add_xp(p_guild_id, v_mission.reward_xp);
    perform public.guild_ensure_active_mission(p_guild_id);
  end if;

  return jsonb_build_object('newCurrent', v_new_current, 'target', v_mission.target, 'completed', v_new_current >= v_mission.target);
end;
$function$;

CREATE OR REPLACE FUNCTION public.guild_disband(p_guild_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  delete from public.guilds where id = p_guild_id and owner_id = auth.uid();
  if not found then raise exception 'Só o líder pode dissolver a guilda.'; end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.guild_invite(p_guild_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_caller_role text;
begin
  v_caller_role := public.guild_role_of(p_guild_id);
  if v_caller_role not in ('leader','vice_leader') then raise exception 'Sem permissão para convidar.'; end if;
  if p_user_id = auth.uid() then raise exception 'Você não pode se convidar.'; end if;
  if exists (select 1 from public.guild_members where guild_id = p_guild_id and user_id = p_user_id) then
    raise exception 'Esse jogador já é membro da guilda.';
  end if;
  if exists (select 1 from public.guild_invites where guild_id = p_guild_id and invited_user_id = p_user_id and status = 'pending') then
    raise exception 'Esse jogador já tem um convite pendente dessa guilda.';
  end if;
  insert into public.guild_invites (guild_id, invited_by, invited_user_id) values (p_guild_id, auth.uid(), p_user_id);
end;
$function$;

CREATE OR REPLACE FUNCTION public.guild_join_open(p_guild_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_me uuid := auth.uid();
  v_guild record;
  v_my_level int;
  v_count int;
begin
  if v_me is null then raise exception 'Não autenticado'; end if;
  if exists (select 1 from public.guild_members where user_id = v_me) then
    raise exception 'Você já pertence a uma guilda. Saia dela primeiro.';
  end if;
  select * into v_guild from public.guilds where id = p_guild_id;
  if not found then raise exception 'Guilda não encontrada.'; end if;
  if v_guild.privacy <> 'open' then raise exception 'Essa guilda não aceita entrada livre — envie uma solicitação.'; end if;
  select coalesce(level,1) into v_my_level from public.profiles where id = v_me;
  if v_my_level < v_guild.min_level then raise exception 'Nível insuficiente para entrar nessa guilda (mín. %).', v_guild.min_level; end if;
  select count(*) into v_count from public.guild_members where guild_id = p_guild_id;
  if v_count >= v_guild.member_limit then raise exception 'Essa guilda está lotada.'; end if;
  insert into public.guild_members (guild_id, user_id, role) values (p_guild_id, v_me, 'member');
  perform public.guild_check_achievements(p_guild_id);
end;
$function$;

CREATE OR REPLACE FUNCTION public.guild_kick_member(p_guild_id uuid, p_target_user uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_caller_role text := public.guild_role_of(p_guild_id);
  v_target_role text;
begin
  if p_target_user = auth.uid() then raise exception 'Use "Sair da guilda" para se retirar.'; end if;
  if v_caller_role not in ('leader','vice_leader','officer') then raise exception 'Sem permissão para expulsar membros.'; end if;

  select role into v_target_role from public.guild_members where guild_id = p_guild_id and user_id = p_target_user;
  if v_target_role is null then raise exception 'Membro não encontrado.'; end if;
  if v_target_role = 'leader' then raise exception 'Não é possível expulsar o líder.'; end if;
  if v_caller_role = 'officer' and v_target_role in ('vice_leader','officer') then
    raise exception 'Oficiais só podem expulsar membros comuns.';
  end if;
  if v_caller_role = 'vice_leader' and v_target_role = 'vice_leader' then
    raise exception 'Sem permissão para expulsar outro Vice-líder.';
  end if;

  delete from public.guild_members where guild_id = p_guild_id and user_id = p_target_user;
end;
$function$;

CREATE OR REPLACE FUNCTION public.guild_request_create(p_name text, p_tag text DEFAULT NULL::text, p_description text DEFAULT NULL::text, p_emblem text DEFAULT '🛡️'::text, p_banner_image text DEFAULT NULL::text, p_category text DEFAULT 'geral'::text, p_privacy text DEFAULT 'open'::text, p_min_level integer DEFAULT 1)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_me uuid := auth.uid();
  v_request_id uuid;
begin
  if v_me is null then raise exception 'Não autenticado'; end if;
  if public.is_restricted() then raise exception 'Sua conta está restrita e não pode solicitar a criação de guildas.'; end if;
  if exists (select 1 from public.guild_members where user_id = v_me) then
    raise exception 'Você já pertence a uma guilda. Saia dela primeiro.';
  end if;
  if exists (select 1 from public.guild_creation_requests where requester_id = v_me and status = 'pending') then
    raise exception 'Você já tem um pedido de criação de guilda pendente.';
  end if;
  if p_name is null or char_length(trim(p_name)) < 3 then
    raise exception 'O nome da guilda precisa ter pelo menos 3 caracteres.';
  end if;
  if p_privacy not in ('open','request','closed') then
    raise exception 'Privacidade inválida.';
  end if;
  if p_tag is not null and p_tag !~ '^[A-Z0-9]{2,6}$' then
    raise exception 'A tag deve ter de 2 a 6 letras/números maiúsculos, sem espaços ou símbolos.';
  end if;
  if exists (select 1 from public.guilds where lower(name) = lower(trim(p_name))) then
    raise exception 'Já existe uma guilda com esse nome.';
  end if;
  if p_tag is not null and exists (select 1 from public.guilds where upper(tag) = upper(p_tag)) then
    raise exception 'Já existe uma guilda com essa tag.';
  end if;

  insert into public.guild_creation_requests (requester_id, name, tag, description, emblem, banner_image, category, privacy, min_level)
    values (v_me, trim(p_name), p_tag, p_description, coalesce(p_emblem,'🛡️'), p_banner_image, coalesce(p_category,'geral'), p_privacy, greatest(1,coalesce(p_min_level,1)))
    returning id into v_request_id;

  return v_request_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.guild_request_join(p_guild_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_me uuid := auth.uid();
  v_guild record;
begin
  if v_me is null then raise exception 'Não autenticado'; end if;
  if exists (select 1 from public.guild_members where user_id = v_me) then
    raise exception 'Você já pertence a uma guilda. Saia dela primeiro.';
  end if;
  select * into v_guild from public.guilds where id = p_guild_id;
  if not found then raise exception 'Guilda não encontrada.'; end if;
  if v_guild.privacy <> 'request' then raise exception 'Essa guilda não usa solicitação de entrada.'; end if;
  if exists (select 1 from public.guild_join_requests where guild_id = p_guild_id and user_id = v_me and status = 'pending') then
    raise exception 'Você já tem uma solicitação pendente para essa guilda.';
  end if;
  insert into public.guild_join_requests (guild_id, user_id) values (p_guild_id, v_me);
end;
$function$;

CREATE OR REPLACE FUNCTION public.guild_respond_invite(p_invite_id uuid, p_accept boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_inv record;
  v_guild record;
  v_count int;
  v_my_level int;
begin
  select * into v_inv from public.guild_invites where id = p_invite_id and status = 'pending' and invited_user_id = auth.uid();
  if not found then raise exception 'Convite não encontrado ou já respondido.'; end if;

  if p_accept then
    if exists (select 1 from public.guild_members where user_id = auth.uid()) then
      raise exception 'Você já pertence a uma guilda. Saia dela primeiro.';
    end if;
    select * into v_guild from public.guilds where id = v_inv.guild_id;
    select coalesce(level,1) into v_my_level from public.profiles where id = auth.uid();
    if v_my_level < v_guild.min_level then raise exception 'Nível insuficiente para entrar nessa guilda.'; end if;
    select count(*) into v_count from public.guild_members where guild_id = v_inv.guild_id;
    if v_count >= v_guild.member_limit then raise exception 'A guilda está lotada.'; end if;
    insert into public.guild_members (guild_id, user_id, role) values (v_inv.guild_id, auth.uid(), 'member');
    perform public.guild_check_achievements(v_inv.guild_id);
    update public.guild_invites set status = 'accepted', responded_at = now() where id = p_invite_id;
  else
    update public.guild_invites set status = 'declined', responded_at = now() where id = p_invite_id;
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.guild_respond_join_request(p_request_id uuid, p_accept boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_req record;
  v_caller_role text;
  v_guild record;
  v_count int;
  v_their_level int;
begin
  select * into v_req from public.guild_join_requests where id = p_request_id and status = 'pending';
  if not found then raise exception 'Solicitação não encontrada ou já respondida.'; end if;
  v_caller_role := public.guild_role_of(v_req.guild_id);
  if v_caller_role not in ('leader','vice_leader') then raise exception 'Sem permissão para responder solicitações.'; end if;

  if p_accept then
    select * into v_guild from public.guilds where id = v_req.guild_id;
    select count(*) into v_count from public.guild_members where guild_id = v_req.guild_id;
    if v_count >= v_guild.member_limit then raise exception 'A guilda está lotada.'; end if;
    if exists (select 1 from public.guild_members where user_id = v_req.user_id) then
      raise exception 'Esse jogador já entrou em outra guilda.';
    end if;
    insert into public.guild_members (guild_id, user_id, role) values (v_req.guild_id, v_req.user_id, 'member');
    perform public.guild_check_achievements(v_req.guild_id);
    update public.guild_join_requests set status = 'accepted', responded_at = now() where id = p_request_id;
  else
    update public.guild_join_requests set status = 'declined', responded_at = now() where id = p_request_id;
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.guild_transfer_leadership(p_guild_id uuid, p_new_leader_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.guild_role_of(p_guild_id) <> 'leader' then raise exception 'Só o líder pode transferir a liderança.'; end if;
  if not exists (select 1 from public.guild_members where guild_id = p_guild_id and user_id = p_new_leader_id) then
    raise exception 'Esse jogador não é membro da guilda.';
  end if;
  update public.guild_members set role = 'vice_leader' where guild_id = p_guild_id and user_id = auth.uid();
  update public.guild_members set role = 'leader' where guild_id = p_guild_id and user_id = p_new_leader_id;
  update public.guilds set owner_id = p_new_leader_id, updated_at = now() where id = p_guild_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.guild_update_settings(p_guild_id uuid, p_description text DEFAULT NULL::text, p_banner_image text DEFAULT NULL::text, p_category text DEFAULT NULL::text, p_privacy text DEFAULT NULL::text, p_min_level integer DEFAULT NULL::integer, p_emblem text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.guild_role_of(p_guild_id) <> 'leader' then raise exception 'Só o líder pode editar as configurações da guilda.'; end if;
  if p_privacy is not null and p_privacy not in ('open','request','closed') then raise exception 'Privacidade inválida.'; end if;
  update public.guilds set
    description = coalesce(p_description, description),
    banner_image = coalesce(p_banner_image, banner_image),
    category = coalesce(p_category, category),
    privacy = coalesce(p_privacy, privacy),
    min_level = coalesce(p_min_level, min_level),
    emblem = coalesce(p_emblem, emblem),
    updated_at = now()
  where id = p_guild_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.guild_vault_deposit(p_guild_id uuid, p_amount integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_me uuid := auth.uid();
begin
  if not exists (select 1 from public.guild_members where guild_id = p_guild_id and user_id = v_me) then
    raise exception 'Você não é membro dessa guilda.';
  end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Valor inválido.'; end if;
  if public.guild_wallet_of(v_me) < p_amount then raise exception 'Cry insuficiente.'; end if;
  perform public.guild_add_wallet(v_me, -p_amount);
  update public.guilds set vault_balance = vault_balance + p_amount, updated_at = now() where id = p_guild_id;
  insert into public.guild_vault_transactions (guild_id, user_id, type, amount) values (p_guild_id, v_me, 'deposit', p_amount);
end;
$function$;

CREATE OR REPLACE FUNCTION public.guild_vault_withdraw(p_guild_id uuid, p_amount integer, p_note text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_me uuid := auth.uid();
  v_balance int;
begin
  if public.guild_role_of(p_guild_id) not in ('leader','vice_leader') then raise exception 'Sem permissão para sacar do cofre.'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Valor inválido.'; end if;
  select vault_balance into v_balance from public.guilds where id = p_guild_id for update;
  if v_balance < p_amount then raise exception 'O cofre não tem Cry suficiente.'; end if;
  update public.guilds set vault_balance = vault_balance - p_amount, updated_at = now() where id = p_guild_id;
  perform public.guild_add_wallet(v_me, p_amount);
  insert into public.guild_vault_transactions (guild_id, user_id, type, amount, note) values (p_guild_id, v_me, 'withdraw', p_amount, p_note);
end;
$function$;
