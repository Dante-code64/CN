-- Snapshot extraído de produção em 30/08/2026. Não é uma migração — não altera o banco.
-- 9 funções administrativas. Todas checam is_admin() antes de qualquer efeito — nenhuma
-- depende só de UI escondida no frontend.

CREATE OR REPLACE FUNCTION public.admin_approve_guild_request(p_request_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_req record;
  v_wallet int;
  v_guild_id uuid;
begin
  if not is_admin() then raise exception 'Apenas a administração pode aprovar pedidos de guilda.'; end if;

  select * into v_req from public.guild_creation_requests where id = p_request_id and status = 'pending' for update;
  if not found then raise exception 'Pedido não encontrado ou já respondido.'; end if;

  if exists (select 1 from public.guild_members where user_id = v_req.requester_id) then
    update public.guild_creation_requests set status='declined', reject_reason='O jogador já entrou em outra guilda', responded_at=now() where id=p_request_id;
    raise exception 'O jogador já pertence a outra guilda. Pedido recusado automaticamente.';
  end if;
  if exists (select 1 from public.guilds where lower(name) = lower(v_req.name)) then
    raise exception 'Já existe uma guilda com esse nome. Recuse este pedido.';
  end if;

  v_wallet := public.guild_wallet_of(v_req.requester_id);
  if v_wallet < 500 then
    update public.guild_creation_requests set status='declined', reject_reason='Ouro insuficiente (precisa de 500)', responded_at=now() where id=p_request_id;
    raise exception 'O jogador não tem 500 de ouro. Pedido recusado automaticamente.';
  end if;
  perform public.guild_add_wallet(v_req.requester_id, -500);

  insert into public.guilds (name, tag, description, emblem, banner_image, category, privacy, min_level, owner_id)
    values (v_req.name, v_req.tag, v_req.description, v_req.emblem, v_req.banner_image, v_req.category, v_req.privacy, v_req.min_level, v_req.requester_id)
    returning id into v_guild_id;

  insert into public.guild_members (guild_id, user_id, role) values (v_guild_id, v_req.requester_id, 'leader');
  perform public.guild_check_achievements(v_guild_id);
  perform public.guild_ensure_active_mission(v_guild_id);

  update public.guild_creation_requests set status='accepted', responded_at=now() where id=p_request_id;

  return v_guild_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.admin_ban_player(p_user_id uuid, p_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_email text;
begin
  if not is_admin() then raise exception 'Apenas administradores podem banir'; end if;
  if p_reason is null or trim(p_reason) = '' then raise exception 'O motivo do banimento é obrigatório'; end if;

  select email into v_email from auth.users where id = p_user_id;
  update public.profiles set banned = true, banned_reason = p_reason, banned_at = now() where id = p_user_id;
  if v_email is not null then
    insert into public.banned_emails (email, reason, banned_by) values (lower(v_email), p_reason, auth.uid())
      on conflict (email) do update set reason = excluded.reason;
  end if;
  return jsonb_build_object('ok', true);
end;
$function$;

CREATE OR REPLACE FUNCTION public.admin_decline_guild_request(p_request_id uuid, p_reason text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not is_admin() then raise exception 'Apenas a administração pode recusar pedidos de guilda.'; end if;
  update public.guild_creation_requests
    set status = 'declined', reject_reason = p_reason, responded_at = now()
    where id = p_request_id and status = 'pending';
  if not found then raise exception 'Pedido não encontrado ou já respondido.'; end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.admin_delete_account(p_user_id uuid, p_block_email boolean DEFAULT true, p_reason text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_email text;
begin
  if not is_admin() then
    raise exception 'Apenas administradores podem excluir contas';
  end if;
  select email into v_email from auth.users where id = p_user_id;
  if p_block_email and v_email is not null then
    insert into public.banned_emails (email, reason, banned_by) values (lower(v_email), coalesce(p_reason, 'Conta excluída pela administração'), auth.uid())
      on conflict (email) do nothing;
  end if;
  delete from auth.users where id = p_user_id;
  return jsonb_build_object('ok', true);
end;
$function$;

CREATE OR REPLACE FUNCTION public.admin_grant_crystals(p_user_id uuid, p_amount integer, p_reason text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_is_admin boolean;
  v_new_balance int;
begin
  select exists(select 1 from public.app_admins where id = auth.uid()) into v_is_admin;
  if not v_is_admin then
    raise exception 'Apenas administradores podem conceder Crystar';
  end if;
  if p_amount = 0 then
    raise exception 'Quantidade inválida';
  end if;

  update public.profiles set crystals = greatest(0, coalesce(crystals,0) + p_amount) where id = p_user_id
    returning crystals into v_new_balance;
  if v_new_balance is null then
    raise exception 'Jogador não encontrado';
  end if;

  insert into public.crystal_grants (admin_id, user_id, amount, reason) values (auth.uid(), p_user_id, p_amount, p_reason);

  return jsonb_build_object('ok', true, 'newBalance', v_new_balance);
end;
$function$;

CREATE OR REPLACE FUNCTION public.admin_reset_account(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not is_admin() then raise exception 'Apenas administradores podem resetar contas'; end if;
  update public.profiles set level = 1, wallet = 100, bank = 0, battles = 0, quests_completed = 0 where id = p_user_id;
  delete from public.guild_members where user_id = p_user_id;
  return jsonb_build_object('ok', true);
end;
$function$;

CREATE OR REPLACE FUNCTION public.admin_set_suspension(p_user_id uuid, p_until timestamp with time zone, p_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not is_admin() then
    raise exception 'Apenas administradores podem suspender';
  end if;
  update public.profiles set suspended_until = p_until, suspended_reason = p_reason where id = p_user_id;
  return jsonb_build_object('ok', true);
end;
$function$;

CREATE OR REPLACE FUNCTION public.admin_set_verified_badge(p_user_id uuid, p_badge text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not is_admin() then raise exception 'Apenas a administração pode conceder selos de verificação.'; end if;
  if p_badge is not null and p_badge not in ('admin','partner','owner','subowner') then
    raise exception 'Tipo de selo inválido.';
  end if;
  update public.profiles set verified_badge = p_badge where id = p_user_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.admin_unban_player(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_email text;
begin
  if not is_admin() then raise exception 'Apenas administradores podem desbanir'; end if;
  select email into v_email from auth.users where id = p_user_id;
  update public.profiles set banned = false, banned_reason = null, banned_at = null where id = p_user_id;
  if v_email is not null then
    delete from public.banned_emails where email = lower(v_email);
  end if;
  return jsonb_build_object('ok', true);
end;
$function$;
