-- Snapshot extraído de produção em 30/08/2026. Não é uma migração — não altera o banco.
--
-- ⚠️ ATENÇÃO — send_pix lê o saldo de saves.data->>'wallet', que hoje é sobrescrevível
-- livremente pelo cliente (ver /supabase/README.md, achado #2). A função em si é atômica
-- e bem escrita (FOR UPDATE nas duas linhas, evita double-spending ENTRE si), mas herda a
-- falta de integridade da fonte de dados que consulta. Corrigir isso é o próximo passo do
-- roadmap de economia — não alterar aqui sem revisar junto com a migração de wallet.

CREATE OR REPLACE FUNCTION public.send_pix(p_to_id uuid, p_amount integer, p_note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  update public.saves set data = jsonb_set(data, '{wallet}', to_jsonb(v_from_wallet - p_amount)), updated_at = now()
    where id = v_from_id;
  update public.saves set data = jsonb_set(data, '{wallet}', to_jsonb(v_to_wallet + p_amount)), updated_at = now()
    where id = p_to_id;

  insert into public.pix_transfers (from_id, to_id, amount, note)
    values (v_from_id, p_to_id, p_amount, p_note);

  return jsonb_build_object('newWallet', v_from_wallet - p_amount);
end;
$function$;

CREATE OR REPLACE FUNCTION public.apply_referral_code(p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_referrer uuid; v_already uuid; v_reward int := 500;
begin
  select referred_by into v_already from public.profiles where id = auth.uid();
  if v_already is not null then
    return jsonb_build_object('ok', false, 'error', 'Você já usou um código de convite antes.');
  end if;
  select id into v_referrer from public.profiles where referral_code = upper(p_code);
  if v_referrer is null then
    return jsonb_build_object('ok', false, 'error', 'Código inválido.');
  end if;
  if v_referrer = auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'Você não pode usar seu próprio código.');
  end if;
  update public.profiles set referred_by = v_referrer where id = auth.uid();
  perform public.guild_add_wallet(auth.uid(), v_reward);
  perform public.guild_add_wallet(v_referrer, v_reward);
  perform public.create_notification(
    v_referrer, auth.uid(), 'referral',
    'Convite aceito! 🎉',
    public.display_name(auth.uid()) || ' entrou usando seu código — vocês dois ganharam ' || v_reward || ' Cry!',
    'config', jsonb_build_object('reward', v_reward)
  );
  return jsonb_build_object('ok', true, 'reward', v_reward);
end;
$function$;

CREATE OR REPLACE FUNCTION public.approve_crystal_purchase(p_purchase_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_is_admin boolean;
  v_purchase record;
begin
  select exists(select 1 from public.app_admins where id = auth.uid()) into v_is_admin;
  if not v_is_admin then
    raise exception 'Apenas administradores podem confirmar pagamentos';
  end if;

  select * into v_purchase from public.crystal_purchases where id = p_purchase_id for update;
  if not found then
    raise exception 'Compra não encontrada';
  end if;
  if v_purchase.status <> 'pending' then
    raise exception 'Essa compra já foi % anteriormente', v_purchase.status;
  end if;

  update public.crystal_purchases set status = 'approved', approved_at = now() where id = p_purchase_id;
  update public.profiles set crystals = coalesce(crystals,0) + v_purchase.crystals where id = v_purchase.user_id;

  return jsonb_build_object('ok', true, 'crystals', v_purchase.crystals, 'user_id', v_purchase.user_id);
end;
$function$;

CREATE OR REPLACE FUNCTION public.reject_crystal_purchase(p_purchase_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_is_admin boolean;
begin
  select exists(select 1 from public.app_admins where id = auth.uid()) into v_is_admin;
  if not v_is_admin then
    raise exception 'Apenas administradores podem rejeitar pagamentos';
  end if;
  update public.crystal_purchases set status = 'rejected' where id = p_purchase_id and status = 'pending';
  return jsonb_build_object('ok', true);
end;
$function$;
