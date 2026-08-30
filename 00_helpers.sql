-- Snapshot extraído de produção em 30/08/2026. Não é uma migração — não altera o banco.
-- Funções auxiliares usadas por quase todas as outras RPCs abaixo.

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists(select 1 from public.app_admins where id = auth.uid());
$function$;

CREATE OR REPLACE FUNCTION public.is_restricted()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce((
    select banned or (suspended_until is not null and suspended_until > now())
    from public.profiles where id = auth.uid()
  ), false);
$function$;
