-- Snapshot extraído de produção em 30/08/2026. Não é uma migração — não altera o banco.

CREATE OR REPLACE FUNCTION public.touch_last_seen()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  update public.profiles set last_seen = now() where id = auth.uid();
$function$;
