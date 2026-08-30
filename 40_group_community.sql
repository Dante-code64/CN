-- Snapshot extraído de produção em 30/08/2026. Não é uma migração — não altera o banco.

CREATE OR REPLACE FUNCTION public.community_add_member(p_community_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.community_role_of(p_community_id) not in ('owner','admin') then raise exception 'Só admins da comunidade podem adicionar pessoas.'; end if;
  if exists (select 1 from public.community_members where community_id = p_community_id and user_id = p_user_id) then
    raise exception 'Essa pessoa já está na comunidade.';
  end if;
  insert into public.community_members (community_id, user_id, role) values (p_community_id, p_user_id, 'member');
end; $function$;

CREATE OR REPLACE FUNCTION public.community_remove_member(p_community_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_target_role text;
begin
  if public.community_role_of(p_community_id) not in ('owner','admin') then raise exception 'Só admins da comunidade podem remover pessoas.'; end if;
  select role into v_target_role from public.community_members where community_id = p_community_id and user_id = p_user_id;
  if v_target_role is null then raise exception 'Essa pessoa não está na comunidade.'; end if;
  if v_target_role = 'owner' then raise exception 'Não é possível remover o dono da comunidade.'; end if;
  delete from public.community_members where community_id = p_community_id and user_id = p_user_id;
end; $function$;

CREATE OR REPLACE FUNCTION public.community_role_of(p_community_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select role from public.community_members where community_id = p_community_id and user_id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.community_set_admin(p_community_id uuid, p_user_id uuid, p_is_admin boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.community_role_of(p_community_id) <> 'owner' then raise exception 'Só o dono da comunidade pode definir admins.'; end if;
  if not exists (select 1 from public.community_members where community_id = p_community_id and user_id = p_user_id and role <> 'owner') then
    raise exception 'Membro não encontrado.';
  end if;
  update public.community_members set role = case when p_is_admin then 'admin' else 'member' end
    where community_id = p_community_id and user_id = p_user_id;
end; $function$;

CREATE OR REPLACE FUNCTION public.community_update_settings(p_community_id uuid, p_name text DEFAULT NULL::text, p_icon text DEFAULT NULL::text, p_description text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.community_role_of(p_community_id) not in ('owner','admin') then raise exception 'Só admins da comunidade podem editar as configurações.'; end if;
  update public.communities set
    name = coalesce(nullif(trim(p_name),''), name),
    icon = coalesce(p_icon, icon),
    description = coalesce(p_description, description)
  where id = p_community_id;
end; $function$;

CREATE OR REPLACE FUNCTION public.group_add_member(p_group_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.group_role_of(p_group_id) not in ('owner','admin') then raise exception 'Só admins do grupo podem adicionar pessoas.'; end if;
  if exists (select 1 from public.group_members where group_id = p_group_id and user_id = p_user_id) then
    raise exception 'Essa pessoa já está no grupo.';
  end if;
  insert into public.group_members (group_id, user_id, role) values (p_group_id, p_user_id, 'member');
end; $function$;

CREATE OR REPLACE FUNCTION public.group_create(p_name text, p_description text DEFAULT NULL::text, p_icon text DEFAULT '👥'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid; v_me uuid := auth.uid();
begin
  if v_me is null then raise exception 'Não autenticado'; end if;
  if p_name is null or char_length(trim(p_name)) < 1 then raise exception 'Nome do grupo é obrigatório.'; end if;
  insert into public.groups (name, description, icon, owner_id) values (trim(p_name), p_description, coalesce(p_icon,'👥'), v_me) returning id into v_id;
  insert into public.group_members (group_id, user_id, role) values (v_id, v_me, 'owner');
  return v_id;
end; $function$;

CREATE OR REPLACE FUNCTION public.group_leave(p_group_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_role text := public.group_role_of(p_group_id); v_others int;
begin
  if v_role is null then raise exception 'Você não é membro desse grupo.'; end if;
  if v_role = 'owner' then
    select count(*) into v_others from public.group_members where group_id = p_group_id and user_id <> auth.uid();
    if v_others > 0 then raise exception 'Transfira a propriedade do grupo antes de sair, ou remova todo mundo primeiro.'; end if;
    delete from public.groups where id = p_group_id;
  else
    delete from public.group_members where group_id = p_group_id and user_id = auth.uid();
  end if;
end; $function$;

CREATE OR REPLACE FUNCTION public.group_remove_member(p_group_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_target_role text;
begin
  if public.group_role_of(p_group_id) not in ('owner','admin') then raise exception 'Só admins do grupo podem remover pessoas.'; end if;
  select role into v_target_role from public.group_members where group_id = p_group_id and user_id = p_user_id;
  if v_target_role is null then raise exception 'Essa pessoa não está no grupo.'; end if;
  if v_target_role = 'owner' then raise exception 'Não é possível remover o dono do grupo.'; end if;
  delete from public.group_members where group_id = p_group_id and user_id = p_user_id;
end; $function$;

CREATE OR REPLACE FUNCTION public.group_role_of(p_group_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select role from public.group_members where group_id = p_group_id and user_id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.group_set_admin(p_group_id uuid, p_user_id uuid, p_is_admin boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.group_role_of(p_group_id) <> 'owner' then raise exception 'Só o dono do grupo pode definir admins.'; end if;
  if not exists (select 1 from public.group_members where group_id = p_group_id and user_id = p_user_id and role <> 'owner') then
    raise exception 'Membro não encontrado.';
  end if;
  update public.group_members set role = case when p_is_admin then 'admin' else 'member' end
    where group_id = p_group_id and user_id = p_user_id;
end; $function$;

CREATE OR REPLACE FUNCTION public.group_update_settings(p_group_id uuid, p_name text DEFAULT NULL::text, p_description text DEFAULT NULL::text, p_icon text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.group_role_of(p_group_id) not in ('owner','admin') then raise exception 'Só admins do grupo podem editar as configurações.'; end if;
  update public.groups set
    name = coalesce(nullif(trim(p_name),''), name),
    description = coalesce(p_description, description),
    icon = coalesce(p_icon, icon)
  where id = p_group_id;
end; $function$;
